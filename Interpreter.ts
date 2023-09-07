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
      switch(expr.operator.type) {
        case TokenType.BANG:
          return !this.isTruthy(right);
        case TokenType.MINUS:
          return -(right as number);
      }
      return "temporary";
    }

    visitBinaryExpr(expr: Binary): LoxObject {
      const left: LoxObject = this.evaluate(expr.left);
      const right: LoxObject = this.evaluate(expr.right);

      switch(expr.operator.type) {
        case TokenType.MINUS:
          return (left as number) - (right as number);
      }

      return "temporary";
    }

    private evaluate(expr: Expr): LoxObject {
        return expr.accept(this);
    }

    private isTruthy(object: LoxObject): boolean {
      return true;  //TODO: Implement this function
    }
}