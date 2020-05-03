const InputType = require('../inputType')
const BlockType = require('../blockType')

module.exports = {
    // Motions
    name: 'Motions',
    id: 'motion',
    blocks: [
        {
            name: 'walkStep',
            opcode: 'motion_movesteps',
            type: BlockType.Block,
            args: [{
                name: 'STEPS',
                type: InputType.Number
            }]
        }, {
            name: 'turnRight',
            opcode: 'motion_turnright',
            type: BlockType.Block,
            args: [{
                name: 'DEGREES',
                type: InputType.Number
            }]
        }, {
            name: 'changeX',
            opcode: 'motion_changexbx',
            type: BlockType.Block,
            args: [{
                name: 'DX',
                type: InputType.Number
            }]
        }, {
            name: 'changeY',
            opcode: 'motion_changexby',
            type: BlockType.Block,
            args: [{
                name: 'DY',
                type: InputType.Number
            }]
        }, {
            name: 'ifOnEdgeBounce',
            opcode: 'motion_ifonedgebounce',
            type: BlockType.Block
        }, {
            name: 'goTo',
            opcode: 'motion_goto',
            type: BlockType.Block,
            args: [{
                name: 'TO',
                type: InputType.Menu,
                menuOpcode: 'motion_goto_menu',
                menu: {
                    mouse: {
                        value: '_mouse_'
                    },
                    random: {
                        value: '_random_'
                    }
                }
            }]
        }
    ]
}
