import {
  Assign,
  Binary,
  Call,
  Expr,
  Get,
  Grouping,
  Literal,
  Logical,
  Set,
  Super,
  This,
  Unary,
  Variable,
  Visitor as ExprVisitor,
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
  INITIALIZER,
  METHOD,
}

enum ClassType {
  NONE,
  CLASS,
  SUBCLASS,
}

type SyntaxVisitor<RE, RS> = ExprVisitor<RE> & StmtVisitor<RS>;

export class Resolver implements SyntaxVisitor<void, void> {
  private readonly interpreter: Interpreter;

  // stack to store scopes
  private scopes: Map<string, boolean>[] = [];

  // tracking if code is in a function declaration
  private currentFunction: FunctionType = FunctionType.NONE;

  // tracking if we are currently in a class
  private currentClass: ClassType = ClassType.NONE;

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
    const enclosingClass: ClassType = this.currentClass;
    this.currentClass = ClassType.CLASS;

    this.declare(stmt.name);
    this.define(stmt.name);

    if (
      stmt.superclass != null && stmt.name.lexeme == stmt.superclass.name.lexeme
    ) {
      Lox.error(stmt.superclass.name, "A class can't inherit from itself.");
    }

    if (stmt.superclass != null) {
      this.currentClass = ClassType.SUBCLASS;
      this.resolve(stmt.superclass);
    }

    if (stmt.superclass != null) {
      this.beginScope();
      this.scopes[this.scopes.length - 1].set("super", true);
    }

    this.beginScope();
    this.scopes[this.scopes.length - 1].set("this", true);

    for (let method of stmt.methods) {
      let declaration: FunctionType = FunctionType.METHOD;
      if (method.name.lexeme === "init") {
        declaration = FunctionType.INITIALIZER;
      }
      this.resolveFunction(method, declaration);
    }

    this.endScope();
    if (stmt.superclass != null) this.endScope();
    this.currentClass = enclosingClass;
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
      if (this.currentFunction == FunctionType.INITIALIZER) {
        Lox.error(stmt.keyword, "Can't return a value from an initializer.");
      }
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

  visitSuperExpr(expr: Super): void {
    if (this.currentClass == ClassType.NONE) {
      Lox.error(expr.keyword, "Can't use 'super' outside of a class.");
    } else if (this.currentClass != ClassType.SUBCLASS) {
      Lox.error(
        expr.keyword,
        "Can't use 'super' in a class with no superclass",
      );
    }

    this.resolveLocal(expr, expr.keyword);
  }

  visitThisExpr(expr: This): void {
    if (this.currentClass == ClassType.NONE) {
      Lox.error(expr.keyword, "Can't use 'this' outside of a class.");
    }
    this.resolveLocal(expr, expr.keyword);
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
