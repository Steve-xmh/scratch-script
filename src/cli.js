let ss
const path = require('path')
const args = process.argv.slice(2)
const fs = require('fs')

if (fs.existsSync(path.join(__dirname, './index.js'))) ss = require('./index')
else ss = require('../dist')

function log (...args) { console.log(...args) }

if (args.length < 2) {
    log('ScratchScriptKit')
    log('By SteveXMH')
    log('Usage: ssc (project directory) (output sb3 file)')
    process.exit(0)
}

const projectDir = path.resolve(process.cwd(), args[args.length - 2])
const outputDir = path.resolve(process.cwd(), args[args.length - 1])

ss.complieInNodeJS({
    projectDir
}).then(complied => {
    return fs.promises.writeFile(outputDir, complied)
}).catch(err => {
    console.log(err)
})
