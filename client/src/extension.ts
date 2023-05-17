import * as path from 'path';
import * as vscode from 'vscode';
import { workspace, ExtensionContext, commands, languages, SemanticTokensLegend } from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	DocumentHighlightClientCapabilities,
	TransportKind
} from 'vscode-languageclient/node';

import * as ohm from 'ohm-js';

import grammar, {JaySemantics} from './grammar.ohm-bundle.js';

//import {readFileSync, readFile} from 'fs';

import assert = require('assert');

let client: LanguageClient;

const fileGrammar = ohm.grammar("Jay {\n"+
	"Prog = Expr end\n" + 
	"| \"\" end\n" +
	"Expr = Expr orOp Expr1\n" +
	"| commentExpr \"\" \"\" \n" +
	"| Expr1 \"\" \"\"\n" +
	"Expr1 = Expr1 andOp Expr2\n" +
	"| Expr2 \"\" \"\"\n" +
	"Expr2 = notOp Expr3\n" +
	"| Expr3 \"\" \n" +
	"Expr3 = Expr4 relOp Expr4\n" +
	"| Expr4 \"\" \"\"\n" +
	"Expr4 = Expr5 colonOp Expr4\n" +
	"| Expr5 \"\" \"\"\n" +
	"Expr5 = Expr5 plusOp Expr6\n" +
	"| Expr6  \"\" \"\"\n" +
	"Expr6 = Expr6 mulOp Expr7\n" +
	"| Expr7 \"\" \"\"\n" +
	"Expr7 = asOp Expr8\n" +
	"| Expr8 \"\"\n" +
	"Expr8 = boolTerm\n" +
	"| intTerm\n" +
	"| IfExpr\n" +
	"| FunExpr\n" +
	"| MatchExpr\n" + 
	"| IfExpr\n" +
    "| LetExpr\n" +
	"| ListDestructExpr\n" +
	"| Appl_Expr\n" +
	"| identifier\n" +
	"| ListExpr\n" + 
	"| ParenExpr\n" +
	"| funOp\n" +
    "| VarientExpr\n" +
    "VarientExpr =  Varient_Label Expr\n" +
    "Varient_Label = \"`\" identifier\n" +
	"MatchExpr = \"match\" Expr \"with\" \"|\"? MatchExprList \"end\"\n" +
	"MatchExprList = MatchExprInner \"|\" MatchExprList\n" +
	"| MatchExprInner \"\" \"\" \n" + 
	"MatchExprInner = Expr8 arrowOp Expr\n" +
	"IfExpr = \"if\" Expr \"then\" Expr \"else\" Expr\n" +
	"FunExpr = funOp Param_List arrowOp Expr \"\" \n" +
    "| \"let\" \"rec\" Fun_Sig_List \"in\" Expr  \n" +
    "| \"let\" Fun_Sig \"in\" Expr \"\" \n" +
    "LetExpr =  \"let\" identifier equalsOp Expr \"in\" Expr\n" +
    "Fun_Sig_List = Fun_Sig \"with\" Fun_Sig_List\n" +
    "| Fun_Sig \"\" \"\" \n" +
    "Fun_Sig = identifier Param_List equalsOp Expr \n" +
    "Param_List = identifier Param_List \n" +
    "| identifier \"\" \n" +
	"commentExpr = \"#\" (~\"\\n\" any)* \"\\n\"\n" +
	"ListExpr = \"{\" NonemptyListOf<RecordPatternEl, \",\"> \"_\" \"}\"\n" +
	"| \"{\" NonemptyListOf<RecordPatternEl, \",\"> \"\" \"}\"\n" +
	"| \"{\" \"\" \"_\" \"}\" \n" +
	"| \"{\" \"\" \"\" \"}\" \n" +
	"| \"[\" \"\" \"\" \"]\" \n" +
	"| \"(\" \"0\" \"0\" \")\" \n" +
	"ListDestructExpr = identifier colonOp Expr\n" +
	"RecordPatternEl = identifier equalsOp identifier \n" + 
	"Appl_Expr = Appl_Expr Prim_Expr \n" +
	"| Prim_Expr \"\" \n" +
    "Prim_Expr = intTerm \n" +
    "| boolTerm \n" +
    "| inputTerm \n" +
    "| identifier \n" +
    "| Record \n" +
    "| Empty_Record \n" +
    "| List \n" +
    "| Empty_List \n" +
    "| ParenExpr \n" +
    "| Record_Proj \n" +
    "Record_Proj = Prim_Expr \".\" identifier \n" +
    "Empty_List = \"[\" \"]\" \n" +
    "List = \"[\" NonemptyListOf<Expr, \",\"> \"]\" \n" +
    "Empty_Record = \"{\" \"}\" \n" +
    "Record = \"{\" Record_Body \"}\" \n" +
    "Record_Body = identifier equalsOp Expr \",\" Record_Body\n" +
    "| identifier equalsOp Expr \"\" \"\" \n" +
	"inputTerm = \"input\" \n" +
    "ParenExpr = \"(\" Expr \")\"\n" +
	"funOp = \"fun\" | \"function\"\n" +
	"orOp = \"or\"\n" +
	"equalsOp = \"=\"\n" +
	"andOp = \"and\"\n" +
	"notOp = \"not\" | \"-\"\n" +
	"relOp = \"<>\" | \"==\" | \"<\" | \">\" | \"<=\"| \">=\"\n" +
	"colonOp = \"::\"\n" +
	"plusOp = \"+\" | \"-\"\n" +
	"mulOp = \"*\" | \"/\" | \"%\"\n" +
	"asOp = \"assert\" | \"assume\"\n" +
	"arrowOp = \"->\"\n" +
	"boolTerm = \"true\" | \"false\"\n" +
	"intTerm = digit+\n" +
	"identifier =  ~(\"with\"|\"match\"|\"end\"|\"if\"|\"then\"|\"else\"|\"assert\"|\"assume\"|\"let\"|\"in\"|\"true\"|\"false\"|\"fun\"|\"function\"|\"input\") (letter|\"_\") (letter | \"_\" | digit)*\n" +
	"ident_start = letter | \"_\"\n" +
	"ident_cont = letter | \"_\" | digit\n" +
	"space += commentExpr\n" +
"}");
const semanticOps = fileGrammar.createSemantics();
let semanticTokensList: IParsedToken[] = [];

interface IParsedToken {
	line: number;
	startCharacter: number;
	length: number;
	tokenType: string;
	tokenModifiers: string[];
}

semanticOps.addOperation<void>('parse()', {
	Prog(x, y) {
		if (x.sourceString.length > 0) x.parse();
	},
	//Or Expression
	Expr(x, y, z) {
		if (x.sourceString.length > 0) x.parse();
		if (y.sourceString.length > 0) {
			semanticTokensList.push({
				line: y.source.getLineAndColumn().lineNum - 1, 
				startCharacter: y.source.getLineAndColumn().colNum - 1,
				length: y.sourceString.length,
				tokenType: "keyword",
				tokenModifiers: []
			});
		}
		if (z.sourceString.length > 0) z.parse();
	},
	//And Expression
	Expr1(x, y, z) {
		if (x.sourceString.length > 0) x.parse();
		if (y.sourceString.length > 0) {
			semanticTokensList.push({
				line: y.source.getLineAndColumn().lineNum - 1, 
				startCharacter: y.source.getLineAndColumn().colNum - 1,
				length: y.sourceString.length,
				tokenType: "keyword",
				tokenModifiers: []
			});
		}
		if (z.sourceString.length > 0) z.parse();
	},
	//Not Expression
	Expr2(x, y) {
		if (y.sourceString.length > 0) {
			semanticTokensList.push({
				line: x.source.getLineAndColumn().lineNum - 1, 
				startCharacter: x.source.getLineAndColumn().colNum - 1,
				length: x.sourceString.length,
				tokenType: "keyword",
				tokenModifiers: []
			});
			y.parse();
		}
		else x.parse();
	},
	//Relational expression
	Expr3(x, y, z) {
		if (x.sourceString.length > 0) x.parse();
		if (y.sourceString.length > 0) {
			semanticTokensList.push({
				line: y.source.getLineAndColumn().lineNum - 1, 
				startCharacter: y.source.getLineAndColumn().colNum - 1,
				length: y.sourceString.length,
				tokenType: "member",
				tokenModifiers: []
			});
		}
		if (z.sourceString.length > 0) z.parse();
	},
	//Colon Expression
	Expr4(x, y, z) {
		if (x.sourceString.length > 0) x.parse();
		if (y.sourceString.length > 0) {
			semanticTokensList.push({
				line: y.source.getLineAndColumn().lineNum - 1, 
				startCharacter: y.source.getLineAndColumn().colNum - 1,
				length: y.sourceString.length,
				tokenType: "member",
				tokenModifiers: []
			});
		}
		if (z.sourceString.length > 0) z.parse();
	},
	MatchExpr(x, y, z, w, t, f) {
		semanticTokensList.push({
			line: x.source.getLineAndColumn().lineNum - 1, 
			startCharacter: x.source.getLineAndColumn().colNum - 1,
			length: x.sourceString.length,
			tokenType: "keyword",
			tokenModifiers: []
		});
		semanticTokensList.push({
			line: z.source.getLineAndColumn().lineNum - 1, 
			startCharacter: z.source.getLineAndColumn().colNum - 1,
			length: z.sourceString.length,
			tokenType: "keyword",
			tokenModifiers: []
		});
		semanticTokensList.push({
			line: f.source.getLineAndColumn().lineNum - 1, 
			startCharacter: f.source.getLineAndColumn().colNum - 1,
			length: f.sourceString.length,
			tokenType: "keyword",
			tokenModifiers: []
		});
		if (w.sourceString.length > 0) {
			semanticTokensList.push({
				line: w.source.getLineAndColumn().lineNum - 1, 
				startCharacter: w.source.getLineAndColumn().colNum - 1,
				length: w.sourceString.length,
				tokenType: "parameter",
				tokenModifiers: []
			});
		}
		y.parse();
		t.parse();

	},
	MatchExprList(x, y, z) {
		if (y.sourceString.length > 0) {
			semanticTokensList.push({
				line: y.source.getLineAndColumn().lineNum - 1, 
				startCharacter: y.source.getLineAndColumn().colNum - 1,
				length: y.sourceString.length,
				tokenType: "parameter",
				tokenModifiers: []
			});
			x.parse();
			z.parse();
		} else x.parse();
	},
	MatchExprInner(x, y, z) {
		x.parse();
		z.parse();
		semanticTokensList.push({
			line: y.source.getLineAndColumn().lineNum - 1, 
			startCharacter: y.source.getLineAndColumn().colNum - 1,
			length: y.sourceString.length,
			tokenType: "member",
			tokenModifiers: []
		});
	},
	//Plus Expression
	Expr5(x, y, z) {
		if (x.sourceString.length > 0) x.parse();
		if (y.sourceString.length > 0) {
			semanticTokensList.push({
				line: y.source.getLineAndColumn().lineNum - 1, 
				startCharacter: y.source.getLineAndColumn().colNum - 1,
				length: y.sourceString.length,
				tokenType: "member",
				tokenModifiers: []
			});
		}
		if (z.sourceString.length > 0) z.parse();
	},
	//Multiply expression
	Expr6(x, y, z) {
		if (x.sourceString.length > 0) x.parse();
		if (y.sourceString.length > 0) {
			semanticTokensList.push({
				line: y.source.getLineAndColumn().lineNum - 1, 
				startCharacter: y.source.getLineAndColumn().colNum - 1,
				length: y.sourceString.length,
				tokenType: "member",
				tokenModifiers: []
			});
		}
		if (z.sourceString.length > 0) z.parse();
	},
	//Assert/assume Expression
	Expr7(x, y) {
		if (y.sourceString.length > 0) {
			semanticTokensList.push({
				line: x.source.getLineAndColumn().lineNum - 1, 
				startCharacter: x.source.getLineAndColumn().colNum - 1,
				length: x.sourceString.length,
				tokenType: "keyword",
				tokenModifiers: []
			});
			y.parse();
		}
		else x.parse();
	},
	//Variable Expression
	Expr8(x) {
		if (x.sourceString.length > 0) x.parse();
	},
	ParenExpr(x, y, z) {
		semanticTokensList.push({
			line: x.source.getLineAndColumn().lineNum - 1, 
			startCharacter: x.source.getLineAndColumn().colNum - 1,
			length: x.sourceString.length,
			tokenType: "member",
			tokenModifiers: []
		});
		semanticTokensList.push({
			line: z.source.getLineAndColumn().lineNum - 1, 
			startCharacter: z.source.getLineAndColumn().colNum - 1,
			length: z.sourceString.length,
			tokenType: "member",
			tokenModifiers: []
		});
		if (y.sourceString.length > 0) y.parse();
		
	},
	ListExpr(x, y, z, w) {
		semanticTokensList.push({
			line: x.source.getLineAndColumn().lineNum - 1, 
			startCharacter: x.source.getLineAndColumn().colNum - 1,
			length: x.sourceString.length,
			tokenType: "member",
			tokenModifiers: []
		});
		semanticTokensList.push({
			line: w.source.getLineAndColumn().lineNum - 1, 
			startCharacter: w.source.getLineAndColumn().colNum - 1,
			length: w.sourceString.length,
			tokenType: "member",
			tokenModifiers: []
		});

		//Recognize the special empty list operator (0 0)
		if (y.sourceString === "0" && z.sourceString === "0") {
			semanticTokensList.push({
				line: y.source.getLineAndColumn().lineNum - 1, 
				startCharacter: y.source.getLineAndColumn().colNum - 1,
				length: y.sourceString.length,
				tokenType: "member",
				tokenModifiers: []
			});
			semanticTokensList.push({
				line: z.source.getLineAndColumn().lineNum - 1, 
				startCharacter: z.source.getLineAndColumn().colNum - 1,
				length: z.sourceString.length,
				tokenType: "member",
				tokenModifiers: []
			});
			return;
		}
		if (y.sourceString.length > 0) {
			
			y.asIteration().children.map(c => c.parse());
		} 
		if (z.sourceString.length > 0) {
			semanticTokensList.push({
				line: z.source.getLineAndColumn().lineNum - 1, 
				startCharacter: z.source.getLineAndColumn().colNum - 1,
				length: z.sourceString.length,
				tokenType: "variable",
				tokenModifiers: []
			});
		}
	},
	ListDestructExpr(x, y, z) {
		x.parse();
		z.parse();
		semanticTokensList.push({
			line: y.source.getLineAndColumn().lineNum - 1, 
			startCharacter: y.source.getLineAndColumn().colNum - 1,
			length: y.sourceString.length,
			tokenType: "member",
			tokenModifiers: []
		});
	},
	RecordPatternEl(x, y, z) {
		x.parse();
		z.parse();
		semanticTokensList.push({
			line: y.source.getLineAndColumn().lineNum - 1, 
			startCharacter: y.source.getLineAndColumn().colNum - 1,
			length: y.sourceString.length,
			tokenType: "member",
			tokenModifiers: []
		});
	},
	IfExpr(x1, x2, x3, x4, x5, x6) {
		if (x2.sourceString.length > 0) {
			semanticTokensList.push({line: x1.source.getLineAndColumn().lineNum - 1, 
				startCharacter: x1.source.getLineAndColumn().colNum - 1,
				length: x1.sourceString.length,
				tokenType: "keyword",
				tokenModifiers: []});
			semanticTokensList.push({line: x3.source.getLineAndColumn().lineNum - 1, 
				startCharacter: x3.source.getLineAndColumn().colNum - 1,
				length: x3.sourceString.length,
				tokenType: "keyword",
				tokenModifiers: []});
			semanticTokensList.push({line: x5.source.getLineAndColumn().lineNum - 1, 
				startCharacter: x5.source.getLineAndColumn().colNum - 1,
				length: x5.sourceString.length,
				tokenType: "keyword",
				tokenModifiers: []});
			x2.parse();
			x4.parse();
			x6.parse();
			} else {
				x1.parse();
			}
	},
	Appl_Expr(x, y) {
		const xFirstLetter = x.sourceString.charAt(0);
		if (y.sourceString.length > 0) {
			//If this Appl_Expr is evaluating to the first two expressions in a sequence, then highlight the first
			//as a function call
			if (this.children[0].children[0].children.length === 1 && ((xFirstLetter == "_") || (xFirstLetter.toLowerCase() != xFirstLetter.toUpperCase()))){
				semanticTokensList.push({
					line: x.source.getLineAndColumn().lineNum - 1, 
					startCharacter: x.source.getLineAndColumn().colNum - 1,
					length: x.sourceString.length,
					tokenType: "function",
					tokenModifiers: []
				});
			} else x.parse();
			y.parse();
		} 
		else x.parse();
	},
	Prim_Expr(x) {
		x.parse();
	},
	Record(x, y, z) {
		semanticTokensList.push({
			line: x.source.getLineAndColumn().lineNum - 1, 
			startCharacter: x.source.getLineAndColumn().colNum - 1,
			length: x.sourceString.length,
			tokenType: "member",
			tokenModifiers: []
		});
		semanticTokensList.push({
			line: z.source.getLineAndColumn().lineNum - 1, 
			startCharacter: z.source.getLineAndColumn().colNum - 1,
			length: z.sourceString.length,
			tokenType: "member",
			tokenModifiers: []
		});
		y.parse();
	},
	Record_Body(x1, x2, x3, x4, x5) {
		if (x4.sourceString.length > 0) {
			semanticTokensList.push({
				line: x4.source.getLineAndColumn().lineNum - 1, 
				startCharacter: x4.source.getLineAndColumn().colNum - 1,
				length: x4.sourceString.length,
				tokenType: "member",
				tokenModifiers: []
			});
			x5.parse();
		}
		semanticTokensList.push({
			line: x2.source.getLineAndColumn().lineNum - 1, 
			startCharacter: x2.source.getLineAndColumn().colNum - 1,
			length: x2.sourceString.length,
			tokenType: "member",
			tokenModifiers: []
		});
		x1.parse();
		x3.parse();
	},
	Empty_Record(x, y) {
		semanticTokensList.push({
			line: x.source.getLineAndColumn().lineNum - 1, 
			startCharacter: x.source.getLineAndColumn().colNum - 1,
			length: x.sourceString.length,
			tokenType: "member",
			tokenModifiers: []
		});
		semanticTokensList.push({
			line: y.source.getLineAndColumn().lineNum - 1, 
			startCharacter: y.source.getLineAndColumn().colNum - 1,
			length: y.sourceString.length,
			tokenType: "member",
			tokenModifiers: []
		});
	},
	List(x, y, z) {
		semanticTokensList.push({
			line: x.source.getLineAndColumn().lineNum - 1, 
			startCharacter: x.source.getLineAndColumn().colNum - 1,
			length: x.sourceString.length,
			tokenType: "member",
			tokenModifiers: []
		});
		semanticTokensList.push({
			line: z.source.getLineAndColumn().lineNum - 1, 
			startCharacter: z.source.getLineAndColumn().colNum - 1,
			length: z.sourceString.length,
			tokenType: "member",
			tokenModifiers: []
		});
		y.parse();
	},
	NonemptyListOf(elem, seps, elems) {
		elem.parse();
		if (elems.children.length > 0) {
			elems.children.map(c => c.parse());
		}
	},
	Empty_List(x, y) {
		semanticTokensList.push({
			line: x.source.getLineAndColumn().lineNum - 1, 
			startCharacter: x.source.getLineAndColumn().colNum - 1,
			length: x.sourceString.length,
			tokenType: "member",
			tokenModifiers: []
		});
		semanticTokensList.push({
			line: y.source.getLineAndColumn().lineNum - 1, 
			startCharacter: y.source.getLineAndColumn().colNum - 1,
			length: y.sourceString.length,
			tokenType: "member",
			tokenModifiers: []
		});
	},
	Record_Proj(x, y, z) {
		x.parse();
		z.parse();
	},
	FunExpr(x1, x2, x3, x4, x5) {
		semanticTokensList.push({
			line: x1.source.getLineAndColumn().lineNum - 1, 
			startCharacter: x1.source.getLineAndColumn().colNum - 1,
			length: x1.sourceString.length,
			tokenType: "keyword",
			tokenModifiers: []
		});
		if (x5.sourceString.length > 0) {
			semanticTokensList.push({
				line: x2.source.getLineAndColumn().lineNum - 1, 
				startCharacter: x2.source.getLineAndColumn().colNum - 1,
				length: x2.sourceString.length,
				tokenType: "keyword",
				tokenModifiers: []
			});
			semanticTokensList.push({
				line: x4.source.getLineAndColumn().lineNum - 1, 
				startCharacter: x4.source.getLineAndColumn().colNum - 1,
				length: x4.sourceString.length,
				tokenType: "keyword",
				tokenModifiers: []
			});
			x3.parse();
			x5.parse();
		} else if (x1.sourceString === "let") {
			semanticTokensList.push({
				line: x3.source.getLineAndColumn().lineNum - 1, 
				startCharacter: x3.source.getLineAndColumn().colNum - 1,
				length: x3.sourceString.length,
				tokenType: "keyword",
				tokenModifiers: []
			});
			x2.parse();
			x4.parse();
		} else {
			semanticTokensList.push({
				line: x3.source.getLineAndColumn().lineNum - 1, 
				startCharacter: x3.source.getLineAndColumn().colNum - 1,
				length: x3.sourceString.length,
				tokenType: "member",
				tokenModifiers: []
			});
			x2.parse();
			x4.parse();
		}

	},
	// FunCall(x, y) {
	// 	semanticTokensList.push({
	// 		line: x.source.getLineAndColumn().lineNum - 1, 
	// 		startCharacter: x.source.getLineAndColumn().colNum - 1,
	// 		length: x.sourceString.length,
	// 		tokenType: "function",
	// 		tokenModifiers: []
	// 	});
	// 	if (y.sourceString.length > 0) y.parse();
	// },
	// FunParams(x, y) {
	// 	x.parse();
	// 	if (y.sourceString.length > 0) y.parse();
	// },
	LetExpr(x1, x2, x3, x4, x5, x6) {
		semanticTokensList.push({
			line: x1.source.getLineAndColumn().lineNum - 1, 
			startCharacter: x1.source.getLineAndColumn().colNum - 1,
			length: x1.sourceString.length,
			tokenType: "keyword",
			tokenModifiers: []
		});
		semanticTokensList.push({
			line: x3.source.getLineAndColumn().lineNum - 1, 
			startCharacter: x3.source.getLineAndColumn().colNum - 1,
			length: x3.sourceString.length,
			tokenType: "member",
			tokenModifiers: []
		});
		semanticTokensList.push({
			line: x5.source.getLineAndColumn().lineNum - 1, 
			startCharacter: x5.source.getLineAndColumn().colNum - 1,
			length: x5.sourceString.length,
			tokenType: "keyword",
			tokenModifiers: []
		});
		x2.parse();
		x4.parse();
		x6.parse();
	},
	VarientExpr(x, y) {
		x.parse();
		y.parse();
	},
	Varient_Label(x, y) {
		semanticTokensList.push({
			line: this.source.getLineAndColumn().lineNum - 1, 
			startCharacter: this.source.getLineAndColumn().colNum - 1,
			length: this.sourceString.length,
			tokenType: "variable",
			tokenModifiers: []
		});
	},
	Fun_Sig_List(x, y, z) {
		if (y.sourceString.length > 0) {
			semanticTokensList.push({
				line: y.source.getLineAndColumn().lineNum - 1, 
				startCharacter: y.source.getLineAndColumn().colNum - 1,
				length: y.sourceString.length,
				tokenType: "keyword",
				tokenModifiers: []
			});
			x.parse();
			z.parse();
		} else x.parse();
	},
	Fun_Sig(x1, x2, x3, x4) {
		semanticTokensList.push({
			line: x1.source.getLineAndColumn().lineNum - 1, 
			startCharacter: x1.source.getLineAndColumn().colNum - 1,
			length: x1.sourceString.length,
			tokenType: "function",
			tokenModifiers: []
		});
		semanticTokensList.push({
			line: x3.source.getLineAndColumn().lineNum - 1, 
			startCharacter: x3.source.getLineAndColumn().colNum - 1,
			length: x3.sourceString.length,
			tokenType: "member",
			tokenModifiers: []
		});
		x2.parse();
		x4.parse();
	},
	Param_List(x, y) {
		x.parse();
		if (y.sourceString.length > 0) {
			y.parse();
		}
	},
	identifier(x, y) {
		semanticTokensList.push({line: this.source.getLineAndColumn().lineNum - 1, 
			startCharacter: this.source.getLineAndColumn().colNum - 1,
			length: this.sourceString.length,
			tokenType: "variable",
			tokenModifiers: []});
	},
	intTerm(digits) {
		semanticTokensList.push({
			line: this.source.getLineAndColumn().lineNum - 1, 
			startCharacter: this.source.getLineAndColumn().colNum - 1,
			length: this.sourceString.length,
			tokenType: "number",
			tokenModifiers: []
		});
	},
	commentExpr(x, y, z) {
		semanticTokensList.push({line: this.source.getLineAndColumn().lineNum - 1, 
			startCharacter: this.source.getLineAndColumn().colNum - 1,
			length: this.sourceString.length,
			tokenType: "comment",
			tokenModifiers: []});
	},
	boolTerm(x) {
		semanticTokensList.push({
			line: this.source.getLineAndColumn().lineNum - 1, 
			startCharacter: this.source.getLineAndColumn().colNum - 1,
			length: this.sourceString.length,
			tokenType: "keyword",
			tokenModifiers: []
		});
	},
	inputTerm(x) {
		semanticTokensList.push({
			line: this.source.getLineAndColumn().lineNum - 1, 
			startCharacter: this.source.getLineAndColumn().colNum - 1,
			length: this.sourceString.length,
			tokenType: "number",
			tokenModifiers: []
		});
	},
	_terminal() {
		semanticTokensList.push({line: this.source.getLineAndColumn().lineNum - 1, 
			startCharacter: this.source.getLineAndColumn().colNum - 1,
			length: this.sourceString.length,
			tokenType: "variable",
			tokenModifiers: []});
	}
});


const tokenTypesMap = new Map<string, number>();
const tokenModifiersMap = new Map<string, number>();

enum TokenTypes {
	comment = 0,
	keyword = 1,
	string = 2,
	number = 3,
	regexp = 4,
	type = 5,
	class = 6,
	interface = 7,
	enum = 8,
	typeParameter = 9,
	function = 10,
	member = 11,
	property = 12,
	variable = 13,
	parameter = 14,
	lambdaFunction = 15,
	_ = 16
}

enum TokenModifiers {
	abstract = 0,
	deprecated = 1,
	static = 2,
	_ = 3,
}

let semanticTokensLegend: SemanticTokensLegend;
function computeLegend(): SemanticTokensLegend {

	const clientTokenTypes = new Set<string>();
	const clientTokenModifiers = new Set<string>();

	const tokenTypes: string[] = [];
	for (let i = 0; i < TokenTypes._; i++) {
		const str = TokenTypes[i];
		tokenTypes.push(str);
		tokenTypesMap.set(str, i);
		
	}

	const tokenModifiers: string[] = [];
	for (let i = 0; i < TokenModifiers._; i++) {
		const str = TokenModifiers[i];
		tokenModifiers.push(str);
		tokenModifiersMap.set(str, i);
	}

	return { tokenTypes, tokenModifiers };
}

export function activate(context: ExtensionContext) {
	// The server is implemented in node
	const serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
		}
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'plaintext' },
							{scheme: 'file', language: 'jay'}],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'jayHighlighter',
		'Jay LSP Highlighter',
		serverOptions,
		clientOptions
	);

	context.subscriptions.push(languages.registerDocumentSemanticTokensProvider({language: "jay"}, new DocumentSemanticTokensProvider(), computeLegend()));
	//context.subscriptions.push(languages.registerDocumentSemanticTokensProvider({language: "plaintext"}, new DocumentSemanticTokensProvider, semanticTokensLegend));

	// Start the client. This will also launch the server
	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}


class DocumentSemanticTokensProvider implements DocumentSemanticTokensProvider {
	async provideDocumentSemanticTokens(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.SemanticTokens> {
		console.log('parsing text for semantic tokens');
		const documentText = document.getText();
		const allTokens = this._parseText(documentText);
		const builder = new vscode.SemanticTokensBuilder();
		allTokens.forEach((token) => {
			builder.push(token.line, token.startCharacter, token.length, this._encodeTokenType(token.tokenType), this._encodeTokenModifiers(token.tokenModifiers));
		});
		return builder.build();
	}

	private _encodeTokenType(tokenType: string): number {
		if (tokenTypesMap.has(tokenType)) {
			return tokenTypesMap.get(tokenType)!;
		} else if (tokenType === 'notInLegend') {
			return tokenTypesMap.size + 2;
		}
		return 0;
	}

	private _encodeTokenModifiers(strTokenModifiers: string[]): number {
		let result = 0;
		for (let i = 0; i < strTokenModifiers.length; i++) {
			const tokenModifier = strTokenModifiers[i];
			if (tokenModifiersMap.has(tokenModifier)) {
				result = result | (1 << tokenModifiersMap.get(tokenModifier)!);
			} else if (tokenModifier === 'notInLegend') {
				result = result | (1 << tokenModifiersMap.size + 2);
			}
		}
		return result;
	}

	private _parseText(text: string): IParsedToken[] {
		const r: IParsedToken[] = [];
		const match = fileGrammar.match(text);
		if (match.succeeded) {
			semanticTokensList = [];
			try {
				const parseReturn = semanticOps(match).parse();
			} catch (exception: any) {
				console.log("Unable to parse current text");
			}
		}
		semanticTokensList.forEach(function(item) {r.push(item);});
		return r;
	}

	private _parseTextToken(text: string): { tokenType: string; tokenModifiers: string[]; } {
		if (text.endsWith('let')) {
			return {
				tokenType: 'keyword',
				tokenModifiers: ['static']
			};
		} else {
			return {
				tokenType: 'class',
				tokenModifiers: ['static']
			};
		}
	}
}
