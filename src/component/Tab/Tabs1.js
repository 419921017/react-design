import React, {Fragment} from 'react';

// 傻瓜组件
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

class Tabs1 extends React.Component {
  state = {}
  onClick = () => {}
  render() { 
    return (
      <Fragment>
        <TabItem active={true} onClick={this.onClick}>One</TabItem>
        <TabItem active={false} onClick={this.onClick}>Two</TabItem>
        <TabItem active={false} onClick={this.onClick}>Three</TabItem> 
      </Fragment>
    );
  }
}

export default Tabs1;

// 每次使用 TabItem 都要传递一堆 props，好麻烦；
// 每增加一个新的 TabItem，都要增加对应的 props，更麻烦；
// 如果要增加 TabItem，就要去修改 Tabs 的 JSX 代码，超麻烦。

