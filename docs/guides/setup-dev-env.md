本文假设你是在 MacOS 环境下开发 React Native 应用

### 梯子

知道如何使用梯子访问外网，否则，不用往下看了。

### Xcode

从 App Store 中安装 Xcode，在安装 Homebrew 之前，至少打开过 Xcode 一次。

第一次打开 Xcode 时，需要同意 Agreement。

### Homebrew

[Homebrew](https://brew.sh/index_zh-cn.html) 是 Mac OSX 上的软件包管理工具，能在 Mac 中方便的安装软件或者卸载软件，相当于 linux 下的 apt-get、yum 神器；Homebre 可以在 Mac 上安装一些 OS X 没有的 UNIX 工具，Homebrew 将这些工具统统安装到了 /usr/local/Cellar 目录中，并在 /usr/local/bin 中创建符号链接。

可以通过以下命令来安装 Homebrew：

```
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

### Node

可以通过 Homebrew 来安装 Node

```shell
brew install node
```

也可以通过 [nvm](https://github.com/creationix/nvm) 来安装

```sh
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
```

nvm 安装完成后，安装 Node

```sh
nvm install --lts
```

### Yarn

yarn 和 npm 一样，都是 Node 的包管理器。

```sh
curl -o- -L https://yarnpkg.com/install.sh | bash
```

### Watchman

Watchman is a tool by Facebook for watching changes in the filesystem. It is highly recommended you install it for better performance.

```sh
brew install watchman
```

### Bundler

[Bundler](https://bundler.io/) 是 Ruby 的包管理器，如同 npm 之于 Node。

> iOS 开发用到的两个工具 cocoapods 和 fastlane 都是用 Ruby 写的。

```sh
sudo gem install bundler
```

### Java

```sh
brew cask install java
```

### Android Studio

```sh
brew cask install android-studio
```

也可以到[官网下载](https://developer.android.com/studio)

设置 Android Studio 相关环境变量

```sh
$ touch .zshrc
```

打开配置文件

```sh
$ open -e .zshrc
```

拷贝如下设置到文件中，注意将`listen`更换成你的用户名

```sh
export ANDROID_HOME=/Users/listen/Library/Android/sdk
export PATH="${ANDROID_HOME}/tools:${PATH}"
export PATH="${ANDROID_HOME}/platform-tools:${PATH}"
```

按下`⌘+S`保存设置，同时输入如下命令激活设置：

```sh
$ source .zshrc
```

### Visual Studio Code

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

  "editor.fontSize": 14,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Google Chrome 浏览器

使用 Homebrew 安装 Google Chrome

```sh
brew cask install google-chrome
```
