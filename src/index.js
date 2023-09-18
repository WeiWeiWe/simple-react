import React, { useReducer } from './react';
import ReactDOM from './react-dom';

function reducer(state, action) {
  if (action.type === 'incremented') {
    return {
      age: state.age + 1,
    };
  }
  throw Error('Unknown action.');
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { age: 18 });

  function handleClick() {
    dispatch({ type: 'incremented' });
  }

  return (
    <div>
      <button onClick={handleClick}>Increment age</button>
      <p>I'm {state.age}</p>
    </div>
  );
}

ReactDOM.render(<Counter />, document.getElementById('root'));
