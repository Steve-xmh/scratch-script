const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const ncc = require('@zeit/ncc')
const path = require('path')
const { promises: fs } = require('fs')

const rm = p => new Promise((resolve, reject) => rimraf(p, err => { if (err) { reject(err) } else { resolve() } }))

async function main () {
    const distPath = path.resolve(__dirname, '../dist')
    const ignoredFiles = [
        '/test/project.json',
        '/test/testProject/project.yaml'
    ]
    const threads = []
    await rm(path.resolve(__dirname, '../dist'))
    await mkdirp(distPath)
    const result = await ncc(path.resolve(__dirname, '../src/index.js'), {
        minify: true
    })
    for (const p in result.assets) {
        if (ignoredFiles.filter(v => p.search(v) !== -1).length === 0) {
            threads.push((async () => {
                const writePath = path.resolve(distPath, p)
                await mkdirp(path.resolve(writePath, '../'))
                await fs.writeFile(writePath, result.assets[p].source)
            })())
        }
    }
    threads.push(fs.writeFile(path.resolve(distPath, 'index.js'), result.code))
    await Promise.all(threads)
}

main()
