// AUTOGENERATED FILE
// This file was generated from grammar.ohm by `ohm generateBundles`.

import {
  BaseActionDict,
  Grammar,
  IterationNode,
  Node,
  NonterminalNode,
  Semantics,
  TerminalNode
} from 'ohm-js';

export interface JayActionDict<T> extends BaseActionDict<T> {
  Prog?: (this: NonterminalNode, arg0: NonterminalNode | TerminalNode, arg1: NonterminalNode) => T;
  Expr?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode | TerminalNode, arg2: NonterminalNode | TerminalNode) => T;
  Expr1?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode | TerminalNode, arg2: NonterminalNode | TerminalNode) => T;
  Expr2?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode | TerminalNode) => T;
  Expr3?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode | TerminalNode, arg2: NonterminalNode | TerminalNode) => T;
  Expr4?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode | TerminalNode, arg2: NonterminalNode | TerminalNode) => T;
  Expr5?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode | TerminalNode, arg2: NonterminalNode | TerminalNode) => T;
  Expr6?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode | TerminalNode, arg2: NonterminalNode | TerminalNode) => T;
  Expr7?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode | TerminalNode) => T;
  Expr8?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode | TerminalNode, arg2: NonterminalNode | TerminalNode) => T;
  Expr9?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  ParenExpr?: (this: NonterminalNode, arg0: TerminalNode, arg1: NonterminalNode, arg2: TerminalNode) => T;
  orOp?: (this: NonterminalNode, arg0: TerminalNode) => T;
  andOp?: (this: NonterminalNode, arg0: TerminalNode) => T;
  notOp?: (this: NonterminalNode, arg0: TerminalNode) => T;
  relOp?: (this: NonterminalNode, arg0: TerminalNode) => T;
  colonOp?: (this: NonterminalNode, arg0: TerminalNode) => T;
  plusOp?: (this: NonterminalNode, arg0: TerminalNode) => T;
  mulOp?: (this: NonterminalNode, arg0: TerminalNode) => T;
  asOp?: (this: NonterminalNode, arg0: TerminalNode) => T;
  arrowOp?: (this: NonterminalNode, arg0: TerminalNode) => T;
  boolTerm?: (this: NonterminalNode, arg0: TerminalNode) => T;
  intTerm?: (this: NonterminalNode, arg0: IterationNode) => T;
  Identifier?: (this: NonterminalNode, arg0: NonterminalNode, arg1: IterationNode) => T;
  ident_start?: (this: NonterminalNode, arg0: NonterminalNode | TerminalNode) => T;
  ident_cont?: (this: NonterminalNode, arg0: NonterminalNode | TerminalNode) => T;
}

export interface JaySemantics extends Semantics {
  addOperation<T>(name: string, actionDict: JayActionDict<T>): this;
  extendOperation<T>(name: string, actionDict: JayActionDict<T>): this;
  addAttribute<T>(name: string, actionDict: JayActionDict<T>): this;
  extendAttribute<T>(name: string, actionDict: JayActionDict<T>): this;
}

export interface JayGrammar extends Grammar {
  createSemantics(): JaySemantics;
  extendSemantics(superSemantics: JaySemantics): JaySemantics;
}

declare const grammar: JayGrammar;
export default grammar;

