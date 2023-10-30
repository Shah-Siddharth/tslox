import { Environment } from "./Environment.ts";
import {
  Assign,
  Binary,
  Expr,
  Grouping,
  Literal,
  Logical,
  Unary,
  Variable,
  Visitor as ExprVisitor,
  Call,
} from "./Expr.ts";
import Lox from "./Lox.ts";
import RuntimeError from "./RuntimeError.ts";
import {
  Block,
  Expression,
  If,
  Print,
  Stmt,
  Var,
  Visitor as StmtVisitor,
  While,
} from "./Stmt.ts";
import Token from "./Token.ts";
import TokenType from "./TokenType.ts";
import { LoxCallable, LoxObject } from "./types.ts";

export class Interpreter implements ExprVisitor<LoxObject>, StmtVisitor<void> {
  private environment = new Environment();

  interpret(statements: Stmt[]): void {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
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

  private execute(stmt: Stmt): void {
    stmt.accept(this);
  }

  executeBlock(statements: Stmt[], environment: Environment): void {
    const previousEnv = this.environment;
    try {
      this.environment = environment;

      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previousEnv;
    }
  }

  visitBlockStmt(stmt: Block): void {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  visitExpressionStmt(stmt: Expression): void {
    this.evaluate(stmt.expression);
  }

  visitIfStmt(stmt: If): void {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch !== null) {
      this.execute(stmt.elseBranch);
    }
  }

  visitPrintStmt(stmt: Print): void {
    const value: LoxObject = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
  }

  visitVarStmt(stmt: Var): void {
    let value: LoxObject = null;
    if (stmt.initializer !== null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
  }

  visitWhileStmt(stmt: While): void {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
  }

  visitAssignExpr(expr: Assign): LoxObject {
    const value: LoxObject = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }

  visitLiteralExpr(expr: Literal): LoxObject {
    return expr.value;
  }

  visitLogicalExpr(expr: Logical): LoxObject {
    const left: LoxObject = this.evaluate(expr.left);

    if (expr.operator.type === TokenType.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
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

  visitVariableExpr(expr: Variable): LoxObject {
    return this.environment.get(expr.name);
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

  visitCallExpr(expr: Call): LoxObject {
    const callee: any = this.evaluate(expr.callee);    
    const args: LoxObject[] = expr.args.map((arg) => this.evaluate(arg));

    if (!(callee instanceof LoxCallable)) {
      throw new RuntimeError(expr.paren, "Can only call functions and classes.");
    }

    if (args.length !== callee.arity()) {
      throw new RuntimeError(expr.paren, `Expected ${callee.arity()} arguments but got ${args.length}.`);
    }

    return callee.call(this, args);
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
