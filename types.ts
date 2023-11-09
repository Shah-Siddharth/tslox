import { Environment } from "./Environment.ts";
import { Interpreter } from "./Interpreter.ts";
import { Function } from "./Stmt.ts";

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

  constructor(declaration: Function) {
    super();
    this.declaration = declaration;
  }

  arity(): number {
    return this.declaration.params.length;
  }

  call(interpreter: Interpreter, args: LoxObject[]): LoxObject {
    const environment = new Environment(interpreter.globals);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    interpreter.executeBlock(this.declaration.body, environment);
    return null;
  }
}

export type LoxObject =
  | string
  | number
  | boolean
  | null;
