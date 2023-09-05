import * as Expr from "./Expr.ts";

export default class AstPrinter implements Expr.Visitor<string> {
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
