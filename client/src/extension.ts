/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

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
	"| MatchExpr \"\" \"\"\n" +
	"MatchExpr = \"match\" Expr \"with\" \"|\"? MatchExprList \"end\"\n" +
	"| Expr5 \"\" \"\" \"\" \"\" \"\" \n" +
	"MatchExprList = MatchExprInner \"|\" MatchExprList\n" +
	"| MatchExprInner \"\" \"\" \n" + 
	"MatchExprInner = Expr9 arrowOp Expr\n" +
	"Expr5 = Expr5 plusOp Expr6\n" +
	"| Expr6  \"\" \"\"\n" +
	"Expr6 = Expr6 mulOp Expr7\n" +
	"| Expr7 \"\" \"\"\n" +
	"Expr7 = asOp Expr8\n" +
	"| Expr8 \"\"\n" +
	"Expr8 = Expr9 arrowOp Expr8\n" +
	"| Expr9 \"\" \"\"\n" +
	"Expr9 = boolTerm\n" +
	"| intTerm\n" +
	"| ListDestructExpr\n" +
	"| identifier\n" +
	"| ParenExpr\n" +
	"| funOp\n" +
	"| ListExpr\n" + 
	"commentExpr = \"#\" (~\"\\n\" any)* \"\\n\"\n" +
	"ListExpr = \"{\" NonemptyListOf<RecordPatternEl, \",\"> \"_\" \"}\"\n" +
	"| \"{\" NonemptyListOf<RecordPatternEl, \",\"> \"\" \"}\"\n" +
	"| \"{\" \"\" \"_\" \"}\" \n" +
	"| \"{\" \"\" \"\" \"}\" \n" +
	"| \"[\" \"\" \"\" \"]\" \n" +
	"ListDestructExpr = identifier colonOp identifier\n" +
	"RecordPatternEl = identifier equalsOp identifier \n" + 
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
	"identifier = (letter|\"_\") (letter | \"_\" | digit)*\n" +
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
		if (y.sourceString.length > 0) {
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
		}
		else x.parse();

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
	//Arrow Expression
	Expr8(x, y, z) {
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
	//Variable Expression
	Expr9(x) {
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
		semanticTokensList = [];
		const match = fileGrammar.match(text);
		try {
			const parseReturn = semanticOps(match).parse();
		} catch (exception: any) {
			console.log("Unable to parse current text");
		}
		semanticTokensList.forEach(function(item) {r.push(item);});
		return r;
		// const lines = text.split(/\r\n|\r|\n/);
		// for (let i = 0; i < lines.length; i++) {
		// 	const line = lines[i];
		// 	let currentOffset = 0;
		// 	do {
		// 		let pattern = /\b(let|match|rec)\b/g;
		// 		const match = pattern.exec(line.substring(currentOffset));
		// 		if (!match) {
		// 			break;
		// 		}
		// 		/*
		// 		const closeOffset = line.indexOf(' ', openOffset);
		// 		if (closeOffset === -1) {
		// 			break;
		// 		}*/
		// 		const tokenData = this._parseTextToken(line.substring(match.index, match.index + match[0].length));
		// 		r.push({
		// 			line: i,
		// 			startCharacter: match.index + currentOffset,
		// 			length: match[0].length,
		// 			tokenType: tokenData.tokenType,
		// 			tokenModifiers: tokenData.tokenModifiers
		// 		});
		// 		currentOffset += match.index + match[0].length;
		// 		/*
		// 		const openOffset = line.indexOf('[', currentOffset);
		// 		if (openOffset === -1) {
		// 			break;
		// 		}
		// 		const closeOffset = line.indexOf(']', openOffset);
		// 		if (closeOffset === -1) {
		// 			break;
		// 		}
		// 		const tokenData = this._parseTextToken(line.substring(openOffset + 1, closeOffset));
		// 		r.push({
		// 			line: i,
		// 			startCharacter: openOffset + 1,
		// 			length: closeOffset - openOffset - 1,
		// 			tokenType: tokenData.tokenType,
		// 			tokenModifiers: tokenData.tokenModifiers
		// 		});
		// 		currentOffset = closeOffset;*/
		// 	} while (true);
		// }
		// return r;
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
