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

    //unreachable
    return null;
  }

  visitBinaryExpr(expr: Binary): LoxObject {
    const left: LoxObject = this.evaluate(expr.left);
    const right: LoxObject = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.GREATER:
        return (left as number) > (right as number);
      case TokenType.GREATER_EQUAL:
        return (left as number) >= (right as number);
      case TokenType.LESS:
        return (left as number) < (right as number);
      case TokenType.LESS_EQUAL:
        return (left as number) <= (right as number);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.MINUS:
        return (left as number) - (right as number);
      case TokenType.SLASH:
        return (left as number) / (right as number);
      case TokenType.STAR:
        return (left as number) * (right as number);
      case TokenType.PLUS:
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }
        if (typeof left === "string" && typeof right === "string") {
          return left + right;
        }
    }

    //unreachable
    return null;
  }

  private evaluate(expr: Expr): LoxObject {
    return expr.accept(this);
  }

  private isTruthy(object: LoxObject): boolean {
    if (object === null) return false;
    if (typeof object === "boolean") return object;
    return true;
  }

  private isEqual(a: LoxObject, b: LoxObject): boolean {
    if (a === null && b === null) return true;
    if (a === null) return false;

    return a === b;
  }
}
