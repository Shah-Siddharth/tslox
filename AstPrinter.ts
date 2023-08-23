import * as Expr from "./Expr.ts";
import Token from "./Token.ts";
import TokenType from "./TokenType.ts";

export default class AstPrinter implements Expr.Visitor<string> {
  static main() {
    const expression = new Expr.Binary(
      new Expr.Unary(
        new Token(TokenType.MINUS, "-", null, 1),
        new Expr.Literal(123),
      ),
      new Token(TokenType.STAR, "*", null, 1),
      new Expr.Grouping(new Expr.Literal(45.67)),
    );

    console.log(new AstPrinter().print(expression));
  }

  print(expr: Expr.Expr): string {
    return expr.accept(this);
  }

  private parenthisize(name: string, ...exprs: Expr.Expr[]): string {
    let content = `(${name}`;
    for (const expr of exprs) {
      content += " ";
      content += expr.accept(this);
    }
    content += ")";

    return content;
  }

  public visitBinaryExpr(expr: Expr.Binary): string {
    return this.parenthisize(expr.operator.lexeme, expr.left, expr.right);
  }

  public visitGroupingExpr(expr: Expr.Grouping): string {
    return this.parenthisize("group", expr.expression);
  }

  public visitLiteralExpr(expr: Expr.Literal): string {
    if (expr.value == null) return "nil";
    return expr.value.toString();
  }

  public visitUnaryExpr(expr: Expr.Unary): string {
    return this.parenthisize(expr.operator.lexeme, expr.right);
  }
}

AstPrinter.main();
