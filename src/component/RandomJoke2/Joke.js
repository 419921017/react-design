import React from 'react';

class Joke extends React.PureComponent {
  render() {
    return (
      <div>
        {this.props.value || 'loading...' }
      </div>
    );
  }
}

export default Joke;