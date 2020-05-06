
const { promises: fs } = require('fs')
const path = require('path')
const JSZip = require('jszip')
const projectParser = require('./project/parser')
const code = require('./code/index')

const EMPTY_AUDIO = require('./project/emptyAudio')
const EMPTY_SVG = require('./project/emptySvg')

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

const setPath = (obj, path = [''], value = undefined) => {
    let temp = obj
    console.log(path.slice(0, -2))
    for (const key of path.slice(0, -2)) {
        temp = temp[key]
    }
    temp[path[path.length - 1]] = value
}

async function complieCode (start, target, stage = null) {
    try {
        const startTime = Date.now()
        const codeResults = code.generator(code.parser(await fs.readFile(start, { encoding: 'utf8' })))
        for (const variable of codeResults.ast.variables) {
            console.log(variable)
            if (!variable.islocal && stage) {
                if (variable.value instanceof Array) {
                    const stageVar = Object.entries(stage.variables).find(v => v[1][0] === variable.name)
                    if (stageVar) {
                        for (const usedPath of variable.used) {
                            setPath(codeResults.blocks, usedPath, stageVar[1])
                        }
                    }
                } else {
                    const stageList = Object.entries(stage.lists).find(v => v[1][0] === variable.name)
                    if (stageList) {
                        for (const usedPath of variable.used) {
                            setPath(codeResults.blocks, usedPath, stageList[1])
                        }
                    }
                }
            } else {
                if (variable.value instanceof Array) {
                    target.lists[variable.id] = [variable.name, variable.value ? variable.value.value : '']
                } else {
                    target.variables[variable.id] = [variable.name, variable.value ? variable.value.value : '']
                }
            }
        }
        target.blocks = codeResults.blocks
        const usedTime = Date.now() - startTime
        console.log(target.name, 'compile time:', usedTime)
    } catch (err) {
        if (err.type === 'CompileError') {
            if (err.node) {
                console.log('CompileError: ', err.message + '\n  On compiling code: ' + start + ':' + err.node.line + ':' + err.node.col)
            }
            return null
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

    function packSvg (name) {
        if (!zip.files[EMPTY_SVG.filename]) {
            zip.file(EMPTY_SVG.filename, EMPTY_SVG.data)
        }
        return {
            assetId: EMPTY_SVG.hash,
            md5ext: EMPTY_SVG.filename,
            dataFormat: EMPTY_SVG.type,
            name,
            rotationCenterX: 0,
            rotationCenterY: 0
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
            project.targets[0].costumes.push(packSvg('Background ' + (counter++)))
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
                    project.targets[0].costumes.push(packSvg('Background ' + (counter++)))
                }
            }
        }
    } else {
        project.targets[0].costumes.push(packSvg('Background ' + (counter++)))
    }

    if (stage.code && stage.code.file) {
        console.log('WARN: Code feature are work in progress, your code will not be compiled.')
        await complieCode(path.resolve(projectDir, stage.code.file), project.targets[0])
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
                console.log('WARN: Code feature are work in progress, your code will not be compiled.')
                await complieCode(path.resolve(projectDir, sprite.code.file), target, project.targets[0])
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
                        target.costumes.push(packSvg('Costume ' + (counter++)))
                    }
                }
            } else {
                target.costumes.push(packSvg('Costume ' + (counter++)))
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
