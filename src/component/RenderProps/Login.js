import React from 'react';

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



export default Login;
