
## React的未来

### React的渲染

#### React的同步渲染

React 一直用的是同步渲染，这样对 React 实现非常直观方便，但是会带来性能问题。

假设有一个超大的 React 组件树结构，有 1000 个组件，每个组件平均使用 1 毫秒，那么，要做一次完整的渲染就要花费 1000 毫秒也就是 1 秒钟，然而 JavaScript 运行环境是单线程的，也就是说，React 用同步渲染方式，渲染最根部组件的时候，会同步引发渲染子组件，再同步渲染子组件的子组件……最后完成整个组件树。在这 1 秒钟内，同步渲染霸占 JavaScript 唯一的线程，其他的操作什么都做不了，在这 1 秒钟内，如果用户要点击什么按钮，或者在某个输入框里面按键，都不会看到立即的界面反应，这也就是俗话说的“卡顿”。

在同步渲染下，要解决“卡顿”的问题，只能是尽量缩小组件树的大小，以此缩短渲染时间，但是，应用的规模总是在增大的，不是说缩小就能缩小的，虽然我们利用定义 shouldComponentUpdate 的方法可以减少不必要的渲染，但是这也无法从根本上解决大量同步渲染带来的“卡顿”问题。

#### React的异步渲染

React Fiber 引入了异步渲染，有了异步渲染之后，React 组件的渲染过程是分时间片的，不是一口气从头到尾把子组件全部渲染完，而是每个时间片渲染一点，然后每个时间片的间隔都可去看看有没有更紧急的任务（比如用户按键），如果有，就去处理紧急任务，如果没有那就继续照常渲染。

根据 React Fiber 的设计，一个组件的渲染被分为两个阶段：第一个阶段（也叫做 render 阶段）是可以被 React 打断的，一旦被打断，这阶段所做的所有事情都被废弃，当 React 处理完紧急的事情回来，依然会重新渲染这个组件，这时候第一阶段的工作会重做一遍；第二个阶段叫做 commit 阶段，一旦开始就不能中断，也就是说第二个阶段的工作会稳稳当当地做到这个组件的渲染结束。

两个阶段的分界点，就是 render 函数。render 函数之前的所有生命周期函数（包括 render)都属于第一阶段，之后的都属于第二阶段。

开启异步渲染，虽然我们获得了更好的感知性能，但是考虑到第一阶段的的生命周期函数可能会被重复调用，不得不对历史代码做一些调整。

在 React v16.3 之前，render 之前的生命周期函数（也就是第一阶段生命周期函数）包括这些：

- componentWillReceiveProps
- shouldComponentUpdate
- componentWillUpdate
- componentWillMount
- render

React v16.3之前生命周期函数
![React v16.3之前生命周期函数](https://user-gold-cdn.xitu.io/2018/11/14/1670f0f2d4d06575?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

一个典型的错误用例，也是我被问到做多的问题之一：为什么不在 componentWillMount 里去做AJAX？componentWillMount 可是比 componentDidMount 更早调用啊，更早调用意味着更早返回结果，那样性能不是更高吗？

##### getDerivedStateFromProps

到了 React v16.3，React 引入了一个新的生命周期函数 getDerivedStateFromProps，这个生命周期函数是一个 static 函数，在里面根本不能通过 this 访问到当前组件，输入只能通过参数，对组件渲染的影响只能通过返回值。getDerivedStateFromProps 应该是一个纯函数，React 就是通过要求这种纯函数，强制开发者们必须适应异步渲染。

```JavaScript
static getDerivedStateFromProps(nextProps, prevState) {
  //根据nextProps和prevState计算出预期的状态改变，返回结果会被送给setState
}
```

React v16.3之后生命周期函数
![React v16.3之后生命周期函数](https://user-gold-cdn.xitu.io/2018/11/14/1670f0fc08e10440?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

还有另外2个捕获异常的生命周期函数
第一阶段(render阶段) getDerivedStateFromError
第二阶段(commit阶段) componentDidCatch

#### 适应异步渲染的组件原则

现在写代码必须要为未来的某一次 React 版本升级做好准备，当 React 开启异步渲染的时候，你的代码应该做到在 render 之前最多只能这些函数被调用：

1. 构造函数
2. getDerivedStateFromProps
3. shouldComponentUpdate
幸存的这些第一阶段函数，除了构造函数，其余两个全都必须是纯函数，也就是不应该做任何有副作用的操作。

实际上，如果之前你的用法规范，除了 shouldComponentUpdate 不怎么使用第一阶段生命周期函数，你还会发现不怎么需要改动代码，比如 componentWillMount 中的代码移到构造函数中就可以了。但是如果用法错乱，比如滥用componentWillReceiveProps，那就不得不具体情况具体分析，从而决定这些代码移到什么位置。

有个错误案例: componentWillMount中调用AJAX函数, 这样是不可取的

- 一个组件的 componentWillMount 比 componentDidMount 也早调用不了几微秒，性能没啥提高
- 等到异步渲染开启的时候，componentWillMount 就可能被中途打断，中断之后渲染又要重做一遍, 在 componentWillMount 中做 AJAX 调用，代码里看到只有调用一次，但是实际上可能调用 N 多次，这明显不合适。相反，若把 AJAX 放在 componentDidMount，因为 componentDidMount 在第二阶段，所以绝对不会多次重复调用，这才是 AJAX 合适的位置

### Suspnse的异步操作

因为异步渲染的原因, React 会有两件“大事”发生，会彻底改变我们的代码模式。

- Suspense, 用同步的代码来实现异步操作
- Hooks

#### Suspense

用同步的代码来实现异步操作
应用的场合就是异步数据处理，最常见的就是通过 AJAX 从服务器获取数据

```JavaScript
const Foo = () => {
  const data = createFetcher(callAJAX).read();
  return <div>{data}</div>;
}
```

componentDidCatch 就是 JavaScript 语法中的 catch，而对应的 try 覆盖所有的子组件

```JavaScript
try {
  //渲染子组件
} catch (error) {
  // componentDidCatch被调用
}
```

Suspense 就是巧妙利用 componentDidCatch 来实现同步形式的异步处理。
Suspense 提供的 createFetcher 函数会封装异步操作，当尝试从 createFetcher 返回的结果读取数据时，有两种可能：一种是数据已经就绪，那就直接返回结果；还有一种可能是异步操作还没有结束，数据没有就绪，这时候 createFetcher 会抛出一个“异常”。
createFetcher 抛出的这个“异常”比较特殊，这个“异常”实际上是一个 Promise 对象，这个 Promise 对象代表的就是异步操作，操作结束时，也是数据准备好的时候。当 componentDidCatch 捕获这个 Promise 类型的“异常”时，就可以根据这个 Promise 对象的状态改变来重新渲染对应组件，第二次渲染，肯定就能够成功。

```JavaScript
var NO_RESULT = {};
// createFetcher 的参数 task 被调用应该返回一个 Promise 对象，这个对象在第一次调用时会被 throw 出去，但是，只要这个对象完结，那么 result 就有实际的值，不会再被 throw。
export const createFetcher = (task) => {
  let result = NO_RESULT;

  return () => {
    const p = task();

    p.then(res => {
      result = res;
    });

    if (result === NO_RESULT) {
      throw p;
    }

    return result;
  }
}
```

createFetcher 配合 Suspense

```JavaScript
class Suspense extends React.Component {
  state = {
    pending: false
  }

  componentDidCatch(error) {
    // 如果捕获的 error 是 Promise 类型，那就说明子组件用 createFetcher 获取异步数据了，就会等到它完结之后重设 state，引发一次新的渲染过程，因为 createFetcher 中会记录异步返回的结果，新的渲染就不会抛出异常了。
    if (typeof error.then === 'function') {
      this.setState({pending: true});

      error.then(() => this.setState({
        pending: false
      }));
    }
  }

  render() {
    return this.state.pending ? null : this.props.children;
  }
}
```

Suspense的使用

getName 利用 setTimeout 模拟了异步 AJAX 获取数据，第一次渲染 Greeting 组件时，会有 Promise 类型的异常抛出，被 Suspense 捕获。1 秒钟之后，当 getName 返回实际结果的时候，Suspense 会引发重新渲染，这一次 Greeting 会显示出 hello Morgan。

```JavaScript
const getName = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve('Morgan');
  }, 1000);
})

const fetcher = createFetcher(getName);

const Greeting = () => {
  return <div>Hello {fetcher()}</div>
};

const SuspenseDemo = () => {
  return (
    <Suspense>
      <Greeting />
    </Suspense>
  );
};
```

```JavaScript
import React, {Suspense} from 'react';
// React 发布 v16.6.0 的时候，提供了 Suspense 组件，直接支持 Suspense 功能，但是还没有正式提供 createFetcher 的功能，只发布了一个独立但不稳定的 react-cache 包
import {unstable_createResource as createResource} from 'react-cache';

const getName = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve('Morgan');
  }, 1000);
})

const resource = createResource(getName);

const Greeting = () => {
  return <div>hello {resource}</div>
};

// 一个页面中包括头部的 Header、左侧的导航栏 LeftPanel 和右侧的内容 Content，其中只有 Header 的渲染不依赖于 API

// 网页首先显示 Header，然后无论 LeftPanel 还是 Content 中谁的 AJAX 首先返回结果，都可以立刻显示对应模块，而不用等待所有 AJAX 都返回才让用户看到更新

const LoadingSpin = () => <div>Loading...</div>;
const LeftPanel = ...;
const Content = ...;

const SuspenseDemo = () => {
  return (
    <div>
      <Header />
      <Suspense fallback={<LoadingSpin />}>
          <LeftPanel />
      </Suspense>
      <Suspense fallback={<LoadingSpin />}>
          <Content />
      </Suspense>
    </div>
  );
};
```

Suspense 被推出之后，可以极大地减少异步操作代码的复杂度。

之前，只要有 AJAX 这样的异步操作，就必须要用两次渲染来显示 AJAX 结果，这就需要用组件的 state 来存储 AJAX 的结果，用 state 又意味着要把组件实现为一个 class。总之，我们需要做这些：

实现一个 class；
class 中需要有 state；
需要实现 componentDidMount 函数；
render 必须要根据 this.state 来渲染不同内容。
有了 Suspense 之后，不需要做上面这些杂事，只要一个函数形式组件就足够了。

在介绍 Redux 时，我们提到过在 Suspense 面前，Redux 的一切异步操作方案都显得繁琐，读者现在应该能够通过代码理解这一点了。

很可惜，目前 Suspense 还不支持服务器端渲染，当 Suspense 支持服务器端渲染的时候，那就真的会对 React 社区带来革命性影响。

### 函数化的Hooks

Hook 使你在非 class 的情况下可以使用更多的 React 特性。 React 组件一直更像是函数, 而 Hook 则拥抱了函数

Hook 是一些可以让你在函数组件里“钩入” React state 及生命周期等特性的函数。Hook 不能在 class 组件中使用 —— 这使得你不使用 class 也能使用 React

useState 就是一个 Hook
useState 会返回一对值：当前状态和一个让你更新它的函数, 可以在事件处理函数中或其他一些地方调用这个函数。
类似 class 组件的 this.setState，但是它不会把新的 state 和旧的 state 进行合并
useState 唯一的参数就是初始 state, 不同于 this.state，这里的 state 不一定要是一个对象(它也可以是)
这个初始 state 参数只有在第一次渲染的会被用到

```JavaScript
import React, { useState } from 'react';

function Counter() {
  // 声明一个叫 “count” 的 state 变量。
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

Counter 拥有自己的“状态”，但它只是一个函数，不是 class。

多个state变量, React 是完全根据 useState 的调用顺序来“记住”状态归属的。

```JavaScript
function ExampleWithManyStates() {
  // 声明多个 state 变量
  const [age, setAge] = useState(42);
  const [fruit, setFruit] = useState('banana');
  const [todos, setTodos] = useState([{ text: 'Learn Hooks' }]);
  // ...
}
```

每一次渲染 Counter 都要由 React 发起，所以它有机会准备好一个内存记录，当开始执行的时候，每一次 useState 调用对应内存记录上一个位置，而且是按照顺序来记录的。React 不知道你把 useState 等 Hooks API 返回的结果赋值给什么变量，但是它也不需要知道，它只需要按照 useState 调用顺序记录就好了。
所以不能再循环或者判断中使用 Hooks, 因为条件判断，让每次渲染中 useState 的调用次序不一致了，React 就会错乱了。

```JavaScript
const Counter = () => {
    const [count, setCount] = useState(0);
    if (count % 2 === 0) {
        const [foo, updateFoo] = useState('foo');
    }
    const [bar, updateBar] = useState('bar');
  ...
}
```

#### useEffect

除了 useState，React 还提供 useEffect，用于支持组件中增加副作用的支持。


在 React 组件生命周期中如果要做有副作用的操作，代码放在 componentDidMount 或者 componentDidUpdate 里，但是这意味着组件必须是一个 class。

在 Counter 组件，如果我们想要在用户点击“+”或者“-”按钮之后把计数值体现在网页标题上，这就是一个修改 DOM 的副作用操作，所以必须把 Counter 写成 class

```JavaScript
componentDidMount() {
  document.title = `Count: ${this.state.count}`;
}

componentDidUpdate() {
  document.title = `Count: ${this.state.count}`;
}
```

useEffect，使用就不用写成 class

```JavaScript
import { useState, useEffect } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = `Count: ${count}`;
  });

  return (
    <div>
       <div>{count}</div>
       <button onClick={() => setCount(count + 1)}>+</button>
       <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  );
};
```

useEffect 的参数是一个函数，组件每次渲染之后，都会调用这个函数参数，这样就达到了 componentDidMount 和 componentDidUpdate 一样的效果。
