// Generated automatically by nearley, version 2.19.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

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




function variableDefinition (d) {
    return {
        type: "VariableDefinition",
        islocal: d[0] === "let",
        name: d[2].value,
        value: d[6]
    }
}




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

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "Program", "symbols": ["_", "_Program", "_"], "postprocess": postProgram},
    {"name": "_Program", "symbols": ["_Program", "_", "OutsideStatement"], "postprocess":  d => {
            const r = d[0].map(v => v)
            r.push(d[2])
            return r
        } },
    {"name": "_Program", "symbols": ["OutsideStatement"], "postprocess": v => [v[0]]},
    {"name": "OutsideStatement", "symbols": ["UsingStatement"], "postprocess": id},
    {"name": "OutsideStatement", "symbols": ["VariableDefinition"], "postprocess": id},
    {"name": "OutsideStatement", "symbols": ["FunctionDefinition"], "postprocess": id},
    {"name": "OutsideStatement", "symbols": ["EventListener"], "postprocess": id},
    {"name": "OutsideStatement", "symbols": ["Comment"], "postprocess": id},
    {"name": "UsingStatement", "symbols": [(lexer.has("KW_USING") ? {type: "KW_USING"} : KW_USING), "_", (lexer.has("STRING") ? {type: "STRING"} : STRING)], "postprocess":  d => ({
            type: "UsingStatement",
            file: d[2].value,
            line: d[0].line,
            col: d[0].col
        }) },
    {"name": "Block", "symbols": ["_Block"], "postprocess": id},
    {"name": "Block", "symbols": ["_"], "postprocess": v => []},
    {"name": "_Block", "symbols": ["Statement"]},
    {"name": "_Block", "symbols": ["_Block", "_", "Statement"], "postprocess":  d => {
            const r = d[0].map(v => v)
            r.push(d[2])
            return r
        } },
    {"name": "Statement", "symbols": ["FunctionCall"], "postprocess": id},
    {"name": "Statement", "symbols": ["SetVariable"], "postprocess": id},
    {"name": "Statement", "symbols": ["RepeatCondition"], "postprocess": id},
    {"name": "Statement", "symbols": ["WhileCondition"], "postprocess": id},
    {"name": "Statement", "symbols": ["IfCondition"], "postprocess": id},
    {"name": "Statement", "symbols": ["Comment"], "postprocess": id},
    {"name": "VariableDefinition", "symbols": [(lexer.has("KW_VAR") ? {type: "KW_VAR"} : KW_VAR), "__", "VariableName"], "postprocess": variableDefinition},
    {"name": "VariableDefinition", "symbols": [(lexer.has("KW_VAR") ? {type: "KW_VAR"} : KW_VAR), "__", "VariableName", "_", {"literal":"="}, "_", "Constant"], "postprocess": variableDefinition},
    {"name": "VariableDefinition", "symbols": [(lexer.has("KW_VAR") ? {type: "KW_VAR"} : KW_VAR), "__", "VariableName", "_", {"literal":"="}, "_", "ListConstant"], "postprocess": variableDefinition},
    {"name": "VariableDefinition", "symbols": [(lexer.has("KW_LET") ? {type: "KW_LET"} : KW_LET), "__", "VariableName"], "postprocess": variableDefinition},
    {"name": "VariableDefinition", "symbols": [(lexer.has("KW_LET") ? {type: "KW_LET"} : KW_LET), "__", "VariableName", "_", {"literal":"="}, "_", "Constant"], "postprocess": variableDefinition},
    {"name": "VariableDefinition", "symbols": [(lexer.has("KW_LET") ? {type: "KW_LET"} : KW_LET), "__", "VariableName", "_", {"literal":"="}, "_", "ListConstant"], "postprocess": variableDefinition},
    {"name": "VariableName$subexpression$1", "symbols": [(lexer.has("IDEN") ? {type: "IDEN"} : IDEN)]},
    {"name": "VariableName$subexpression$1", "symbols": [(lexer.has("BLOCKIDEN") ? {type: "BLOCKIDEN"} : BLOCKIDEN)]},
    {"name": "VariableName", "symbols": ["VariableName$subexpression$1"], "postprocess": v => v[0][0]},
    {"name": "EventListener", "symbols": [(lexer.has("KW_WHEN") ? {type: "KW_WHEN"} : KW_WHEN), "__", (lexer.has("BLOCKIDEN") ? {type: "BLOCKIDEN"} : BLOCKIDEN), "_", (lexer.has("LP") ? {type: "LP"} : LP), "_", "ArgList", "_", (lexer.has("RP") ? {type: "RP"} : RP), "_", "FunctionBody", "_", "End"], "postprocess":  (d, pos, reject) => {
            return {
                type: "EventExpression",
                name: d[2].value,
                args: d[6],
                body: d[10],
                line: d[0].line,
                col: d[0].col
            }
        } },
    {"name": "FunctionDefinition", "symbols": [(lexer.has("KW_DEFINE") ? {type: "KW_DEFINE"} : KW_DEFINE), "__", (lexer.has("IDEN") ? {type: "IDEN"} : IDEN), "_", (lexer.has("LP") ? {type: "LP"} : LP), "_", "ParamList", "_", (lexer.has("RP") ? {type: "RP"} : RP), "_", "FunctionBody", "_", "End"], "postprocess":  (d, pos, reject) => {
            return {
                type: "FunctionDefinition",
                name: d[2].value,
                params: d[6],
                body: d[10],
                line: d[0].line,
                col: d[0].col
            }
        } },
    {"name": "FunctionCall$subexpression$1", "symbols": [(lexer.has("BLOCKIDEN") ? {type: "BLOCKIDEN"} : BLOCKIDEN)]},
    {"name": "FunctionCall$subexpression$1", "symbols": [(lexer.has("IDEN") ? {type: "IDEN"} : IDEN)]},
    {"name": "FunctionCall", "symbols": ["FunctionCall$subexpression$1", "_", (lexer.has("LP") ? {type: "LP"} : LP), "_", "ArgList", "_", (lexer.has("RP") ? {type: "RP"} : RP), "_", "InCases"], "postprocess":  d => ({
            type: "FunctionCall",
            name: d[0][0].value,
            args: d[4],
            cases: d[8],
            line: d[0][0].line,
            col: d[0][0].col
        }) },
    {"name": "IfCondition", "symbols": [(lexer.has("KW_IF") ? {type: "KW_IF"} : KW_IF), "_", (lexer.has("LP") ? {type: "LP"} : LP), "_", "Expression", "_", (lexer.has("RP") ? {type: "RP"} : RP), "_", "FunctionBody", "_", (lexer.has("KW_END") ? {type: "KW_END"} : KW_END)], "postprocess": ifCondition},
    {"name": "IfCondition", "symbols": [(lexer.has("KW_IF") ? {type: "KW_IF"} : KW_IF), "_", (lexer.has("LP") ? {type: "LP"} : LP), "_", "Expression", "_", (lexer.has("RP") ? {type: "RP"} : RP), "_", "FunctionBody", "_", (lexer.has("KW_ELSE") ? {type: "KW_ELSE"} : KW_ELSE), "_", "FunctionBody", "_", "End"], "postprocess": ifCondition},
    {"name": "WhileCondition$ebnf$1$subexpression$1", "symbols": [(lexer.has("LP") ? {type: "LP"} : LP), "_", (lexer.has("RP") ? {type: "RP"} : RP), "_"]},
    {"name": "WhileCondition$ebnf$1", "symbols": ["WhileCondition$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "WhileCondition$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "WhileCondition", "symbols": [(lexer.has("KW_WHILE") ? {type: "KW_WHILE"} : KW_WHILE), "_", "WhileCondition$ebnf$1", "FunctionBody", "_", "End"], "postprocess": 
        (d, pos) => ({
            type: "LoopExpression",
            loop: "forever",
            body: d[3],
            line: d[0].line,
            col: d[0].col
        })
            },
    {"name": "WhileCondition", "symbols": [(lexer.has("KW_WHILE") ? {type: "KW_WHILE"} : KW_WHILE), "_", (lexer.has("LP") ? {type: "LP"} : LP), "_", "Expression", "_", (lexer.has("RP") ? {type: "RP"} : RP), "_", "FunctionBody", "_", "End"], "postprocess": 
        (d, pos) => ({
            type: "LoopExpression",
            loop: "condition",
            condition: d[4],
            body: d[8],
            line: d[0].line,
            col: d[0].col
        })
            },
    {"name": "RepeatCondition", "symbols": [(lexer.has("KW_REPEAT") ? {type: "KW_REPEAT"} : KW_REPEAT), "_", (lexer.has("LP") ? {type: "LP"} : LP), "_", "Expression", "_", (lexer.has("RP") ? {type: "RP"} : RP), "_", "FunctionBody", "_", "End"], "postprocess": 
        (d, pos) => ({
            type: "LoopExpression",
            loop: "repeat",
            time: d[4],
            body: d[8],
            line: d[0].line,
            col: d[0].col
        })
            },
    {"name": "ArgList", "symbols": ["ExpList"], "postprocess": id},
    {"name": "ArgList", "symbols": ["_"], "postprocess": () => []},
    {"name": "InCases", "symbols": [], "postprocess": d => null},
    {"name": "InCases", "symbols": ["_InCases", "_", (lexer.has("KW_END") ? {type: "KW_END"} : KW_END)], "postprocess": d => Object.fromEntries(d[0])},
    {"name": "_InCases", "symbols": ["InCase"]},
    {"name": "_InCases", "symbols": ["_InCases", "__", "InCase"], "postprocess": d => {const t = Array.from(d[0]); t.push(d[2]); return t }},
    {"name": "InCase", "symbols": [(lexer.has("KW_IN") ? {type: "KW_IN"} : KW_IN), "__", "Constant", "__", "FunctionBody"], "postprocess":  d => [d[2].value, {
            type: "CaseBody",
            name: d[2],
            body: d[4],
            line: d[0].line,
            col: d[0].col
        }] },
    {"name": "ParamList", "symbols": [], "postprocess": () => []},
    {"name": "ParamList", "symbols": ["Param"]},
    {"name": "ParamList", "symbols": ["ParamList", "_", (lexer.has("COMMA") ? {type: "COMMA"} : COMMA), "_", "Param"], "postprocess": d => { const t = d[0]; t.push(d[4]); return t }},
    {"name": "Param", "symbols": [(lexer.has("LT") ? {type: "LT"} : LT), (lexer.has("IDEN") ? {type: "IDEN"} : IDEN), (lexer.has("GT") ? {type: "GT"} : GT)], "postprocess":  d => ({
            type: "Argument",
            name: d[1].value,
            argumentType: "Boolean"
        }) },
    {"name": "Param", "symbols": [(lexer.has("LMP") ? {type: "LMP"} : LMP), (lexer.has("IDEN") ? {type: "IDEN"} : IDEN), (lexer.has("RMP") ? {type: "RMP"} : RMP)], "postprocess":  d => ({
            type: "Argument",
            name: d[1].value,
            argumentType: "String"
        }) },
    {"name": "Param", "symbols": [(lexer.has("IDEN") ? {type: "IDEN"} : IDEN)], "postprocess":  d => ({
            type: "Argument",
            name: d[0].value,
            argumentType: "String"
        }) },
    {"name": "FunctionBody", "symbols": ["_"], "postprocess": () => ([])},
    {"name": "FunctionBody", "symbols": ["Block"], "postprocess": id},
    {"name": "SetVariable", "symbols": [(lexer.has("IDEN") ? {type: "IDEN"} : IDEN), "_", {"literal":"="}, "_", "Expression"], "postprocess":  d => ({
            type: "FunctionCall",
            name: "data.set",
            args: [{
                type: "Constant",
                value: d[0].value
            }, d[4]],
            line: d[0].line,
            col: d[0].col
        }) },
    {"name": "ExpList", "symbols": ["ExpList", "_", {"literal":","}, "_", "Expression"], "postprocess":  d => {
            const r = d[0].map(v => v)
            r.push(d[4])
            return r
        } },
    {"name": "ExpList", "symbols": ["Expression"], "postprocess": d => [d[0]]},
    {"name": "Expression", "symbols": ["ExpOr"], "postprocess": id},
    {"name": "Parenthesized", "symbols": [(lexer.has("LP") ? {type: "LP"} : LP), "Expression", (lexer.has("RP") ? {type: "RP"} : RP)], "postprocess": d => d[1]},
    {"name": "ExpOr", "symbols": ["ExpOr", "__", {"literal":"||"}, "__", "ExpAnd"], "postprocess": tryCalculate},
    {"name": "ExpOr", "symbols": ["ExpAnd"], "postprocess": id},
    {"name": "ExpAnd", "symbols": ["ExpAnd", "__", {"literal":"&&"}, "__", "ExpComparison"], "postprocess": tryCalculate},
    {"name": "ExpAnd", "symbols": ["ExpComparison"], "postprocess": id},
    {"name": "ExpComparison", "symbols": ["ExpComparison", "_", {"literal":">"}, "_", "ExpConcatenation"], "postprocess": tryCalculate},
    {"name": "ExpComparison", "symbols": ["ExpComparison", "_", {"literal":"<"}, "_", "ExpConcatenation"], "postprocess": tryCalculate},
    {"name": "ExpComparison", "symbols": ["ExpEquals"], "postprocess": id},
    {"name": "ExpEquals", "symbols": ["ExpComparison", "_", {"literal":"=="}, "_", "ExpConcatenation"], "postprocess": tryCalculate},
    {"name": "ExpEquals", "symbols": ["ExpConcatenation"], "postprocess": id},
    {"name": "ExpConcatenation", "symbols": ["ExpConcatenation", "_", {"literal":".."}, "_", "ExpSum"], "postprocess": tryCalculate},
    {"name": "ExpConcatenation", "symbols": ["ExpSum"], "postprocess": id},
    {"name": "ExpSum", "symbols": ["ExpSum", "_", {"literal":"+"}, "_", "ExpProduct"], "postprocess": tryCalculate},
    {"name": "ExpSum", "symbols": ["ExpSum", "_", {"literal":"-"}, "_", "ExpProduct"], "postprocess": tryCalculate},
    {"name": "ExpSum", "symbols": ["ExpProduct"], "postprocess": id},
    {"name": "ExpProduct", "symbols": ["ExpProduct", "_", {"literal":"*"}, "_", "ExpSum"], "postprocess": tryCalculate},
    {"name": "ExpProduct", "symbols": ["ExpProduct", "_", {"literal":"/"}, "_", "ExpSum"], "postprocess": tryCalculate},
    {"name": "ExpProduct", "symbols": ["ExpProduct", "_", {"literal":"%"}, "_", "ExpSum"], "postprocess": tryCalculate},
    {"name": "ExpProduct", "symbols": [{"literal":"!"}, "_", "ExpSum"], "postprocess": d => tryCalculate([d[2],, d[0]])},
    {"name": "ExpProduct", "symbols": ["Atom"], "postprocess": id},
    {"name": "Atom", "symbols": []},
    {"name": "Atom", "symbols": ["FunctionCall"], "postprocess": id},
    {"name": "Atom$subexpression$1", "symbols": [(lexer.has("BLOCKIDEN") ? {type: "BLOCKIDEN"} : BLOCKIDEN)]},
    {"name": "Atom$subexpression$1", "symbols": [(lexer.has("IDEN") ? {type: "IDEN"} : IDEN)]},
    {"name": "Atom", "symbols": ["Atom$subexpression$1"], "postprocess":  ([[name]]) => ({
            type: "Literal",
            name: name.value,
            line: name.line,
            col: name.col
        }) },
    {"name": "Atom", "symbols": ["Constant"], "postprocess": id},
    {"name": "Atom", "symbols": ["Parenthesized"], "postprocess": id},
    {"name": "ListConstant", "symbols": [{"literal":"["}, "_", "ListItems", "_", {"literal":"]"}], "postprocess": d => d[2]},
    {"name": "ListConstant", "symbols": [{"literal":"["}, "_", {"literal":"]"}], "postprocess": d => []},
    {"name": "ListItems", "symbols": ["Constant", "_", {"literal":","}, "_", "ListItems"], "postprocess": d => [d[0], ...d[4]]},
    {"name": "ListItems", "symbols": ["Constant", "_", {"literal":","}], "postprocess": d => [d[0]]},
    {"name": "ListItems", "symbols": ["Constant"]},
    {"name": "Constant", "symbols": [(lexer.has("STRING") ? {type: "STRING"} : STRING)], "postprocess":  ([d]) => ({
            type: "Constant",
            value: d.value,
            line: d.line,
            col: d.col
        }) },
    {"name": "Constant", "symbols": [(lexer.has("COLOR") ? {type: "COLOR"} : COLOR)], "postprocess":  ([d], l ,reject) => {
            if ([3, 4, 6, 8].includes(d[1].length - 1)) {
                return {
                    type: "Constant",
                    value: d.value,
                    line: d.line,
                    col: d.col
                }
            }
            return reject
        } },
    {"name": "Constant", "symbols": [(lexer.has("NUMBER") ? {type: "NUMBER"} : NUMBER)], "postprocess":  ([d]) => ({
            type: "Constant",
            value: d.value,
            line: d.line,
            col: d.col
        }) },
    {"name": "Comment", "symbols": ["_", (lexer.has("COMMENT") ? {type: "COMMENT"} : COMMENT), "_"], "postprocess":  d => ({
            type: "Comment",
            message: d[1].value
        }) },
    {"name": "End", "symbols": [(lexer.has("KW_END") ? {type: "KW_END"} : KW_END)]},
    {"name": "__$ebnf$1", "symbols": [(lexer.has("WS") ? {type: "WS"} : WS)]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": v => {}},
    {"name": "_$subexpression$1$ebnf$1", "symbols": []},
    {"name": "_$subexpression$1$ebnf$1", "symbols": ["_$subexpression$1$ebnf$1", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_$subexpression$1", "symbols": ["_$subexpression$1$ebnf$1"]},
    {"name": "_", "symbols": ["_$subexpression$1"], "postprocess": v => {}}
]
  , ParserStart: "Program"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
