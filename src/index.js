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
  counter = 0;
  constructor(props) {
    super(props);
    this.state = {
      testState: 'child4',
      count: '0',
    };
  }
  updateShowText(newText) {
    this.setState({
      count: newText + '',
    });
  }
  render() {
    return (
      <div style={{ color: 'blue' }}>
        Hello Simple React
        <div>child1</div>
        <div>child2</div>
        <div>{this.props.testProps}</div>
        <div>{this.state.testState}</div>
        <div
          style={{
            color: 'red',
            cursor: 'pointer',
            border: '1px solid gray',
            borderRadius: '6px',
            display: 'inline-block',
            padding: '6px 12px',
          }}
          onClick={() => this.updateShowText(++this.counter)}
        >
          Count: {this.state.count}
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <MyClassComponent testProps="child3" />,
  document.getElementById('root')
);
