
import InputType from '../inputType'
import BlockType from '../blockType'

export default {
    name: 'Events',
    id: 'events',
    blocks: [{
        name: 'flagClicked',
        opcode: 'event_whenflagclicked',
        type: BlockType.EventBlock
    }, {
        name: 'keyPressed',
        opcode: 'event_whenkeypressed',
        type: BlockType.EventBlock,
        args: [{
            name: 'KEY_OPTION',
            type: InputType.Menu
        }]
    }, {
        name: 'clicked',
        opcode: 'event_whenthisspriteclicked',
        type: BlockType.EventBlock
    }, {
        name: 'backdropSwitchesTo',
        opcode: 'event_whenbackdropswitchesto',
        type: BlockType.EventBlock,
        args: [{
            name: 'BROADCAST_INPUT',
            type: InputType.Broadcast
        }]
    }, {
        name: 'greaterThan',
        opcode: 'event_whengreaterthan',
        type: BlockType.EventBlock,
        args: [{
            name: 'VALUE',
            type: InputType.Number
        }]
    }, {
        name: 'broadcastReceived',
        opcode: 'event_whenbroadcastreceived',
        type: BlockType.EventBlock,
        args: [{
            name: 'BROADCAST_OPTION',
            type: InputType.Broadcast
        }]
    }, {
        name: 'broadcast',
        opcode: 'event_broadcast',
        type: BlockType.Block,
        args: [{
            name: 'BROADCAST_INPUT',
            type: InputType.Broadcast
        }]
    }, {
        name: 'broadcastAndWait',
        opcode: 'event_broadcastandwait',
        type: BlockType.Block,
        args: [{
            name: 'BROADCAST_INPUT',
            type: InputType.Broadcast
        }]
    }]
}
