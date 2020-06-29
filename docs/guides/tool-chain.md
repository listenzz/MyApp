前端工具链，对于初学者来说，稍微了解即可，不必过早深入。

前端工具链，不是寥寥千字能讲明白的，就当这里是学习提纲。

## Node

Node (Node.js) 是一个基于 Chrome V8 引擎的 JavaScript 运行时。

Node 可以开发服务端应用，也可以开发命令行应用，几乎所有的前端工具链都依赖 Node。

我们工程中的 CI / CD 也依赖了 Node。

为了能维护我们的 CI / CD 代码，你需要掌握使用 fs, path, process 等 Node 模块。

**学习参考资料：**

[Node.js 中文网](http://nodejs.cn/)

[Node.js 命令行程序开发教程](http://www.ruanyifeng.com/blog/2015/05/command-line-with-node.html)

[Node.js 子进程：你应该知道的一切](https://juejin.im/entry/595dc35b51882568d00a97ab)

[你可能想知道的 Node 子进程模块](https://segmentfault.com/a/1190000005004946)

## npm

[npm](https://docs.npmjs.com/) 是 Node Package Manager，是个命令行工具。

使用 `npm init` 命令来初始化一个简单的 package.json 文件，执行该命令后终端会依次询问 name, version, description 等字段。

package.json 文件中一些重要的字段，你需要理解

```js
{
  "name": "myapp",
  "version": "1.0.0",
  // 避免不小心通过 `npm publish` 把项目发布到 https://www.npmjs.com/
  "private": true,
  // 如果这是个命令行应用，需要指定 bin 字段
  // bin 字段指定了可执行文件的位置
  // 如果全局安装模块，npm 会使用符号链接把可执行文件链接到 /usr/local/bin
  // 如果项目中安装，会链接到 ./node_modules/.bin/
  "bin": "bin/cli.js",
  // main 属性指定程序的主入口文件，其他项目在引用这个 npm 包时，实际上引入的是 lib/index 中暴露出去的模块
  "main": "lib/index.js",
  // 如果我们开发的是一个 lib，通过 typings 指定 Typescript 类型文件入口
  "typings": "./lib/index.d.ts",
  // scripts 指定可运行脚本，
  // scripts 中的命令执行时，会将当前目录下 node_modules/.bin 的子目录临时加入到 PATH 变量中
  "scripts": {
    // start 命令实际上是 ./node_modules/.bin/react-native start --reset-cache
    "start": "react-native start --reset-cache",
    // 运行这个命令来检查项目的 Typescript 类型是否有问题
    "tsc": "tsc --noEmit",
    // 每次更新 eslint 规则后，运行这个命令来检查和修复项目，使之符合新的规则
    "lint": "eslint . --fix --ext .js,.jsx,.ts,.tsx",
  },
  // 主要依赖
  "dependencies": {},
  // 开发依赖
  "devDependencies": {}
}
```

运行 `npm start` 实际上是运行 `./node_modules/.bin/react-native start --reset-cache`

可以通过以下命令来全局设置 npm 镜像，解决 Great Wall 的问题。

```sh
npm config set registry https://registry.npm.taobao.org
```

不过我们推荐使用 .npmrc 文件来局部配置：

在和 package.json 同级的目录中创建 .npmrc 文件

```ruby
# .npmrc
registry=https://registry.npm.taobao.org/
```

我司部署了私有的 npm 服务器，那么 npm 包如何发布到私有服务器呢？

修改 package.json，配置 publishConfig 字段

```json
{
  "name": "@sdcx/track",
  "publishConfig": {
    "registry": "https://nexus.xxxxxx.com/repository/npm-packages/"
  }
}
```

然后使用 `npm publish` 发布

如何在项目中引用私有的 npm 包呢？

我司的 npm 包名，都使用 `@sdcx` 作为 scope，在需要引入私有 npm 包的项目的 .npmrc 文件中添加指定 scope 的 registry 即可

```ruby
# .npmrc
registry=https://registry.npm.taobao.org/
@sdcx:registry=https://nexus.xxxxxx.com/repository/npm-packages
```

有时，我们开发 npm 包，需要在本地调试，此时可以使用 `npm link`

`npm link` 主要做了两件事：

1. 为目标 npm 模块创建软链接，将其链接到全局 node 模块安装路径 /usr/local/lib/node_modules/
2. 为目标 npm 模块的可执行 bin 文件创建软链接，将其链接到全局 node 命令安装路径 /usr/local/bin/

譬如，我们开发了一个普通的 npm 包 `npm-lib-demo`，在 `npm-lib-demo` 根目录下运行 `npm link`， 然后在依赖该 lib 的项目根目录下运行 `npm link npm-lib-demo`，即可在该项目 node_module 中看到链接过来的模块包。

又譬如，我们开发了一个命令行工具 `npm-bin-demo`，在 `npm-bin-demo` 根目录下运行 `npm link`，即可愉快地使用 `npm-bin-demo` 中的命令，就像使用 `npm i -g npm-bin-demo` 命令全局安装了一样。

## Yarn

[Yarn](https://yarnpkg.com/) 也是 Node 的包管理器，在一定历史时期内，yarn 比 npm 更快更稳定，所以我们一般使用 npm 来运行 scripts, 使用 yarn 来管理依赖。

`.npmrc` 文件同样对 yarn 生效。

理解什么是语义化版本(semver)

使用 `yarn install` 来依照 yarn.lock 文件更新依赖

```sh
yarn install         # yarn 在本地 node_modules 目录安装 package.json 里列出的所有依赖
yarn install --force # 重新拉取所有包，即使之前已经安装的
```

使用 `yarn add` 来添加依赖

```sh
yarn add <package...>  # 安装包到dependencies中
yarn add <package...>  # [--dev/-D]  用 --dev 或 -D 安装包到 devDependencies
```

使用 `yarn remove` 来移除依赖

使用 `yarn list` 来查看依赖树

```sh
yarn list --depth 0
```

使用 `yarn outdated` 来查看可升级依赖

使用 `yarn upgrade` 来更新依赖

如果涉及主版本更新，需要使用 `yarn add` 来重新安装，以达到升级版本的目的。

无论何时，都可以使用 `--help` 参数来获得帮助

```sh
yarn --help
yarn list --help
```

## Babel

[Babel](https://babeljs.io/docs/en/) 就是**巴别塔**，是 Javascript 的编译器，通过 Babel 我们可以把最新标准编写的 JS 代码向下编译成兼容各种浏览器或 Node 的通用版本。

Babel 在转译的时候，会将源代码分成 syntax 和 api 两部分来处理：

1. syntax：类似于展开对象、optional chain、let、const 等语法
2. api：类似于 `[1,2,3].includes` 等函数、方法

一个 Babel 配置文件大概长这个样子：

```js
{
  // plugin 会运行在 preset 之前
  // plugin 会从前到后顺序执行
  // preset 的顺序则刚好相反(从后向前)
  "presets": [["@babel/preset-env"]],
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      {
        "corejs": false // 可选 false | 2 | 3
      }
    ]
  ]
}
```

Babel 在转译的过程中，对 syntax 的处理可能会使用到 helper 函数，对 api 的处理会引入 polyfill。

Babel 在每个需要使用 helper 的地方都会定义一个 helper，导致最终的产物里有大量重复的 helper；引入 polyfill 时会直接修改全局变量及其原型，造成原型污染。

`@babel/plugin-transform-runtime` 的作用是将 helper 和 polyfill 都改为从一个统一的地方引入，并且引入的对象和全局变量是完全隔离的，这样解决了上面的两个问题。

**学习参考资料：**

[@babel/plugin-transform-runtime 到底是什么？](https://zhuanlan.zhihu.com/p/147083132)

## ESLint

[ESLint](https://cn.eslint.org/) 是一个插件化的 javascript 代码检测工具，也可以检测 JSX 和 Typescript。

一个 ESLint 配置文件大概长下面这个样子：

```js
module.exports = {
  root: true,
  env: {
    es6: true,
  },

  parserOptions: {
    sourceType: 'module',
  },

  extends: ['plugin:prettier/recommended', 'prettier/react'],

  plugins: ['eslint-comments', 'react', 'react-hooks', 'react-native', 'jest'],

  overrides: [
    {
      files: ['*.js'],
      parser: 'babel-eslint',
      plugins: ['flowtype'],
      rules: {},
    },
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint/eslint-plugin'],
      rules: {},
    },
    {
      files: ['jest/*'],
      env: {
        jest: true,
      },
    },
  ],

  globals: {
    __DEV__: true,
    window: false,
  },

  rules: {
    'react-native/no-inline-styles': 0,
  },
}
```

`extends` 就是直接使用别人已经配置好的 lint 规则

`globals` 声明了有哪些全局变量可用

`env` 是一组全局变量的预设

`overrides` 可以针对不同类型的文件设置不同的 parser, plugins, env, rules

懂得 `eslint-config-` 和 `eslint-plugin-` 表示什么

如果希望某些文件免除检查，可以将该文件添加到 .eslintignore 中，如：

```py
ios/
android/
builds/
*/build/
```

**学习参考资料：**

[深入理解 ESlint](https://juejin.im/post/5d3d3a685188257206519148)

## Prettier

[Prettier](https://prettier.io/) 是个代码格式化工具，我们用它来保证代码风格一致性。

## Webpack

[Webpack](https://webpack.js.org/) 是个打包工具，不过它可以做的事情非常多。React Native 并没有使用 Webpack 来打包，而是开发了专门的打包工具 [Metro](https://facebook.github.io/metro/)。

之所以在这里提及 Webpack，是因为我们 app 团队还负责微信小程序开发，我们使用 Webpack 来作为[小程序工程实践](https://github.com/listenzz/MyMina)的重要工具。
