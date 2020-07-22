import GUI, { AppStateHOC } from 'scratch-gui'
import ScratchScript from '../index'
import React from 'react'
import ReactDOM from 'react-dom'
import CodeMirror from 'codemirror'
import DefaultProject from './default.sb3'
import Package from '../../package.json'
import JSZip from 'jszip'
import defaultsDeep from 'lodash.defaultsdeep'
const appTarget = document.querySelector('#scratchgui')
const textArea = document.querySelector('textarea')
GUI.setAppElement(appTarget)
const WrappedGui = AppStateHOC(GUI)
const defaultCode = `var direction = 0;
when events.flagClicked() {
    looks.sayFor('Hello ScratchScript!', 3);
    forever {
        direction = 1;
        repeat (10) {
            motion.changeY(5 * direction);
        }
        if (direction == 1) {
            direction = -1;
        } else {
            direction = 1;
        }
    }
}`

window.CodeArea = CodeMirror.fromTextArea(textArea, {
    lineNumbers: true
})
window.CodeArea.setValue(defaultCode)
window.CodeArea.getWrapperElement().style = 'height: calc(100% - 2rem); margin: 1rem; flex: 0.35; border-style: solid; border-width: 1px; border-color: black'

const compiledTemplate = {
    targets: [{
        isStage: true,
        name: 'Stage',
        variables: {},
        lists: {},
        broadcasts: {},
        blocks: {},
        comments: {},
        currentCostume: 0,
        costumes: [],
        sounds: [],
        volume: 100,
        layerOrder: 0,
        tempo: 60,
        videoTransparency: 50,
        videoState: 'off',
        textToSpeechLanguage: null
    }],
    monitors: [],
    extensions: [],
    meta: {
        semver: '3.0.0',
        agent: 'ScratchScriptKit/' + Package.version
    }
}

// Register change and send to vm
function onVmInit (vm) {
    let loadingProject = false
    let delayHandle = null
    let requiredUpdate = false
    async function compile (code) {
        if (loadingProject) return
        loadingProject = true
        try {
            const t = Date.now()
            const rawCode = code.getValue()
            console.log(rawCode)
            const ast = ScratchScript.parser(rawCode)
            console.log(Date.now() - t, ast)
            const result = await ScratchScript.generator({ ast })
            console.log(Date.now() - t, result)
            const newProj = defaultsDeep({}, compiledTemplate)
            const stage = newProj.targets[0]
            stage.blocks = result.blocks
            for (const variable of result.ast.variables) {
                if (!variable.value) {
                    stage.variables[variable.id] = [variable.name, '']
                } else if (variable.value.value instanceof Array) {
                    stage.lists[variable.id] = [variable.name, variable.value ? variable.value.value.map(v => v.value) : []]
                } else {
                    stage.variables[variable.id] = [variable.name, variable.value ? variable.value.value : '']
                }
            }
            console.log(newProj)
            const zip = await JSZip.loadAsync(DefaultProject)
            zip.file('project.json',
                JSON.stringify(
                    defaultsDeep(
                        {},
                        JSON.parse(
                            await zip.file('project.json')
                                .async('text')
                        ), newProj
                    )
                )
            )
            await vm.loadProject(await zip.generateAsync({ type: 'uint8array' }))
            loadingProject = false
        } catch (err) {
            console.warn(err)
        }
        if (requiredUpdate) {
            requiredUpdate = false
            compile(code)
            return
        }
        loadingProject = false
    }
    window.CodeArea.on('change', code => {
        requiredUpdate = true
        if (delayHandle) clearTimeout(delayHandle)
        delayHandle = setTimeout(() => {
            requiredUpdate = false
            compile(code)
        }, 1000)
    })
    loadingProject = true
    vm.loadProject(DefaultProject).then(() => { loadingProject = false })
    console.log('Registered VM!', vm)
}

window.GUI = ReactDOM.render(React.createElement(WrappedGui, {
    canSave: false,
    isStandalone: true,
    backpackVisible: false,
    onVmInit
}), appTarget)
