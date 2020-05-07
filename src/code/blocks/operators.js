const InputType = require('../inputType')
const BlockType = require('../blockType')

module.exports = {
    name: 'Operators',
    id: 'math',
    blocks: [{
        name: 'random',
        opcode: 'operator_random',
        type: BlockType.ReporterBlock,
        args: [{
            name: 'FROM',
            type: InputType.Number
        }, {
            name: 'TO',
            type: InputType.Number
        }]
    }, {
        name: 'add',
        opcode: 'operator_add',
        type: BlockType.ReporterBlock,
        args: [{
            name: 'NUM1',
            type: InputType.Number
        }, {
            name: 'NUM2',
            type: InputType.Number
        }]
    }, {
        name: 'sub',
        opcode: 'operator_subtract',
        type: BlockType.ReporterBlock,
        args: [{
            name: 'NUM1',
            type: InputType.Number
        }, {
            name: 'NUM2',
            type: InputType.Number
        }]
    }, {
        name: 'multiply',
        opcode: 'operator_multiply',
        type: BlockType.ReporterBlock,
        args: [{
            name: 'NUM1',
            type: InputType.Number
        }, {
            name: 'NUM2',
            type: InputType.Number
        }]
    }, {
        name: 'divide',
        opcode: 'operator_divide',
        type: BlockType.ReporterBlock,
        args: [{
            name: 'NUM1',
            type: InputType.Number
        }, {
            name: 'NUM2',
            type: InputType.Number
        }]
    }, {
        name: 'join',
        opcode: 'operator_join',
        type: BlockType.ReporterBlock,
        args: [{
            name: 'STRING1',
            type: InputType.String
        }, {
            name: 'STRING2',
            type: InputType.String
        }]
    }, {
        name: 'lt',
        opcode: 'operator_lt',
        args: [{
            name: 'OPERAND1',
            type: InputType.Number
        }, {
            name: 'OPERAND2',
            type: InputType.Number
        }]
    }, {
        name: 'equals',
        opcode: 'operator_equals',
        type: BlockType.ReporterBlock,
        args: [{
            name: 'OPERAND1',
            type: InputType.Number
        }, {
            name: 'OPERAND2',
            type: InputType.Number
        }]
    }, {
        name: 'gt',
        opcode: 'operator_gt',
        type: BlockType.ReporterBlock,
        args: [{
            name: 'OPERAND1',
            type: InputType.Number
        }, {
            name: 'OPERAND2',
            type: InputType.Number
        }]
    }]
}
