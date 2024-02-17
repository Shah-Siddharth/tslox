import {
  Assign,
  Binary,
  Call,
  Expr,
  Get,
  Grouping,
  Literal,
  Logical,
  Unary,
  Variable,
  Visitor as ExprVisitor,
  Set,
} from "./Expr.ts";
import { Interpreter } from "./Interpreter.ts";
import Lox from "./Lox.ts";
import {
  Block,
  Class,
  Expression,
  Function as StmtFunction,
  If,
  Print,
  Return,
  Stmt,
  Var,
  Visitor as StmtVisitor,
  While,
} from "./Stmt.ts";
import Token from "./Token.ts";

enum FunctionType {
  NONE,
  FUNCTION,
}

type SyntaxVisitor<RE, RS> = ExprVisitor<RE> & StmtVisitor<RS>;

export class Resolver implements SyntaxVisitor<void, void> {
  private readonly interpreter: Interpreter;

  // stack to store scopes
  private scopes: Map<string, boolean>[] = [];

  // tracking if code is in a function declaration
  private currentFunction: FunctionType = FunctionType.NONE;

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
  }

  resolve(statements: Stmt[]): void;
  resolve(stmt: Stmt | Expr): void;
  resolve(target: Stmt[] | Stmt | Expr): void {
    if (target instanceof Array) target.forEach((stmt) => this.resolve(stmt));
    else target.accept(this);
  }

  private resolveFunction(func: StmtFunction, type: FunctionType): void {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;

    this.beginScope();
    for (const param of func.params) {
      this.declare(param);
      this.define(param);
    }

    this.resolve(func.body);
    this.endScope();

    this.currentFunction = enclosingFunction;
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
    if (scope.has(name.lexeme)) {
      Lox.error(name, "Variable with this name already exists in this scope.");
    }
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

  visitClassStmt(stmt: Class): void {
    this.declare(stmt.name);
    this.define(stmt.name);
  }

  visitExpressionStmt(stmt: Expression): void {
    this.resolve(stmt.expression);
  }

  visitFunctionStmt(stmt: StmtFunction): void {
    this.declare(stmt.name);
    this.define(stmt.name);
    this.resolveFunction(stmt, FunctionType.FUNCTION);
  }

  visitIfStmt(stmt: If): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch !== null) this.resolve(stmt.elseBranch);
  }

  visitPrintStmt(stmt: Print): void {
    this.resolve(stmt.expression);
  }

  visitReturnStmt(stmt: Return): void {
    if (this.currentFunction === FunctionType.NONE) {
      Lox.error(stmt.keyword, "Can't return from top-level code.");
    }
    if (stmt.value !== null) {
      this.resolve(stmt.value);
    }
  }

  visitVarStmt(stmt: Var): void {
    this.declare(stmt.name);
    if (stmt.initializer !== null) {
      this.resolve(stmt.initializer);
    }

    this.define(stmt.name);
  }

  visitWhileStmt(stmt: While): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.body);
  }

  visitAssignExpr(expr: Assign): void {
    this.resolve(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  visitBinaryExpr(expr: Binary): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  visitCallExpr(expr: Call): void {
    this.resolve(expr.callee);
    for (const arg of expr.args) {
      this.resolve(arg);
    }
  }

  visitGetExpr(expr: Get): void {
    this.resolve(expr.object);
  }

  visitGroupingExpr(expr: Grouping): void {
    this.resolve(expr.expression);
  }

  visitLiteralExpr(_expr: Literal): void {
    return;
  }

  visitLogicalExpr(expr: Logical): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  visitSetExpr(expr: Set): void {
    this.resolve(expr.value);
    this.resolve(expr.object);
  }

  visitUnaryExpr(expr: Unary): void {
    this.resolve(expr.right);
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
