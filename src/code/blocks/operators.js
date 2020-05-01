const InputType = require('../inputType')
const BlockType = require('../blockType')

module.exports = {
    // Operators
    'math.random': {
        opcode: 'operator_random',
        inputs: [{
            name: 'FROM',
            type: InputType.Number
        }, {
            name: 'TO',
            type: InputType.Number
        }]
    },
    'math.add': {
        opcode: 'operator_add',
        inputs: [{
            name: 'NUM1',
            type: InputType.Number
        }, {
            name: 'NUM2',
            type: InputType.Number
        }]
    },
    'math.sub': {
        opcode: 'operator_subtract',
        inputs: [{
            name: 'NUM1',
            type: InputType.Number
        }, {
            name: 'NUM2',
            type: InputType.Number
        }]
    },
    'math.multiply': {
        opcode: 'operator_multiply',
        inputs: [{
            name: 'NUM1',
            type: InputType.Number
        }, {
            name: 'NUM2',
            type: InputType.Number
        }]
    },
    'math.divide': {
        opcode: 'operator_divide',
        inputs: [{
            name: 'NUM1',
            type: InputType.Number
        }, {
            name: 'NUM2',
            type: InputType.Number
        }]
    },
    'math.lt': {
        opcode: 'operator_lt',
        inputs: [{
            name: 'OPERAND1',
            type: InputType.Number
        }, {
            name: 'OPERAND2',
            type: InputType.Number
        }]
    },
    'math.equals': {
        opcode: 'operator_equals',
        inputs: [{
            name: 'OPERAND1',
            type: InputType.Number
        }, {
            name: 'OPERAND2',
            type: InputType.Number
        }]
    },
    'math.gt': {
        opcode: 'operator_gt',
        inputs: [{
            name: 'OPERAND1',
            type: InputType.Number
        }, {
            name: 'OPERAND2',
            type: InputType.Number
        }]
    }
}
