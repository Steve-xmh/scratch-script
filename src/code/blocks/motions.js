const InputType = require('../inputType')
const BlockType = require('../blockType')

module.exports = {
    // Motions
    'motion.walkStep': {
        opcode: 'motion_movesteps',
        inputs: [{
            name: 'STEPS',
            type: InputType.Number
        }]
    },
    'motion.turnRight': {
        opcode: 'motion_turnright',
        inputs: [{
            name: 'DEGREES',
            type: InputType.Number
        }]
    },
    'motion.changeX': {
        opcode: 'motion_changexbx',
        inputs: [{
            name: 'DX',
            type: InputType.Number
        }]
    },
    'motion.changeY': {
        opcode: 'motion_changexby',
        inputs: [{
            name: 'DY',
            type: InputType.Number
        }]
    },
    'motion.ifOnEdgeBounce': {
        opcode: 'motion_ifonedgebounce'
    },
    'motion.goTo': {
        opcode: 'motion_goto',
        inputs: [{
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
}
