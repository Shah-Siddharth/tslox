import Token from "./Token.ts";
import TokenType from "./TokenType.ts";

export default class Lox {
  static hadError = false;

  private static executeCode(code: string) {
    //to do - where code gets executed
    console.log(code);
  }

  private static runFile(filePath: string): void {
    const code = Deno.readTextFileSync(filePath);
    Lox.executeCode(code);

    if (Lox.hadError) {
      Deno.exit(65);
    }
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

  static report(line: number, where: string, message: string): void {
    console.log(`[line ${line}] Error ${where}: ${message}`);
    Lox.hadError = true;
  }

  static error(token: Token, message: string): void {
    if (token.type === TokenType.EOF) {
      Lox.report(token.line, "at end", message);
    } else {
      Lox.report(token.line, `at '${token.lexeme}'`, message);
    }
  }
}
