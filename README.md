# React的设计模式分享

模式(Pattern) = 问题场景(Context) + 解决办法(Solution)

模式需要应对正确的场合，才会发挥最大的威力

## 组件设计模式

### 聪明组件和傻瓜组件

在`React`应用中，最简单也是最常用的一种组件模式，就是“聪明组件和傻瓜组件”。

为什么要分割聪明组件和傻瓜组件?

软件设计中有一个原则，叫做“责任分离”（Separation of Responsibility），简单说就是让一个模块的责任尽量少，如果发现一个模块功能过多，就应该拆分为多个模块，让一个模块都专注于一个功能，这样更利于代码的维护。

把获取和管理数据这件事和界面渲染这件事分开, 把获取和管理数据的逻辑放在父组件，也就是聪明组件, 把渲染界面的逻辑放在子组件，也就是傻瓜组件

#### 傻瓜组件

聪明组件的 `render` 函数一般都这样，渲染不是他们操心的业务，他们的主业是获取数据

如果要优化界面，只需要去修改傻瓜组件 `Joke`，如果你想改进数据管理和获取，只需要去修改聪明组件 `RandomJoke`。

如此一来，维护工作就简单多了，你甚至可以把两个组件分配各两个不同的开发者去维护开发。

#### PureComponent

函数形式的`React`组件，好处是不需要管理 `state`，占用资源少，但是，函数形式的组件无法利用 `shouldComponentUpdate`

当 `RandomJoke` 要渲染 `Joke` 时，即使传入的`props``是一模一样的，Joke` 也要走一遍完整的渲染过程，这就显得浪费了。

好一点的方法，是把 Joke 实现为一个类，而且定义 shouldComponentUpdate 函数，每次渲染过程中，在 render 函数执行之前 shouldComponentUpdate 会被调用，如果返回 true，那就继续，如果返回 false，那么渲染过程立刻停止，因为这代表不需要重画了。

对于傻瓜组件，因为逻辑很简单，界面完全由 `props` 决定，所以 `shouldComponentUpdate` 的实现方式就是比较这次渲染的 `props` 是否和上一次 `props` 相同。当然，让每一个组件都实现一遍这样简单的 `shouldComponentUpdate` 也很浪费，所以，React 提供了一个简单的实现工具 `PureComponent`，可以满足绝大部分需求。

`PureComponent` 中 `shouldComponentUpdate` 对 `props` 做得只是浅层比较，不是深层比较，如果 `props` 是一个深层对象，就容易产生问题。

两次渲染传入的某个 `props` 都是同一个对象，但是对象中某个属性的值不同，这在 `PureComponent` 眼里，`props` 没有变化，不会重新渲染，但是这明显不是我们想要的结果。

#### React.memo

虽然 `PureComponent` 可以提高组件渲染性能，但是它也不是没有代价的，它逼迫我们必须把组件实现为 `class`，不能用纯函数来实现组件。

如果你使用 `React v16.6.0` 之后的版本，可以使用一个新功能 `React.memo` 来完美实现 `React` 组件。

```JavaScript
const Joke = React.memo((props) => (
  <div>
      {props.value || 'loading...' }
  </div>
));
```

React.memo 既利用了 `shouldComponentUpdate`，又不要求我们写一个 `class`，这也体现出`React`逐步向完全函数式编程前进。

### 高阶组件(HoC)

在开发`React`组件过程中，很容易发现这样一种现象，某些功能是多个组件通用的，如果每个组件都重复实现这样的逻辑，肯定十分浪费，而且违反了“不要重复自己”（DRY，Don't Repeat Yourself)的编码原则，我们肯定需要要把这部分共用逻辑提取出来重用。

我们首先想到的是当然是把共用逻辑提取为一个 `React` 组件。不过，有些情况下，这些共用逻辑还没法成为一个独立组件，换句话说，这些共用逻辑单独无法使用，它们只是对其他组件的功能加强。

举个例子，对于很多网站应用，有些模块都需要在用户已经登录的情况下才显示。比如，对于一个电商类网站，“退出登录”按钮、“购物车”这些模块，就只有用户登录之后才显示，对应这些模块的`React`组件如果连“只有在登录时才显示”的功能都重复实现，那就浪费了。

“高阶组件”名为“组件”，其实并不是一个组件，而是一个函数，只不过这个函数比较特殊，它接受至少一个`React`组件为参数，并且能够返回一个全新的`React`组件作为结果，当然，这个新产生的`React`组件是对作为参数的组件的包装。

最简单的高阶组件

高阶组件的命名一般都带 with 前缀，命名中后面的部分代表这个高阶组件的功能

1. 高阶组件不能去修改作为参数的组件，高阶组件必须是一个**纯函数**，不应该有任何副作用。
2. 高阶组件返回的结果必须是一个新的`React`组件，这个新的组件的 JSX 部分肯定会包含作为参数的组件。
3. 高阶组件一般需要把传给自己的 props 转手传递给作为参数的组件。

```JavaScript
const withDoNothing = (Component) => {
  const NewComponent = (props) => {
    return <Component {...props} />;
  };
  return NewComponent;
};
```

#### 用高阶组件抽取共同逻辑

#### 高阶组件的高级用法

高阶组件只需要返回一个`React`组件即可，没人规定高阶组件只能接受一个`React`组件作为参数，完全可以传入多个`React`组件给高阶组件。

```JavaScript
const withLoginAndLogout = (ComponentForLogin, ComponentForLogout) => {
  const NewComponent = (props) => {
    if (getUserId()) {
      return <ComponentForLogin {...props} />;
    } else {
      return <ComponentForLogout {...props} />;
    }
  }
  return NewComponent;
};
```

#### 链式调用高阶组件

高阶组件最巧妙的一点，是可以链式调用。

假设，你有三个高阶组件分别是 withOne、withTwo 和 withThree，那么，如果要赋予一个组件 X 某个高阶组件的超能力，那么，你要做的就是挨个使用高阶组件包装，代码如下：

```JavaScript
const X1 = withOne(X);
const X2 = withTwo(X1);
const X3 = withThree(X2);
//最终的SuperX具备三个高阶组件的超能力
const SuperX = X3;
```

我们可以避免使用中间变量 X1 和 X2，直接连续调用高阶组件

```JavaScript
const SuperX = withThree(withTwo(withOne(X)));
```

对于 X 而言，它被高阶组件包装了，至于被一个高阶组件包装，还是被 N 个高阶组件包装，没有什么差别。而高阶组件本身就是一个纯函数，纯函数是可以组合使用的，所以，我们其实可以把多个高阶组件组合为一个高阶组件，然后用这一个高阶组件去包装X

```JavaScript
const hoc = compose(withThree, withTwo, withOne);
const SuperX = hoc(X);

// compose，是函数式编程中的一种方法，把多个函数组合为一个函数
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```

React 组件可以当做积木一样组合使用，现在有了 `compose`，我们就可以把高阶组件也当做积木一样组合，进一步重用代码。

假如一个应用中多个组件都需要同样的多个高阶组件包装，那就可以用 `compose` 组合这些高阶组件为一个高阶组件，这样在使用多个高阶组件的地方实际上就只需要使用一个高阶组件了。

#### 不要滥用高阶组件

高阶组件虽然可以用一种可重用的方式扩充现有`React`组件的功能，但高阶组件并不是绝对完美的。

首先，高阶组件不得不处理 displayName，不然 debug 会很麻烦。
当`React`渲染出错的时候，靠组件的 displayName 静态属性来判断出错的组件类，而高阶组件总是创造一个新的`React`组件类，所以，每个高阶组件都需要处理一下 displayName。

每个高阶组件都这么写，就会非常的麻烦。

```JavaScript
const withExample = (Component) => {
  const NewComponent = (props) => {
    return <Component {...props} />;
  }
  
  NewComponent.displayName = `withExample(${Component.displayName || Component.name || 'Component'})`;
  
  return NewCompoennt;
};
```

对于`React`生命周期函数，高阶组件不用怎么特殊处理，但是，如果内层组件包含定制的静态函数，这些静态函数的调用在`React`生命周期之外，那么高阶组件就必须要在新产生的组件中增加这些静态函数的支持，这更加麻烦。

高阶组件支持嵌套调用，这是它的优势。但是如果真的一大长串高阶组件被应用的话，当组件出错，你看到的会是一个超深的 stack trace，十分痛苦。

使用高阶组件，一定要非常小心，要避免重复产生`React`组件，比如，下面的代码是有问题的
每一次渲染 Example，都会用高阶组件产生一个新的组件，虽然都叫做 EnhancedFoo，但是对`React`来说是一个全新的东西，在重新渲染的时候不会重用之前的虚拟 DOM，会造成极大的浪费。

```JavaScript
const Example = () => {
  const EnhancedFoo = withExample(Foo);
  return <EnhancedFoo />
}
```

正确的写法是下面这样，自始至终只有一个 EnhancedFoo 组件类被创建

```JavaScript
const EnhancedFoo = withExample(Foo);

const Example = () => {
  return <EnhancedFoo />
}
```

### render props 模式

#### render props

所谓 render props，指的是让`React`组件的 props 支持函数这种模式。因为作为 props 传入的函数往往被用来渲染一部分界面，所以这种模式被称为 render props

这个 RenderAll 预期子组件是一个函数，它所做的事情就是把子组件当做函数调用，调用参数就是传入的 props，然后把返回结果渲染出来，除此之外什么事情都没有做

```JavaScript
const RenderAll = (props) => {
  return(
    <React.Fragment>
      {props.children(props)}
    </React.Fragment>
  );
};

<RenderAll>
  {() => <h1>hello world</h1>}
</RenderAll>
```

#### 传递props

render props 和高阶组件的第一个区别，就是 render props 是真正的`React`组件，而不是一个返回`React`组件的函数。

```JavaScript
const getUserId = () => {
  // 获取登陆信息
}

const Login = (props) => {
  const userName = getUserId();

  if (userName) {
    const allProps = {userName, ...props};
    return (
      <React.Fragment>
        {props.children(allProps)}
      </React.Fragment>
    );
  } else {
    return null;
  }
};


<Login>
  {({userName}) => <h1>Hello {userName}</h1>}
</Login>
```

#### 不局限于 children

render props 这个模式不必局限于 children 这一个 props，任何一个 props 都可以作为函数，也可以利用多个 props 来作为函数

```JavaScript
const Auth= (props) => {
  const userName = getUserName();

  if (userName) {
    const allProps = {userName, ...props};
    return (
      <React.Fragment>
        {props.login(allProps)}
      </React.Fragment>
    );
  } else {
    <React.Fragment>
      {props.nologin(props)}
    </React.Fragment>
  }
};

// 可以分别通过 login 和 nologin 两个 props 来指定用户登录或者没登录时显示什么
<Auth
  login={({userName}) => <h1>Hello {userName}</h1>}
  nologin={() => <h1>Please login</h1>}
/>
```

#### 依赖注入

render props 其实就是`React`世界中的“依赖注入”（Dependency Injection)。

所谓依赖注入，指的是解决这样一个问题：逻辑 A 依赖于逻辑 B，如果让 A 直接依赖于 B，当然可行，但是 A 就没法做得通用了。依赖注入就是把 B 的逻辑以函数形式传递给 A，A 和 B 之间只需要对这个函数接口达成一致就行，如此一来，再来一个逻辑 C，也可以用一样的方法重用逻辑 A。

### render props和高阶组件比较

1. render props 模式的应用，就是做一个`React`组件; 而高阶组件，虽然名为“组件”，其实只是一个产生`React`组件的函数

2. render props 没有高阶组件有那么多毛病，render props 不能像高阶组件那样链式调用

3. render props 相对于高阶组件还有一个显著优势，就是对于新增的 props 更加灵活。高阶组件限定死了参数, 如果参数名称发生了改变, 还需要做映射, render props就很轻松

当需要重用`React`组件的逻辑时，首先看这个功能是否可以抽象为一个简单的组件
如果行不通的话，考虑是否可以应用 render props 模式；再不行的话，才考虑应用高阶组件模式

### 提供者模式(Provider Pattern)

在`React`中，props 是组件之间通讯的主要手段，但是，有一种场景单纯靠 props 来通讯是不恰当的，那就是两个组件之间间隔着多层其他组件

![多层组件通信]('./img/more.png)

在`React`中，解决跨级的信息传递问题应用的就是“提供者模式”。

#### 提供者模式

提供者模式有两个角色，一个叫“提供者”（Provider），另一个叫“消费者”（Consumer），这两个角色都是`React`组件。

其中“提供者”在组件树上居于比较靠上的位置，“消费者”处于靠下的位置。

既然名为“提供者”，它可以提供一些信息，而且这些信息在它之下的所有组件，无论隔了多少层，都可以直接访问到，而不需要通过 props 层层传递

相对于context，组合模式更加简单

#### 实现提供者模式

使用 Context 功能，能够创造一个“上下文”，在这个上下文笼罩之下的所有组件都可以访问同样的数据。

当`React`发布 v16.3.0 时，终于提供了“正式版本”的 Context 功能 API

提供者模式的一个典型用例就是实现“样式主题”（Theme），由顶层的提供者确定一个主题，下面的样式就可以直接使用对应主题里的样式。这样，当需要切换样式时，只需要修改提供者就行，其他组件不用修改。

### 组合组件

组合组件模式：父组件想要传递一些信息给子组件，但是，如果用 props 传递又显得十分麻烦。

```JavaScript

const TabItem = (props) => {
  const {active, onClick} = props;
  const tabStyle = {
    'max-width': '150px',
    color: active ? 'red' : 'green',
    border: active ? '1px red solid' : '0px',
  };
  return (
    <h1 style={tabStyle} onClick={onClick}>
      {props.children}
    </h1>
  );
};
// active决定哪个TabItem显示
// onClick触发active改变
<Tab>
  <TabItem active={true} onClick={this.onClick}>One</TabItem>
  <TabItem active={false} onClick={this.onClick}>Two</TabItem>
  <TabItem active={false} onClick={this.onClick}>Three</TabItem>
</Tab>

```

```JavaScript
class Tabs extends React.Component {
  state = {
    activeIndex:  0
  }
  render() {
    // React.Children.map, 遍历children中的子元素
    const newChildren = React.Children.map(this.props.children, (child, index) => {
      if (child.type) {
        // React.cloneElement(), 复制某个元素, 添加props
        return React.cloneElement(child, {
          active: this.state.activeIndex === index,
          onClick: () => this.setState({activeIndex: index})
        });
      } else {
        return child;
      }
    });
    return (
      <Fragment>
        {newChildren}
      </Fragment>
    );
  }
}

```

对于组合组件这种实现方式，TabItem 非常简化；Tabs 稍微麻烦了一点，但是好处就是把复杂度都封装起来了，从使用者角度，连 props 都看不见。

应用组合组件的往往是共享组件库，把一些常用的功能封装在组件里，让应用层直接用就行。在 antd 和 bootstrap 这样的共享库中，都使用了组合组件这种模式。
