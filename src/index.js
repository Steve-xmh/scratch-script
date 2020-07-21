import code from './code/index'
import projectParser from './project/parser'

const complieInNodeJS = () => { throw new Error('This is only nodejs use.') }

export {
    code as default,
    projectParser,
    complieInNodeJS
}
