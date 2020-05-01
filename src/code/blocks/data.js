// data_setvariableto

const InputType = require('../inputType')
const BlockType = require('../blockType')

module.exports = {
    // Looks
    'data.set': {
        opcode: 'data_setvariableto',
        inputs: [{
            name: 'MESSAGE',
            type: InputType.Variable
        }, {
            name: 'VALUE',
            type: InputType.String
        }],
        fields: [{
            
        }]
    }
}
