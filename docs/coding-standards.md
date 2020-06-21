本文讲述开发 React Native App 的代码规范。

本规范会持续演进。

如对某些条目持不同意见，在未达成共识之前，以本规范为准。

## 代码格式

使用 EsLint, Prettier 等工具确保代码格式

以下是一些额外要求

- 函数之间，方法之间必须空一行

- 使用 tsc 来作为类型检查

## 工程

- 配置权放在主工程

- 子工程应当声明自身依赖，由主工程引入

- PR 需要区分 feature，bugfix, refactor，doc，不要把不同类型的操作放在同一个 PR 中

## React 组件

- 所有组件均是函数组件

- 区分业务无关的 UI 组件和业务相关的 UI 组件

- 业务相关的 UI 谨慎复用

- 组件依赖业务，业务不依赖组件

- 有状态的组件没有渲染，有渲染的组件没有状态

- 业务组件应该放在业务模块所属文件夹内

- 元素级别保持一致

- 禁止使用行内样式

- 样式要设置到实体组件上

- 需要传递进来的事件处理函数，以 `on` 作为前缀

- 禁止使用行内 Handler

- Handler 需以 handle 为前缀

  handleItemPress
  handleItemAvatarPress

- 理解什么是受控组件

- 学习如何优化列表

- 渲染函数以 `render` 作为前缀

- 如果可以写成自定义组件，就不要使用渲染函数

## 原生组件与原生 UI 组件

- Pod 依赖版本要锁定

- iOS 字典使用 `[NSNull null]` 而不是 `nil` 来表示键值

- iOS 使用 objc 作为编程语言

- Android 中没有 Integer，应该使用 double 来代替

- Android 使用 java 作为编程语言

- 基础库，若无必要，不要依赖门槛较高的第三方库，比如 Rx, Dagger

- 处理好 Gradle Build Tools 版本

- 处理好 reload

- 务必处理好线程

- Android 组件库需配置好混淆文件
