import React from 'react';

const Joke = React.memo((props) => (
  <div>
      {props.value || 'loading...' }
  </div>
));

export default Joke;