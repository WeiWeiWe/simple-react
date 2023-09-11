import React from './react';
import ReactDOM from './react-dom';

// function MyFunctionComponent(props) {
//   return (
//     <div style={{ color: 'blue' }}>
//       Hello Simple React
//       <span>
//         <div>child1</div>
//       </span>
//       <span>child2</span>
//     </div>
//   );
// }

class MyClassComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      testState: 'child4',
    };
  }

  render() {
    return (
      <div style={{ color: 'blue' }}>
        Hello Simple React
        <div>child1</div>
        <div>child2</div>
        <div>{this.props.testProps}</div>
        <div>{this.state.testState}</div>
      </div>
    );
  }
}

ReactDOM.render(
  <MyClassComponent testProps="child3" />,
  document.getElementById('root')
);
