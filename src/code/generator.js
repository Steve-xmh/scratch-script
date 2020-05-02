const uid = require('./uid')
const CoreBlocks = require('./blocks/index')
const InputType = require('./inputType')
const BlockType = require('./blockType')

const get = (obj, path, defaultValue = undefined) => {
    const travel = regexp =>
        String.prototype.split
            .call(path, regexp)
            .filter(Boolean)
            .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj)
    const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/)
    return result === undefined || result === obj ? defaultValue : result
}

/* SUBSTACK + num */

/**
 *
 * @typedef {number} ShadowType Does this block is not a part of the parent?
 * @typedef {string} BlockId The block id.
 * @typedef {[number, string | number | null]} Constant
 * @typedef {string | null} BlockShadow The shadow block id.
 * @typedef {[ShadowType, BlockId | Constant, BlockShadow]} Input A block's input.
 * @typedef {Object.<string, Input>} Inputs A block's inputs, contains constants or blocks.
 *
 * @typedef {string} FieldValue The value of the field, if is variable it will be the name of it.
 * @typedef {string | null} FieldId The value of the field, if is variable it will be the name of it.
 * @typedef {[FieldValue, FieldId]} Field A block's field.
 * @typedef {Object.<string, Field>} Fields A block's fields, contains variables or menus.
 *
 * @typedef {Object} Block A block data.
 * @property {string} opcode
 * @property {string | null} next
 * @property {string | null} parent
 * @property {Inputs} inputs
 * @property {Fields} fields
 * @property {boolean} shadow
 * @property {boolean} topLevel
 * @property {number} x
 * @property {number} y
 *
 * @typedef {Object.<string, Block>} Blocks A object contains all the blocks.
 */

class BlocksHelper {
    /**
     * Generate a helper to make blocks operation easier.
     * @param {Blocks} blocks
     * @param {*} ast
     */
    constructor (blocks, ast) {
        this._blocks = blocks
        this._ast = ast
    }

    /**
     * @param {Block} block
     */
    saveBlock (block) {
        const id = uid()
        this._blocks[id] = block
        return id
    }

    /**
     * @param {Block} block
     * @returns {Block}
     */
    getTopBlock (block) {
        let temp = this._blocks[block.parent]
        while (temp.parent !== null) {
            temp = this._blocks[temp.parent]
        }
        return temp
    }

    /**
     * @returns {{block: Block, id: string}}
     */
    newBlock () {
        const block = {
            opcode: '',
            next: null,
            parent: null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: false,
            x: 0,
            y: 0
        }
        return { block, id: this.saveBlock(block) }
    }

    /**
     * @param {object} block The block object
     * @param {Object.<string,[string, string]>} block.fields The block's fields
     * @param {string} name
     * @param {string | number} value
     * @param {*} isVariable
     */
    setField (block, name, value, isVariable = false) {
        block.fields[name] = [value, null]
        if (isVariable) {
            const variable = this._ast.variables.find(v => v.name === name)
            if (!variable) throw new TypeError(`Undefined variable ${name}`)
            block.fields[name][1] = variable.id
        }
    }

    /**
     * @param {object} block The block object
     * @param {Object.<string,[string, string]>} block.fields The block's fields
     * @param {string} name
     * @param {string | number} value
     * @param {*} isVariable
     */
    setInput (block, name, value, isVariable = false) {
        block.fields[name] = [value, null]
        if (isVariable) {
            const variable = this._ast.variables.find(v => v.name === name)
            if (!variable) throw new TypeError(`Undefined variable ${name}`)
            block.fields[name][1] = variable.id
        }
    }
}

/**
 * @enum {ShadowType}
 */
const ShadowType = {
    /**
     * Which will move with parent block when draging
     */
    SameShadow: 1,
    /**
     * 2
     */
    NoShadow: 2,
    /**
     * 3
     */
    DifferentShadow: 3
}

/**
 * Generate blocks object from the ast.
 * @param {any} ast The AST object that generated by parser.
 * @returns {any} The block object.
 */
function generator (
    ast,
    blocks = {},
    optimizeLevel = 0,
    askForModule = () => { throw new Error('This caller doesn\'t supplied module resolve function.') }
) {
    const helper = new BlocksHelper(blocks, ast)
    function generate (node, parentId = null) {
        switch (node.type) {
        case 'UsingStatement':
        {
            return askForModule()
        }
        case 'FunctionDefintion':
        {
            // TODO
            return null
        }
        case 'EventExpression':
        {
            // TODO
            // If we don't have this event
            const coreblock = CoreBlocks[node.name]
            if (!coreblock || coreblock.type !== BlockType.EventBlock) {
                throw new TypeError(`Can't find event ${node.name}`)
            }
            const evtBlock = helper.newBlock()
            evtBlock.block.opcode = coreblock.opcode
            if (coreblock.args.length !== node.args.length) {
                throw new TypeError(`Can't find event ${node.name}`)
            }
            return null
        }
        case 'LoopExpression':
        {
            // TODO
            return null
        }
        case 'ConditionExpression':
        {
            // TODO
            return null
        }
        case 'FunctionCall':
        {
            // TODO
            return null
        }
        case 'Literal':
        {
            // TODO
            return null
        }
        case 'Comment':
        {
            // TODO
            return null
        }
        default:
            throw new SyntaxError(`Unknown AST node type ${node.type}`)
        }
    }
    // Give variables a uid for indexing.
    ast.variables.forEach(v => { v.id = uid() })
    ast.procedures.forEach((node) => { generate(node) })
    ast.listeners.forEach((node) => { generate(node) })
    return {
        blocks,
        ast
    }
}

module.exports = generator
