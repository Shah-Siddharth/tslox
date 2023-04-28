function executeCode(code: string) {
    //to do - where code gets executed
}

function runFile(filePath: string): void {
    const code = Deno.readTextFileSync(filePath);
    executeCode(code);
}

function runPrompt(): void {
    while (true) {
        const line = prompt(">");
        if (line == null) {
            break;
        }

        executeCode(line);
    }
}

function main(args: string[]) {
    if (args.length > 1) {
        console.log("Usage: tslox [script]");
    
    } else if (args.length === 1) {
        runFile(args[0]);
    
    } else {
        runPrompt();
    }
}


main(Deno.args);