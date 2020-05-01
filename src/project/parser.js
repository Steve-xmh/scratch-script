const yaml = require('yaml')
const AJV = require('ajv')
const schema = require('./schema')

/**
 * Transfer project info file to a type fine object.
 * @param {string} scriptInfo The project info writen in YAML.
 */
function parser (scriptInfo, useJSON = false) {
    const data = useJSON ? JSON.parse(scriptInfo) : yaml.parse(scriptInfo)
    const ajv = new AJV()
    const v = ajv.validate(schema, data)
    if (!v) {
        const errorText = `[Error] Project parser find error(s):\n${ajv.errors.map(v => `ProjectInfo${v.dataPath} ${v.message}`).join('\n')}`
        throw new Error(errorText)
    }
    return data
}

module.exports = parser
