import Token from './Token.ts'
import TokenType from './TokenType.ts';

export default class Scanner {
    private source: string;
    private tokens: Token[] = [];
    private start = 0;
    private current = 0;
    private line = 1;

    constructor(source: string) {
        this.source = source;
    }

    private isAtEnd(): boolean {
        return this.current >= this.source.length;
    }

    generateTokens(): Token[] {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF, "", null, this.line))

        return this.tokens;
    }

    private scanToken(): void {

    }
}