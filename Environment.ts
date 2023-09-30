import { LoxObject } from "./Interpreter.ts";
import RuntimeError from "./RuntimeError.ts";
import Token from "./Token.ts";

export class Environment {
    private values = new Map<string, LoxObject>();

    define(name: string, value: LoxObject): void {
        this.values.set(name, value);
    }

    get(name: Token): LoxObject {
        const value = this.values.get(name.lexeme);
        if (value !== undefined) return value;

        throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`)
    }
}