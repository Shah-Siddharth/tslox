import TokenType from "./TokenType.ts";

export default class Token {
  constructor(
    public type: TokenType,
    public lexeme: string,
    public literal: string | number | null,
    public line: number,
  ) {}

  toString(): string {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}
