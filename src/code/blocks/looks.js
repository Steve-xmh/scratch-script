const InputType = require('../inputType')
const BlockType = require('../blockType')

module.exports = {
    // Looks
    'looks.say': {
        opcode: 'looks_sayforsecs',
        inputs: [{
            name: 'MESSAGE',
            type: InputType.String
        }]
    },
    'looks.sayFor': {
        opcode: 'looks_sayforsecs',
        inputs: [{
            name: 'MESSAGE',
            type: InputType.String
        }, {
            name: 'SECS',
            type: InputType.Number
        }]
    }
}
