我们的 App 遵循[整洁架构](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)。

![Clean-Architecture-graph](./images/CleanArchitecture.jpg)

## 依赖原则

如图所示，依赖由外向内，由具体到抽象。

必须谨记于心，如果发现内层依赖了外层，那么必然是代码写错了。

中间两层又称为业务层，它们是整个应用的核心，最外两层的东西都绕着它们转。

在我们的实践中，我们把中间两层称为内层，最外两层称为外层。在目录组织结构上，也主要表现为两层。

业务层与 UI 无关，与设备无关，它们不依赖任何 React 以及 React Native 的东西，它们不知道自己运行在哪个环境中，即使将它们的代码原封不动地拷贝到一个小程序项目中，只要外层实现了内层的接口，代码就能正常运转。

Devices、Web、UI 等都属于最外层，但它们彼此之间最好不要有依赖，它们应该通过内层（业务层）进行通信。

## Service Pattern

在大多数整洁架构的实践中，使用 UseCase 来表示用户交互，一个用户交互背后就是一个文件，这会导致产生很多碎片化的文件，也会将密切相关的操作割裂开来，强行降低了代码的内聚性，违背了高内聚，低耦合的原则，不利于业务代码的维护。

我们把相关的 UseCase 都聚合到同一个 Service 中，不同的 Service 管理着各自的领域。

UI 层依赖 Service 层，调用 Service 层中的方法执行操作或获取数据。

## Repository Pattern

假设 UI 层依赖的数据来源于网络，但是根据我们的依赖原则，UI 层不应该直接依赖网络层，它应该依赖于服务层。

所以服务层的数据来源于网络层，但是根据我们的依赖原则，服务层不应当依赖网络层，而是网络层要依赖服务层。

我们通过[**控制反转**](https://zh.wikipedia.org/wiki/%E6%8E%A7%E5%88%B6%E5%8F%8D%E8%BD%AC)来解决这个问题。

我们在内层定义 Repository 接口，Service 依赖这些接口。

我们在外层实现这些 Repository 接口，最后通过**依赖注入**的方式，为 Service 提供 Repository 的具体实现。

但是 Service 对 Repository 的实现一无所知，因为它依赖的是接口。

这种数据层的设计模式，又被称为 [Repository Pattern](https://blog.kylegalbraith.com/2018/03/06/getting-familiar-with-the-awesome-repository-pattern/)

## 数据转换

数据层从后台或本地存储中获取到的数据，通常是 json，或者 key-value。这些数据不能直接传递给服务层，需要转换成服务层所使用的数据结构。我们把服务层所使用的这些数据结构称为 Entity。有些工程师把数据层所承担的这个转换数据的职责称为数据清洗。

UI 层从服务层所获得的数据，有时候，或大多数情况下，并不能直接作为界面的状态展示出来，需要先进行适配。这也是为什么图中第三层（由里向外）也被称为接口适配层的原因。譬如，我们从 Service 层拿到的表示时间的数据，可能是一个整型的时间戳，需要先适配成描述性的字符串后展示出来。

有时，一个 UI 界面所依赖的数据来自于多个 Service，我们需要把这多个数据源聚合在一起，转换(适配)成 UI 可以展示的数据结构。譬如一个用户头像组件，它的头像数据来源于 UserService，然而头像的角落有个 Badge 来表示未读的消息数目，这个数据则来源于 ChatService，我们需要组合这些数据，构造一个叫 `AvatarItem` 的数据结构，传递给 `AvatarComponent`。

```ts
interface AvatarItem {
  url: string
  unread: number
}
```

UI 层的数据转换逻辑放在哪呢？如果采用了 MVP 或者 MVVM 模式，就放在 Presenter 或 ViewModel 中，否则就放在和 UI Component 相同的文件中，可以是一个工具函数，也可以是一个方法。工具函数如果需要多处复用，则抽取到 helper 文件中。

## Manager Pattern

## 异常处理

我们在业务层定义了若干常见异常（Error）。

所有的网络访问 Error，都应当转译成业务 Error，因为业务层不依赖网络层，更不能把网络异常传递给 UI 层。

转译后的 Error 应当包含原始的 Error

```ts
class WrappedError extends Error {
  cause: Error | null
  constructor(cause: Error | null, message?: string) {
    super(message)
    this.cause = cause
  }
}

export class AuthError extends WrappedError {
  constructor(cause: Error | null, message: string = '手机号码或验证码错误') {
    super(cause, message)
    this.name = 'AuthError'
  }
}
```

业务层通常不捕获异常。

UI 层则应当捕获业务层抛出的 Error，提示用户操作失败，或提供重试机会。

UI 层在处理异常时，可以使用 Result Pattern，我们提供了一个辅助方法来帮助使用该模式

```ts
export async function result<T, U = Error>(promise: Promise<T>): Promise<[U | null, T | null]> {
  try {
    const data = await promise
    return [null, data]
  } catch (err) {
    return [err, null]
  }
}
```

但是，不能强迫客户代码使用该模式。也就是说，只应该在方法内部处理异常时使用 Result Pattern，不能将该模式用于方法的返回值中，而是应该抛出异常。

## Socket

(Web)Socket 属于最外层。

当服务器通过 Socket 给 App 发送信息时，相当于用户操作了界面。此时，处理该消息的 Handler 就是控制器，它们依赖 Service，调用 Service 提供的方法操作数据。

当 Service 需要通过 Socket 给服务器发送消息时，Socket 就相当于 Repository，此时，应当遵循 Repository 模式。Service 依赖 Repository 接口，而 Socket 层则实现这一接口。

命名规范：当 Service 中的某个方法是用来处理 Socket 发送的消息时，该方遵循 `receive...Event` 的命名方式。

> 控制器是整洁架构中，第三层（由里及外）的存在

## 事件发布/订阅

当 Service 接收到到来自 Socket 的消息，或者因为用户操作时，往往会改变自己的属性状态，UI 层需要监听这些状态的变化，改变界面来呈现这些变化。

我们通过**发布/订阅**模式来实现这点。

如果 Service 需要发布事件，那么它需要继承 EventEmitter。

```ts
// EventEmitter.ts
export interface EventCallback<T = any> {
  (data: T): void
}

interface Subscriptions {
  [x: string]: EventCallback[]
}

export default class EventEmitter {
  private subs: Subscriptions = {}

  protected emit<T = any>(event: string, data: T) {
    this.subs[event] &&
      this.subs[event].forEach((cb) => {
        cb(data)
      })
  }

  on<T = any>(event: string, cb: EventCallback<T>) {
    ;(this.subs[event] || (this.subs[event] = [])).push(cb)
  }

  once<T = any>(event: string, cb: EventCallback<T>) {
    const callback = (data: T) => {
      cb(data)
      this.off(event, cb)
    }
    this.on(event, callback)
  }

  off<T = any>(event: string, cb: EventCallback<T>) {
    if (this.subs[event]) {
      let index = this.subs[event].findIndex((callback) => callback === cb)
      this.subs[event].splice(index, 1)
      if (!this.subs[event].length) delete this.subs[event]
    }
  }
}
```

emit 方法是受保护的，这意味着，无法在 Service 之外发布事件，确保了事件源的唯一性，这符合唯一真实数据源原则。

```ts
export default class AccountService extends EventEmitter {
  async bindAlipayAccount(userId: number, accessToken: string) {
    const sign = await this.accountRepository.requestAlipayAuthorizedSignature()
    const code = await this.alipayManager.requestAuthCode(sign)
    await this.accountRepository.bindAlipayAccount(userId, code, accessToken)
    const [accounts] = await this.getBindingAccountInfo()
    this.emit(BINDING_ACCOUNT_CHANGE, accounts)
  }
}
```

如上面代码所示，当绑定好支付宝时，发出 `BINDING_ACCOUNT_CHANGE` 事件，对绑定账号信息关心的 UI 就可以监听这个事件来刷新界面。
