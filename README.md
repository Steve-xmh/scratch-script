# ScratchScriptKit

A toolchain to make scratch project without drag any thing.

ScratchScript Example:
```lua
when events.flagClicked()
    looks.sayFor('Hello ScratchScript!', 3)
    while
        direction = 1
        repeat(10)
            motion.changeY(5 * direction)
        end
        if (direction == 1)
            direction = -1
        else
            direction = 1
        end
    end
end
```

[Chinese 中文](./README-CN.md)

English document is in progress (:P)
