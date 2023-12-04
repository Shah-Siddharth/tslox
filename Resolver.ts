import { Assign, Expr, Variable, Visitor as ExprVisitor } from "./Expr.ts";
import { Interpreter } from "./Interpreter.ts";
import Lox from "./Lox.ts";
import {
  Block,
  Function as StmtFunction,
  Stmt,
  Var,
  Visitor as StmtVisitor,
} from "./Stmt.ts";
import Token from "./Token.ts";

type SyntaxVisitor<RE, RS> = ExprVisitor<RE> & StmtVisitor<RS>;

export class Resolver implements SyntaxVisitor<void, void> {
  private readonly interpreter: Interpreter;

  // stack to store scopes
  private scopes: Map<string, boolean>[] = [];

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
  }

  resolve(statements: Stmt[]): void;
  resolve(stmt: Stmt | Expr): void;
  resolve(target: Stmt[] | Stmt | Expr): void {
    if (target instanceof Array) target.forEach((stmt) => this.resolve(stmt));
    else target.accept(this);
  }

  private resolveFunction(func: StmtFunction): void {
    this.beginScope();
    for (const param of func.params) {
      this.declare(param);
      this.define(param);
    }

    this.resolve(func.body);
    this.endScope();
  }

  beginScope(): void {
    this.scopes.push(new Map());
  }

  endScope(): void {
    this.scopes.pop();
  }

  private declare(name: Token): void {
    if (this.scopes.length === 0) return;
    const scope = this.scopes[this.scopes.length - 1];
    scope.set(name.lexeme, false);
  }

  private define(name: Token): void {
    if (this.scopes.length === 0) return;
    const scope = this.scopes[this.scopes.length - 1];
    scope.set(name.lexeme, true);
  }

  private resolveLocal(expr: Expr, name: Token): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
      }
    }
  }

  visitBlockStmt(stmt: Block): void {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
  }

  visitFunctionStmt(stmt: StmtFunction): void {
    this.declare(stmt.name);
    this.define(stmt.name);
    this.resolveFunction(stmt);
  }

  visitVarStmt(stmt: Var): void {
    this.declare(stmt.name);
    if (stmt.initializer !== null) {
      this.resolve(stmt.initializer);
    }

    this.define(stmt.name);
  }

  visitAssignExpr(expr: Assign): void {
    this.resolve(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  visitVariableExpr(expr: Variable): void {
    if (this.scopes.length > 0) {
      if (!this.scopes[this.scopes.length - 1].get(expr.name.lexeme)) {
        Lox.error(
          expr.name,
          "Can't read local variable in its own initializer.",
        );
      }
    }

    this.resolveLocal(expr, expr.name);
  }
}
