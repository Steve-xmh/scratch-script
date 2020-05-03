const nearley = require('nearley')
const grammar = nearley.Grammar.fromCompiled(require('./nearley'))
const te = token => new TypeError(`Unknown token "${token.value}" at ${token.location.line}:${token.location.row}`)

/**
 * Parse source code into ast.
 * @param {string} src The tokens array
 */
function parser (src) {
    const ne = new nearley.Parser(grammar)
    try {
        ne.feed(src)
    } catch (err) {
        console.log(err)
        throw te(err.message)
    }
    const result = ne.finish()
    if (result.length === 0) {
        console.log(ne)
        throw te('Unexpected end token.')
    }
    return result[0]
}

module.exports = parser
