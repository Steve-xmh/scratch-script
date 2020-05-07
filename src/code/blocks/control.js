
const InputType = require('../inputType')
const BlockType = require('../blockType')

module.exports = {
    id: 'control',
    blocks: [
        {
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
            name: 'while',
            opcode: 'control_while',
            type: BlockType.Block,
            subn: 1,
            args: [{
                name: 'CONDITION',
                type: InputType.Boolean
            }]
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
        }
    ]
}
