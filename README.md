# ScratchScriptKit

[![](https://img.shields.io/github/license/Steve-xmh/scratch-script?style=flat-square)](https://github.com/Steve-xmh/scratch-script)
[![](https://img.shields.io/github/repo-size/Steve-xmh/scratch-script?style=flat-square)](https://github.com/Steve-xmh/scratch-script)
[![](https://img.shields.io/bundlephobia/min/scratch-script?style=flat-square)](https://www.npmjs.com/package/scratch-script)

Code feature is STILL work in progress. But others (sprites or stage definition) are finished.

A toolchain to make scratch project without drag any thing.

ScratchScript Example:
```lua
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

[Chinese 中文](./README-CN.md)

English document is in progress (:P)
