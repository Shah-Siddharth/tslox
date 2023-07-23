import Token from "./Token.ts";

export abstract class Expr {}

export class Binary extends Expr {
  left: Expr;
  operator: Token;
  right: Expr;
  
  constructor(left: Expr, operator: Token, right: Expr) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}
