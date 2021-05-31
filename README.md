# ScratchScriptKit

A toolchain to make scratch project without drag any thing. Rewriten in Rust with better perfomance.

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

Currently we are still in heavy development

## Development



## Usage

```shell
> ssc --help
Usage: ssc [options] <dir>

Options:
  -v, --version              output the version number
  -o, --output <outputpath>  specify an output project file path
  -h, --help                 display help for command
```
