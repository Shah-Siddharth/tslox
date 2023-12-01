import { Expr, Visitor as ExprVisitor } from "./Expr.ts";
import { Interpreter } from "./Interpreter.ts";
import { Block, Stmt, Visitor as StmtVisitor } from "./Stmt.ts";

type SyntaxVisitor<RE, RS> = ExprVisitor<RE> & StmtVisitor<RS>

export class Resolver implements SyntaxVisitor<void, void> {
    private readonly interpreter: Interpreter;
    
    // stack to store scopes
    private scopes: Map<string, boolean>[] = [];

    constructor(interpreter: Interpreter) {
        this.interpreter = interpreter;
    }

    resolve(statements: Stmt[]): void
    resolve(stmt: Stmt | Expr): void
    resolve(target: Stmt[] | Stmt | Expr): void {
        if (target instanceof Array) target.forEach((stmt) => this.resolve(stmt));
        else target.accept(this);
    }

    beginScope(): void {
        this.scopes.push(new Map());
    }

    endScope(): void {
        this.scopes.pop();
    }

    visitBlockStmt(stmt: Block): void {
      this.beginScope();
      this.resolve(stmt.statements);
      this.endScope();
    }

    
}