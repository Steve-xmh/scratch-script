
const CopyWebpackPlugin = require('copy-webpack-plugin')
const defaultsDeep = require('lodash.defaultsdeep')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const path = require('path')

console.log(process.env.NODE_ENV)

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'

const base = {
    mode,
    devServer: {
        contentBase: false,
        host: '0.0.0.0',
        port: process.env.PORT || 8040
    },
    devtool: 'cheap-module-source-map',
    output: {
        library: 'scratchscript',
        filename: '[name].js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            include: path.resolve(__dirname, 'src'),
            query: {
                plugins: [
                    '@babel/plugin-transform-runtime'
                ],
                presets: [[
                    '@babel/preset-env', {
                        targets: {
                            browsers: ['last 3 versions', 'Safari >= 8', 'iOS >= 8']
                        }
                    }
                ]]
            }
        }, {
            test: /\.ne$/,
            loader: 'nearley-loader'
        }, {
            test: /\.sb3$/,
            loader: 'arraybuffer-loader'
        }]
    },
    optimization: {
        minimizer: [
            new TerserWebpackPlugin({
                include: /\.min\.js$/
            })
        ]
    },
    plugins: []
}

const configs = [
    // Web-compatible
    defaultsDeep({}, base, {
        target: 'web',
        entry: {
            ssc: './src/index.js',
            'ssc.min': './src/index.js'
        },
        output: {
            libraryTarget: 'umd',
            path: path.resolve('dist', 'web')
        }
    }),
    // Node-compatible
    defaultsDeep({}, base, {
        target: 'node',
        entry: {
            ssc: './src/index.node.js'
        },
        output: {
            libraryTarget: 'commonjs2',
            path: path.resolve('dist', 'node')
        },
        externals: {
            ajv: true,
            commander: true,
            jszip: true,
            moo: true,
            nearley: true,
            yaml: true
        }
    })
]

if (base.mode === 'development') {
    configs.push(// Playground: only development
        defaultsDeep({}, base, {
            target: 'web',
            entry: {
                playground: './src/playground/playground'
            },
            output: {
                path: path.resolve(__dirname, 'playground'),
                filename: '[name].js'
            },
            performance: {
                hints: false
            },
            externals: {
                react: 'React',
                codemirror: 'CodeMirror',
                'react-dom': 'ReactDOM',
                'scratch-gui': 'GUI',
                jszip: 'JSZip'
            },
            plugins: base.plugins.concat([
                new CopyWebpackPlugin({
                    patterns: [
                        'src/playground',
                        { from: 'node_modules/scratch-gui/dist/static/blocks-media', to: 'static/blocks-media' },
                        { from: 'node_modules/scratch-gui/dist', to: '../' }
                    ]
                })
            ])
        })
    )
}

module.exports = configs
