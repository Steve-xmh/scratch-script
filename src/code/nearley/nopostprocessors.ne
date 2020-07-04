
@{%
const moo = require("moo")
const lexer = moo.compile([

    {type: "COMMENT", match: /\/\*[\W\w]*?\*\//, value: x => x.slice(2, -3)},
    {type: "COMMENT", match: /\/{2}(?:.*?)\n?$/, value: x => x.slice(2)},

    {type: "SPACE", match: /\s+/, lineBreaks: true},
    {type: "DELIMITER", match: ";"},

    {type: "STRING",  match: /".*?"/, value: x => JSON.parse(x)},
    {type: "STRING",  match: /'.*?'/, value: x => JSON.parse('"' + x.slice(1, -1) + '"')},
    {type: "NUMBER",  match: /-?(?:[1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0)/, value: x => Number(x)},
    {type: "NUMBER",  match: /-?[1-9]\d*/, value: x => Number(x)},
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

Program -> _ _Program _ 

_Program -> 
    OutsideStatement
    | _Program (_ ";" _ | __) OutsideStatement 

OutsideStatement ->
    Comment 
    | RegisterStatement 
    | UsingStatement 
    | VariableDefinition 
    | FunctionDefinition 
    | EventListener 

RegisterStatement -> "register" __ %STRING (__ "as" __ %IDEN | null) 

UsingStatement -> "using" __ %STRING 

Block -> _ _Block _ 
    | _ 

_Block -> Statement 
    | _Block _ Statement 

Statement -> _Statement (_ ";" | null) 

_Statement -> 
    Comment 
    | RepeatCondition 
    | SetVariable 
    | WhileCondition 
    | IfCondition 
    | FunctionCall 

EventListener ->
    "when" __ %BLOCKIDEN _ "(" ArgList ")" _ FunctionBody


# define *FunctionName* (*args*)
FunctionDefinition ->
    (%KW_ATONCE __ | null) %KW_DEFINE __ %IDEN _ "(" _ ParamList _ ")" _ FunctionBody


FunctionCall ->
    (%BLOCKIDEN | %IDEN) _ "(" ArgList ")" InCases


VariableDefinition -> _VariableDefinition 
_VariableDefinition ->
    "var" __ VariableName
    | "var" __ VariableName _ "=" _ Constant
    | "var" __ VariableName _ "=" _ ListConstant
    | "let" __ VariableName
    | "let" __ VariableName _ "=" _ Constant
    | "let" __ VariableName _ "=" _ ListConstant

VariableName -> (%IDEN | %BLOCKIDEN) 



IfCondition ->
    "if" _ "(" _ Expression _ ")" _ FunctionBody 
    | "if" _ "(" _ Expression _ ")" _ FunctionBody _ "else" _ FunctionBody 

WhileCondition ->
    "forever" _  FunctionBody
    
    | %KW_WHILE _ "(" _ Expression _ ")" _ FunctionBody
    

RepeatCondition ->
    "repeat" _ "(" _ Expression _ ")" _ FunctionBody
    

ArgList -> null
    | _ ExpList _

# Cases

InCases -> null 
    | _ _InCases 

_InCases ->
    InCase
    | _InCases __ InCase 

InCase -> "in" __ Constant __ FunctionBody 

ParamList ->
    null 
    | Param
    | ParamList _ "," _ Param 

Param ->
    %IDEN (_ ":" _ ("string" | "number" | "bool")):? 

FunctionBody -> "{" Block "}" 

SetVariable ->
    %IDEN _ "=" _ Expression


ExpList -> 
    Expression 
    | ExpList _ "," _ Expression
    

# Expressions
Expression -> ExpOr 



Parenthesized -> "(" Expression ")" 
 
ExpOr -> ExpOr _ "||" _ ExpAnd 
	| ExpAnd 
 
ExpAnd -> ExpAnd _ "&&" _ ExpComparison 
	| ExpComparison 

ExpComparison ->
	  ExpComparison _ ">"  _ ExpConcatenation 
	| ExpComparison _ "<"  _ ExpConcatenation 
	| ExpEquals 
 
ExpEquals -> ExpComparison _ "==" _ ExpConcatenation 
    | ExpConcatenation 

ExpConcatenation ->
	  ExpConcatenation _ ".." _ ExpSum 
	| ExpSum 
 
ExpSum ->
	  ExpSum _ "+" _ ExpProduct 
	| ExpSum _ "-" _ ExpProduct 
	| ExpProduct 
 
ExpProduct ->
	  ExpProduct _ "*" _ ExpSum 
	| ExpProduct _ "/" _ ExpSum 
	| ExpProduct _ "%" _ ExpSum 
    | "!" _ ExpSum 
	| Atom 

Atom -> 
    "null" 
    | %IDEN 
    | %BLOCKIDEN 
    | Constant 
    | Parenthesized 
    | FunctionCall 

ListConstant -> "[" _ ListItems _ "]" 
    | "[" _ "]" 

ListItems ->
    Constant 
    | ListItems _ "," _ Constant 

Constant ->
    %STRING 
    | %COLOR 
    | %NUMBER 

_ -> null 
    | _ Comment _ 
    | %SPACE 
__ -> _ Comment _ 
    | %SPACE 

Comment -> %COMMENT
