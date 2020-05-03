
const InputType = require('../inputType')
const BlockType = require('../blockType')

module.exports = {
    id: 'data',
    blocks: [
        {
            name: 'setVar',
            opcode: 'data_setvariableto',
            type: BlockType.Block,
            args: [{
                name: 'VARIABLE',
                type: InputType.Variable
            }, {
                name: 'VALUE',
                type: InputType.String
            }]
        }
    ]
}
