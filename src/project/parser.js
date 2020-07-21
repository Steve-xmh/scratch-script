import YAML from 'yaml'
import AJV from 'ajv'
import schema from './schema'

/**
 * Transfer project info file to a type fine object.
 * @param {string} scriptInfo The project info writen in YAML.
 */
function parser (scriptInfo, useJSON = false) {
    const data = useJSON ? JSON.parse(scriptInfo) : YAML.parse(scriptInfo)
    const ajv = new AJV()
    const v = ajv.validate(schema, data)
    if (!v) {
        const errorText = `[Error] Project parser find error(s):\n${ajv.errors.map(v => `ProjectInfo${v.dataPath} ${v.message}`).join('\n')}`
        throw new Error(errorText)
    }
    return data
}

export default parser
