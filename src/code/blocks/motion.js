
const InputType = require('../inputType')
const BlockType = require('../blockType')

module.exports = {
    name: 'Motion',
    id: 'motion',
    blocks: [{
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
        name: 'turnLeft',
        opcode: 'motion_turnleft',
        type: BlockType.Block,
        args: [{
            name: 'DEGREES',
            type: InputType.Number
        }]
    }, {
        name: 'goTo',
        opcode: 'motion_goto',
        type: BlockType.Block,
        args: [{
            name: 'TO',
            type: InputType.Menu,
            menuOpcode: 'motion_goto_menu'
        }]
    }, {
        name: 'goToPos',
        opcode: 'motion_gotoxy',
        type: BlockType.Block,
        args: [{
            name: 'X',
            type: InputType.Number
        }, {
            name: 'Y',
            type: InputType.Number
        }]
    }, {
        name: 'glideTo',
        opcode: 'motion_glideto',
        type: BlockType.Block,
        args: [{
            name: 'SECS',
            type: InputType.Number
        }, {
            name: 'TO',
            type: InputType.Menu,
            menuOpcode: 'motion_glideto_menu'
        }]
    }, {
        name: 'glideToPos',
        opcode: 'motion_glidesecstoxy',
        type: BlockType.Block,
        args: [{
            name: 'SECS',
            type: InputType.Number
        }, {
            name: 'X',
            type: InputType.Number
        }, {
            name: 'Y',
            type: InputType.Number
        }]
    }, {
        name: 'setDirection',
        opcode: 'motion_pointindirection',
        type: BlockType.Block,
        args: [{
            name: 'DIRECTION',
            type: InputType.Menu,
            menuOpcode: 'math_angle'
        }]
    }, {
        name: 'towards',
        opcode: 'motion_pointtowards',
        type: BlockType.Block,
        args: [{
            name: 'TOWARDS',
            type: InputType.Menu,
            menuOpcode: 'motion_pointtowards_menu'
        }]
    }, {
        name: 'changeX',
        opcode: 'motion_changexby',
        type: BlockType.Block,
        args: [{
            name: 'DX',
            type: InputType.Number
        }]
    }, {
        name: 'setX',
        opcode: 'motion_setx',
        type: BlockType.Block,
        args: [{
            name: 'X',
            type: InputType.Number
        }]
    }, {
        name: 'changeY',
        opcode: 'motion_changeyby',
        type: BlockType.Block,
        args: [{
            name: 'DY',
            type: InputType.Number
        }]
    }, {
        name: 'setY',
        opcode: 'motion_sety',
        type: BlockType.Block,
        args: [{
            name: 'Y',
            type: InputType.Number
        }]
    }, {
        name: 'ifOnEdgeBounce',
        opcode: 'motion_ifonedgebounce',
        type: BlockType.Block,
        args: []
    }, {
        name: 'setRotationStyle',
        opcode: 'motion_setrotationstyle',
        type: BlockType.Block,
        args: [{
            name: 'Y',
            type: InputType.Number
        }]
    }, {
        name: 'x',
        opcode: 'motion_xposition',
        type: BlockType.ReporterBlock
    }, {
        name: 'y',
        opcode: 'motion_yposition',
        type: BlockType.ReporterBlock
    }, {
        name: 'direction',
        opcode: 'motion_direction',
        type: BlockType.ReporterBlock
    }]
}
