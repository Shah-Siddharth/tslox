function runFile(filePath: string): void {
    console.log("Running file", filePath);
}

function runPrompt(): void {
    console.log("Running prompt");
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