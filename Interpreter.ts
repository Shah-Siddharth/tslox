import { Binary, Expr, Grouping, Literal, Unary, Visitor } from "./Expr.ts";
import Lox from "./Lox.ts";
import RuntimeError from "./RuntimeError.ts";
import Token from "./Token.ts";
import TokenType from "./TokenType.ts";

type LoxObject = number | string | boolean | null;

export class Interpreter implements Visitor<LoxObject> {
  interpret(expression: Expr): void {
    try {
      const value = this.evaluate(expression);
      console.log(value);
    } catch (error) {
      Lox.runtimeError(error);
    }
  }

  private stringify(object: LoxObject): string {
    if (object === null) return "nil";

    if (typeof object === "number") {
      let text = object.toString();
      if (text.endsWith(".0")) text = text.substring(0, text.length - 2);
      return text;
    }

    return object.toString();
  }

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
        this.checkNumberOperand(expr.operator, right);
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
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) > (right as number);
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) >= (right as number);
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) < (right as number);
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) <= (right as number);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) - (right as number);
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) / (right as number);
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) * (right as number);
      case TokenType.PLUS:
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }
        if (typeof left === "string" && typeof right === "string") {
          return left + right;
        }
        throw new RuntimeError(
          expr.operator,
          "Operands must be two numbers or two strings",
        );
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

  private checkNumberOperand(operator: Token, operand: LoxObject): void {
    if (typeof operand === "number") return;
    throw new RuntimeError(operator, "Operand must be a number");
  }

  private checkNumberOperands(
    operator: Token,
    left: LoxObject,
    right: LoxObject,
  ): void {
    if (typeof left === "number" && typeof right === "number") return;
    throw new RuntimeError(operator, "Operands must be numbers");
  }
}
