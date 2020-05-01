const InputType = require('../inputType')
const BlockType = require('../blockType')

/*

event_whentouchingobject
event_broadcast
event_broadcastandwait
event_whengreaterthan

event_whenflagclicked
event_whenkeypressed
event_whenthisspriteclicked
event_whentouchingobject
event_whenstageclicked
event_whenbackdropswitchesto
event_whengreaterthan
event_whenbroadcastreceived

*/

module.exports = {
    // Events
    'events.flagClicked': {
        opcode: 'event_whenflagclicked',
        type: BlockType.Block
    },
    'events.pressedKey': {
        opcode: 'event_whenkeypressed',
        type: BlockType.Block
    },
    'events.clickedThis': {
        opcode: 'event_whenthisspriteclicked',
        type: BlockType.Block
    },
    'events.touched': {
        opcode: 'event_whentouchingobject',
        type: BlockType.Block,
        inputs: [{
            name: 'TOUCHINGOBJECTMENU',
            type: InputType.Menu,
            menuOpcode: 'event_touchingobjectmenu',
            menu: {
                mouse: {
                    value: '_mouse_'
                },
                edge: {
                    value: '_edge_'
                }
            }
        }]
    },
    'events.clickedStage': {
        opcode: 'event_whenstageclicked',
        type: BlockType.Block
    },
    'events.back': {
        opcode: 'event_whenbackdropswitchesto',
        type: BlockType.Block
    },
    'events.greaterThan': {
        opcode: 'event_whengreaterthan',
        type: BlockType.Block
    },
    'events.gotBroadcast': {
        opcode: 'event_whenbroadcastreceived',
        type: BlockType.Block
    }
}
