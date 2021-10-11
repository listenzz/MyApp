# 集成 Typescript, ESLint, Prettier

本文介绍：

- 在 React Native 中如何配置使用 Typescript

- 如何使用 ESLint 和 Prettier 来检查 ts 代码

- ESLint 和 Prettier 如何与 Visual Studio Code 集成

> 2019 年 11 月 6 日更新： 使用社区提供的 eslint 配置

## Typescript

类型系统对于需要长期维护的项目来说，是非常重要的。

我们可以使用 [react-native-template-typescript](https://github.com/react-native-community/react-native-template-typescript) 模版来创建 typescript 化的项目，也可以手动配置。

确保所使用的 react-native-cli 为社区版的 cli

```
npm uninstall -g react-native-cli
```

```
npm i -g @react-native-community/cli
```

运行以下命令，即可创建带 typescript 配置的 React Native 项目

```
npx react-native init MyApp --template react-native-template-typescript
```

> 使用 --version 参数可以指定 RN 版本，如 `npx react-native init MyApp --version 0.60.0`

> 小知识：react-native-template-typescript 既是个模版项目，也是个 npm 包，可以在 https://www.npmjs.com/ 上搜索到它。我们可以创建自己的模版，然后发布到 npm。

调整 tsconfig.json 文件，在 compilerOptions 中添加如下两个配置

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "skipLibCheck": true
  }
}
```

Typescript 的配置项比较多，我们至少需要弄明白那些开启的选项代表什么，不过这是另外一个话题了。

### 手动配置 Typescript

添加依赖

```
yarn add -D typescript @types/jest @types/react @types/react-native @types/react-test-renderer
```

在项目根目录中创建名为 tsconfig.json 的文件，复制以下内容到文件中。

```js
{
  "compilerOptions": {
    /* Basic Options */
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "target": "esnext" /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017','ES2018' or 'ESNEXT'. */,
    "module": "commonjs" /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', or 'ESNext'. */,
    "lib": ["es6"] /* Specify library files to be included in the compilation. */,
    "allowJs": true /* Allow javascript files to be compiled. */,
    // "checkJs": true,                       /* Report errors in .js files. */
    "jsx": "react-native" /* Specify JSX code generation: 'preserve', 'react-native', or 'react'. */,
    // "declaration": true,                   /* Generates corresponding '.d.ts' file. */
    // "sourceMap": true,                     /* Generates corresponding '.map' file. */
    // "outFile": "./",                       /* Concatenate and emit output to single file. */
    // "outDir": "./",                        /* Redirect output structure to the directory. */
    // "rootDir": "./",                       /* Specify the root directory of input files. Use to control the output directory structure with --outDir. */
    // "removeComments": true,                /* Do not emit comments to output. */
    "noEmit": true /* Do not emit outputs. */,
    // "importHelpers": true,                 /* Import emit helpers from 'tslib'. */
    // "downlevelIteration": true,            /* Provide full support for iterables in 'for-of', spread, and destructuring when targeting 'ES5' or 'ES3'. */
    "isolatedModules": true /* Transpile each file as a separate module (similar to 'ts.transpileModule'). */,

    /* Strict Type-Checking Options */
    "strict": true /* Enable all strict type-checking options. */,
    // "noImplicitAny": true,                 /* Raise error on expressions and declarations with an implied 'any' type. */
    // "strictNullChecks": true,              /* Enable strict null checks. */
    // "strictFunctionTypes": true,           /* Enable strict checking of function types. */
    // "strictPropertyInitialization": true,  /* Enable strict checking of property initialization in classes. */
    // "noImplicitThis": true,                /* Raise error on 'this' expressions with an implied 'any' type. */
    // "alwaysStrict": true,                  /* Parse in strict mode and emit "use strict" for each source file. */

    /* Additional Checks */
    // "noUnusedLocals": true,                /* Report errors on unused locals. */
    // "noUnusedParameters": true,            /* Report errors on unused parameters. */
    // "noImplicitReturns": true,             /* Report error when not all code paths in function return a value. */
    // "noFallthroughCasesInSwitch": true,    /* Report errors for fallthrough cases in switch statement. */

    /* Module Resolution Options */
    "moduleResolution": "node" /* Specify module resolution strategy: 'node' (Node.js) or 'classic' (TypeScript pre-1.6). */,
    "baseUrl": "./" /* Base directory to resolve non-absolute module names. */,
    // "paths": {},                           /* A series of entries which re-map imports to lookup locations relative to the 'baseUrl'. */
    // "rootDirs": [],                        /* List of root folders whose combined content represents the structure of the project at runtime. */
    // "typeRoots": [],                       /* List of folders to include type definitions from. */
    // "types": [],                           /* Type declaration files to be included in compilation. */
    "allowSyntheticDefaultImports": true /* Allow default imports from modules with no default export. This does not affect code emit, just typechecking. */,
    "esModuleInterop": true /* Enables emit interoperability between CommonJS and ES Modules via creation of namespace objects for all imports. Implies 'allowSyntheticDefaultImports'. */
    // "preserveSymlinks": true,              /* Do not resolve the real path of symlinks. */

    /* Source Map Options */
    // "sourceRoot": "./",                    /* Specify the location where debugger should locate TypeScript files instead of source locations. */
    // "mapRoot": "./",                       /* Specify the location where debugger should locate map files instead of generated locations. */
    // "inlineSourceMap": true,               /* Emit a single file with source maps instead of having a separate file. */
    // "inlineSources": true,                 /* Emit the source alongside the sourcemaps within a single file; requires '--inlineSourceMap' or '--sourceMap' to be set. */

    /* Experimental Options */
    // "experimentalDecorators": true,        /* Enables experimental support for ES7 decorators. */
    // "emitDecoratorMetadata": true,         /* Enables experimental support for emitting type metadata for decorators. */
  },
  "exclude": ["node_modules", "babel.config.js", "metro.config.js", "jest.config.js"]
}
```

## ESLint & Prettier

在 [TypeScript 2019 路线图](https://github.com/Microsoft/TypeScript/issues/29288#developer-productivity-tools-and-integration) 中，TypeScript 核心团队推荐使用 ESLint 来检测代码。

安装 React Native 团队为我们提供的 [eslint config](https://github.com/facebook/react-native/blob/master/packages/eslint-config-react-native-community/index.js)

```
yarn add -D eslint@^7.32.0  @react-native-community/eslint-config
```

创建或编辑 .eslintrc.js 文件

```js
module.exports = {
  root: true,
  extends: ['@react-native-community', 'plugin:prettier/recommended', 'prettier/react'],
}
```

创建或编辑 .prettierrc.js 文件

```js
module.exports = {
  semi: false,
  trailingComma: 'all',
  jsxBracketSameLine: true,
  singleQuote: true,
  printWidth: 100,
}
```

修改 package.json 文件，添加 tsc 和 lint 脚本

```js
  "scripts": {
    "tsc": "tsc --noEmit",
    "lint": "eslint . --fix --ext .js,.jsx,.ts,.tsx"
  },
```

ESLint 相关知识，请[深入理解 ESlint](https://juejin.im/post/5d3d3a685188257206519148)

## Git Hook

为了不妨碍 commit 效率，我们不使用 Git Hook 来自动触发 tsc 和 lint，而是将这些过程延迟到 CI 阶段。

## 与 Visual Studio Code 集成

为了获得良好的开发体验，设置编辑器以便在保存文件时自动运行 ESLint 的自动修复命令（即 eslint --fix）是非常有用的。

确保安装了以下 VS Code 插件

```
dbaeumer.vscode-eslint
esbenp.prettier-vscode
```

添加如下配置到 VS Code 中的 settings.json 文件中，以便在保存文件时自动格式化：

> 按下 `Command + ,` 然后点击右上角的 **{ }** 按钮，可以打开 settings.json 文件

```js
{
  "javascript.updateImportsOnFileMove.enabled": "always",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "[typescript]": {
    "editor.tabSize": 2
  },
  "[typescriptreact]": {
    "editor.tabSize": 2
  },
  "[javascript]": {
    "editor.tabSize": 2
  },
  "[html]": {
    "editor.tabSize": 2
  },
  "[json]": {
    "editor.tabSize": 2
  },
  "[css]": {
    "editor.tabSize": 2
  },
  "[yaml]": {
    "editor.tabSize": 2
  },
  "[toml]": {
    "editor.tabSize": 2
  },
  "editor.fontSize": 14,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
}
```

建议阅读 [Using TypeScript with React Native](http://facebook.github.io/react-native/docs/typescript)

---

参考：

[react-native-template-typescript](https://github.com/emin93/react-native-template-typescript)

[Setting up ESLint with Prettier, TypeScript, and Visual Studio Code](https://levelup.gitconnected.com/setting-up-eslint-with-prettier-typescript-and-visual-studio-code-d113bbec9857)

[在 Typescript 项目中使用 ESLint 和 Prettier](https://dev.to/robertcoopercode/using-eslint-and-prettier-in-a-typescript-project-53jb)
