
@{%
const moo = require("moo")
const lexer = moo.compile([

    {type: "COMMENT", match: /\/\*[\W\w]*?\*\//, value: x => x.slice(2, -3)},
    {type: "COMMENT", match: /\/{2}(?:.*?)\n?$/, value: x => x.slice(2)},

    {type: "SPACE", match: /\s+/, lineBreaks: true},
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
    {type: "LCB", match: "{"},
    {type: "RCB", match: "}"},
    {type: "GT", match: ">"},
    {type: "LT", match: "<"},
    {type: 'OP', match: /[&|\=\.]{2}|[\+\-\*\/\%\!\<\>=]/},

    // Keywords
    {type: "KW_VAR", match: "var"},
    {type: "KW_IN", match: "in"},
    {type: "KW_LET", match: "let"},
    {type: "KW_WHEN", match: "when"},
    {type: "KW_DEFINE", match: "define"},
    {type: "KW_ATONCE", match: "atonce"},
    {type: "KW_END", match: "end"},
    {type: "KW_WHILE", match: "while"},
    {type: "KW_FOREVER", match: "forever"},
    {type: "KW_REPEAT", match: "repeat"},
    {type: "KW_REGISTER", match: "register"},
    {type: "KW_IF", match: "if"},
    {type: "KW_ELSE", match: "else"},
    {type: "KW_USING", match: "using"},
    {type: "KW_NUMBER", match: "number"},
    {type: "KW_STRING", match: "string"},
    {type: "KW_BOOL", match: "bool"},

    {type: "BLOCKIDEN", match: /[a-zA-Z_][0-9a-zA-Z_]*\.[a-zA-Z_][0-9a-zA-Z_]*/},
    {type: "IDEN", match: /[a-zA-Z_][0-9a-zA-Z_]*/},

    {type: 'UIDEN', match: /[^\n \t"'()<>=*\/+-]+/},
    {type: "ERROR", error: true},
])

%}

@lexer lexer

Program -> _ _Program _ {% d => ({
        type: "Program",
        listeners: d[1].filter(ast => ast.type === "EventExpression"),
        procedures: d[1].filter(ast => ast.type === "FunctionDefinition"),
        variables: d[1].filter(ast => ast.type === "VariableDefinition"),
        registers: d[1].filter(ast => ast.type === "RegisterStatement"),
        usings: d[1].filter(ast => ast.type === "UsingStatement")
    }) %}

_Program -> 
    OutsideStatement
    | _Program (_ ";" _ | __) OutsideStatement {% d => {
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
    "when" __ %BLOCKIDEN _ "(" _ ArgList _ ")" _ FunctionBody
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
    (%KW_ATONCE __ | null) %KW_DEFINE __ %IDEN _ "(" _ ParamList _ ")" _ FunctionBody
{% d => {
    return {
        type: "FunctionDefinition",
        warp: !!d[0][0],
        name: d[3].value,
        params: d[7],
        body: d[11],
        line: d[0][0] ? d[0][0].line : d[1].line,
        col: d[0][0] ?d[0][0].col : d[1].line
    }
} %}

FunctionCall ->
    (%BLOCKIDEN | %IDEN) _ "(" _ ArgList _ ")" InCases
{% d => ({
    type: "FunctionCall",
    name: d[0][0].value,
    args: d[4],
    cases: d[7],
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
        cases: [{
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
            }],
        line: d[0].line,
        col: d[0].col
    }) %}
    | "if" _ "(" _ Expression _ ")" _ FunctionBody _ "else" _ FunctionBody {% d => ({
        type: "FunctionCall",
        name: "control.ifelse",
        args: [d[4]],
        cases: [{
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
            }, {
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
            }],
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
            cases: [{
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
            }],
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
            cases: [{
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
            }],
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
            cases: [{
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
            }],
            line: d[0].line,
            col: d[0].col
        })
    %}

ArgList -> ExpList {% id %}

# Cases

InCases -> null {% d => [] %}
    | _ _InCases {% d => Object.fromEntries(d[0]) %}

_InCases ->
    InCase
    | _InCases __ InCase {% d => {const t = Array.from(d[0]); t.push(d[2]); return t } %}

InCase -> "in" __ Constant __ FunctionBody {% d => [d[2].value, {
    type: "CaseBody",
    name: d[2],
    body: d[4],
    line: d[0].line,
    col: d[0].col
}] %}

ParamList ->
    null {% () => [] %}
    | Param
    | ParamList _ "," _ Param {% d => { const t = d[0]; t.push(d[4]); return t } %}

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

ExpList -> ExpList _ "," _ Expression
    {% d => {
        const r = d[0].slice()
        r.push(d[4])
        return r
    } %}
    | Expression {% d => (d[0] === undefined || d[0] === null) ? [] : d %}

# Expressions
Expression -> ExpOr {% id %}

@{%
function tryCalculate ([left,,sym,,right]) {
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

Parenthesized -> "(" Expression ")" {% d => d[1] %}
 
ExpOr -> ExpOr __ "||" __ ExpAnd {% tryCalculate %}
	| ExpAnd {% id %}
 
ExpAnd -> ExpAnd __ "&&" __ ExpComparison {% tryCalculate %}
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
    null {% id %}
    | %BLOCKIDEN {% ([name]) => ({
        type: "FunctionCall",
        name: name.value,
        args: [],
        cases: [],
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

ListConstant -> "[" _ ListItems _ "]" {% d => d[2] %}
    | "[" _ "]" {% d => [] %}

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

_ -> null {% null %}
    | _ Comment _ {% d => d[1] %}
    | %SPACE {% null %}
__ -> _ Comment _ {% id %}
    | %SPACE {% null %}

Comment -> %COMMENT
{% d => ({
    type: "Comment",
    message: d[0].value,
    line: d[0].line,
    col: d[0].col
}) %}