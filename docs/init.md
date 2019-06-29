本文介绍：

- 如何在 React Native 中如何配置使用 Typescript

- 如何使用 ESLint 和 Prettier 来检测 ts 代码

- 如何利用 git hook 在提交代码前先做检查

- 如何使用 cocoapods 在 iOS 工程中管理依赖

- 如何配置 VSCode

## Typescript

类型系统对于需要长期维护的项目来说，是非常重要的。

安装 react-native-cli

```
npm i -g react-native-cli
```

通过 typescript 模版创建工程

```
react-native init MyApp --package "com.xxxxxx.mayapp" --template typescript
```

调整 tsconfig.json 文件，

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "jsx": "react",
    "lib": ["es6"],
    "moduleResolution": "node",
    "noEmit": true,
    "strict": true,
    "target": "esnext"
  },
  "include": ["app", "index.js"]
}
```

## ESLint & Prettier

在 [TypeScript 2019 路线图](https://github.com/Microsoft/TypeScript/issues/29288#developer-productivity-tools-and-integration) 中，TypeScript 核心团队推荐使用 ESLint 来检测代码。

```shell
# 安装 eslint
yarn add eslint eslint-plugin-react @typescript-eslint/parser @typescript-eslint/eslint-plugin --dev
# 安装 prettier
yarn add prettier eslint-plugin-prettier eslint-config-prettier --dev
```

创建 .eslintrc.js 文件

```js
module.exports = {
  // 指定 ESLint parser
  parser: '@typescript-eslint/parser',
  extends: [
    // 使用 @eslint-plugin-react 中推荐的规则
    'plugin:react/recommended',
    // 使用 @typescript-eslint/eslint-plugin 中推荐的规则
    'plugin:@typescript-eslint/recommended',
    // 使用 eslint-config-prettier 来禁止 @typescript-eslint/eslint-plugin 中那些和 prettier 冲突的规则
    'prettier/@typescript-eslint',
    // 使用 eslint-plugin-prettier 来将 prettier 错误作为 ESLint 错误显示
    // 确保下面这行配置是这个数组里的最后一行配置
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018, // 允许解析现代 es 特性
    sourceType: 'module', // 允许使用 imports
    ecmaFeatures: {
      jsx: true, // 允许解析 jsx
    },
  },
  rules: {
    'react/display-name': 'off',
    'react/prop-types': 'off',
    // 限制数组类型必须使用 Array<T> 或 T[]
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/camelcase': 'off',
    // 类名与接口名必须为驼峰式
    '@typescript-eslint/class-name-casing': 'error',
    // 函数返回值必须与声明的类型一致，【编译阶段检查就足够了】
    '@typescript-eslint/explicit-function-return-type': 'off',
    // 必须设置类的成员的可访问性
    '@typescript-eslint/explicit-member-accessibility': 'off',
    // 约束泛型的命名规则
    '@typescript-eslint/generic-type-naming': 'off',
    // 接口名称必须以 I 开头
    '@typescript-eslint/interface-name-prefix': 'off',
    // 禁止使用 any
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    // 有时需要动态引入，还是需要用 require
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-type-alias': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
  },
  settings: {
    react: {
      // Tells eslint-plugin-react to automatically detect the version of React to use
      version: 'detect',
    },
  },
}
```

创建 .prettierrc.js 文件

```js
module.exports = {
  semi: false,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 120,
  tabWidth: 2,
}
```

## Git Hook

为了确保提交给 git 的所有文件都能通过 tsc 的编译和 ESLint 检查，我们使用 husky 和 lint-staged。

```shell
yarn add husky lint-staged --dev
```

在 package.json 添加

```json
  "husky": {
    "hooks": {
      "pre-commit": "tsc --noEmit && lint-staged",
      "post-commit": "git update-index --again"
    }
  },
  "lint-staged": {
    "*.{js,ts,tsx,jsx}": [
      "eslint . --fix",
      "git add"
    ]
  },
```

husky 对每次提交生效，tsc 会编译整个工程，lint-staged 只对需要提交的文件生效。

## 自动修复代码（VS Code）

为了获得良好的开发体验，设置编辑器以便在保存文件时自动运行 ESLint 的自动修复命令（即 eslint --fix）是非常有用的。

以下是 VS Code 中的 settings.json 文件中所需的配置，以便在保存文件时自动修复：

> 按下 `Command + ,` 然后点击右上角的 **{ }** 按钮，可以打开 settings.json 文件

```json
{
  "eslint.autoFixOnSave": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    { "language": "typescript", "autoFix": true },
    { "language": "typescriptreact", "autoFix": true }
  ],

  "editor.formatOnSave": true, // 配合 Prettier
  "[javascript]": {
    "editor.formatOnSave": false
  },
  "[javascriptreact]": {
    "editor.formatOnSave": false
  },
  "[typescript]": {
    "editor.formatOnSave": false
  },
  "[typescriptreact]": {
    "editor.formatOnSave": false
  },
  "javascript.updateImportsOnFileMove.enabled": "always",
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

参考：

[react-native-template-typescript](https://github.com/emin93/react-native-template-typescript)

[在 typescript 项目中使用 eslint 和 prettier](https://dev.to/robertcoopercode/using-eslint-and-prettier-in-a-typescript-project-53jb)
