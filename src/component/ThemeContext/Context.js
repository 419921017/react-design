import React from 'react';
import PropTypes from 'prop-types';

class ThemeProvider extends React.Component {
  getChildContext() {
    return {
      theme: this.props.value
    };
  }

  render() {
    return (
      <React.Fragment>
        {this.props.children}
      </React.Fragment>
    );
  }
}

ThemeProvider.childContextTypes = {
  theme: PropTypes.object
};

// 通过this.context访问
class Subject extends React.Component {
  render() {
    const {mainColor} = this.context.theme;
    return (
      <h1 style={{color: mainColor}}>
        {this.props.children}
      </h1>
    );
  }
}

Subject.contextTypes = {
  theme: PropTypes.object
}

// 函数式组件的第二个参数是context
const Paragraph = (props, context) => {
  const {textColor} = context.theme;
  return (
    <p style={{color: textColor}}>
      {props.children}
    </p>
  );
};

Paragraph.contextTypes = {
  theme: PropTypes.object
};

export default {
  ThemeProvider,
  Subject,
  Paragraph
};