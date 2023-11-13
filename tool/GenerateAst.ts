class GenerateAst {
  public static main(args = Deno.args) {
    if (args.length !== 1) {
      console.log("Usage: generate_ast <output directory>");
      Deno.exit(64);
    }

    const outputDir = args[0];
    this.defineAst(outputDir, "Expr", [
      "Assign = name: Token, value: Expr",
      "Binary = left: Expr, operator: Token, right: Expr",
      "Call = callee: Expr, paren: Token, args: Expr[]",
      "Grouping = expression: Expr",
      "Literal = value: any",
      "Logical = left: Expr, operator: Token, right: Expr",
      "Unary = operator: Token, right: Expr",
      "Variable = name: Token",
    ]);

    this.defineAst(outputDir, "Stmt", [
      "Block = statements: Stmt[]",
      "Expression = expression: Expr",
      "Function = name: Token, params: Token[], body: Stmt[]",
      "If = condition: Expr, thenBranch: Stmt, elseBranch: Stmt | null",
      "Print = expression: Expr",
      "Return = keyword: Token, value: Expr",
      "Var = name: Token, initializer: Expr | null",
      "While = condition: Expr, body: Stmt",
    ]);
  }

  private static defineAst(
    outputDir: string,
    baseName: string,
    types: string[],
  ) {
    const path = `${outputDir}/${baseName}.ts`;
    const encoder = new TextEncoder();

    let content = `import Token from "./Token.ts";`;
    content += "\n\n";
    content += `export abstract class ${baseName} {`;

    //the base accept() method
    content += `abstract accept<R>(visitor: Visitor<R>): R;`;
    content += `}\n\n`;

    content += this.defineVisitor(baseName, types);
    content += `\n\n`;

    //the AST classes for each type
    for (const type of types) {
      const className = type.split("=")[0].trim();
      const fields = type.split("=")[1].trim();
      content += this.defineType(baseName, className, fields);
      content += "\n\n";
    }

    Deno.writeFile(path, encoder.encode(content));
  }

  private static defineType(
    baseName: string,
    className: string,
    fields: string,
  ) {
    let content = "";
    content += `export class ${className} extends ${baseName} {`;

    const fieldList = fields.split(",");
    for (const field of fieldList) {
      content += field + ";";
    }

    content += `constructor(${fields}){`;
    content += `super();`;
    for (const field of fieldList) {
      const name = field.split(":")[0].trim();
      content += `this.${name} = ${name};`;
    }

    content += "}";

    content += `accept<R>(visitor: Visitor<R>) {
      return visitor.visit${className + baseName}(this);
    }`;

    content += "}";

    return content;
  }

  private static defineVisitor(
    baseName: string,
    types: string[],
  ) {
    let content = "";
    content += `export interface Visitor<R> {`;

    for (const type of types) {
      const typeName = type.split("=")[0].trim();
      content += `visit${typeName}${baseName}(`;
      content += `${baseName.toLowerCase()}: ${typeName}): R;`;
    }

    content += "}";
    return content;
  }
}

GenerateAst.main();
