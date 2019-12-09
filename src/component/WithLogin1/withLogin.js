// 不使用高阶组件

import React from 'react';

const getUserId = () => {
  // 获取登陆信息
}

const LogoutButton = () => {
  if (getUserId()) {
    return <div>退出登录</div>;
  } else {
    return null;
  }
};

const ShoppintCart = () => {
  if (getUserId()) {
    return <div>购物车</div>;
  } else {
    return null;
  }
};

const Contrainer = () => (
  <div>
    <LogoutButton/>
    <ShoppintCart/>
  </div>
)

export default Contrainer