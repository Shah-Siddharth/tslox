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
  private readonly isInitializer: boolean;

  constructor(declaration: Function, closure: Environment, isInitializer: boolean) {
    super();
    this.declaration = declaration;
    this.closure = closure;
    this.isInitializer = isInitializer;
  }

  bind(instance: LoxInstance): LoxFunction {
    const environment = new Environment(this.closure);
    environment.define("this", instance);
    return new LoxFunction(this.declaration, environment, this.isInitializer);
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
        if (this.isInitializer) return this.closure.getAt(0, "this");
        return e.value;
      }
    }
    if (this.isInitializer) return this.closure.getAt(0, "this");
    return null;
  }
}

export class LoxClass extends LoxCallable {
  readonly name: string;
  private readonly methods: Map<string, LoxFunction>;

  constructor(name: string, methods: Map<string, LoxFunction>) {
    super();
    this.name = name;
    this.methods = methods;
  }

  findMethod(name: string): LoxFunction | null {
    if (this.methods.has(name)) {
      return this.methods.get(name)!;
    }

    return null;
  }

  public call(interpreter: Interpreter, args: LoxObject[]): LoxObject {
    const instance = new LoxInstance(this);
    const initializer = this.findMethod("init");
    if (initializer) {
      initializer.bind(instance).call(interpreter, args);
    }
    return instance;
  }

  arity(): number {
    const initializer = this.findMethod("init");
    if (initializer == null) return 0;
    return initializer.arity();
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

    const method = this._class.findMethod(name.lexeme);
    if (method) return method.bind(this);

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
