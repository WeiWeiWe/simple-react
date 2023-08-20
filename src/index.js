import React from './react';
import ReactDOM from './react-dom';

ReactDOM.render(
  <div style={{ color: 'blue' }}>
    Hello Simple React
    <span>
      <div>child1</div>
    </span>
    <span>child2</span>
  </div>,
  document.getElementById('root')
);
