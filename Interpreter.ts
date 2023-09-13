import { Binary, Expr, Grouping, Literal, Unary, Visitor } from "./Expr.ts";
import TokenType from "./TokenType.ts";

type LoxObject = number | string | boolean | null;

export class Interpreter implements Visitor<LoxObject> {
  visitLiteralExpr(expr: Literal): LoxObject {
    return expr.value;
  }

  visitGroupingExpr(expr: Grouping): LoxObject {
    return this.evaluate(expr.expression);
  }

  visitUnaryExpr(expr: Unary): LoxObject {
    const right: LoxObject = this.evaluate(expr.right);
    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        return -(right as number);
    }
    return null;
  }

  visitBinaryExpr(expr: Binary): LoxObject {
    return "temporary";
  }

  private evaluate(expr: Expr): LoxObject {
    return expr.accept(this);
  }

  private isTruthy(object: LoxObject): boolean {
    if (object == null) return false;
    if (typeof object == "boolean") return object;
    return true;
  }
}
