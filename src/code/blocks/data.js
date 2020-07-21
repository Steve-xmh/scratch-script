
import InputType from '../inputType'
import BlockType from '../blockType'

export default {
    name: 'Data',
    id: 'data',
    blocks: [{
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
    }, {
        name: 'addVar',
        opcode: 'data_changevariableby',
        type: BlockType.Block,
        args: [{
            name: 'VARIABLE',
            type: InputType.Variable
        }, {
            name: 'VALUE',
            type: InputType.String
        }]
    }, {
        name: 'hideVar',
        opcode: 'data_hidevariable',
        type: BlockType.Block,
        args: [{
            name: 'VARIABLE',
            type: InputType.Variable
        }]
    }, {
        name: 'showVar',
        opcode: 'data_showvariable',
        type: BlockType.Block,
        args: [{
            name: 'VARIABLE',
            type: InputType.Variable
        }]
    }, {
        name: 'addItem',
        opcode: 'data_addtolist',
        type: BlockType.Block,
        args: [{
            name: 'LIST',
            type: InputType.List
        }, {
            name: 'ITEM',
            type: InputType.String
        }]
    }, {
        name: 'deleteItem',
        opcode: 'data_deleteoflist',
        type: BlockType.Block,
        args: [{
            name: 'LIST',
            type: InputType.List
        }, {
            name: 'INDEX',
            type: InputType.PositionInteger
        }]
    }, {
        name: 'deleteAll',
        opcode: 'data_deletealloflist',
        type: BlockType.Block,
        args: [{
            name: 'LIST',
            type: InputType.List
        }]
    }, {
        name: 'insertItem',
        opcode: 'data_insertatlist',
        type: BlockType.Block,
        args: [{
            name: 'LIST',
            type: InputType.List
        }, {
            name: 'INDEX',
            type: InputType.PositionInteger
        }, {
            name: 'ITEM',
            type: InputType.String
        }]
    }, {
        name: 'replaceItem',
        opcode: 'data_replaceitemoflist',
        type: BlockType.Block,
        args: [{
            name: 'LIST',
            type: InputType.List
        }, {
            name: 'INDEX',
            type: InputType.PositionInteger
        }, {
            name: 'ITEM',
            type: InputType.String
        }]
    }, {
        name: 'itemOfList',
        opcode: 'data_itemoflist',
        type: BlockType.ReporterBlock,
        args: [{
            name: 'LIST',
            type: InputType.List
        }, {
            name: 'INDEX',
            type: InputType.PositionInteger
        }]
    }, {
        name: 'indexOfList',
        opcode: 'data_itemnumoflist',
        type: BlockType.ReporterBlock,
        args: [{
            name: 'LIST',
            type: InputType.List
        }, {
            name: 'ITEM',
            type: InputType.String
        }]
    }, {
        name: 'lengthOfList',
        opcode: 'data_lengthoflist',
        type: BlockType.ReporterBlock,
        args: [{
            name: 'LIST',
            type: InputType.List
        }, {
            name: 'ITEM',
            type: InputType.String
        }]
    }, {
        name: 'containsItem',
        opcode: 'data_listcontainsitem',
        type: BlockType.BooleanReporter,
        args: [{
            name: 'LIST',
            type: InputType.List
        }, {
            name: 'ITEM',
            type: InputType.String
        }]
    }, {
        name: 'hideList',
        opcode: 'data_hidelist',
        type: BlockType.Block,
        args: [{
            name: 'LIST',
            type: InputType.List
        }]
    }, {
        name: 'showList',
        opcode: 'data_showlist',
        type: BlockType.Block,
        args: [{
            name: 'LIST',
            type: InputType.List
        }]
    }]
}
