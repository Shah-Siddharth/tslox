import Token from './Token.ts';
import TokenType from './TokenType.ts';
import Lox from './Lox.ts';

export default class Scanner {
    private source: string;
    private tokens: Token[] = [];
    private start = 0;
    private current = 0;
    private line = 1;
    private static keywords: Map<string, TokenType>;

    static {
        this.keywords = new Map();
        this.keywords.set("and", TokenType.AND);
        this.keywords.set("or", TokenType.OR);
        this.keywords.set("if", TokenType.IF);
        this.keywords.set("else", TokenType.ELSE);
        this.keywords.set("true", TokenType.TRUE);
        this.keywords.set("false", TokenType.FALSE);
        this.keywords.set("nil", TokenType.NIL);
        this.keywords.set("fun", TokenType.FUN);
        this.keywords.set("class", TokenType.CLASS);
        this.keywords.set("return", TokenType.RETURN);
        this.keywords.set("for", TokenType.FOR);
        this.keywords.set("while", TokenType.WHILE);
        this.keywords.set("var", TokenType.VAR);
        this.keywords.set("print", TokenType.PRINT);
        this.keywords.set("super", TokenType.SUPER);
    }

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
            
            //whitespace, newlines, etc.
            case ' ':
            case '\r':
            case '\t':
                break;
            
            case '\n':
                this.line++;
                break;
            
            case '"':
                this.scanString();
                break;
            
            default:
                if (this.isDigit(c)) {
                    this.scanNumber();
                } else if (this.isAlpha(c)) {
                    this.scanIdentifier();
                }
                Lox.reportError(this.line, "", "Unexpected character.");
        }
    }

    private advance(): string {
        return this.source[this.current++];
    }

    private peek(): string {
        if (this.isAtEnd()) return '\0';
        return this.source[this.current];
    }

    private peekNext(): string {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source[this.current+1];
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

    private scanString(): void {
        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() === '\n') this.line++;
            this.advance();
        }

        if (this.isAtEnd()) {
            Lox.reportError(this.line, "", "Unterminated string.");
            return;
        }

        this.advance();     //consume the closing "

        const value: string = this.source.substring(this.start+1, this.current-1);
        this.addToken(TokenType.STRING, value);
    }

    private isDigit(c: string): boolean {
        return c >= '0' && c <= '9';
    }

    private isAlpha(c: string): boolean {
        return (c >= 'A' && c <= 'z') || (c == '_');
    }

    private isAlphaNumeric(c: string) {
        return this.isAlpha(c) || this.isDigit(c);
    }

    private scanNumber(): void {
        while (this.isDigit(this.peek())) this.advance();

        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            this.advance();
            while (this.isDigit(this.peek())) this.advance();
        }

        const value = parseFloat(this.source.substring(this.start, this.current));
        this.addToken(TokenType.NUMBER, value)
    }

    private scanIdentifier(): void {
        while (this.isAlphaNumeric(this.peek())) this.advance();

        const text = this.source.substring(this.start, this.current);
        let type = Scanner.keywords.get(text);
        if (type == undefined) {
            type = TokenType.IDENTIFIER;
        }
        this.addToken(type);
    }

}