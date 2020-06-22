React Native 开发指南

## 入门

本卷包含以下内容

React Native 开发环境配置

Git 和 Git 分支管理

所需掌握的前端知识

React Native 基础

React Native 调试工具

React Native 页面导航

React Native 架构实践

### 开发环境配置

本章节假设你是在 MacOS 环境下开发 React Native 应用

#### 梯子

知道如何使用梯子访问外网，否则，不用往下看了。

#### Xcode

从 App Store 中安装 Xcode，在安装 Homebrew 之前，至少打开过 Xcode 一次。

第一次打开 Xcode 时，需要同意 Agreement。

#### Homebrew

[Homebrew](https://brew.sh/index_zh-cn.html) 是 Mac OSX 上的软件包管理工具，能在 Mac 中方便的安装软件或者卸载软件，相当于 linux 下的 apt-get、yum 神器；Homebre 可以在 Mac 上安装一些 OS X 没有的 UNIX 工具，Homebrew 将这些工具统统安装到了 /usr/local/Cellar 目录中，并在 /usr/local/bin 中创建符号链接。

可以通过以下命令来安装 Homebrew：

```
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

#### Node

可以通过 Homebrew 来安装 Node

```shell
brew install node
```

也可以通过 nvm 来安装

点击 [nvm](https://github.com/creationix/nvm)，根据官方提示来安装

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
```

nvm 安装完成后，安装 Node

```
nvm install --lts
```

#### Yarn

yarn 和 npm 一样，都是 Node 的包管理器。

```sh
curl -o- -L https://yarnpkg.com/install.sh | bash
```

#### Watchman

Watchman is a tool by Facebook for watching changes in the filesystem. It is highly recommended you install it for better performance.

```sh
brew install watchman
```

#### Bundler

[Bundler](https://bundler.io/) 是 Ruby 的包管理器，如同 npm 之于 Node。

> iOS 开发用到的两个工具 cocoapods 和 fastlane 是用 Ruby 写的。

```sh
sudo gem install bundler
```

#### JDK

```sh
brew cask install java
```

#### Android Studio

```sh
brew cask install android-studio
```

也可以到[官网](https://developer.android.com/studio)直接下载

#### Visual Studio Code

我们推荐使用 VS Code 来作为前端代码的编辑器

[Download for Mac](https://code.visualstudio.com/)

安装完成后打开

同时按下 ⇧ + ⌘ + p，安装 code command shell

安装主题 Ayu

安装主题 Material Icon Theme

安装插件 ESLint

安装插件 Prettier - Code formatter

安装插件 GitLens

同时按下 ⌘ + , 设置 User Settings

```json
{
  "workbench.colorTheme": "Ayu Mirage",
  "workbench.iconTheme": "material-icon-theme",

  "javascript.updateImportsOnFileMove.enabled": "always",
  "typescript.updateImportsOnFileMove.enabled": "always",

  "[javascript]": {
    "editor.formatOnSave": false,
    "editor.tabSize": 2
  },
  "[javascriptreact]": {
    "editor.formatOnSave": false,
    "editor.tabSize": 2
  },
  "[typescript]": {
    "editor.formatOnSave": false,
    "editor.tabSize": 2
  },
  "[typescriptreact]": {
    "editor.formatOnSave": false,
    "editor.tabSize": 2
  },

  "prettier.semi": false,
  "prettier.printWidth": 100,
  "prettier.singleQuote": true,

  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "eslint.format.enable": true,

  "editor.suggestSelection": "first",
  "editor.fontSize": 14,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Git 和 Git 分支管理

本章节讲解如何获取、更新、运行 React Native 项目

#### 配置 SSH KEY

我司使用私有部署的 GitLab 来作为代码仓库，为了可以免密拉取和提交代码，需要配置 SSH key。

1. 查看是否已有 SSH key 存在

打开终端，输入 `ls -al ~/.ssh`

```sh
$ ls -al ~/.ssh
# Lists the files in your .ssh directory, if they exist
```

如果存在，跳到 3 步，否则，跳到第 2 步

2. 生成 SSH Key

打开终端，复制以下命令，记得替换成你的邮箱地址

```sh
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

一路回车即可，不要设置密码

3. 添加你的 SSH key 到 ssh-agent

在后台启动 ssh-agent

```sh
$ eval "$(ssh-agent -s)"
> Agent pid 59566
```

检查 `~/.ssh/config` 是否存在

```sh
$ open ~/.ssh/config
> The file /Users/you/.ssh/config does not exist.
```

如果不存在就创建

```
$ touch ~/.ssh/config
```

打开 `~/.ssh/config`，修改成如下样子

```
Host *
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_rsa
```

将 SSH 私钥添加到 ssh-agent

```sh
$ ssh-add -K ~/.ssh/id_rsa
```

4. 复制 SSH Key 到 GitLab

运行以下命令，复制 SSH Key 到剪贴板

```sh
$ pbcopy < ~/.ssh/id_rsa.pub
# Copies the contents of the id_rsa.pub file to your clipboard
```

打开 GitLab -> Profile Settings -> SSH Keys
右键粘贴或者 Command + V，把刚刚拷贝的 SSH Key 添加到 Key 文本域里面，注意不要有新行或空格，随意起一个 title，点击 Add key 按钮确认添加。

![ssh-configure](./guides/ssh-configure.png)

参考 [Connecting to GitHub with SSH](https://help.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh)

#### 克隆代码

以 SSH 的方式 clone 代码

譬如

```sh
git clone git@github.com:listenzz/MyApp.git
```

我们的 React Native 项目具有良好的[工程实践](https://github.com/listenzz/MyApp)，[区分 qa 和 production 环境](https://github.com/listenzz/MyApp/blob/master/docs/environment.md)，[使用 fastlane 来管理 iOS 的签名和打包](https://github.com/listenzz/MyApp/blob/master/docs/ios.md)。

clone 代码后，cd 到项目根目录，运行以下命令，安装必要的依赖。

```sh
# 安装 node package 依赖
yarn install

# cd 到 ios 项目所在文件夹
cd ios

# 安装项目特定版本的 cocoapods 和 fastlane
bundle install

# 安装由 cocoapods 管理的 ios 包依赖
bundle exec pod install

# 安装开发证书
bundle exec fastlane match development
```

#### 如何运行项目

打开终端，运行以下命令，启动 Package Server：

```sh
npm start
```

接下来，可以通过 IDE 工具（Android Studio 或 Xcode）运行项目，也可以通过终端运行：

打开另一个终端，

运行 `npm run android` 即可运行 qa 环境的可调试的 Android 应用

运行 `npm run ios` 即可运行 qa 环境的可调式 iOS 应用

真机调试或切换到其它环境，请参考 [React Native 工程多环境配置](https://github.com/listenzz/MyApp/blob/master/docs/environment.md)如何切换环境一节。

#### 掌握 Git 基本知识

请务必理解 merge 和 rebase 的区别

rebase 之前，请确保代码已经 commit

如果遇到意外，可使用 `git reflog` 和 `git reset --hard` 来救命。

参考

[常用 Git 命令清单](http://www.ruanyifeng.com/blog/2015/12/git-cheat-sheet.html)

[Git 远程操作详解](http://www.ruanyifeng.com/blog/2014/06/git_remote.html?utm_source=tuicool&utm_medium=referral)

推荐使用 Sourcetree 等可视化工具

#### 理解 Git 分支管理模型

阅读[基于 Git 的分支管理模型](https://yasinshaw.com/articles/51)，理解什么是 `Git Flow` `GitHub Flow` `Trunk Based Development`。

我们使用的分支管理模型主要基于 `Trunk Based Development`

master 分支是我们的持续集成分支，是个受保护的分支，不允许直接 push 代码。

开发人员从 master checkout 一个 feature 分支，分支可以以功能名称命名或以开发者的名字命名，如 feature/login。

功能开发完成后，在本地 rebase 到 master 分支，将代码 push 到远程仓库，创建 PR 到 master 分支，代码通过 review 后，合并到 master 分支。

需要 release 时，一般先打 tag，CI 会将 tag 作为版本号，管理者在发版的 commit 处创建新的 release 分支， 以记录本次发版的位置，如 release/5.0.0。通常只保留一个 release 分支。

如果发现线上版本有 BUG，需要打补丁。一般考虑在 master 分支修复，然后由管理者将修复代码 cherry pick 到 release 分支，并在该分支上打 tag 发版。

#### 更新代码

使用 rebase 合并代码

```sh
git pull master --rebase
```

更新依赖

```sh
yarn install
cd ios && bundle exec pod install
```

> 不要等到自己负责的功能完成后才将代码 rebase 到 master 分支，要养成每天合并代码的习惯。这样可以避免许多冲突。

#### 提交代码

除了 master 分支，其它分支都是临时性的，如果需要删除已经没有对应远程分支的本地分支，可以运行以下命令。

```sh
git tag -l | xargs git tag -d #删除所有本地 tag
git fetch origin --prune #从远程拉取所有信息
```

功能开发完成后，在本地 rebase 到 master 分支，将代码 push 到远程仓库，创建 PR 到 master 分支，代码通过 review 后，合并到 master 分支。

#### 创建新项目

有时，我们需要创建新的 React Native 项目

如果你使用 `npx react-native init` 的方式来创建，请参考[如何在工程中集成 Typescript, ESLint, Prettier 等](https://github.com/listenzz/MyApp/blob/master/docs/init.md)

我们推荐使用 [react-native-create-app](https://github.com/listenzz/react-native-create-app) 来创建。

### 所需掌握的前端知识

本章节讲述开发 React Native 需要掌握的最少前端知识

#### Javascript 语言和 ES6 语法

阅读[JavaScript 标准参考教程](https://javascript.ruanyifeng.com/)，了解 Javascript 大概有哪些 api 可用，需要时查询。

学习 [ES6 核心特性](https://exploringjs.com/es6/ch_core-features.html)，理解解构赋值、扩展运算符等新语法。

#### Typescript 基础

没有类型的代码是无法维护的，我们使用 Typescript 来为 Javascript 加上类型。

Typescript 是结构化类型，只在编译时生效，并没有改变 Javascript 的动态性。

初学者，从 [Typescript 的基本类型](https://www.typescriptlang.org/docs/handbook/basic-types.html)开始，到 [Typescript 的高级类型](https://www.typescriptlang.org/docs/handbook/advanced-types.html)结束即可。

#### React 基础

React Native 基于 React，我们需要掌握[核心概念](https://react.docschina.org/docs/hello-world.html)，以及 [HOOK](https://react.docschina.org/docs/hooks-intro.html)。

### React Native 基础

官方网站，是学习 React Native 的最好去处，在开始为公司项目添砖加瓦前，我们需要先了解以下内容：

[The Basics](https://reactnative.dev/docs/intro-react-native-components)

[Workflow](https://reactnative.dev/docs/running-on-device)

[Design](https://reactnative.dev/docs/style)

### 调试工具

本章节讲述如何调试 React Native 应用

打开 Chrome 调试

### 导航组件

导航是指支持用户导航、进入和退出应用中不同内容片段（页面）的交互。[React Navigation](https://reactnavigation.org/) 是 React Native 主流的导航组件，使用 React Native 视图组件实现。但我们使用的是 [react-native-navigation-hybrid](https://github.com/listenzz/react-native-navigation-hybrid)，该导航组件使用原生导航组件实现，性能更优，使用简单，并且支持混合导航（原生和 RN 页面互跳）。

### 架构实践

本章节讲述我司 React Native 应用的架构实践

#### 角色与职责

#### 哲学

#### 异常处理

## 进阶

### Yarn 基本知识

### Npm 基本知识

私服

### Babel 基本知识

### ESLint 基本知识

### React Native 基本原理

### Android 基本知识

使用 Android Studio Profiler 工具解析应用的内存和 CPU 使用数据

### iOS 基本知识

### 如何开发 iOS 原生模块

### 如何开发 Android 原生模块

### 如何开发 iOS 原生 UI 组件

### 如何开发 Android 原生 UI 组件

### Typescript 进阶知识

配置选项说明

高级语法

### ES6 进阶知识

### React Hook 高级技巧

### Webpack 基本知识

### 使用 Webpck 开发原生小程序

### CI / CD
