
const { promises: fs } = require('fs')
const path = require('path')
const JSZip = require('jszip')
const projectParser = require('./project/parser')
const code = require('./code/index')

const WRITE_BG = '<svg xmlns="http://www.w3.org/2000/svg"version="1.1" width="480" height="360"><rect width="480"height="360"stroke="white"stroke-width="0"fill="white"/></svg>'
const WRITE_BG_MD5 = 'cbc832ca55fdab3219bc972a555dd9b4'
const WRITE_BG_FILENAME = 'cbc832ca55fdab3219bc972a555dd9b4.svg'

const TRANS_BG = '<svg xmlns="http://www.w3.org/2000/svg"version="1.1" width="480" height="360"><rect width="480"height="360"stroke="transparent"stroke-width="0"fill="transparent"/></svg>'
const TRANS_BG_MD5 = 'a07cd14a85ead82b17380fe5abe8335c'
const TRANS_BG_FILENAME = 'a07cd14a85ead82b17380fe5abe8335c.svg'

const EMPTY_AUDIO = require('./project/emptyAudio')

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

    function packWrite (name) {
        if (!zip.files[WRITE_BG_FILENAME]) {
            zip.file(WRITE_BG_FILENAME, WRITE_BG)
        }
        return {
            assetId: WRITE_BG_MD5,
            md5ext: WRITE_BG_FILENAME,
            dataFormat: 'svg',
            name,
            rotationCenterX: 240,
            rotationCenterY: 180
        }
    }
    function packTrans (name) {
        if (!zip.files[TRANS_BG_FILENAME]) {
            zip.file(TRANS_BG_FILENAME, TRANS_BG)
        }
        return {
            assetId: TRANS_BG_MD5,
            md5ext: TRANS_BG_FILENAME,
            dataFormat: 'svg',
            name,
            rotationCenterX: 240,
            rotationCenterY: 180
        }
    }
    function packEmptyAudio (name) {
        if (!zip.files[EMPTY_AUDIO.filename]) {
            zip.file(EMPTY_AUDIO.filename, EMPTY_AUDIO.data)
        }
        return {
            assetId: EMPTY_AUDIO.hash,
            md5ext: EMPTY_AUDIO.filename,
            dataFormat: 'wav',
            rate: 44100,
            sampleCount: 0,
            name
        }
    }

    // Collage resources
    let counter = 0
    if (stage.costumes) {
        if (stage.costumes.length === 0) {
            if (!zip.files[WRITE_BG_FILENAME]) {
                zip.file(WRITE_BG_FILENAME, WRITE_BG)
            }
            project.targets[0].costumes.push(packWrite('Background ' + (counter++)))
        } else {
            for (const costume of stage.costumes) {
                if (costume.file) {
                    const desc = await packFile(path.resolve(projectDir, costume.file))
                    project.targets[0].costumes.push(
                        createFileDescription({
                            hash: desc.hash,
                            filename: desc.filename,
                            name: costume.name
                        })
                    )
                } else {
                    if (!zip.files[TRANS_BG_FILENAME]) {
                        zip.file(TRANS_BG_FILENAME, TRANS_BG_MD5)
                    }
                    project.targets[0].costumes.push(packWrite('Background ' + (counter++)))
                }
            }
        }
    } else {
        if (!zip.files[WRITE_BG_FILENAME]) {
            zip.file(WRITE_BG_FILENAME, WRITE_BG)
        }
        project.targets[0].costumes.push(packWrite('Background ' + (counter++)))
    }
    // Sprites
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
            counter = 0
            if (sprite.costumes) {
                for (const costume of sprite.costumes) {
                    if (costume.file) {
                        const desc = await packFile(path.resolve(projectDir, costume.file))
                        target.costumes.push(
                            createFileDescription({
                                hash: desc.hash,
                                filename: desc.filename,
                                name: costume.name
                            })
                        )
                    } else {
                        project.targets[0].costumes.push(packTrans('Costume ' + (counter++)))
                    }
                }
            }
            counter = 0
            if (sprite.sounds) {
                for (const sound of sprite.sounds) {
                    if (sound.file) {
                        const desc = await packFile(path.resolve(projectDir, sound.file))
                        target.sounds.push(
                            createFileDescription({
                                hash: desc.hash,
                                filename: desc.filename,
                                name: sound.name
                            })
                        )
                    } else {
                        target.sounds.push(packEmptyAudio('Sound ' + (counter++)))
                    }
                }
            }
            project.targets.push(target)
        }
    }

    zip.file('project.json', JSON.stringify(project))

    console.log(
        util.formatWithOptions({ colors: true, depth: 10 },
            project
        )
    )
    return zip.generateAsync({ type: 'uint8array' })
}

async function complieInNodeJS ({
    projectDir
}) {
    const projectFile = path.join(projectDir, './project.yaml')
    console.log(projectDir, './project.yaml', projectFile)
    if ((await fs.stat(projectFile)).isFile()) {
        const projectInfo = projectParser(await fs.readFile(projectFile, { encoding: 'utf8' }))
        return parseProject({ projectInfo, projectDir })
    } else if ((await fs.stat(path.join(projectDir, './project.json'))).isFile()) {
        const projectInfo = projectParser(await fs.readFile(projectFile, { encoding: 'utf8' }), true)
        return parseProject({ projectInfo, projectDir })
    } else {
        throw new Error("Can't find project info file. (project.yaml or project.json)")
    }
}

module.exports = complieInNodeJS
