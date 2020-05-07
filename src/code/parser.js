const nearley = require('nearley')
const te = token => new TypeError(`Unknown token "${token.value}" at ${token.location.line}:${token.location.row}`)

/**
 *
 * @typedef {Object} Literal
 * @property {"Literal"} type
 * @property {string} name
 * @property {number} line
 * @property {number} col
 *
 * @typedef {Object} Constant
 * @property {"Constant"} type
 * @property {string} name
 * @property {number} line
 * @property {number} col
 *
 * @typedef {Literal | Constant | FunctionCall} Expression
 *
 * @typedef {FunctionCall | LoopExpression | IfCondition | Comment} Statement
 *
 * @typedef {Object} FunctionCall
 * @property {"FunctionCall"} type
 * @property {Expression[]} args
 * @property {string} name
 * @property {number} line
 * @property {number} col
 *
 * @typedef {Object} Argument
 * @property {"Argument"} type
 * @property {string} name
 * @property {"string" | "number" | "bool"} argumentType
 * @property {number} line
 * @property {number} col
 *
 * @typedef {Object} FunctionDefinition
 * @property {"FunctionDefinition"} type
 * @property {string} name
 * @property {Argument[]} params
 * @property {Expression[]} args
 * @property {number} line
 * @property {number} col
 *
 * @typedef {Object} IfCondition
 * @property {"IfCondition"} type
 * @property {Expression} condition
 * @property {Statement[]} trueBlock
 * @property {Statement[]} falseBlock
 * @property {number} line
 * @property {number} col
 *
 * @typedef {Object} LoopExpression
 * @property {"LoopExpression"} type
 * @property {"forever" | "condition" | "repeat"} loop
 * @property {Expression} time
 * @property {Expression} condition
 * @property {Statement[]} body
 * @property {number} line
 * @property {number} col
 *
 * @typedef {Object} EventExpression
 * @property {"EventExpression"} type
 * @property {string} name
 * @property {Expression[]} args
 * @property {Statement[]} body
 * @property {number} line
 * @property {number} col
 *
 * @typedef {Object} VariableDefinition
 * @property {"VariableDefinition"} type
 * @property {string} name
 * @property {boolean} islocal
 * @property {Constant} value
 * @property {number} line
 * @property {number} col
 *
 * @typedef {Object} UsingStatement
 * @property {"UsingStatement"} type
 * @property {string} file
 * @property {number} line
 * @property {number} col
 *
 * @typedef {Object} RegisterStatement
 * @property {"RegisterStatement"} type
 * @property {string} file
 * @property {string?} rename
 * @property {number} line
 * @property {number} col
 *
 * @typedef { EventExpression | FunctionCall | IfCondition | LoopExpression | Constant | Comment | Literal} Node
 *
 * @typedef {Object} AST
 * @property {"Program"} type
 * @property {string?} name
 * @property {EventExpression[]} listeners
 * @property {FunctionDefinition[]} procedures
 * @property {VariableDefinition[]} variables
 * @property {UsingStatement[]} usings
 * @property {RegisterStatement[]} registers
 */

/**
 * Parse source code into ast.
 * @param {string} src The tokens array
 * @returns {AST}
 */
function parser (src) {
    const grammar = nearley.Grammar.fromCompiled(require('./nearley'))
    const ne = new nearley.Parser(grammar)
    ne.lexer.reset()
    ne.feed(src)
    const result = ne.finish()
    if (result.length === 0) {
        throw te('Unexpected end token.')
    }
    if (result.length !== 1) {
        console.log(`Warning: Parser has ${result.length} results.`)
        // (result.slice(0, 32).map(JSON.stringify))
    }
    return result[0]
}

module.exports = parser
