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
    id: 'events',
    name: 'Events',
    blocks: [
        {
            name: 'flagClicked',
            opcode: 'event_whenflagclicked',
            type: BlockType.EventBlock
        }, {
            name: 'pressedKey',
            opcode: 'event_whenkeypressed',
            type: BlockType.EventBlock
        }, {
            name: 'clickedThis',
            opcode: 'event_whenthisspriteclicked',
            type: BlockType.EventBlock
        }, {
            name: 'touched',
            opcode: 'event_whentouchingobject',
            type: BlockType.EventBlock,
            args: [{
                name: 'TOUCHINGOBJECTMENU',
                type: InputType.Menu,
                menuOpcode: 'event_touchingobjectmenu',
                menu: input => ({
                    mouse: {
                        value: '_mouse_'
                    },
                    edge: {
                        value: '_edge_'
                    }
                })[input.value]
            }]
        }, {
            name: 'stageClicked',
            opcode: 'event_whenstageclicked',
            type: BlockType.EventBlock
        }, {
            name: 'switchedTo',
            opcode: 'event_whenbackdropswitchesto',
            type: BlockType.EventBlock
        }, {
            name: 'greaterThan',
            opcode: 'event_whengreaterthan',
            type: BlockType.EventBlock
        }, {
            name: 'gotBroadcast',
            opcode: 'event_whenbroadcastreceived',
            type: BlockType.EventBlock
        }
    ]
}
