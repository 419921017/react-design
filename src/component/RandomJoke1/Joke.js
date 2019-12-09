import React from 'react';

const Joke = ({value}) => {
  return (
    <div>
      {value || 'loading...' }
    </div>
  );
}

export default Joke;