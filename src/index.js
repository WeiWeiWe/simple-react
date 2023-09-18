import React, { useState } from './react';
import ReactDOM from './react-dom';

function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return <button onClick={handleClick}>You pressed me {count} times</button>;
}

ReactDOM.render(<Counter />, document.getElementById('root'));
