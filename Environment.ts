import { LoxObject } from "./types.ts";
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

  ancestor(distance: number): Environment | null {
    if (distance === 0) return this;
    else {
      let environment = this.enclosing || null;
      for (let i = 1; i < distance; i++) {
        environment = environment?.enclosing || null;
      }
      return environment;
    }
  }

  get(name: Token): LoxObject {
    const value = this.values.get(name.lexeme);
    if (value !== undefined) return value;

    if (this.enclosing !== null) return this.enclosing.get(name);

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }

  getAt(distance: number, name: string): LoxObject {
    // non-undefined assertion since we know the variable will be there if the resolver did it's job correctly
    return this.ancestor(distance)!.values.get(name)!;
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

  assignAt(distance: number, name: Token, value: LoxObject) {
    this.ancestor(distance)!.values.set(name.lexeme, value);
  }
}
