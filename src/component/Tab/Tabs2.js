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

class Tabs2 extends React.Component {
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


export default Tabs2;
 