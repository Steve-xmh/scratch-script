const ss = require('../dist')
const path = require('path')
const args = process.argv.slice(2)
const fs = require('fs')

function log (...args) { console.log(...args) }

if (args.length < 2) {
    log('ScratchScriptKPit')
    log('By SteveXMH')
    log('Usage: ssc (project directory) (output sb3 file)')
    process.exit(0)
}

const projectDir = path.resolve(process.cwd(), args[0])
const outputDir = path.resolve(process.cwd(), args[args.length - 1])

ss.complieInNodeJS({
    projectDir
}).then(complied => {
    return fs.promises.writeFile(outputDir, complied)
}).catch(err => {
    console.log(err)
})
