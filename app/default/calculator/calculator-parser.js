var assert = require('assert');
function tokenize(code) {
    var results = [];
    var tokenRegExp = /\s*([A-Za-z]+|[0-9]+|\S)\s*/g;
    var m;
    while ((m = tokenRegExp.exec(code)) !== null)
        results.push(m[1]);
    return results;
}
function isNumber(token) {
    return token !== undefined && token.match(/^[0-9]+$/) !== null;
}
function isName(token) {
    return token !== undefined && token.match(/^[A-Za-z]+$/) !== null;
}
function parse(code) {    
    var tokens = tokenize(code);
    var position = 0;
    function peek() {
        return tokens[position];
    }
    function consume(token) {
        assert.strictEqual(token, tokens[position]);
        position++;
    }
    function parsePrimaryExpr() {
        var t = peek();
        if (isNumber(t)) {
            consume(t);
            return {type: "number", value: t};
        } else if (isName(t)) {
            consume(t);
            return {type: "name", id: t};
        } else if (t === "(") {
            consume(t);
            var expr = parseExpr();
            if (peek() !== ")")
                throw new SyntaxError(`Expected ")"`);
            consume(")");
            return expr;
        } else {
            throw new SyntaxError("Expected a number, a variable, or parentheses.");
        }
    }
    function parseMulExpr() {
        var expr = parsePrimaryExpr();
        var t = peek();
        while (t === "*" || t === "/") {
            consume(t);
            var rhs = parsePrimaryExpr();
            expr = {type: t, left: expr, right: rhs};
            t = peek();
        }
        return expr;
    }
    function parseExpr() {
        var expr = parseMulExpr();
        var t = peek();
        while (t === "+" || t === "-") {
            consume(t);
            var rhs = parseMulExpr();
            expr = {type: t, left: expr, right: rhs};
            t = peek();
        }
        return expr;
    }
    var result = parseExpr();
    if (position !== tokens.length)
        throw new SyntaxError(`Unexpected "${peek()}"`);
    return result;
}