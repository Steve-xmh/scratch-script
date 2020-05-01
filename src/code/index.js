const parser = require('./parser')
const visitor = require('./visitor')
const generator = require('./generator')

module.exports = {
    parser,
    visitor,
    generator
}

global.ss = module.exports
