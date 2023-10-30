import { Interpreter } from "./Interpreter.ts";

export abstract class LoxCallable {
    abstract arity(): number
    abstract call(interpreter: Interpreter, args: LoxObject[]): LoxObject
}

export type LoxObject = string
    | number
    | boolean
    | null