
@{%
const moo = require("moo")
const lexer = moo.compile([

    {type: "COMMENT", match: /\/\*[\W\w]*?\*\//, value: x => x.slice(2, -3)},
    {type: "COMMENT", match: /\/{2}(?:.*?)\n?$/, value: x => x.slice(2)},

    {type: "SPACE",     match: /[\s;]+/, lineBreaks: true},
    {type: "DELIMITER", match: ";"},

    {type: "NUMBER",  match: /0x[0-9A-Fa-f]+/, value: x => parseInt(x, 16)},
    {type: "NUMBER",  match: /0b[01]+/, value: x => parseInt(x, 2)},
    {type: "NUMBER",  match: /0[0-7]+/, value: x => parseInt(x, 8)},
    {type: "NUMBER",  match: /-?(?:[1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0)/, value: x => Number(x)},
    {type: "NUMBER",  match: /-?[1-9]\d*/, value: x => Number(x)},
    {type: "COLOR",   match: /#[A-Fa-f0-9]{3}(?:[A-Fa-f0-9]{3})?/},
    {type: "STRING",  match: /"(?:\\["\\]|[^\n"\\])*"/, value: x => JSON.parse(x)},
    {type: "STRING",  match: /'(?:\\['\\]|[^\n'\\])*'/, value: x => JSON.parse('"' + x.slice(1, -1).replace(/^\\'/, "'") + '"')},

    {type: "COMMA", match: ","},
    {type: "LP",    match: "("},
    {type: "RP",    match: ")"},
    {type: "LMP",   match: "["},
    {type: "RMP",   match: "]"},
    {type: "LCB",   match: "{"},
    {type: "RCB",   match: "}"},
    {type: "GT",    match: ">"},
    {type: "LT",    match: "<"},
    {type: 'OP',    match: /[&|\=\.]{2}|[\+\-\*\/\%\!\<\>=]/},

    // Keywords
    {type: "KW_REGISTER", match: "register"},
    {type: "KW_FOREVER",  match: "forever"},
    {type: "KW_ATONCE",   match: "atonce"},
    {type: "KW_DEFINE",   match: "define"},
    {type: "KW_NUMBER",   match: "number"},
    {type: "KW_REPEAT",   match: "repeat"},
    {type: "KW_STRING",   match: "string"},
    {type: "KW_FALSE",    match: "false"},
    {type: "KW_USING",    match: "using"},
    {type: "KW_WHILE",    match: "while"},
    {type: "KW_BOOL",     match: "bool"},
    {type: "KW_ELSE",     match: "else"},
    {type: "KW_NULL",     match: "null"},
    {type: "KW_WHEN",     match: "when"},
    {type: "KW_TRUE",     match: "true"},
    {type: "KW_LET",      match: "let"},
    {type: "KW_VAR",      match: "var"},
    {type: "KW_IF",       match: "if"},
    {type: "KW_IN",       match: "in"},

    {type: "BLOCKIDEN", match: /[a-zA-Z_][0-9a-zA-Z_]*\.[a-zA-Z_][0-9a-zA-Z_]*/},
    {type: "IDEN",      match: /[a-zA-Z_][0-9a-zA-Z_]*/},

    {type: 'UIDEN', match: /[^\n \t"'()<>=*\/+-]+/},
    {type: "ERROR", error: true},
])

%}

@lexer lexer

Program ->
    _ {% d => ({
        type: "Program",
        listeners: [],
        procedures: [],
        variables: [],
        registers: [],
        usings: []
    }) %}
    | _ _Program _ {% d => ({
        type: "Program",
        listeners: d[1].filter(ast => ast.type === "EventExpression"),
        procedures: d[1].filter(ast => ast.type === "FunctionDefinition"),
        variables: d[1].filter(ast => ast.type === "VariableDefinition"),
        registers: d[1].filter(ast => ast.type === "RegisterStatement"),
        usings: d[1].filter(ast => ast.type === "UsingStatement")
    }) %}

_Program -> 
    OutsideStatement
    | _Program __ OutsideStatement {% d => {
        const r = d[0].slice()
        r.push(d[2])
        return r
    } %}

OutsideStatement ->
    Comment {% id %}
    | RegisterStatement {% id %}
    | UsingStatement {% id %}
    | VariableDefinition {% id %}
    | FunctionDefinition {% id %}
    | EventListener {% id %}

RegisterStatement -> "register" __ %STRING (__ "as" __ %IDEN | null) {% d => ({
    type: "RegisterStatement",
    file: d[2].value,
    rename: d[3].length === 4 ? d[3][3].value : null,
    line: d[0].line,
    col: d[0].col
}) %}

UsingStatement -> "using" __ %STRING {% d => ({
    type: "UsingStatement",
    file: d[2].value,
    line: d[0].line,
    col: d[0].col
}) %}

Block -> _ _Block _ {% d => d[1] %}
    | _ {% v => [] %}

_Block -> Statement {% d => [d[0]] %}
    | _Block _ Statement {% d => {
        const r = d[0].slice()
        r.push(d[2])
        return r
    } %}

Statement -> _Statement (_ ";" | null) {% id %}

_Statement -> 
    Comment {% id %}
    | RepeatCondition {% id %}
    | SetVariable {% id %}
    | WhileCondition {% id %}
    | IfCondition {% id %}
    | FunctionCall {% id %}

EventListener ->
    %KW_WHEN __ %BLOCKIDEN _ "(" ArgList ")" _ FunctionBody
{% (d, pos, reject) => {
    return {
        type: "EventExpression",
        name: d[2].value,
        args: d[5],
        body: d[8],
        line: d[0].line,
        col: d[0].col
    }
} %}

FunctionDefinition ->
    (%KW_ATONCE __ | null) %KW_DEFINE __ %IDEN _ "(" ParamList ")" _ FunctionBody
{% d => {
    return {
        type: "FunctionDefinition",
        warp: !!d[0][0],
        name: d[3].value,
        params: d[6],
        body: d[9],
        line: d[0][0] ? d[0][0].line : d[1].line,
        col: d[0][0] ?d[0][0].col : d[1].line
    }
} %}

FunctionCall ->
    (%BLOCKIDEN | %IDEN) _ "(" ArgList ")" InCases
{% d => ({
    type: "FunctionCall",
    name: d[0][0].value,
    args: d[3],
    cases: d[5],
    line: d[0][0].line,
    col: d[0][0].col
}) %}

VariableDefinition -> _VariableDefinition {% ([d]) => ({
        type: "VariableDefinition",
        islocal: d[0].value === "let",
        name: d[2].value,
        value: d[6],
        line: d[0].line,
        col: d[0].col
    }) %}
_VariableDefinition ->
    "var" __ VariableName
    | "var" __ VariableName _ "=" _ Constant
    | "var" __ VariableName _ "=" _ ListConstant
    | "let" __ VariableName
    | "let" __ VariableName _ "=" _ Constant
    | "let" __ VariableName _ "=" _ ListConstant

VariableName -> (%IDEN | %BLOCKIDEN) {% v => v[0][0] %}

@{%

function ifCondition (d) {
    return {
        type: "FunctionCall",
        condition: d[4],
        trueBlock: d[8],
        falseBlock: d[12],
        line: d[0].line,
        col: d[0].col
    }
}

%}

IfCondition ->
    "if" _ "(" _ Expression _ ")" _ FunctionBody {% d => ({
        type: "FunctionCall",
        name: "control.if",
        args: [d[4]],
        cases: {
            1: {
                type: "CaseBody",
                name: {
                    type: "Constant",
                    value: 1,
                    line: d[0].line,
                    col: d[0].col
                },
                body: d[8],
                line: d[0].line,
                col: d[0].col
            }
        },
        line: d[0].line,
        col: d[0].col
    }) %}
    | "if" _ "(" _ Expression _ ")" _ FunctionBody _ "else" _ FunctionBody {% d => ({
        type: "FunctionCall",
        name: "control.ifelse",
        args: [d[4]],
        cases: {
            1: {
                type: "CaseBody",
                name: {
                    type: "Constant",
                    value: 1,
                    line: d[0].line,
                    col: d[0].col
                },
                body: d[8],
                line: d[0].line,
                col: d[0].col
            },
            2: {
                type: "CaseBody",
                name: {
                    type: "Constant",
                    value: 2,
                    line: d[0].line,
                    col: d[0].col
                },
                body: d[12],
                line: d[0].line,
                col: d[0].col
            }
        },
        line: d[0].line,
        col: d[0].col
    }) %}

WhileCondition ->
    "forever" _  FunctionBody
    {%
        d => ({
            type: "FunctionCall",
            name: "control.forever",
            args: [],
            cases: {
                1: {
                    type: "CaseBody",
                    name: {
                        type: "Constant",
                        value: 1,
                        line: d[0].line,
                        col: d[0].col
                    },
                    body: d[2],
                    line: d[0].line,
                    col: d[0].col
                }
            },
            line: d[0].line,
            col: d[0].col
        })
    %}
    | %KW_WHILE _ "(" _ Expression _ ")" _ FunctionBody
    {%
        d => ({
            type: "FunctionCall",
            name: "control.while",
            args: [d[4]],
            cases: {
                1: {
                    type: "CaseBody",
                    name: {
                        type: "Constant",
                        value: 1,
                        line: d[0].line,
                        col: d[0].col
                    },
                    body: d[8],
                    line: d[0].line,
                    col: d[0].col
                }
            },
            line: d[0].line,
            col: d[0].col
        })
    %}

RepeatCondition ->
    "repeat" _ "(" _ Expression _ ")" _ FunctionBody
    {%
        d => ({
            type: "FunctionCall",
            name: "control.repeat",
            args: [d[4]],
            cases: {
                1: {
                    type: "CaseBody",
                    name: {
                        type: "Constant",
                        value: 1,
                        line: d[0].line,
                        col: d[0].col
                    },
                    body: d[8],
                    line: d[0].line,
                    col: d[0].col
                }
            },
            line: d[0].line,
            col: d[0].col
        })
    %}

ArgList -> _ {% d => [] %}
    | _ ExpList _ {% d => d[1] %}

# Cases

InCases -> null {% d => ({}) %}
    | _ _InCases {% d => Object.fromEntries(d[1]) %}

_InCases ->
    InCase
    | _InCases __ InCase {% d => [d[2], ...d[0]] %}

InCase -> "in" __ Constant __ FunctionBody {% d => [d[2].value, {
    type: "CaseBody",
    name: d[2],
    body: d[4],
    line: d[0].line,
    col: d[0].col
}] %}

ParamList ->
    _ {% d => [] %}
    | _ _ParamList _ {% d => d[1] %}

_ParamList ->
    Param
    | _ParamList _ "," _ Param {% d => { const t = d[0]; t.push(d[4]); return t } %}


Param ->
    %IDEN (_ ":" _ ("string" | "number" | "bool")):? {% d => ({
        type: "Argument",
        name: d[0].value,
        argumentType: d[1] ? d[1][3][0].value : "string",
        line: d[0].line,
        col: d[0].col
    }) %}

FunctionBody -> "{" Block "}" {% d => d[1] %}

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

ExpList -> 
    Expression {% d => (d[0] === undefined || d[0] === null) ? [] : d %}
    | ExpList _ "," _ Expression
    {% d => {
        const r = d[0].slice()
        r.push(d[4])
        return r
    } %}

# Expressions
Expression -> ExpOr {% id %}

@{%
function tryCalculate ([left,,sym,,right]) {
    const blocks = {
        "+": "math.add",
        "-": "math.subtract",
        "*": "math.multiply",
        "/": "math.divide",
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
        args: [left, right].filter(v => v !== undefined),
        line: left.line,
        col: left.col
    }
}
%}

Parenthesized -> "(" Expression ")" {% d => d[1] %}
 
ExpOr -> ExpOr _ "||" _ ExpAnd {% tryCalculate %}
	| ExpAnd {% id %}
 
ExpAnd -> ExpAnd _ "&&" _ ExpComparison {% tryCalculate %}
	| ExpComparison {% id %}

ExpComparison ->
	  ExpComparison _ ">"  _ ExpConcatenation {% tryCalculate %}
	| ExpComparison _ "<"  _ ExpConcatenation {% tryCalculate %}
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
    %BLOCKIDEN {% ([name]) => ({
        type: "FunctionCall",
        name: name.value,
        args: [],
        cases: {},
        line: name.line,
        col: name.col
    }) %}
    | %IDEN {% ([name]) => ({
        type: "Literal",
        name: name.value,
        line: name.line,
        col: name.col
    }) %}
    | Constant {% id %}
    | Parenthesized {% id %}
    | FunctionCall {% id %}

ListConstant -> "[" _ ListItems _ "]" {% d => ({
    type: "Constant",
    value: d[2],
    line: d[0].line,
    col: d[0].col
}) %}
    | "[" _ "]" {% d => ({
    type: "Constant",
    value: [],
    line: d[0].line,
    col: d[0].col
}) %}

ListItems ->
    Constant {% d => [d[0]]%}
    | ListItems _ "," _ Constant {% d => {
        const r = d[0].slice()
        r.push(d[4])
        return r
    } %}

Constant ->
    %STRING {% ([d]) => ({
        type: "Constant",
        value: d.value,
        line: d.line,
        col: d.col
    }) %}
    | %COLOR {% ([d], l ,reject) => {
        if ([3, 6].includes(d.value.length - 1)) {
            if (d.value.length - 1 === 3) {
                return {
                    type: "Constant",
                    value: d.value[0] + d.value[1].repeat(2) + d.value[2].repeat(2) + d.value[3].repeat(2),
                    line: d.line,
                    col: d.col
                }
            }
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
    | %KW_FALSE {% () => null %}
    | %KW_NULL {% () => null %}
    | %KW_TRUE {% () => ({
        type: "FunctionCall",
        name: "math.not",
        args: [null],
        cases: {},
        line: name.line,
        col: name.col
    })%}

_ -> null {% null %}
    | _ Comment {% d => d[1] %}
    | %SPACE {% null %}
__ -> _ Comment {% d => d[1] %}
    | %SPACE {% null %}

Comment -> %COMMENT
{% d => ({
    type: "Comment",
    message: d[0].value,
    line: d[0].line,
    col: d[0].col
}) %}