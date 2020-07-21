
import InputType from '../inputType'
import BlockType from '../blockType'

export default {
    name: 'Sensing',
    id: 'sensing',
    blocks: [{
        name: 'isTouching',
        opcode: 'sensing_touchingobject',
        type: BlockType.BooleanReporter,
        args: [{
            name: 'TOUCHINGOBJECTMENU',
            type: InputType.Menu,
            menuOpcode: 'sensing_touchingobjectmenu'
        }]
    }, {
        name: 'isTouchingColor',
        opcode: 'sensing_touchingcolor',
        type: BlockType.BooleanReporter,
        args: [{
            name: 'COLOR',
            type: InputType.Color
        }]
    }, {
        name: 'isColorTouchingColor',
        opcode: 'sensing_coloristouchingcolor',
        type: BlockType.BooleanReporter,
        args: [{
            name: 'COLOR',
            type: InputType.Color
        }, {
            name: 'COLOR2',
            type: InputType.Color
        }]
    }, {
        name: 'distanceTo',
        opcode: 'sensing_distanceto',
        type: BlockType.ReporterBlock,
        args: [{
            name: 'DISTANCETOMENU',
            type: InputType.Menu,
            menuOpcode: 'sensing_distancetomenu'
        }]
    }, {
        name: 'askAndWait',
        opcode: 'sensing_askandwait',
        type: BlockType.Block,
        args: [{
            name: 'QUESTION',
            type: InputType.String
        }]
    }, {
        name: 'answer',
        opcode: 'sensing_answer',
        type: BlockType.ReporterBlock
    }, {
        name: 'isKeyPressed',
        opcode: 'sensing_keypressed',
        type: BlockType.BooleanReporter,
        args: [{
            name: 'KEY_OPTION',
            type: InputType.Menu,
            menuOpcode: 'sensing_keyoptions'
        }]
    }, {
        name: 'isMouseDown',
        opcode: 'sensing_mousedown',
        type: BlockType.BooleanReporter
    }, {
        name: 'mouseX',
        opcode: 'sensing_mousex',
        type: BlockType.ReporterBlock
    }, {
        name: 'mouseY',
        opcode: 'sensing_mousey',
        type: BlockType.ReporterBlock
    }, {
        name: 'setDragMode',
        opcode: 'sensing_setdragmode',
        type: BlockType.Block,
        args: [{
            name: 'DRAG_MODE',
            type: InputType.Menu,
            menu: i => i.value === 'draggable' ? 'draggable' : 'not draggable'
        }]
    }, {
        name: 'loudness',
        opcode: 'sensing_loudness',
        type: BlockType.ReporterBlock
    }, {
        name: 'timer',
        opcode: 'sensing_timer',
        type: BlockType.ReporterBlock
    }, {
        name: 'resetTimer',
        opcode: 'sensing_resettimer',
        type: BlockType.Block
    }, {
        name: 'ofStage',
        opcode: 'sensing_of',
        type: BlockType.Block,
        args: [{
            name: 'OBJECT',
            type: InputType.Constant,
            value: '_stage_',
            menuOpcode: 'sensing_of_object_menu'
        }, {
            name: 'PROPERTY',
            type: InputType.String
        }]
    }, {
        name: 'of',
        opcode: 'sensing_of',
        type: BlockType.Block,
        args: [{
            name: 'OBJECT',
            type: InputType.Menu,
            menuOpcode: 'sensing_of_object_menu'
        }, {
            name: 'PROPERTY',
            type: InputType.String
        }]
    }, {
        name: 'current',
        opcode: 'sensing_current',
        type: BlockType.Block,
        args: [{
            name: 'CURRENTMENU',
            type: InputType.Menu

        }]
    }, {
        name: 'dayssince2000',
        opcode: 'sensing_dayssince2000',
        type: BlockType.ReporterBlock
    }, {
        name: 'username',
        opcode: 'sensing_username',
        type: BlockType.ReporterBlock
    }]
}
