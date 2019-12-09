// 使用高阶组件

import React from './node_modules/react';

const getUserId = () => {
  // 获取登陆信息
}

// 在高阶组件中判断登陆
const withLogin = (Component) => {
  const NewComponent = (props) => {
    if (getUserId()) {
      return <Component {...props} />;
    } else {
      return null;
    }
  }
  return NewComponent;
};

const LogoutButton = withLogin(<div>退出登录</div>);

const ShoppintCart = withLogin(<div>购物车</div>);


const Contrainer = () => (
  <div>
    <LogoutButton/>
    <ShoppintCart/>
  </div>
)

export default Contrainer