import React from './react';
import ReactDOM from './react-dom';

function MyFunctionComponent(props) {
  return (
    <div style={{ color: 'blue' }}>
      Hello Simple React
      <span>
        <div>child1</div>
      </span>
      <span>child2</span>
    </div>
  );
}

ReactDOM.render(<MyFunctionComponent />, document.getElementById('root'));
