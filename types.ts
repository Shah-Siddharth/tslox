import { Environment } from "./Environment.ts";
import { Interpreter } from "./Interpreter.ts";
import RuntimeError from "./RuntimeError.ts";
import { Function } from "./Stmt.ts";
import Token from "./Token.ts";

export abstract class LoxCallable {
  abstract arity(): number;
  abstract call(interpreter: Interpreter, args: LoxObject[]): LoxObject;
}

// native 'clock' function
export class LoxClockFunction extends LoxCallable {
  arity(): number {
    return 0;
  }

  call(interpreter: Interpreter, args: LoxObject[]): LoxObject {
    return Date.now().valueOf() / 1000.0;
  }
}

export class LoxFunction extends LoxCallable {
  private readonly declaration: Function;
  private readonly closure: Environment;

  constructor(declaration: Function, closure: Environment) {
    super();
    this.declaration = declaration;
    this.closure = closure;
  }

  arity(): number {
    return this.declaration.params.length;
  }

  call(interpreter: Interpreter, args: LoxObject[]): LoxObject {
    const environment = new Environment(this.closure);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (e) {
      if (e instanceof ReturnException) {
        return e.value;
      }
    }
    return null;
  }
}

export class LoxClass extends LoxCallable {
  readonly name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  public call(interpreter: Interpreter, args: LoxObject[]): LoxObject {
    const instance = new LoxInstance(this);
    return instance;
  }

  arity(): number {
    return 0;
  }

  toString(): string {
    return this.name;
  }
}

export class LoxInstance {
  private _class: LoxClass;
  private readonly fields = new Map<string, LoxObject>();

  constructor(_class: LoxClass) {
    this._class = _class;
  }

  toString(): string {
    return this._class.name + " instance";
  }

  get(name: Token): LoxObject {
    if (this.fields.has(name.lexeme)) return this.fields.get(name.lexeme)!;
    throw new RuntimeError(name, `Undefined property ${name.lexeme}.`);
  }

  set(name: Token, value: LoxObject): void {
    this.fields.set(name.lexeme, value);
  }
}

export class ReturnException extends Error {
  readonly value: LoxObject;

  constructor(value: LoxObject) {
    super();
    this.value = value;
  }
}

export type LoxObject =
  | LoxInstance
  | LoxCallable
  | string
  | number
  | boolean
  | null;
