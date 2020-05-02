
@{%
const moo = require("moo")
const lexer = moo.compile([

    {type: "COMMENT", match: /\/\*[\W\w]*?\*\//, value: x => x.slice(2, -3)},
    {type: "COMMENT", match: /\/{2}(?:.*)$/, value: x => x.slice(2)},

    {type: "WS", match: /[ \t\n\r]+/, lineBreaks: true},
    {type: "DELIMITER", match: ";"},

    {type: "STRING",  match: /".*?"/, value: x => JSON.parse(x)},
    {type: "STRING",  match: /'.*?'/, value: x => JSON.parse('"' + x.slice(1, -1) + '"')},
    {type: "NUMBER",  match: /-?[1-9]\d*/, value: x => Number(x)},
    {type: "NUMBER",  match: /-?(?:[1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0)/, value: x => Number(x)},
    {type: "NUMBER",  match: /0x[0-9A-Fa-f]+/, value: x => parseInt(x)},
    {type: "NUMBER",  match: /0b[01]+/, value: x => parseInt(x)},
    {type: "NUMBER",  match: /0[0-7]+/, value: x => parseInt(x)},
    {type: "COLOR",   match: /#[A-Fa-f0-9]{3}(?:[A-Fa-f0-9](?:[A-Fa-f0-9]{2}(?:[A-Fa-f0-9]{2})))?/},

    {type: "COMMA", match: ","},
    {type: "LP", match: "("},
    {type: "RP", match: ")"},
    {type: "LMP", match: "["},
    {type: "RMP", match: "]"},
    {type: "GT", match: ">"},
    {type: "LT", match: "<"},
    {type: 'OP', match: /[&|\=\.]{2}|[\+\-\*\/\%\!\<\>=]/},

    // Keywords
    {type: "KW_VAR", match: "var"},
    {type: "KW_IN", match: "in"},
    {type: "KW_LET", match: "let"},
    {type: "KW_WHEN", match: "when"},
    {type: "KW_DEFINE", match: "define"},
    {type: "KW_END", match: "end"},
    {type: "KW_WHILE", match: "while"},
    {type: "KW_REPEAT", match: "repeat"},
    {type: "KW_IF", match: "if"},
    {type: "KW_ELSE", match: "else"},
    {type: "KW_USING", match: "using"},

    {type: "BLOCKIDEN", match: /[a-zA-Z_][0-9a-zA-Z_]*\.[a-zA-Z_][0-9a-zA-Z_]*/},
    {type: "IDEN", match: /[a-zA-Z_][0-9a-zA-Z_]*/},

    {type: 'UIDEN', match: /[^\n \t"'()<>=*\/+-]+/},
    {type: "ERROR", error: true},
])

function postProgram (d) {
    
    return {
        type: "Program",
        listeners: d[1].filter(ast => ast.type === "EventExpression"),
        procedures: d[1].filter(ast => ast.type === "FunctionDefinition"),
        variables: d[1].filter(ast => ast.type === "VariableDefinition"),
        usings: d[1].filter(ast => ast.type === "UsingStatement").map(v => v.file)
    }
}

%}

@lexer lexer

Program -> _ _Program _ {% postProgram %}

_Program -> _Program _ OutsideStatement {% d => {
        const r = d[0].map(v => v)
        r.push(d[2])
        return r
    } %}
    | OutsideStatement {% v => [v[0]] %}

OutsideStatement ->
    UsingStatement {% id %}
    | VariableDefinition {% id %}
    | FunctionDefinition {% id %}
    | EventListener {% id %}
    | Comment {% id %}

UsingStatement -> %KW_USING _ %STRING {% d => ({
    type: "UsingStatement",
    file: d[2].value,
    line: d[0].line,
    col: d[0].col
}) %}

Block -> _Block {% id %}
    | _ {% v => [] %}

_Block -> Statement
    | _Block _ Statement {% d => {
        const r = d[0].map(v => v)
        r.push(d[2])
        return r
    } %}

Statement -> 
    FunctionCall {% id %}
    | SetVariable {% id %}
    | RepeatCondition {% id %}
    | WhileCondition {% id %}
    | IfCondition {% id %}
    | Comment {% id %}

@{%

function variableDefinition (d) {
    return {
        type: "VariableDefinition",
        islocal: d[0] === "let",
        name: d[2].value,
        value: d[6]
    }
}

%}

VariableDefinition ->
    %KW_VAR __ VariableName {% variableDefinition %}
    | %KW_VAR __ VariableName _ "=" _ Constant {% variableDefinition %}
    | %KW_VAR __ VariableName _ "=" _ ListConstant {% variableDefinition %}
    | %KW_LET __ VariableName {% variableDefinition %}
    | %KW_LET __ VariableName _ "=" _ Constant {% variableDefinition %}
    | %KW_LET __ VariableName _ "=" _ ListConstant {% variableDefinition %}

VariableName -> (%IDEN | %BLOCKIDEN) {% v => v[0][0] %}

EventListener ->
    %KW_WHEN __ %BLOCKIDEN _ %LP _ ArgList _ %RP _ FunctionBody _ End
{% (d, pos, reject) => {
    return {
        type: "EventExpression",
        name: d[2].value,
        args: d[6],
        body: d[10],
        line: d[0].line,
        col: d[0].col
    }
} %}

# define *FunctionName* (*args*)
FunctionDefinition ->
    %KW_DEFINE __ %IDEN _ %LP _ ParamList _ %RP _ FunctionBody _ End
{% (d, pos, reject) => {
    return {
        type: "FunctionDefinition",
        name: d[2].value,
        params: d[6],
        body: d[10],
        line: d[0].line,
        col: d[0].col
    }
} %}

FunctionCall ->
    (%BLOCKIDEN | %IDEN) _ %LP _ ArgList _ %RP _ InCases
{% d => ({
    type: "FunctionCall",
    name: d[0][0].value,
    args: d[4],
    cases: d[8],
    line: d[0][0].line,
    col: d[0][0].col
}) %}

@{%

function ifCondition (d) {
    return {
        type: "IfCondition",
        condition: d[4],
        trueBlock: d[8],
        falseBlock: d[12],
        line: d[0].line,
        col: d[0].col
    }
}

%}

IfCondition ->
    %KW_IF _ %LP _ Expression _ %RP _ FunctionBody _ %KW_END {% ifCondition %}
    | %KW_IF _ %LP _ Expression _ %RP _ FunctionBody _ %KW_ELSE _ FunctionBody _ End {% ifCondition %}

WhileCondition ->
    %KW_WHILE _ (%LP _ %RP _):? FunctionBody _ End
    {%
        (d, pos) => ({
            type: "LoopExpression",
            loop: "forever",
            body: d[3],
            line: d[0].line,
            col: d[0].col
        })
    %}
    | %KW_WHILE _ %LP _ Expression _ %RP _ FunctionBody _ End
    {%
        (d, pos) => ({
            type: "LoopExpression",
            loop: "condition",
            condition: d[4],
            body: d[8],
            line: d[0].line,
            col: d[0].col
        })
    %}

RepeatCondition ->
    %KW_REPEAT _ %LP _ Expression _ %RP _ FunctionBody _ End
    {%
        (d, pos) => ({
            type: "LoopExpression",
            loop: "repeat",
            time: d[4],
            body: d[8],
            line: d[0].line,
            col: d[0].col
        })
    %}

ArgList -> ExpList {% id %}
    | _ {% () => [] %}

# Cases

InCases -> null {% d => null %}
    | _InCases _ %KW_END {% d => Object.fromEntries(d[0]) %}

_InCases ->
    InCase
    | _InCases __ InCase {% d => {const t = Array.from(d[0]); t.push(d[2]); return t } %}

InCase -> %KW_IN __ Constant __ FunctionBody {% d => [d[2].value, {
    type: "CaseBody",
    name: d[2],
    body: d[4],
    line: d[0].line,
    col: d[0].col
}] %}

ParamList ->
    null {% () => [] %}
    | Param
    | ParamList _ %COMMA _ Param {% d => { const t = d[0]; t.push(d[4]); return t } %}

Param ->
    %LT %IDEN %GT {% d => ({
        type: "Argument",
        name: d[1].value,
        argumentType: "Boolean"
    }) %}
    | %LMP %IDEN %RMP {% d => ({
        type: "Argument",
        name: d[1].value,
        argumentType: "String"
    }) %}
    | %IDEN {% d => ({
        type: "Argument",
        name: d[0].value,
        argumentType: "String"
    }) %}

FunctionBody -> _ {% () => ([]) %}
    | Block {% id %}

SetVariable ->
    %IDEN _ "=" _ Expression
{% d => ({
    type: "FunctionCall",
    name: "data.setVar",
    args: [{
        type: "Constant",
        value: d[0].value
    }, d[4]],
    line: d[0].line,
    col: d[0].col
}) %}

ExpList -> ExpList _ "," _ Expression
    {% d => {
        const r = d[0].map(v => v)
        r.push(d[4])
        return r
    } %}
    | Expression {% d => [d[0]] %}

# Expressions
Expression -> ExpOr {% id %}

@{%

const Cast = require("./cast")

function tryCalculate ([left,,sym,,right]) {
    /*
    if (typeof left === "object" && typeof right === "object" &&
        left.type === "Constant" && right.type === "Constant") {
        function preCalculate (left, sym, right) {
            if (sym === "<") return Cast.compare(left, right) < 0
            if (sym === ">") return Cast.compare(left, right) > 0
            if (sym === "==") return Cast.compare(left, right) === 0
            if (sym === ".." && typeof left === "string") return Cast.toString(left) + Cast.toString(right)
            if (sym === "+") return Cast.toNumber(left) + Cast.toNumber(right)
            if (sym === "-") return Cast.toNumber(left) - Cast.toNumber(right)
            if (sym === "*") return Cast.toNumber(left) * Cast.toNumber(right)
            if (sym === "/") return Cast.toNumber(left) / Cast.toNumber(right)
            if (sym === "%") {
                const n = Cast.toNumber(left)
                const modulus = Cast.toNumber(right)
                let result = n % modulus
                if (result / modulus < 0) result += modulus
                return result
            }
            if (sym === "||") return Cast.toBoolean(left) || Cast.toBoolean(right)
            if (sym === "&&") return Cast.toBoolean(left) && Cast.toBoolean(right)
        }
        return {
            type: "Constant",
            value: preCalculate(left.value, sym.value, right.value),
            line: left.line,
            col: left.col
        }
    }
    if (sym === "!" && left.type === "Constant") {
        return {
            type: "Constant",
            value: !Cast.toBoolean(left.value),
            line: left.line,
            col: left.col
        }
    }
    */
    const blocks = {
        "+": "math.add",
        "-": "math.sub",
        "*": "math.multiply",
        "/": "math.devide",
        "<": "math.lt",
        ">": "math.gt",
        "%": "math.mod",
        "||": "math.or",
        "&&": "math.and",
        "!": "math.not",
        "==": "math.equals",
        "..": "math.join",
    }
    return {
        type: "FunctionCall",
        name: blocks[sym],
        args: [left, right].filter(v => !!v),
        line: left.line,
        col: left.col
    }
}

%}

Parenthesized -> %LP Expression %RP {% d => d[1] %}
 
ExpOr -> ExpOr __ "||" __ ExpAnd {% tryCalculate %}
	| ExpAnd {% id %}
 
ExpAnd -> ExpAnd __ "&&" __ ExpComparison {% tryCalculate %}
	| ExpComparison {% id %}

ExpComparison ->
	  ExpComparison _ ">"  _ ExpConcatenation {% tryCalculate %}
	| ExpComparison _ "<"  _ ExpConcatenation {% tryCalculate %}
	# | ExpComparison _ "<=" _ ExpConcatenation {% tryCalculate %}
	# | ExpComparison _ ">=" _ ExpConcatenation {% tryCalculate %}
	| ExpEquals {% id %}
 
ExpEquals -> ExpComparison _ "==" _ ExpConcatenation {% tryCalculate %}
    | ExpConcatenation {% id %}

ExpConcatenation ->
	  ExpConcatenation _ ".." _ ExpSum {% tryCalculate %}
	| ExpSum {% id %}
 
ExpSum ->
	  ExpSum _ "+" _ ExpProduct {% tryCalculate %}
	| ExpSum _ "-" _ ExpProduct {% tryCalculate %}
	| ExpProduct {% id %}
 
ExpProduct ->
	  ExpProduct _ "*" _ ExpSum {% tryCalculate %}
	| ExpProduct _ "/" _ ExpSum {% tryCalculate %}
	| ExpProduct _ "%" _ ExpSum {% tryCalculate %}
    | "!" _ ExpSum {% d => tryCalculate([d[2],, d[0]]) %}
	| Atom {% id %}

Atom -> 
    null
    | FunctionCall {% id %}
    | (%BLOCKIDEN | %IDEN) {% ([[name]]) => ({
        type: "Literal",
        name: name.value,
        line: name.line,
        col: name.col
    }) %}
    | Constant {% id %}
    | Parenthesized {% id %}

ListConstant -> "[" _ ListItems _ "]" {% d => d[2] %}
    | "[" _ "]" {% d => [] %}

ListItems -> Constant _ "," _ ListItems {% d => [d[0], ...d[4]]%}
    | Constant _ "," {% d => [d[0]]%}
    | Constant

Constant ->
    %STRING {% ([d]) => ({
        type: "Constant",
        value: d.value,
        line: d.line,
        col: d.col
    }) %}
    | %COLOR {% ([d], l ,reject) => {
        if ([3, 4, 6, 8].includes(d[1].length - 1)) {
            return {
                type: "Constant",
                value: d.value,
                line: d.line,
                col: d.col
            }
        }
        return reject
    } %}
    | %NUMBER {% ([d]) => ({
        type: "Constant",
        value: d.value,
        line: d.line,
        col: d.col
    }) %}

Comment -> _ %COMMENT _
{% d => ({
    type: "Comment",
    message: d[1].value
}) %}


End -> %KW_END
__ -> %WS:+ {% v => {} %}
_ -> (%WS:*) {% v => {} %}
