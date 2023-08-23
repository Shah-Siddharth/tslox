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

  static reportError(line: number, where: string, message: string): void {
    console.log(`[line ${line}] Error ${where}: ${message}`);
    Lox.hadError = true;
  }
}
