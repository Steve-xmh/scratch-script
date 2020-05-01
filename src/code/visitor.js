
const uid = require('./uid')

function genUid (blocks) {
    let tuid = null
    let haveSame = true
    while (haveSame) {
        haveSame = false
        tuid = uid()
        for (const name in blocks) {
            if (tuid === blocks[name]) {
                haveSame = true
                break
            }
        }
    }
    return tuid
}

/**
 * Transform the code for easier generation and function check.
 * @param {any} ast The AST object from parser.
 */
function visitor (ast) {
    const newAst = {
        defineFunctionNames: {},
        defineFunctions: [],
        eventFunctions: []
    }
    for (const node of ast.body) {
        if (node.type === 'EventExpression') {
            newAst.eventFunctions.push(node)
            continue
        }
        if (node.type === 'FunctionDefintion') {
            // newAst.defineFunctionNames[node.name] = genUid(newAst.defineFunctionNames)
            newAst.defineFunctions.push(node)
            continue
        }
        // If there is a node outside of a top block, it will be never execuated by any event, so ignore it.
    }
    return newAst
}

module.exports = visitor
