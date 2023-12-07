# ScratchScriptKit

[![Licence](https://img.shields.io/github/license/Steve-xmh/scratch-script?style=flat-square)](https://github.com/Steve-xmh/scratch-script/blob/master/LICENCE)
[![Github](https://img.shields.io/github/repo-size/Steve-xmh/scratch-script?style=flat-square)](https://github.com/Steve-xmh/scratch-script)
[![Github Package Version](https://img.shields.io/github/package-json/v/Steve-xmh/scratch-script?label=dev&style=flat-square)](https://github.com/Steve-xmh/scratch-script)
[![Package Version](https://img.shields.io/npm/v/scratch-script?style=flat-square)](https://www.npmjs.com/package/scratch-script)
[![NPM](https://img.shields.io/bundlephobia/min/scratch-script?style=flat-square)](https://www.npmjs.com/package/scratch-script)

Code feature is in alpha statement, . But others (sprites or stage definition) are finished.

A toolchain to make scratch projects without dragging anything.

ScratchScript Example:
```lua
var direction = 0;
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
}
```

[Chinese 中文](./README-CN.md) English  
[API Refenerce](./API.md)  

English document is in progress (:P)

## Installation

```shell
> npm i scratch-script -g
```

## Development

We recommend you to use Yarn to setup the environment, npm also works.

```bash
> yarn
> yarn start
```

This will start webpack dev server, then you can access [http://localhost:8040/playground/](http://localhost:8040/playground/) to the playground (only for debug).

## Usage

```shell
> ssc --help
Usage: ssc [options] <dir>

Options:
  -v, --version              output the version number
  -o, --output <outputpath>  specify an output project file path
  -h, --help                 display help for command
```
