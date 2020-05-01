const nearley = require('nearley')
const main = require('./main')
const util = require('util')
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(main))

const code = `
using "test.ss" // WIP
var temp = 1 // This is a comment
when events.flagClicked()
    looks.sayFor('Hello'..' '..'ScratchScript!', 3)
    while(1 * 50 + 2 / 4)
        direction = 1
        repeat(10)
            direction = 1
            repeat(10)
                motion.changeY(5 * direction,,)
            end
            ext.switch(temp)
            in 1
                direction = -1
            in 2
                direction = 1
            end
        end
    end
end
`

const startTime = Date.now()
parser.feed(code)
const usedTime = Date.now() - startTime
console.log(util.formatWithOptions({ colors: true, depth: 100 }, parser.finish().find(v => !!v)))
console.log('Used time', usedTime, 'ms')
