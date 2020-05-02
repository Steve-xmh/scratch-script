
/**
 * @typedef {Object} ArgumentD
 * @property {number} type
 * @property {Object.<string, string>} menu
 * @property {string} menuOpcode
 *
 * @typedef {Object} BlockD
 * @property {string} name
 * @property {string} opcode
 * @property {number} type
 * @property {number} subn
 * @property {Array.<ArgumentD>} args
 * @property {(node: any) => any} preprocess
 *
 * @typedef {Object} BlockDefinition
 * @property {string} name
 * @property {string} id
 * @property {string} description
 * @property {Array.<BlockD>} blocks
 *
 * @typedef {Object.<string, BlockDefinition>} BlockDefinitions
 * @returns {BlockStorage}
 */

class BlockStorage {
    constructor () {
        /**
         * @type {BlockDefinitions}
         * @private
         */
        this._blocks = {}
    }

    /**
     * @param {BlockDefinition} desc
     */
    register (desc) {
        if (!desc || typeof desc.id !== 'string') {
            throw new Error(`Extention ${desc} doesn't have a id or not exists`)
        }
        if (this._blocks[desc.id] !== undefined) {
            throw new Error(`Extention ${desc.id} has been registered`)
        }
        this._blocks[desc.id] = desc
        return this
    }

    /**
     * @param {string} blockiden
     * @returns {BlockD | null}
     */
    getBlock (blockiden) {
        const [id, name] = blockiden.split('.')
        if (!this._blocks[id]) return null
        return this._blocks[id].blocks.find(v => v.name === name) || null
    }
}

module.exports = new BlockStorage()
    .register(require('./events'))
    .register(require('./motions'))
    .register(require('./operators'))
    .register(require('./data'))
    .register(require('./looks'))
