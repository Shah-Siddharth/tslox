import { Interpreter } from "./Interpreter.ts";

export abstract class LoxCallable {
    abstract arity(): number
    abstract call(interpreter: Interpreter, args: LoxObject[]): LoxObject
}

// native 'clock' function
export class LoxClockFunction extends LoxCallable {
    arity(): number {
      return 0;
    }

    call(interpreter: Interpreter,args: LoxObject[]): LoxObject {
      return Date.now().valueOf() / 1000.0;
    }
}

export type LoxObject = string
    | number
    | boolean
    | null