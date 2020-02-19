本文档讲述 React Native 的工程化实践。

- [在工程中集成 Typescript, ESLint, Prettier 等](./docs/init.md)

  - 使用 typescript 模版来初始化工程
  - 使用 ESLint 来检查代码
  - 使用 Prettier 来保证一致的代码风格
  - 使用 husky 和 lint-staged 来确保提交给 git 的文件先经过 ESLint 的检查
  - 配置 VS Code，当保存文件时自动运行 ESLint 的修复命令

- [多环境配置](./docs/environment.md)

  - 使用 Configuration 和 Scheme 来实现 iOS 工程的多环境配置
  - 使用 Flavor 来实现 Android 工程的多环境配置
  - 编写原生模块，导出多环境配置到 React Native 代码

- 代码规范与最佳实践

  - [React 组件规范](./docs/coding-standards.md)
  - [如何编写 Android 组件](./docs/best-practice.md)
  - [如何编写 iOS 组件](./docs/best-practice.md)
  - [整洁架构](./docs/clean-architecture.md)
  - [未分类](./docs/coding-standards.md)

- 如何进行单元测试

  - 测什么
  - 不测什么
  - 如何测

- 使用 **GitLab CI / CD** 来实现持续集成与持续部署

  - [iOS 工程化实践的准备工作](./docs/ios.md)

    - 使用 cocoapods 来管理依赖
    - 使用 fastlane 来管理签名和打包
    - 使用 fastlane 上传生产包到 TestFlight
    - 使用 fastlane 上传测试包到 Bugly

  - [Android 工程化实践的准备工作](./docs/android.md)

    - 生成签名密钥
    - 混淆配置
    - 多渠道打包
    - 自建文件服务器

  - [使用 **GitLab CI / CD** 来实现持续集成与持续部署](./docs/ci.md)

    - 使用 Node 来编写 **CI / CD** 脚本
    - 自动管理 Version Name 和 Version Code
    - 每日自动构建、部署

- [集成 Sentry 来跟踪代码错误](./docs/sentry.md)

  - 创建 Sentry 项目
  - 如何配置 iOS、Android、React Native 工程
  - 与 **CI / CD** 集成，自动注入 Commit SHA，自动上传符号表

- [集成热更新(CodePush)](./docs/hotfix.md)

  - 如何注册 CodePush 热更新服务
  - 如何配置 iOS、Android、React Native 工程
  - 与 **CI / CD** 集成，自动发布热更新，并上传符号表到 Sentry

- 附录

  - 搭建 Sentry 私服
  - 搭建 CodePush 私服
  - 搭建私有 NPM 仓库
