const fileItemSchema = {
    type: 'object',
    required: ['name', 'file'],
    properties: {
        name: { type: 'string' },
        file: { type: 'string' }
    }
}

const fileArraySchema = {
    type: 'array',
    items: fileItemSchema
}

const codeSchema = {
    type: 'object',
    required: ['file'],
    properties: {
        file: { type: 'string' }
    }
}

const spriteSchema = {
    type: 'object',
    properties: {
        code: codeSchema,
        position: {
            type: 'object',
            required: ['x', 'y'],
            properties: {
                x: { type: 'number', minimum: -240, maximum: 240 },
                y: { type: 'number', minimum: -180, maximum: 180 }
            }
        },
        rotation: { type: 'number', minimum: -180, maximum: 180 },
        rotationstyle: {
            type: 'string',
            enum: ['all around', 'left-right', "don't rotate"]
        },
        size: { type: 'number', minimum: 0 },
        visible: { type: 'boolean' },
        draggable: { type: 'boolean' },
        costume: { type: 'integer', minimum: 0 },
        costumes: fileArraySchema,
        sounds: fileArraySchema
    }
}

const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['info'],
    properties: {
        info: {
            type: 'object',
            properties: {
                stage: {
                    type: 'object',
                    properties: {
                        code: codeSchema,
                        costume: {
                            type: 'integer',
                            minimum: 0
                        },
                        costumes: fileArraySchema,
                        sounds: fileArraySchema
                    }
                },
                sprites: {
                    type: 'array',
                    items: spriteSchema
                }
            }
        }
    }
}

module.exports = schema
