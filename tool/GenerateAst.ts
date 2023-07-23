class GenerateAst {
  public static main(args = Deno.args) {
    if (args.length !== 1) {
      console.log("Usage: generate_ast <output directory>");
      Deno.exit(64);
    }

    const outputDir = args[0];
    this.defineAst(outputDir, "Expr", [
      "Binary = left: Expr, operator: Token, right: Expr",
      // To add
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
    content += `export abstract class ${baseName} {`;
    content += `}`;

    for (const type of types) {
      const className = type.split("=")[0].trim();
      const fields = type.split("=")[1].trim();
      content += this.defineType(baseName, className, fields);
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

    content += `}`;
    content += "}";

    return content;
  }
}

GenerateAst.main();
