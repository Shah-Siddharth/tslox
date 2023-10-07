import { Expr } from "./Expr.ts";
import Token from "./Token.ts";

export abstract class Stmt {
  abstract accept<R>(visitor: Visitor<R>): R;
}

export interface Visitor<R> {
  visitExpressionStmt(stmt: Expression): R;
  visitPrintStmt(stmt: Print): R;
  visitVarStmt(stmt: Var): R;
}

export class Expression extends Stmt {
  expression: Expr;
  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }
  accept<R>(visitor: Visitor<R>) {
    return visitor.visitExpressionStmt(this);
  }
}

export class Print extends Stmt {
  expression: Expr;
  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }
  accept<R>(visitor: Visitor<R>) {
    return visitor.visitPrintStmt(this);
  }
}

export class Var extends Stmt {
  name: Token;
  initializer: Expr | null;
  constructor(name: Token, initializer: Expr) {
    super();
    this.name = name;
    this.initializer = initializer;
  }
  accept<R>(visitor: Visitor<R>) {
    return visitor.visitVarStmt(this);
  }
}
