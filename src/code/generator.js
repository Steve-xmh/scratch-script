import uid from './uid'
import { createWithCoreBlocks } from './blocks/index'
import InputType from './inputType'
import BlockType from './blockType'

const BlockStorage = createWithCoreBlocks()

/**
 * @enum {ShadowType}
 */
const ShadowType = {
    /**
     * 1, Which will move with parent block when draging
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

const ArgumentType = {
    bool: 'b',
    string: 's',
    number: 's'
}

const ArgumentDefaultValue = {
    bool: null,
    string: '',
    number: 0
}

const DefaultValues = {
    [InputType.Boolean]: null,
    [InputType.Broadcast]: null,
    [InputType.List]: null,
    [InputType.Menu]: null,
    [InputType.Variable]: null,
    [InputType.Color]: '#000000',
    [InputType.String]: '',
    [InputType.Integer]: 0,
    [InputType.PositionInteger]: 0,
    [InputType.PositiveNumber]: 0,
    [InputType.Number]: 0,
    // For procedure block
    string: InputType.String,
    number: InputType.Number,
    bool: InputType.Boolean
}

const nonMenus = [
    InputType.Number,
    InputType.Angle,
    InputType.String,
    InputType.PositionInteger,
    InputType.PositiveNumber,
    InputType.Color,
    InputType.Integer
]

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
        let temp = block
        while (temp && temp.parent !== null) {
            temp = this._blocks[temp.parent]
        }
        return temp || null
    }

    getProtoBlock (block) {
        const top = this.getTopBlock(block)
        if (top && top.opcode === 'procedures_definition') {
            return this._blocks[top.inputs.custom_block[1]] || null
        }
        return null
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
            topLevel: false
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

class CompileError extends TypeError {
    constructor (msg, node) {
        super(msg)
        this.node = node
        this.type = 'CompileError'
    }
}

const te = (msg, node) => new CompileError(msg, node)
const noModuleSupported = async () => { throw new Error('This generator doesn\'t supplied module resolve function.') }
const noRegisterSupported = async () => { throw new Error('This generator doesn\'t supplied register function.') }

/**
 * Generate blocks object from the ast.
 * @param {Object} option
 * @param {import('./parser').AST} option.ast The AST object that generated by parser.
 * @param {Blocks?} option.blocks
 * @param {number?} option.optimizeLevel
 * @param {string?} option.thisModuleHash
 * @param {(usingStatement: import('./parser').UsingStatement) => Promise<string>} option.getModuleHash
 * @param {(usingStatement: import('./parser').UsingStatement) => Promise<import('./parser').AST>} option.askForModule
 * @param {(registerStatement: import('./parser').RegisterStatement) => Promise<import('./blocks').BlockD>} option.askForRegister
 * @returns {Promise<{blocks: Blocks, ast: import('./parser').AST}>} The block object.
 */
async function generator ({
    ast,
    blocks = {},
    optimizeLevel = 0,
    thisModuleHash = null,
    getModuleHash = noModuleSupported,
    askForModule = noModuleSupported,
    askForRegister = noRegisterSupported
}) {
    const helper = new BlocksHelper(blocks, ast)
    BlockStorage.reset()
    /**
     * @param {import('./parser').Node} node
     * @param {string?} parentId
     * @returns {string | import('./parser').Constant} The block's id
     */
    function generate (node, parentId = null) {
        /**
         * @param {import('./parser').Node} node
         * @param {{block: Block, id: string}} block
         * @param {import('./blocks').ArgumentD[]} args
         * @param {string?} parentId
         */
        function addArgumentsToBlock (node, block, args, parentId = null) {
            if (!args || args.length === 0) return
            const constantArgs = args.filter(v => [InputType.Constant, InputType.MenuConstant].includes(v.type))
            for (let i = 0; i < constantArgs.length; i++) {
                const arg = constantArgs[i]
                if (arg.type === InputType.Constant) {
                    if (typeof arg.value === 'string') {
                        block.block.inputs[arg.name] = [ShadowType.SameShadow, [InputType.String, arg.value]]
                    } else if (typeof arg.value === 'number') {
                        block.block.inputs[arg.name] = [ShadowType.SameShadow, [InputType.Number, arg.value]]
                    } else if (arg.value instanceof Array) {
                        block.block.inputs[arg.name] = [ShadowType.SameShadow, arg.value]
                    } else {
                        console.log(`WARN: Can't add ${arg.name} value.`)
                    }
                } else { // Menu Constant
                    if ('menuOpcode' in arg) {
                        const menuBlock = helper.newBlock()
                        menuBlock.block.opcode = arg.menuOpcode
                        menuBlock.block.parent = block.id
                        menuBlock.block.shadow = true
                        menuBlock.block.fields[arg.name] = [arg.value, null]
                        block.block.inputs[arg.name] = [ShadowType.SameShadow, menuBlock.id]
                    } else {
                        block.block.fields[arg.name] = [arg.value, null]
                    }
                }
            }
            const realArgs = args.filter(v => v.type !== InputType.Constant && v.type !== InputType.MenuConstant)
            for (let i = 0; i < realArgs.length; i++) {
                const arg = realArgs[i]
                const narg = node.args[i]
                const defaultValue = DefaultValues[arg.type]
                if (narg === null) {
                    continue
                } else if (narg.type === 'Constant') {
                    if (nonMenus.includes(arg.type)) {
                        block.block.inputs[arg.name] = [ShadowType.SameShadow, [arg.type, narg.value]]
                    } else {
                        // So we think it's a menu
                        if (narg.type !== 'Constant') throw te(`Can't use non-constant to argument ${i} in block ${node.name}`, narg)
                        if (arg.type === InputType.Variable) {
                            const variable = ast.variables.find(v => v.name === narg.value && !(v.value instanceof Array))
                            if (!variable) throw te(`Undefined variable ${narg.value}`, narg)
                            if (!variable.islocal) variable.used.push([parentId, 'fields', arg.name, '1'])
                            block.block.fields[arg.name] = [variable.name, variable.id]
                        } else if (arg.type === InputType.List) {
                            const variable = ast.variables.find(v => v.name === narg.value && (v.value instanceof Array))
                            if (!variable) throw te(`Undefined list ${narg.value}`, narg)
                            if (!variable.islocal) variable.used.push([parentId, 'fields', arg.name, '1'])
                            block.block.fields[arg.name] = [variable.name, variable.id]
                        } else if (arg.type === InputType.Menu) {
                            if (arg.menuOpcode) {
                                const menuBlock = helper.newBlock()
                                menuBlock.block.opcode = arg.menuOpcode
                                menuBlock.block.parent = block.id
                                block.block.inputs[arg.name] = [ShadowType.SameShadow, menuBlock.id]
                                menuBlock.block.fields[arg.name] = [arg.menu ? arg.menu(narg) : narg.value, null]
                            } else {
                                block.block.fields[arg.name] = [arg.menu ? arg.menu(narg) : narg.value, null]
                            }
                        }
                    }
                } else {
                    const subBlock = generate(narg, parentId)
                    if (typeof subBlock !== 'string') {
                        // It is constants, or array (variable or list)
                        if (subBlock instanceof Array) {
                            block.block.inputs[arg.name] = [ShadowType.DifferentShadow, subBlock, [arg.type, defaultValue]]
                        } else if (nonMenus.includes(arg.type)) {
                            block.block.inputs[arg.name] = [ShadowType.DifferentShadow, [arg.type, narg.value], [arg.type, defaultValue]]
                        } else {
                            // So we think it's a menu
                            if (arg.type === InputType.Variable) {
                                if (narg.type !== 'Constant') throw te(`Can't use non-constant to argument ${i} in block ${node.name}`, narg)
                                const variable = ast.variables.find(v => v.name === narg.value)
                                if (!variable) throw te(`Undefined variable ${narg.value}`, narg)
                                if (!variable.islocal) variable.used.push([parentId, 'fields', arg.name, '1', '2'])
                                block.block.fields[arg.name] = [InputType.Variable, variable.name, variable.id]
                            }
                        }
                    } else {
                        if (defaultValue === null) {
                            block.block.inputs[arg.name] = [ShadowType.SameShadow, subBlock]
                        } else {
                            block.block.inputs[arg.name] = [ShadowType.DifferentShadow, subBlock, [arg.type, defaultValue]]
                        }
                    }
                }
            }
        }
        switch (node.type) {
        case 'FunctionDefinition':
        {
            let parentBlockId = node.defid
            for (const statement of node.body) {
                const temp = generate(statement, parentBlockId)
                if (temp) {
                    if (parentBlockId === node.id) {
                        parentBlockId = temp
                        node.block.next = parentBlockId
                    } else {
                        blocks[parentBlockId].next = temp
                        parentBlockId = blocks[parentBlockId].next
                    }
                }
            }
            return null
        }
        case 'EventExpression':
        {
            const blockd = BlockStorage.getBlock(node.name, node.args.filter(v => v.type !== InputType.Constant).length)
            if (!blockd || blockd.type !== BlockType.EventBlock) {
                throw te(`Can't find event ${node.name} with ${node.args.length} argument${node.args.length > 1 ? 's' : ''}`, node)
            }
            const evtBlock = helper.newBlock()
            const block = evtBlock.block
            block.opcode = blockd.opcode
            block.topLevel = true
            block.x = 0
            block.y = 0
            let parentBlockId = evtBlock.id
            for (const statement of node.body) {
                const temp = generate(statement, parentBlockId)
                if (temp) {
                    if (parentBlockId === evtBlock.id) {
                        parentBlockId = temp
                        block.next = parentBlockId
                    } else {
                        blocks[parentBlockId].next = temp
                        parentBlockId = blocks[parentBlockId].next
                    }
                }
            }
            addArgumentsToBlock(node, evtBlock, blockd.args, parentId)
            return evtBlock.id
        }
        case 'FunctionCall':
        {
            // Check if it's procedure block
            const procNode = ast.procedures.find(v =>
                v.name === node.name &&
                v.params.length === node.args.length
            )
            if (procNode) {
                const protoBlock = blocks[procNode.protoid]
                const { block: callBlock, id: callId } = helper.newBlock()
                callBlock.opcode = 'procedures_call'
                callBlock.parent = parentId
                callBlock.mutation = {
                    tagName: protoBlock.mutation.tagName,
                    children: protoBlock.mutation.children,
                    proccode: protoBlock.mutation.proccode,
                    warp: protoBlock.mutation.warp,
                    argumentids: protoBlock.mutation.argumentids
                }
                callBlock.mutation.argumentids.forEach((argid, i) => {
                    const valueType = DefaultValues[procNode.params[i].argumentType]
                    const defaultValue = DefaultValues[valueType]
                    if (node.args[i].type !== 'Constant') {
                        const subBlock = generate(node.args[i], callId)
                        callBlock.inputs[argid] = [ShadowType.DifferentShadow, subBlock, [valueType, defaultValue]]
                        if (typeof subBlock === 'object' && subBlock.type === 'Constant') {
                            callBlock.inputs[argid][2] = [valueType, subBlock.value]
                        }
                    } else {
                        callBlock.inputs[argid] = [ShadowType.DifferentShadow, [valueType, node.args[i].value], [valueType, defaultValue]]
                    }
                })
                callBlock.mutation.argumentids = JSON.stringify(callBlock.mutation.argumentids)
                return callId
            }
            const blockd = BlockStorage.getBlock(node.name, node.args.length)
            if (!(blockd && [
                BlockType.Block,
                BlockType.ReporterBlock,
                BlockType.BooleanReporter
            ].includes(blockd.type))) {
                throw te(`Can't find block ${node.name} with ${node.args.length} argument${node.args.length > 1 ? 's' : ''}`, node)
            }
            let isAllConstants = true
            if (!blockd.args) blockd.args = []
            for (let i = 0; i < blockd.args.length; i++) {
                if (!node.args[i]) {
                    isAllConstants = false
                    break
                } else if (node.args[i] && node.args[i].type !== 'Constant') {
                    isAllConstants = false
                    break
                }
            }
            if (isAllConstants && blockd.preprocess && blockd.subn === 0 && optimizeLevel > 0) {
                return blockd.preprocess(node, helper)
            } else {
                const funcBlock = helper.newBlock()
                const block = funcBlock.block
                block.opcode = blockd.opcode
                block.parent = parentId
                addArgumentsToBlock(node, funcBlock, blockd.args, parentId)
                // Check if block has substack
                for (let i = 1; i <= blockd.subn; i++) {
                    // If they have something in this substack
                    if (i in node.cases) {
                        const thisCase = node.cases[i]
                        const inputName = `SUBSTACK${i > 1 ? i : ''}`
                        block.inputs[inputName] = [ShadowType.NoShadow, null]
                        let parentBlockId = funcBlock.id
                        for (const statement of thisCase.body) {
                            const temp = generate(statement, parentBlockId)
                            if (temp) {
                                if (parentBlockId === funcBlock.id) {
                                    parentBlockId = temp
                                    block.inputs[inputName][1] = parentBlockId
                                } else {
                                    blocks[parentBlockId].next = temp
                                    parentBlockId = blocks[parentBlockId].next
                                }
                            }
                        }
                    }
                }
                return funcBlock.id
            }
        }
        case 'Literal':
        {
            const protoBlock = helper.getProtoBlock(blocks[parentId])
            if (protoBlock) {
                const argument = protoBlock.mutation.argumentnames.indexOf(node.name)
                if (argument !== -1) {
                    const argBlock = helper.newBlock()
                    argBlock.block.opcode = 'argument_reporter_string_number'
                    argBlock.block.parent = parentId
                    argBlock.block.fields.VALUE = [
                        node.name,
                        null
                    ]
                    return argBlock.id
                }
            }
            const variable = ast.variables.find(v => v.name === node.name)
            if (!variable) throw te(`Undefined variable ${node.name}`, node)
            return [InputType.Variable, variable.name, variable.id]
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
    const usedModules = []
    if (thisModuleHash) usedModules.push(thisModuleHash)
    /**
     * @param {import('./parser').AST} ast
     */
    async function tryFindAndMixModules (ast) {
        if (ast.usings.length > 0 && (getModuleHash === noModuleSupported || askForModule === noModuleSupported)) noModuleSupported()
        for (const use of ast.usings) {
            const moduleHash = await getModuleHash(use)
            if (!usedModules.includes(moduleHash)) {
                usedModules.push(moduleHash)
                const usingModule = await askForModule(use)
                if (usingModule) {
                    if (usingModule.usings.length > 0) {
                        await tryFindAndMixModules(usingModule)
                    }
                    ast.variables.unshift(...usingModule.variables)
                    ast.procedures.unshift(...usingModule.procedures)
                    ast.listeners.unshift(...usingModule.listeners)
                } else {
                    return false
                }
            }
        }
        return true
    }
    if (!await tryFindAndMixModules(ast)) return null
    // Register extentions.
    for (const r of ast.registers) {
        // SCRATCHSCRIPT_INCLUDE_DIR
        if (askForRegister === noRegisterSupported) noRegisterSupported()
        const def = await askForRegister(r)
        if (!def) throw te(`Can't find module ${r.file}${r.rename ? ` as ${r.rename}` : ''}`, r)
        BlockStorage.register(def, r.rename)
    }
    // Give variables a uid for indexing.
    ast.variables.forEach(v => { v.id = uid(); if (!v.islocal) { v.used = [] } })
    // Create prototype first
    ast.procedures.forEach((node) => {
        const protoBlock = helper.newBlock()
        protoBlock.block.opcode = 'procedures_prototype'
        protoBlock.block.shadow = true
        const defBlock = helper.newBlock()
        protoBlock.block.parent = defBlock.id
        defBlock.block.opcode = 'procedures_definition'
        defBlock.block.topLevel = true
        defBlock.block.x = 0
        defBlock.block.y = 0
        // Link to prototype block
        defBlock.block.inputs.custom_block = [ShadowType.SameShadow, protoBlock.id]
        protoBlock.block.mutation = {
            tagName: 'mutation',
            warp: node.warp,
            children: [],
            proccode: node.name + (node.params.length > 0 ? ' ' : '') +
                    node.params.map(v => '%' + ArgumentType[v.argumentType]).join(' '),
            argumentids: node.params.map(v => {
                const argBlock = helper.newBlock()
                argBlock.block.opcode = 'argument_reporter_string_number'
                argBlock.block.parent = protoBlock.id
                argBlock.block.shadow = true
                argBlock.block.fields.VALUE = [
                    v.name,
                    null
                ]
                return argBlock.id
            }),
            argumentnames: node.params.map(v => v.name),
            argumentdefaults: node.params.map(v => ArgumentDefaultValue[v.argumentType])
        }
        // Store defid and protoid
        node.defid = defBlock.id
        node.protoid = protoBlock.id
    })
    ast.procedures.forEach(node => { generate(node) })
    ast.listeners.forEach(node => { generate(node) })
    ast.procedures.forEach(node => {
        const mutation = blocks[node.protoid].mutation
        mutation.argumentids = JSON.stringify(mutation.argumentids)
        mutation.argumentnames = JSON.stringify(mutation.argumentnames)
        mutation.argumentdefaults = JSON.stringify(mutation.argumentdefaults)
    })
    return {
        blocks,
        ast
    }
}

export default generator
