# ScratchScriptKit

一个简约的玩具脚本语言工具包，用于将 Scratch 工程规模化和代码化。使用 Rust 重写以获得更高的编译性能。

Chinese 中文  
[English](./README.md)

ScratchScript 示例：
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

## 项目描述文件

项目描述文件用于定义各个角色和舞台的初始属性，统一命名 `project.yaml` 或者 `project.json` ，支持 YAML 和 JSON 语法进行描述。
基本格式如下，JSON 则大同小异：

```yaml
# 井号开头为注释
# YAML 使用缩进表达层级关系，详情请搜索 YAML 查询文档

# 作品描述对象，如无提供则会生成一个干净的空作品文件（只有纯白色无代码舞台）
info:
    # 舞台对象，如无提供则会默认添加纯白色无代码舞台
    stage:
        # 代码属性
        code:
            # 相对于项目描述文件所在文件夹的代码文件位置，如无提供则无代码
            file: ./src/stage.ss
        # 当前舞台背景编号，如无提供则默认为 0
        costume: 0
        # 舞台播放声音的大小
        volume: 100
        # 舞台背景清单，如无提供则默认添加纯白色背景
        costumes:
            # 一个减号代表一个背景，按顺序依次编号，从 0 开始。
            -
                # 背景名称
                name: Stage
                # 相对于项目描述文件所在文件夹的图像文件位置，允许使用 PNG 图像或 SVG 图像
                file: ./asset/stage.png
        # 舞台音效清单，如无提供则不添加任何音效
        sounds:
            # 一个减号代表一个音效，按顺序依次编号，从 0 开始。
            -
                # 音效名称
                name: 流行音乐
                # 相对于项目描述文件所在文件夹的音效文件位置，允许使用 WAV 音频和 MP3 音频
                file: ./asset/pop.mp3
    # 角色清单，如无提供则没有任何角色
    sprites:
        -
            # 角色名称，不允许重复，如不提供或出现冲突则会自动生成一个新名称
            name: Cat
            # 代码属性
            code:
                # 相对于项目描述文件所在文件夹的代码文件位置，如无提供则无代码
                file: ./src/stage.ss
            # 角色播放声音的大小，100 为最大， 0 为无声
            volume: 100
            # 是否显示角色
            visible: true
            # 角色的横纵坐标，按照角色中心和舞台坐标系计算
            pos:
                x: 0
                y: 0
            # 角色当前的大小，100 为正常大小
            size: 100
            # 角色当前的旋转角度，90 为向右
            direction: 90
            # 旋转模式，可选值为 all around, don't rotate, left-right
            rotationstyle: all around
            # 当前角色造型编号，如无提供则默认为 0
            costume: 0
            # 角色造型清单，如无提供则默认添加透明造型
            costumes:
                # 一个减号代表一个造型，按顺序依次编号，从 0 开始。
                -
                    # 造型名称
                    name: Cat0
                    # 相对于项目描述文件所在文件夹的图像文件位置，允许使用 PNG 图像或 SVG 图像
                    file: ./asset/cat.png
                    # 相对于图像左上角的图像旋转中心点位置，如不提供则默认为图像中心
                    center:
                        x: 0
                        y: 0
            # 角色音效清单，如无提供则不添加任何音效
            sounds:
                # 一个减号代表一个音效，按顺序依次编号，从 0 开始。
                -
                    # 音效名称
                    name: Meow
                    # 相对于项目描述文件所在文件夹的音效文件位置，允许使用 WAV 音频和 MP3 音频
                    file: ./asset/meow.mp3

```

## ScratchScript

ScratchScriptKit 的重要组成部分，使用简单的语法对角色和舞台进行编程的脚本语言。  
（有人吐槽这是 Lua，其实的确参考了很多，不过还是和 Lua 有所不同的）

### 语法

#### 数字
允许正常的正负整数或小数：

```javascript
0 1 20 -1 1.05 -3.14
```

当然十六进制，二进制，八进制，也是完全可以的，在编译时将会转换成十进制数字：

```javascript
0xAAFFEE // Hex
07654321 // Oct
0b100101 // Bin
```

#### 字符串
使用单引号或双引号开头和结尾：
```javascript
'Single' "Double"
```
你可以使用反斜杠（\）进行转义：

|格式|转义为|
|---|---|
|`\n`|换行符|
|`\\`|反斜杠|
|`\'`|单引号|
|`\"`|双引号|
|`\uxxxx`|（x 为十六进制符号（`[0-9a-fA-f]`））十六进制的 Unicode 编码所对应的任意的 Unicode 字符|

注：其实反斜杠后面只要不是 u 都会转译成那个字符（雾）

#### HEX 颜色值

使用井号开头 `#`，后跟 3, 4, 6, 8 个十六进制字符，颜色顺序如下：  
（注：R 代表红色，G 代表绿色，B 代表蓝色，A 代表不透明度）

|格式|颜色顺序|
|---|--------|
|`#XXX`|`#RGB`|
|`#XXXX`|`#RGBA`|
|`#XXXXXX`|`#RRGGBB`|
|`#XXXXXXXX`|`#RRGGBBAA`|

```css
#F00 /* Black */
#F007 /* Half transparent red */
#FFFFFFFF /* White */
```

#### 标识符

资深用户一条式：`[A-Za-z_][A-Za-z_0-9]*`

第一个字符必须为任意大小写字母（A-Z,a-z）或下划线（_），
之后可跟任意大小写字母，下划线和数字（0-9）进行组合：
```
identifier
thisIsAnIdentifier666
IDENTIFIER0
nameWhateverUWant
```
注：不得使用专用关键字作为标识符，下文有列出

#### 关键字清单

请勿将下列关键字用于变量或函数定义。

```
atonce bool define false
for forever if in let
number null register
repeat string true using
var when while
```

#### 注释

在两个连续的斜杠后跟的当前行的所有内容都将被编译器忽略，：

```c
// Line comment
/*
  Block comment
*/
```

#### 分隔符？

从例子里你可以看到每个函数执行的后面都加入了分号作为分割符，其实这并非必要，设定这个语法只是为了顺应其他程序员的习惯。

```js
// This is okay!
looks.sayFor('Hello ScratchScript!', 3)
// Add semicolon if you want:
looks.sayFor('Hello ScratchScript!', 3);
```

#### 空白

ScratchScript 不像 Python 使用缩进表达层级关系，所以你大可放心在不造成歧义的情况下写成一行，但是为了可读性还是推荐多用换行和缩进来表达程序结构。

```lua
// This still can be compiled!
when events.flagClicked() { looks.sayFor('Hello ScratchScript!', 3); forever { direction = 1; repeat (10) { motion.changeY(5 * direction); } if (direction == 1) { direction = -1; } else { direction = 1; }}}
```

#### 运算符

虽然你可以直接通过执行模块的语法来进行运算，但是为了简单，ScratchScript
基本支持以下简化的算式：

- 算术运算符
  - 加法 `+`
  - 减法 `-`
  - 乘法 `*`
  - 除法 `/`
  - 求余 `%`
- 逻辑运算符
  - 等于 `==`
  - 大于 `>`
  - 小于 `<`
  - 不成立 `!`
  - 逻辑与 `&&`
  - 逻辑或 `||`
- 字符串操作
  - 连接字符串 `..`

如果算式两侧均为常数，则编译器会进行预计算优化，部分数学函数模块也支持预计算优化。

运算优先级如下表（数字越高优先级越大）：

1. 逻辑或 `||`
2. 逻辑与 `&&`
2. 大于 `>`, 小于 `<`
3. 等于 `==`
3. 连接字符串 `..`
5. 加减 `+`, `-`
6. 乘除，求余 `*`, `/`, `%`
7. 不成立 `!`

后续会尝试添加语法糖（自增，大于等于，不等于等）（懒）

#### 定义变量/列表

类似 JavaScript，使用 `var` 开头将创建一个全局（舞台）变量，使用 `let` 开头将创建一个局部（仅角色）变量。
如果在舞台里使用 `let` 定义变量，则效果和 `var` 一样。后跟一个标识符作为名称，默认该变量为一个普通变量，初始值将决定该变量是普通变量还是列表。如果使用常量字面量或不提供初始值，则默认为普通变量，如果提供以 `[` 和 `]` 包裹的列表，则使用列表类型。

列表使用 `[` 和 `]` 包裹，使用逗号 `,` 区分每个项目，每个项目可以使用任意的字面量来表示。

```js
var answer = "C"
var answers = [
    "Any type!",
    123
]
```


#### 执行模块（函数）：

执行一个函数的格式为 *类型*.*模块名称*(*参数*)  
如果有多个参数，则使用英文逗号分隔开。  
如果执行的模块是自定义模块，则不需要输入模块类型。
```
*Cateory*.*Identifier*(*arguments*);
motion.moveSteps(5);
customBlock('I\'m a custom block!');
```

#### 触发事件
```
when *Cateory*.*Identifier*(*arguments*) {
    *Codes*
}
```

#### 条件判断
对应 Scratch 的 `如果 < > 那么 { }` 模块，当判断参数为 `true` 时则执行内部代码。  
如果在 `if` 和 `}` 之间添加了 `else`，则对应 Scratch 的 `如果 < > 那么 { } 否则 { }`。  
当判断参数为 `true` 时则执行 `if` 和 `else` 之间的代码，否则则执行 `else` 和 `}` 之间的代码。  
虽然 ScratchScript 不限制你使用非布尔值模块，但是为了确保稳健性，建议统一使用布尔值模块。
```lua
if(*Condition*) {
    *Codes*
}

if(*Condition*) {
    *Codes*
} else {
    *Codes*
}
```

#### 多分支模块

虽然应该没有什么模块会用到多分支，但是因为 Scratch 原代码里有提到，为了兼容性则设计了这个语法。  
在执行函数的下方使用多个 `in` 加一个常量值（通常为数字，代表分支的编号）用于分辨分支类型，如果达成模块要求则会进入该分支，之后将按模块的执行方式继续执行，直到到达结尾的 `}` 结束执行。

```lua
*Cateory*.*Identifier*(*arguments*)
in *String or Number* {
    *Code*
} in *String or Number* {
    *Code*
}
...

// Example
ext.switch(value)
in 1 {
    looks.say("Hello!");
} in 2 {
    looks.say("Bye!");
}
```

#### 无限循环
对应 Scratch 的 `重复执行 { }` 模块，永久重复执行：
```lua
forever {
    *Codes*
}
```

#### 重复执行
对应 Scratch 的 `重复执行 ( ) 次 { }` 模块，参数为一个正整数，指定循环的次数：
```lua
repeat (*Times*) {
    *Codes*
}
```

#### 条件循环

对应 Scratch 的 `重复执行直到 < < > 不成立 > { }` 模块，参数为一个布尔值，当为 `true` 时进行循环。  
目前暂时不限模块类型（懒），但是建议判断时使用布尔值类型的模块，保证生成的代码足够稳定。

```lua
while (*Conditions*) {
    *Codes*
}
```

#### 计次循环

对应 Scratch 的 `对于 [ ] 中的每个 [ ] { }` 模块，将左侧的变量中的值依次设置成 `1` 到右侧的计次数并在改变值后执行循环体。  
虽然 ScratchScript 不限制你使用非数值模块，但是为了确保稳健性，建议统一使用数值模块或数字常量。
```lua
for (*variable* in *times*) {
    *Codes*
}
// Will count from 1 to 10
for (counter in 10) {
   looks.sayFor(counter, 1);
}
```

#### 自定义模块（WIP）

使用 `define` 关键字作为开头，后跟一个普通的标识符并提供名称，如果需要不刷新舞台，则在 `define` 关键字前添加 `atonce` 关键字。

```
define *Identifier*(*arguments*) {
    *Codes*
}
// Will not update the stage!
atonce define *Identifier*(*arguments*) {
    *Codes*
}
```

因为自定义模块存在类型（字符串/数字类型，布尔类型），如果仅声明了参数名称则使用字符串/数字类型作为参数类型。如果参数名后加冒号，再加入以下关键字即可指定参数类型：
- `string` 字符串类型
- `number` 数字类型
- `bool` 布尔值类型

```
// This argument will become a string/number type input.
define stringAndNumberArg1(str) {
    // ...
}

// This argument will become a string type input.
define stringArg(str: string) {
    // ...
}

// This argument will become a number type input.
define numberArg(str: number) {
    // ...
}

// This argument will become a boolean type input.
define boolArg(arg: bool) {
    // ...
}

```

#### 模块引用

使用 `using` 关键字后跟一个**静态**字符串，通过相对路径的方式指定模块的位置，其内的模块会被添加到现有代码内，嵌套引用的话只会引用同一个。

```C#
using *FilePath*
using './path/to/module.ss'
```

#### 注册扩展

使用 `register` 关键字后跟一个**静态**字符串指定拓展模块的文件位置，其内定义的扩展模块将可以在代码内使用，嵌套引用的话会报告编译错误。如果需要引用同名不同功能的模块，则在字符串后面再跟一个 `as` 和一个标识符代表这个模块的新 ID。同种模块的多次不同 ID 引用不会触发编译错误。

扩展文件的搜索方式不光有相对目录方式，如果相对目录无法找到模块，编译器还会根据环境变量 `SCRATCHSCRIPT_INCLUDE_DIR` 的相对目录里查询，如果仍然不存在则会报告编译错误。如果你的扩展定义文件格式为 `.js`，你可以选择不写文件后缀名。

```js
register *FilePath*
register './path/to/extension.js'
// You can rename extension
register './path/to/extension.js' as new_id
// You can also register it with file path without .js extension name.
// If your extension definition file's extention name is .js .
register './path/to/extension'
```

## ScratchScript 模块定义文件结构

为了能有一定的拓展性，支持外部扩展的非核心模块，这里提供了一个模块定义文件的结构说明文件格式，开发者可使用 `register` 语句进行引用。

目前仍在讨论模块定义文件的文件结构方式，敬请期待

## 编译器开发

一般情况下，你只需要准备好基本的 Rust 工具链即可开始编译。

```bash
cargo build
```

而后将会生成出编译器库及编译器本体，可以用于
