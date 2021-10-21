# iOS 工程实践

本文讲述 React Native 工程化，iOS 端需要做的准备工作，原生工程也可以参考。

本文包括以下内容

- 搭建基于 Ruby 的开发环境
- 使用 fastlane 来管理证书和打包
- 使用 fastlane 上传 ipa 到 TestFlight

## 使用 Homebrew 安装 Ruby

Mac OS 自带 ruby，不过限制过多，在执行某些命令时，需要 sudo。 我们使用 homebrew 重新安装一个。

```zsh
brew install ruby
```

安装完成后，根据提示，执行如下命令

```zsh
echo 'export PATH="/usr/local/opt/ruby/bin:$PATH"' >> ~/.zshrc
# 如果是 M1 则执行  echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

查看 ruby 和 gem 的版本

```zsh
ruby -v
# ruby 3.0.2p107 (2021-07-07 revision 0db68f0233) [arm64-darwin20]
```

```zsh
gem -v
# 3.2.22
```

## 安装 cocoapods 和 fastlane

> RN0.60 以后，默认使用 cocoapods 来作为 iOS 的包管理器，本文不再讲解如何配置 cocoapods。

安装 bundler， bundler 是 Ruby 的包管理器，如同 npm 之于 Node。cocoapods 和 fastlane 都是使用 Ruby 来编写的。

```
gem install bundler
```

在 ios 目录下，新建一个 Gemfile 文件，文件内容如下：

```gemfile
source "https://rubygems.org"

gem 'fastlane'
gem 'cocoapods'
```

Gemfile 之于 bundler，如同 package.json 之于 npm。

运行以下命令，安装 fastlane 和 cocoapods

```sh
# ios 目录下
bundle install
```

安装成功后，会看到 ios 目录下多了一个 Gemfile.lock 文件，这个文件锁定了我们在这个项目中使用的 fastlane 和 cocoapods 版本，统一的版本，方便团队协作。

以后团队成员一律使用 `bundle exec pod install` 这样的命令

> 其他团队成员，cd 到 ios 目录下，运行 gem install bundler && bundle install 即可安装相同版本的 fastlane 和 cocoapods

## 创建 fastlane 文件夹

[fastlane](https://docs.fastlane.tools/) 是用 Ruby 语言编写的一个命令行工具，可以自动化几乎所有 iOS 开发所需要的操作，例如自动打包和签名 App，自动上传到 App Store 等等。

在 ios 文件夹创建一个名为 fastlane 的文件夹，在该文件夹里面创建一个名为 Fastfile 的文件，注意大小写。

## Action

fastlane 为我们提供了诸多 Action，它们是 iOS 项目开发中需要用到的基本操作，常见的 Action 有

- [match](https://docs.fastlane.tools/actions/match/)，为整个团队自动管理、同步证书和 Provisioning Profile

- [gym](https://docs.fastlane.tools/actions/gym/)，用于自动构建和打包 App

- [pilot](https://docs.fastlane.tools/actions/testflight/)，用于自动把 App 部署到 TestFlight 并管理测试用户

- deliver，用于自动把 App 上传到 App Store

通过 `bundle exec fastlane <action> -- help` 命令可以查看 action 有哪些子命令和参数。

如：

```sh
# ios 目录下
bunlde exec fastlane match --help
```

使用向下箭头查看更多信息，使用 q 退出查看。

通过 `bundle exec fastlane action <action>` 命令可以查看 action 可以传递的参数及其对应的环境变量。

如：

```sh
bundle exec fastlane action match
```

## match

我们通过 [match](https://docs.fastlane.tools/actions/match/) 来管理证书和 Provisioning Profile 文件。

通过 `bunlde exec fastlane match --help` 命令查看帮助信息可知，我们可以通过 `development` 子命令生成开发证书和 provisioning profile 文件。

```sh
bundle exec fastlane match development
```

执行该命令时，需要传递若干参数，参数可以通过命令行参数或者环境变量的方式传递。通过 `bundle exec fastlane action match` 命令查看可以传递的参数及其对应的环境变量。

譬如 git_url 参数可以通过 `bundle exec fastlane match development --git_url git@git.xxxxxx.com:ios/certificates.git` 的形式传递，也可以通过名为 `MATCH_GIT_URL` 的环境变量。

通过环境变量的方式传递参数比较方便，因为可以在多个以及多次命令之间复用参数。

通过环境变量传递参数也有多种方式，本文使用 .env 文件来传递环境变量。

在 fastlane 文件夹里面创建一个名为 .env 变量，注意不要少了一个点。并将 .env 加入到 .gitignore 文件中，因为这里面涉及敏感信息，我们不希望将它加入到版本控制里面。

### App Store Connect API

生成证书和 provisioning profile 文件，需要开发者账号。如果你不是该账号持有人，你需要该账号持有人或管理者将你的 AppleId 加入该账号，并赋予 APP 管理权限。

请根据 [Using App Store Connect API](https://docs.fastlane.tools/app-store-connect-api/) 的指引，生成 fastlane API Key JSON file。如果你们的账号从未使用过 App Store Connect API，则需要**账号持有人**开通这一功能。

生成的 json 文件长如下这个样子，把该文件存放到你的电脑某处。

```json
{
  "key_id": "D383SF739",
  "issuer_id": "6053b7fe-68a8-4acb-89be-165aa6465141",
  "key": "-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHknlhdlYdLu\n-----END PRIVATE KEY-----",
  "duration": 1200,
  "in_house": false
}
```

打开 .env 文件，添加如下信息

```sh
# 指向 fastlane API Key JSON file 的文件路径
APP_STORE_CONNECT_API_KEY_PATH=/Users/listen/AuthKey.json
# 证书仓库
MATCH_GIT_URL=git@git.xxxxxx.com:ios/certificates.git
# bundle id
MATCH_APP_IDENTIFIER=com.shundaojia.myapp
```

`git@git.xxxxxx.com:ios/certificates.git` 是我们用于存放证书和 Provisioning Profile 文件的仓库，需要预先创建。

> 确保 CI 机器使用 `ssh -T git@git.xxxxxx.com` 能 ping 成功

多个项目可以共享一个证书仓库，只要这些项目的 Bundle ID 不一样即可。

在之前的步骤中，我们已经通过 `bundle exec fastlanme match development` 生成了 development 证书，接下来，我们生成 appstore 证书。

```sh
bundle exec fastlane match appstore
```

就这样，我们把开发证书和 Provisioning Profile 文件交给了 match 来管理。

> 添加新的设备后，使用 bundle exec fastlane matche development --force 来刷新 Provisioning Profile

我们可以通过手动设置签名来检验这一成果。

打开 Xcode，配置好 Provisioning Profile，因为我们有 qa 和 production 两个环境，每个环境有 debug 和 release 两个 Configuration，所以我们有 4 处签名需要配置。

![ios-2021-10-19-16-23-01](https://todoit.oss-cn-shanghai.aliyuncs.com/todoit/ios-2021-10-19-16-23-01.jpg)

最后，别忘了设置回自动管理签名哦，因为我们只希望通过 CI 打包时，才交给 match 管理签名文件，这样可以降低团队协作成本，其它成员不需要知道有这一回事。

### 清理证书

某些情况下，可能需要 revoke 掉所有证书和 provisioning profiles

```shell
bundle exec fastlane match nuke
```

> 该操作不会影响 AppStore 上已经发布的版本

测试用的机器以及 CI 机器，需要清空本地的 provisioning profiles。清空方法：打开 Finder，前往文件夹（shift + command + G） ~/Library/MobileDevice/Provisioning Profiles，删除里面的文件。

同时需要删掉钥匙串中无效的证书。

## Lane 和打包

我们单独使用 match 这个 Action 就可以实现自动管理证书和 Provisioning Profile 文件，但打包，光靠一个 [gym](https://docs.fastlane.tools/actions/gym/) 可不行，因为打包涉及好几个步骤。

- 更新和安装 pod 依赖

- 设置 version code

- 设置 version name

- 更新签名配置，或者使用开发证书，或者使用发布证书

- 打包

我们需要把这些操作组合成一个操作，这就是 Lane，Lane 写在 Fastfile 文件中，如下

```ruby
# ios/fastlane/Fastfile
lane :build
    # 安装 pod 依赖
    cocoapods(
        podfile: "./Podfile",
    )

    # 默认打 qa 环境的包
    environment = ENV['ENVIRONMENT'] || 'qa'
    export_method = (environment == 'production' ? 'app-store' : 'development')
    type = export_method.gsub(/-/, '')

    # 设置 bundle id
    update_app_identifier(
        xcodeproj: xcodeproj,
        plist_path: "#{app_name}/Info.plist",
        app_identifier: app_identifier
    )

    build_number = ENV['VERSION_CODE'] || '272'
    version_name = ENV['VERSION_NAME'] || '1.7.2'

    # 设置 version code
    increment_build_number(
        build_number: build_number,
        xcodeproj: xcodeproj
    )

    # 设置 version name
    increment_version_number(
        version_number: version_name,
        xcodeproj: xcodeproj
    )

    # 下载 provisioning profile 文件
    match(
        type: 'development',
        readonly: true,
    )

    match(
        type: type,
        readonly: true,
    )

    # 清除之前的构建物
    sh(%(cd #{ENV['PWD']} && rm -rf ./build && mkdir build))

    profile_name = ENV["sigh_#{app_identifier}#{type}_profile-name"] || "match Development #{app_identifier}"

    # 配置签名
    update_code_signing_settings(
        use_automatic_signing: false,
        path: xcodeproj,
        code_sign_identity: export_method == 'appstore' ? "iPhone Distribution" : "iPhone Developer",
        bundle_identifier: app_identifier,
        profile_name: profile_name,
    )

    output_name = "#{environment}-#{version_name}-#{build_number}"
    # 要求项目 scheme 的命名规则是 app 名称 + 空格 + 环境
    scheme = options[:scheme] || "#{app_name} #{environment}"

    # 打包
    gym(
        export_method: export_method,
        include_symbols: true,
        include_bitcode: false,
        xcargs: 'DEBUG_INFORMATION_FORMAT="dwarf-with-dsym"',
        scheme: scheme,
        workspace: "#{app_name}.xcworkspace",
        output_name: output_name,
        clean: true,
        output_directory: "./build"
    )
end

```

这个 lane 的名字名为 build，它组合了 `cocoapods` `increment_build_number` `match` `update_code_signing_settings` `gym` 等 action。

请注意，我们可以运行 `bundle exec fastlane action <action>` 这样的命令来查看这些 action 可以或需要传递什么样的参数，然后通过方法参数或环境变量的形式传递。

为了顺利运行以上这些 action，修改 .env 文件，传递以下环境变量。

```sh
# 你的 team_id
FASTLANE_TEAM_ID=RGX3H8KABF
```

我们可以像运行一个 action 那样运行它

```shell
# ios 目录下运行
bundle exec fastlane build
```

运行成功后，我们发现，在 ios/build 目录下，本次构建的制品(artifacts)：ipa 包以及 dSYM 符号表。

## 使用 fastlane 上传 ipa 到 TestFlight

我们将使用苹果官方的内测服务 [TestFlight](https://developer.apple.com/testflight/)，来测试生产包。

fastlane 提供了一个叫 [pilot](https://docs.fastlane.tools/actions/testflight/) 的 action 来帮组我们把 ipa 包上传到 App Store Connect。

我们在 Fastfile 中添加一个新的 lane

```ruby
lane :upload_ipa_to_testflight do |options|
    file_name, basename, version_name, build_number, dir_name = app_info
    pilot(
        ipa: file_name,
        # changelog 不能过短，否则会有警告
        changelog: 'This is my changelog of things that have changed in a log.',
    )
end

def app_info
    dir_name = "#{ENV['PWD']}/build/*"
    match_extension = '.ipa'
    files = Dir[dir_name]
    file_name = files.find do |file|
        File.extname(file) == match_extension
    end

    basename = File.basename(file_name, match_extension)
    version_name, build_number = basename.split('-').last(2)

    return file_name, basename, version_name, build_number, dir_name
end
```

在执行 `bundle exec fastlane upload_ipa_to_testflight` 之前，先让我们来做些准备工作

1. 前往 App Store Connect 创建 App

![ios-2021-10-19-16-23-25](https://todoit.oss-cn-shanghai.aliyuncs.com/todoit/ios-2021-10-19-16-23-25.jpg)

2. 打开 Xcode，添加 AppIcon，本项目附送了一套 icon，可供测试使用

![ios-2021-10-19-16-23-42](https://todoit.oss-cn-shanghai.aliyuncs.com/todoit/ios-2021-10-19-16-23-42.png)

重新打个类型为 appstore 的包再上传

```
ENVIRONMENT=production bundle exec fastlane build
bundle exec fastlane upload_ipa_to_testflight
```

如果控制台出现以下消息，说明 ipa 包未能通过检测，按下 **Control + C**

> 留意苹果给你发的邮件，如有问题，及时按下 Control + C

![ios-2021-10-19-16-24-05](https://todoit.oss-cn-shanghai.aliyuncs.com/todoit/ios-2021-10-19-16-24-05.png)

ipa 包通过检测后，TestFlight 功能将被激活，前往 App Store Connenct, 打开我的 App 页面，选择 TestFlight 选项卡，可以看到

![ios-2021-10-19-16-24-49](https://todoit.oss-cn-shanghai.aliyuncs.com/todoit/ios-2021-10-19-16-24-49.jpg)

选择侧边栏的 App Store Connect 用户，点击测试员旁边的 + 按钮，添加内部测试员。内部测试员必须是开发组的成员。

添加成功后，测试员会收到邮件邀请

![ios-2021-10-19-16-25-16](https://todoit.oss-cn-shanghai.aliyuncs.com/todoit/ios-2021-10-19-16-25-16.jpg)

测试员接受邀请，在 App Store 下载 TestFlight App，输入兑换码，即可安装 App 进行测试，以后每次发布新包，测试员都可以收到通知。

使用 TestFlight 还有一个好处，可以直接把通过测试的包发布到 AppStore，如果使用其它测试分发平台，还需要再次打包。

### 可能会遇到的问题

如果发现如下错误

![ios-2021-10-19-16-25-34](https://todoit.oss-cn-shanghai.aliyuncs.com/todoit/ios-2021-10-19-16-25-34.png)

说明准备工作 1 没做好

![ios-2021-10-19-16-26-00](https://todoit.oss-cn-shanghai.aliyuncs.com/todoit/ios-2021-10-19-16-26-00.png)

说明准备工作 2 没做好

如果收到这样的邮件

![ios-2021-10-19-16-26-19](https://todoit.oss-cn-shanghai.aliyuncs.com/todoit/ios-2021-10-19-16-26-19.png)

说明 ipa 未能通过检测，请根据提示修复问题

## 上传到 App Store?

ipa 上传到 TestFlight，通过测试后，可以直接发布。

因此，deliver 这个 Action 可以忽略了。
