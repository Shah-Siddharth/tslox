import AstPrinter from "./AstPrinter.ts";
import Parser from "./Parser.ts";
import RuntimeError from "./RuntimeError.ts";
import Scanner from "./Scanner.ts";
import Token from "./Token.ts";
import TokenType from "./TokenType.ts";

export default class Lox {
  static hadError = false;
  static hadRuntimeError = false;

  private static executeCode(code: string) {
    const scanner = new Scanner(code);
    const tokens = scanner.generateTokens();

    const parser = new Parser(tokens);
    const expression = parser.parse();

    if (Lox.hadError) return;
    console.log(new AstPrinter().print(expression));
  }

  private static runFile(filePath: string): void {
    const code = Deno.readTextFileSync(filePath);
    Lox.executeCode(code);

    if (Lox.hadError) Deno.exit(65);
    if (Lox.hadRuntimeError) Deno.exit(70);
  }

  private static runPrompt(): void {
    while (true) {
      const line = prompt(">");
      if (line == null) {
        break;
      }

      Lox.executeCode(line);

      Lox.hadError = false;
    }
  }

  static main(args: string[]) {
    if (args.length > 1) {
      console.log("Usage: tslox [script]");
    } else if (args.length === 1) {
      Lox.runFile(args[0]);
    } else {
      Lox.runPrompt();
    }
  }

  static reportError(line: number, where: string, message: string): void {
    console.log(`[line ${line}] Error ${where}: ${message}`);
    Lox.hadError = true;
  }

  static error(token: Token, message: string): void {
    if (token.type === TokenType.EOF) {
      Lox.reportError(token.line, "at end", message);
    } else {
      Lox.reportError(token.line, `at '${token.lexeme}'`, message);
    }
  }

  static runtimeError(error: RuntimeError): void {
    console.error(`${error.message}
                  [line ${error.token.line}]`);
    
    Lox.hadRuntimeError = true;
  }
}
