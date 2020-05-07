
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
 * @property {(node: import('../parser').Constant) => string} preprocess
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
        this._coreBlocks = {}
        this._blocks = {}
    }

    /**
     * @param {BlockDefinition} desc
     * @private
     */
    _register (desc) {
        if (!desc || typeof desc.id !== 'string') {
            throw new Error(`Extention ${desc.id || desc.name} doesn't have a id or not exists`)
        }
        if (this._coreBlocks[desc.id] !== undefined) {
            throw new Error(`Extention ${desc.id} has been registered`)
        }
        this._coreBlocks[desc.id] = desc
        return this
    }

    /**
     * @param {BlockDefinition} desc
     * @param {string?} rename
     */
    register (desc, rename = null) {
        const registerid = rename || desc.id
        if (!desc || typeof registerid !== 'string') {
            throw new Error(`Extention ${registerid || desc.name} doesn't have a id or not exists`)
        }
        if (this._blocks[registerid] !== undefined || this._coreBlocks[registerid] !== undefined) {
            throw new Error(`Extention ${registerid} has been registered`)
        }
        this._blocks[registerid] = desc
        return this
    }

    reset () {
        this._blocks = {}
        return this
    }

    /**
     * @param {string} blockiden
     * @param {number} argn
     * @returns {BlockD?}
     */
    getBlock (blockiden, argn = 0) {
        const [id, name] = blockiden.split('.')
        if (this._blocks[id]) {
            return this._blocks[id].blocks.find(v => v.name === name &&
                (v.args ? (v.args.length === argn) : (argn === 0))
            ) || null
        } else if (this._coreBlocks[id]) {
            return this._coreBlocks[id].blocks.find(v => v.name === name &&
                (v.args ? (v.args.length === argn) : (argn === 0))
            ) || null
        } else {
            return null
        }
    }
}

BlockStorage.coreBlocks = {
    events: require('./events'),
    motions: require('./motions'),
    operators: require('./operators'),
    data: require('./data'),
    looks: require('./looks'),
    control: require('./control')
}

BlockStorage.createWithCoreBlocks = function () {
    const storage = new BlockStorage()
    for (const key in BlockStorage.coreBlocks) {
        storage._register(BlockStorage.coreBlocks[key])
    }
    return storage
}

module.exports = BlockStorage
