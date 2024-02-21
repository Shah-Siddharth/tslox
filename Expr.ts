import Token from "./Token.ts";

export abstract class Expr {
  abstract accept<R>(visitor: Visitor<R>): R;
}

export interface Visitor<R> {
  visitAssignExpr(expr: Assign): R;
  visitBinaryExpr(expr: Binary): R;
  visitCallExpr(expr: Call): R;
  visitGetExpr(expr: Get): R;
  visitGroupingExpr(expr: Grouping): R;
  visitLiteralExpr(expr: Literal): R;
  visitLogicalExpr(expr: Logical): R;
  visitSetExpr(expr: Set): R;
  visitThisExpr(expr: This): R;
  visitUnaryExpr(expr: Unary): R;
  visitVariableExpr(expr: Variable): R;
}

export class Assign extends Expr {
  name: Token;
  value: Expr;
  constructor(name: Token, value: Expr) {
    super();
    this.name = name;
    this.value = value;
  }
  accept<R>(visitor: Visitor<R>) {
    return visitor.visitAssignExpr(this);
  }
}

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
  accept<R>(visitor: Visitor<R>) {
    return visitor.visitBinaryExpr(this);
  }
}

export class Call extends Expr {
  callee: Expr;
  paren: Token;
  args: Expr[];
  constructor(callee: Expr, paren: Token, args: Expr[]) {
    super();
    this.callee = callee;
    this.paren = paren;
    this.args = args;
  }
  accept<R>(visitor: Visitor<R>) {
    return visitor.visitCallExpr(this);
  }
}

export class Get extends Expr {
  object: Expr;
  name: Token;
  constructor(object: Expr, name: Token) {
    super();
    this.object = object;
    this.name = name;
  }
  accept<R>(visitor: Visitor<R>) {
    return visitor.visitGetExpr(this);
  }
}

export class Grouping extends Expr {
  expression: Expr;
  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }
  accept<R>(visitor: Visitor<R>) {
    return visitor.visitGroupingExpr(this);
  }
}

export class Literal extends Expr {
  value: any;
  constructor(value: any) {
    super();
    this.value = value;
  }
  accept<R>(visitor: Visitor<R>) {
    return visitor.visitLiteralExpr(this);
  }
}

export class Logical extends Expr {
  left: Expr;
  operator: Token;
  right: Expr;
  constructor(left: Expr, operator: Token, right: Expr) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
  accept<R>(visitor: Visitor<R>) {
    return visitor.visitLogicalExpr(this);
  }
}

export class Set extends Expr {
  object: Expr;
  name: Token;
  value: Expr;
  constructor(object: Expr, name: Token, value: Expr) {
    super();
    this.object = object;
    this.name = name;
    this.value = value;
  }
  accept<R>(visitor: Visitor<R>) {
    return visitor.visitSetExpr(this);
  }
}

export class This extends Expr {
  keyword: Token;
  constructor(keyword: Token) {
    super();
    this.keyword = keyword;
  }
  accept<R>(visitor: Visitor<R>) {
    return visitor.visitThisExpr(this);
  }
}

export class Unary extends Expr {
  operator: Token;
  right: Expr;
  constructor(operator: Token, right: Expr) {
    super();
    this.operator = operator;
    this.right = right;
  }
  accept<R>(visitor: Visitor<R>) {
    return visitor.visitUnaryExpr(this);
  }
}

export class Variable extends Expr {
  name: Token;
  constructor(name: Token) {
    super();
    this.name = name;
  }
  accept<R>(visitor: Visitor<R>) {
    return visitor.visitVariableExpr(this);
  }
}
