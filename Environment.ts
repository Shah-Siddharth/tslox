import { LoxObject } from "./Interpreter.ts";
import RuntimeError from "./RuntimeError.ts";
import Token from "./Token.ts";

export class Environment {
  readonly enclosing: Environment | null;
  private values = new Map<string, LoxObject>();

  constructor(enclosing?: Environment) {
    if (enclosing) this.enclosing = enclosing;
    else this.enclosing = null;
  }

  define(name: string, value: LoxObject): void {
    this.values.set(name, value);
  }

  get(name: Token): LoxObject {
    const value = this.values.get(name.lexeme);
    if (value !== undefined) return value;

    if (this.enclosing !== null) return this.enclosing.get(name);

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }

  assign(name: Token, value: LoxObject): void {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.enclosing !== null) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable ${name.lexeme}.`);
  }
}
