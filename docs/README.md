# React Native 工程实践

本文档讲述 React Native 的工程实践。

[配套 GitHub 仓库](https://github.com/listenzz/MyApp)

- [在工程中集成 Typescript, ESLint, Prettier 等](./lint.md)

  - 使用 typescript 模版来初始化工程
  - 使用 ESLint 来检查代码
  - 使用 Prettier 来保证一致的代码风格
  - 配置 VS Code，当保存文件时自动运行 ESLint 的修复命令

- [多环境配置](./env.md)

  - 使用 Configuration 和 Scheme 来实现 iOS 工程的多环境配置
  - 使用 Flavor 来实现 Android 工程的多环境配置
  - 编写原生模块，导出多环境配置到 React Native 代码

- 使用 **GitLab CI / CD** 来实现持续集成与持续部署

  - [iOS 工程化实践的准备工作](./ios.md)

    - 搭建基于 Ruby 的开发环境
    - 使用 fastlane 来管理证书和打包
    - 使用 fastlane 上传 ipa 到 TestFlight

  - [Android 工程化实践的准备工作](./android.md)

    - 生成签名密钥
    - 混淆配置

  - [使用 **GitLab CI / CD** 来实现持续集成与持续部署](./ci.md)

    - 使用 NodeJS 来编写 **CI / CD** 脚本
    - 自动管理 Version Name 和 Version Code
    - 上传 ipa 到自建文件服务器，并提供扫码安装能力
    - 上传 apk 到自建文件服务器，并提供扫码安装能力
    - 每日自动构建、部署

- [集成 Sentry 来监控应用崩溃问题](./sentry.md)

  - 创建 Sentry 项目
  - 如何配置 iOS、Android、React Native 工程
  - 与 **CI / CD** 集成，自动注入 Commit SHA，自动上传符号表

- [集成热更新(CodePush)](./hotfix.md)

  - 如何注册 CodePush 热更新服务
  - 如何配置 iOS、Android、React Native 工程
  - 与 **CI / CD** 集成，自动发布热更新，并上传符号表到 Sentry
