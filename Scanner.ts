import Token from './Token.ts';
import TokenType from './TokenType.ts';
import Lox from './Lox.ts';

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
        const c = this.advance();
        switch(c) {
            //single character lexemes
            case '(':
                this.addToken(TokenType.LEFT_PAREN);
                break;
            case ')':
                this.addToken(TokenType.RIGHT_PAREN);
                break;
            case '{':
                this.addToken(TokenType.LEFT_BRACE);
                break;
            case '}':
                this.addToken(TokenType.RIGHT_BRACE);
                break;
            case ',':
                this.addToken(TokenType.COMMA);
                break;
            case '.':
                this.addToken(TokenType.DOT);
                break;
            case '-':
                this.addToken(TokenType.MINUS);
                break;
            case '+':
                this.addToken(TokenType.PLUS);
                break;
            case ';':
                this.addToken(TokenType.SEMICOLON);
                break;
            case '*':
                this.addToken(TokenType.STAR);
                break;
            
            //double character lexemes
            case '!':
                this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
                break;
            case '=':
                this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
                break;
            case '<':
                this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
                break;
            case '>':
                this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
                break;

            // '/' character - can represent start of comments as well
            case '/':
                if(this.match('/')) {
                    while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
                } else {
                    this.addToken(TokenType.SLASH);
                }
                break;
            
            default:
                Lox.reportError(this.line, "", "Unexpected character");
        }
    }

    private advance(): string {
        return this.source[this.current++];
    }

    private peek(): string {
        if (this.isAtEnd()) return '\0';
        return this.source[this.current];
    }

    private addToken(type: TokenType, literal: (string|number|null) = null): void {
        const text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.line));
    }

    private match(expected: string): boolean {
        if (this.isAtEnd()) return false;
        if (this.source[this.current] != expected) return false;

        this.current++;
        return true;
    }
}