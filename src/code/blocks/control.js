
const InputType = require('../inputType')
const BlockType = require('../blockType')

module.exports = {
    name: 'Control',
    id: 'control',
    blocks: [{
        name: 'wait',
        opcode: 'control_wait',
        type: BlockType.Block,
        args: [{
            name: 'DURATION',
            type: InputType.PositiveNumber
        }]
    }, {
        name: 'repeat',
        opcode: 'control_repeat',
        type: BlockType.Block,
        subn: 1,
        args: [{
            name: 'TIMES',
            type: InputType.Integer
        }]
    }, {
        name: 'forever',
        opcode: 'control_forever',
        type: BlockType.Block,
        subn: 1
    }, {
        name: 'if',
        opcode: 'control_if',
        type: BlockType.Block,
        subn: 1,
        args: [{
            name: 'CONDITION',
            type: InputType.Boolean
        }]
    }, {
        name: 'ifelse',
        opcode: 'control_if_else',
        type: BlockType.Block,
        subn: 2,
        args: [{
            name: 'CONDITION',
            type: InputType.Boolean
        }]
    }, {
        name: 'waitUntil',
        opcode: 'control_wait_until',
        type: BlockType.Block,
        args: [{
            name: 'CONDITION',
            type: InputType.Boolean
        }]
    }, {
        name: 'repeatUntil',
        opcode: 'control_repeat_until',
        type: BlockType.Block,
        subn: 1,
        args: [{
            name: 'CONDITION',
            type: InputType.Boolean
        }]
    }, {
        name: 'forEach',
        opcode: 'control_for_each',
        type: BlockType.Block,
        args: [{
            name: 'VARIABLE',
            type: InputType.Variable
        }, {
            name: 'VALUE',
            type: InputType.Integer
        }]
    }, {
        name: 'stop',
        opcode: 'control_stop',
        type: BlockType.Block,
        args: [{
            name: 'STOP_OPTION',
            type: InputType.Menu
        }]
    }, {
        name: 'startAsClone',
        opcode: 'control_start_as_clone',
        type: BlockType.EventBlock
    }, {
        name: 'cloneSelf',
        opcode: 'control_create_clone_of',
        type: BlockType.Block,
        args: [{
            name: 'CLONE_OPTION',
            type: InputType.Constant,
            value: '_myself_',
            menuOpcode: 'control_create_clone_of_menu'
        }]
    }, {
        name: 'clone',
        opcode: 'control_create_clone_of',
        type: BlockType.Block,
        args: [{
            name: 'CLONE_OPTION',
            type: InputType.Menu,
            menuOpcode: 'control_create_clone_of_menu'
        }]
    }, {
        name: 'deleteThisClone',
        opcode: 'control_delete_this_clone',
        type: BlockType.Block
    }, {
        name: 'getCounter',
        opcode: 'control_get_counter',
        type: BlockType.Block
    }, {
        name: 'incrCounter',
        opcode: 'control_incr_counter',
        type: BlockType.Block
    }, {
        name: 'clearCounter',
        opcode: 'control_clear_counter',
        type: BlockType.Block
    }, {
        name: 'allAtOnce',
        opcode: 'control_all_at_once',
        type: BlockType.Block,
        subn: 1
    }]
}
