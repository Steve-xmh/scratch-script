
const InputType = require('../inputType')
const BlockType = require('../blockType')

module.exports = {
    name: 'Sound',
    id: 'sound',
    blocks: [{
        name: 'playUntilDone',
        opcode: 'sound_playuntildone',
        type: BlockType.Block,
        args: [{
            name: 'SOUND_MENU',
            type: InputType.Menu,
            menu: i => i,
            menuOpcode: 'sound_sounds_menu'
        }]
    }, {
        name: 'play',
        opcode: 'sound_play',
        type: BlockType.Block,
        args: [{
            name: 'SOUND_MENU',
            type: InputType.Menu,
            menu: i => i,
            menuOpcode: 'sound_sounds_menu'
        }]
    }, {
        name: 'stopAllSounds',
        opcode: 'sound_stopallsounds',
        type: BlockType.Block
    }, {
        name: 'changeeffectby',
        opcode: 'sound_changeeffectby',
        type: BlockType.Block,
        args: [{
            name: 'EFFECT',
            type: InputType.Menu
        }, {
            name: 'VALUE',
            type: InputType.Number
        }]
    }, {
        name: 'setEffect',
        opcode: 'sound_seteffectto',
        type: BlockType.Block,
        args: [{
            name: 'EFFECT',
            type: InputType.Menu
        }, {
            name: 'VALUE',
            type: InputType.Number
        }]
    }, {
        name: 'clearEffects',
        opcode: 'sound_cleareffects',
        type: BlockType.Block
    }, {
        name: 'addVolume',
        opcode: 'sound_changevolumeby',
        type: BlockType.Block,
        args: [{
            name: 'VOLUME',
            type: InputType.Number
        }]
    }, {
        name: 'setVolume',
        opcode: 'sound_setvolumeto',
        type: BlockType.Block,
        args: [{
            name: 'VOLUME',
            type: InputType.Number
        }]
    }, {
        name: 'volume',
        opcode: 'sound_volume',
        type: BlockType.ReporterBlock
    }]
}
