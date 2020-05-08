#!/usr/bin/env node

'use strict'

const path = require('path')
const prog = require('commander')
const fs = require('fs')

const version = require('../package.json').version

let ss
if (fs.existsSync(path.join(__dirname, '../build/index.js'))) ss = require('../build')
else ss = require('../src/index')

prog.version(version, '-v, --version')
    .name('ssc')
    .arguments('<dir>')
    .option('-o, --output <outputpath>', 'specify an output project file path')
    .action((dir, argv) => {
        const projectDir = path.resolve(process.cwd(), dir)
        const outputDir = argv.output
            ? path.resolve(process.cwd(), argv.output)
            : path.resolve(projectDir, path.basename(projectDir) + '.sb3')
        ss.complieInNodeJS({
            projectDir
        }).then(complied => {
            return fs.promises.writeFile(outputDir, complied)
        }).catch(err => {
            console.log(err)
        })
    })

prog.parse(process.argv)
