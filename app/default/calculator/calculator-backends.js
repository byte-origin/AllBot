// @ts-nocheck
var mathml = "http://www.w3.org/1998/Math/MathML";
var BigInteger = require('biginteger').BigInteger;
function convertToJSON(code) {
    return parse(code);
}
function span(className, contents) {
    var e = document.createElement("span");
    e.className = className;
    for(var i = 0; i < contents.length; i++) {
        var kid = contents[i];
        if(typeof kid === "string")
            kid = document.createTextNode(kid);
        e.appendChild(kid);
    }
    return e;
}
function convertToDOM(code) {
    var fancyOperator = {
        "+": "+",
        "-": "\u2212",
        "*": "\u00d7",
        "/": "\u00f7"
    };
    function convert(obj) {
        switch(obj.type) {
            case "number": return span("num", [obj.value]);
            case "+": case "-": case "*": case "/": return span("expr", [convert(obj.left), fancyOperator[obj.type], convert(obj.right)]);
            case "name": return span("var", [obj.id]);
        }
    }
    return convert(parse(code));
}
function mo(s) {
    var e = document.createElementNS(mathml, "mo");
    var t = document.createTextNode(s);
    e.appendChild(t);
    return {prec: 3, element: e};
}
function make(name, precedence, contents) {
    var e = document.createElementNS(mathml, name);
    for(var i = 0; i < contents.length; i++) {
        var kid = contents[i];
        var node;
        if(typeof (kid) === "string") {
            node = document.createTextNode(kid);
        } else {
            if(precedence !== null && (kid.prec < precedence || (kid.prec == precedence && i != 0))) {
                kid = make("mrow", null, [mo("("), kid, mo(")")]);
            }
            node = kid.element;
        }
        e.appendChild(node);
    }
    if(precedence === null) precedence = 3;
    return {prec: precedence, element: e};
}
function convertToMathML(code) {
    function convert(obj) {
        switch(obj.type) {
            case "number": return make("mn", 3, [obj.value]);
            case "name": return make("mi", 3, [obj.id]);
            case "+": return make("mrow", 1, [convert(obj.left), make("mo", 3, ["+"]), convert(obj.right)]);
            case "-": return make("mrow", 1, [convert(obj.left), make("mo", 3, ["-"]), convert(obj.right)]);
            case "*": return make("mrow", 2, [convert(obj.left), convert(obj.right)]);
            case "/": return make("mfrac", null, [convert(obj.left), convert(obj.right)]);
        }
    };
    var e = convert(parse(code));
    return make("math", null, [e]);
}
function evaluateAsFloat(code) {
    var variables = {};
    variables.e = Math.E;
    variables.pi = Math.PI;
    function evaluate(obj) {
        switch(obj.type) {
            case "number": return parseInt(obj.value);
            case "name": return variables[obj.id] || 0;
            case "+": return evaluate(obj.left) + evaluate(obj.right);
            case "-": return evaluate(obj.left) - evaluate(obj.right);
            case "*": return evaluate(obj.left) * evaluate(obj.right);
            case "/": return evaluate(obj.left) / evaluate(obj.right);
        }
    }
    return evaluate(parse(code));
}
function gcd(a, b) {
    while(!b.isZero()) {
        var tmp = a;
        a = b;
        b = tmp.remainder(b);
    }
    return a;
}

function Fraction(n, d) {
    if(d === undefined) d = new BigInteger(1);
    var x = gcd(n.abs(), d);
    this.n = n.divide(x);
    this.d = d.divide(x);
}
Fraction.prototype = {
    add: function(x) {
        return new Fraction(this.n.multiply(x.d).add(x.n.multiply(this.d)), this.d.multiply(x.d));
    },
    negate: function(x) {
        return new Fraction(this.n.negate(), this.d);
    },
    sub: function(x) {
        return this.add(x.negate());
    },
    mul: function(x) {
        return new Fraction(this.n.multiply(x.n), this.d.multiply(x.d));
    },
    div: function(x) {
        return new Fraction(this.n.multiply(x.d), this.d.multiply(x.n));
    },
    toString: function() {
        var ns = this.n.toString(), ds = this.d.toString();
        if(ds === "1") return ns; else return ns + "/" + ds;
    }
};
function evaluateAsFraction(code) {
    function evaluate(obj) {
        switch(obj.type) {
            case "number": return new Fraction(new BigInteger(obj.value));
            case "+": return evaluate(obj.left).add(evaluate(obj.right));
            case "-": return evaluate(obj.left).sub(evaluate(obj.right));
            case "*": return evaluate(obj.left).mul(evaluate(obj.right));
            case "/": return evaluate(obj.left).div(evaluate(obj.right));
            case "name": throw new SyntaxError("No variables in fraction mode, sorry");
        }
    }
    return evaluate(parse(code));
}
function compileToJSFunction(code) {
    function emit(ast) {
        switch(ast.type) {
            case "number": return ast.value;
            case "name":
                if(ast.id !== "x") throw SyntaxError("Only the name 'x' is allowed");
                return ast.id;
            case "+": case "-": case "*": case "/": return "(" + emit(ast.left) + " " + ast.type + " " + emit(ast.right) + ")";
        }
    }
    return Function("x", `return ${emit(parse(code))};`);
}
function compileToComplexFunction(code) {
    var values = [
        {type: "arg", arg0: "z_re", arg1: null},
        {type: "arg", arg0: "z_im", arg1: null}
    ];
    function valuesEqual(n1, n2) {
        return n1.type === n2.type && n1.arg0 === n2.arg0 && n1.arg1 === n2.arg1;
    }
    function valueToIndex(v) {
        for(var i = 0; i < values.length; i++) {
            if(valuesEqual(values[i], v)) return i;
        }
        values.push(v);
        return values.length - 1;
    }
    function num(s) {
        return valueToIndex({type: "number", arg0: s, arg1: null});
    }
    function op(op, a, b) {
        return valueToIndex({type: op, arg0: a, arg1: b});
    }
    function isNumber(i) {
        return values[i].type === "number";
    }
    function isZero(i) {
        return isNumber(i) && values[i].arg0 === "0";
    }
    function isOne(i) {
        return isNumber(i) && values[i].arg0 === "1";
    }
    function add(a, b) {
        if(isZero(a)) return b;
        if(isZero(b)) return a;
        if(isNumber(a) && isNumber(b)) return num(String(Number(values[a].arg0) + Number(values[b].arg0)));
        return op("+", a, b);
    }
    function sub(a, b) {
        if(isZero(b)) return a;
        if(isNumber(a) && isNumber(b)) return num(String(Number(values[a].arg0) - Number(values[b].arg0)));
        return op("-", a, b);
    }
    function mul(a, b) {
        if(isZero(a)) return a;
        if(isZero(b)) return b;
        if(isOne(a)) return b;
        if(isOne(b)) return a;
        if(isNumber(a) && isNumber(b)) return num(String(Number(values[a].arg0) * Number(values[b].arg0)));
        return op("*", a, b);
    }
    function div(a, b) {
        if(isOne(b)) return a;
        if(isNumber(a) && isNumber(b) && !isZero(b)) return num(String(Number(values[a].arg0) / Number(values[b].arg0)));
        return op("/", a, b);
    }
    function ast_to_ir(obj) {
        switch(obj.type) {
            case "number": return {re: num(obj.value), im: num("0")};
            case "+": case "-":
                var a = ast_to_ir(obj.left), b = ast_to_ir(obj.right);
                var f = (obj.type === "+" ? add : sub);
                return {re: f(a.re, b.re), im: f(a.im, b.im)};
            case "*":
                var a = ast_to_ir(obj.left), b = ast_to_ir(obj.right);
                return {re: sub(mul(a.re, b.re), mul(a.im, b.im)), im: add(mul(a.re, b.im), mul(a.im, b.re))};
            case "/":
                var a = ast_to_ir(obj.left), b = ast_to_ir(obj.right);
                var t = add(mul(b.re, b.re), mul(b.im, b.im));
                return {re: div(add(mul(a.re, b.re), mul(a.im, b.im)), t), im: div(sub(mul(a.im, b.re), mul(a.re, b.im)), t)};
            case "name":
                if(obj.id === "i") return {re: num("0"), im: num("1")};
                if(obj.id === "z") return {re: 0, im: 1};
                throw SyntaxError(`Undefined variable: "${obj.id}".`);
        }
    }
    function computeUseCounts(values) {
        var binaryOps = {"+": 1, "-": 1, "*": 1, "/": 1};
        var useCounts = [];
        for(var i = 0; i < values.length; i++) {
            useCounts[i] = 0;
            var node = values[i];
            if(node.type in binaryOps) {
                useCounts[node.arg0]++;
                useCounts[node.arg1]++;
            }
        }
        return useCounts;
    }
    function ir_to_js(values, result) {
        var useCounts = computeUseCounts(values);
        var code = "";
        var next_temp_id = 0;
        var js = [];
        for(var i = 0; i < values.length; i++) {
            var node = values[i];
            if(node.type === "number" || node.type === "arg") {
                js[i] = node.arg0;
            } else {
                js[i] = "(" + js[node.arg0] + node.type + js[node.arg1] + ")";
                if(useCounts[i] > 1) {
                    var name = `t ${next_temp_id++}`;
                    code += `var ${name} = ${js[i]};\n`;
                    js[i] = name;
                }
            }
        }
        code += `return {re: ${js[result.re]}, im: ${js[result.im]}};\n`;
        return code;
    }
    var ast = parse(code);
    var result = ast_to_ir(ast);
    var code = ir_to_js(values, result);
    return Function("z_re, z_im", code);
}
var parseModes = {
    json: convertToJSON,
    blocks: convertToDOM,
    mathml: convertToMathML,
    calc: evaluateAsFloat,
    fraction: evaluateAsFraction,
    graph: compileToJSFunction,
    complex: compileToComplexFunction
};