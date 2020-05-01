
const { promises: fs } = require('fs')
const path = require('path')
const JSZip = require('jszip')
const projectParser = require('./project/parser')
const code = require('./code/index')
const WRITE_BG_FILE = path.resolve(__dirname, './project/writebg.png')
const TRANS_BG_FILE = path.resolve(__dirname, './project/transparentbg.png')
const util = require('util')
const crypto = require('crypto')

function createFileDescription ({ hash, filename, name, x, y }) {
    return {
        assetId: hash,
        md5ext: filename,
        dataFormat: path.extname(filename).substr(1),
        name,
        rotationCenterX: x,
        rotationCenterY: y
    }
}

let layerOrder = 0
function createTarget (isStage = false) {
    return {
        isStage,
        name: isStage ? 'Stage' : '',
        variables: {},
        lists: {},
        broadcasts: {},
        blocks: {},
        comments: {},
        currentCostume: 0,
        costumes: [],
        sounds: [],
        volume: 100,
        layerOrder: isStage ? 0 : ++layerOrder,
        tempo: 60,
        videoTransparency: 50,
        videoState: 'off',
        textToSpeechLanguage: null
    }
}

async function complieCode (start) {
    try {
        return code.generator(code.parser(await fs.readFile(start, { encoding: 'utf8' })))
    } catch (err) {
        if (err instanceof TypeError) {
            console.log('Error', err.stack, '\n  On compiling code: ' + start)
            return {}
        } else throw err
    }
}

/*
Resources:
info.stage.costumes[].file
info.stage.sounds[].file
info.sprites[]costumes[].file
info.sprites[]sounds[].file
info.sprites[]code.file
*/

function * nameGenerator (nameSet) {
    let counter = 0
    while (true) {
        counter++
        const thisName = `Sprite (${counter})`
        if (!nameSet.has(thisName)) {
            yield thisName
        }
    }
}

async function parseProject ({ projectInfo: proj, projectDir }) {
    const zip = new JSZip()
    const { stage, sprites } = proj.info
    const project = {
        targets: [createTarget(true)],
        monitors: [],
        extensions: [],
        meta: {
            semver: '3.0.0',
            agent: 'ScratchScriptKit/' + require('../package.json').version
        }
    }

    async function packFile (file) {
        const data = await fs.readFile(path.resolve(projectDir, file))
        const hash = crypto.createHash('md5').update(data).digest('hex')
        const filename = hash + path.extname(file)
        zip.file(filename, data)
        return { hash, filename }
    }

    // Collage resources
    if (stage.costumes) {
        if (stage.costumes.length === 0) {
            const desc = await packFile(WRITE_BG_FILE)
            project.targets[0].costumes.push(
                createFileDescription({
                    hash: desc.hash,
                    filename: desc.filename,
                    name: 'Background'
                })
            )
        } else {
            for (const costume of stage.costumes) {
                costume.file = costume.file || TRANS_BG_FILE
                const desc = await packFile(path.resolve(projectDir, costume.file))
                project.targets[0].costumes.push(
                    createFileDescription({
                        hash: desc.hash,
                        filename: desc.filename,
                        name: costume.name
                    })
                )
            }
        }
    } else {
        const desc = await packFile(WRITE_BG_FILE)
        project.targets[0].costumes.push(
            createFileDescription({
                hash: desc.hash,
                filename: desc.filename,
                name: 'Background'
            })
        )
    }
    if (sprites && sprites.length > 0) {
        const nameSet = new Set()
        const nameGen = nameGenerator(nameSet)
        for (const sprite of sprites) {
            const target = createTarget()
            target.name = (nameSet.has(sprite.name) || !sprite.name) ? nameGen.next().value : sprite.name
            target.size = sprite.size || 100
            target.direction = sprite.direction || 90
            target.rotationType = sprite.rotationType || 'all around'
            target.currentCostume = sprite.costume || 0
            target.draggable = sprite.draggable || false
            if (sprite.pos) {
                target.x = sprite.pos.x || 0
                target.y = sprite.pos.y || 0
            }
            if (sprite.code && sprite.code.file) {
                target.blocks = (await complieCode(path.resolve(projectDir, sprite.code.file))).blocks
            }
            if (sprite.costumes) {
                for (const costume of sprite.costumes) {
                    const desc = await packFile(path.resolve(projectDir, costume.file))
                    target.costumes.push(
                        createFileDescription({
                            hash: desc.hash,
                            filename: desc.filename,
                            name: costume.name
                        })
                    )
                }
            }
            if (sprite.sounds) {
                for (const sound of sprite.sounds) {
                    const desc = await packFile(path.resolve(projectDir, sound.file))
                    target.sounds.push(
                        createFileDescription({
                            hash: desc.hash,
                            filename: desc.filename,
                            name: sound.name
                        })
                    )
                }
            }
            project.targets.push(target)
        }
    }

    zip.file('project.json', JSON.stringify(project))
    // console.log(project)
    console.log(
        util.formatWithOptions({ colors: true, depth: 10 },
            project
        )
    )
    return zip.generateAsync({ type: 'nodebuffer' })
}

/*
console.log(
            util.formatWithOptions({ colors: true, depth: 10 },
                projectInfo
            )
        )
 */
async function complieInNodeJS ({
    projectDir
}) {
    const projectFile = path.resolve(projectDir, './project.yaml')
    if ((await fs.stat(projectFile)).isFile()) {
        const projectInfo = projectParser(await fs.readFile(projectFile, { encoding: 'utf8' }))
        return parseProject({ projectInfo, projectDir })
    } else if ((await fs.stat(path.resolve(projectDir, './project.json'))).isFile()) {
        const projectInfo = projectParser(await fs.readFile(projectFile, { encoding: 'utf8' }), true)
        return parseProject({ projectInfo, projectDir })
    } else {
        throw new Error("Can't find project info file. (project.yaml or project.json)")
    }
}

module.exports = complieInNodeJS
