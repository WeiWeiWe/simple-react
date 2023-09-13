import React from './react';
import ReactDOM from './react-dom';

class ClassComponent extends React.Component {
  counter = 0;
  constructor(props) {
    super(props);
    this.state = {
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
    );
  }
}

const ForwardRefFunctionComponent = React.forwardRef((props, ref) => {
  return <input ref={ref} />;
});

function FunctionComponent(props) {
  const forwardRef = React.createRef();
  const classRef = React.createRef();
  const elementRef = React.createRef();
  const changeInput = () => {
    forwardRef.current.value = 'ForwardRef...';
    classRef.current.updateShowText('100');
    elementRef.current.value = '...';
  };

  return (
    <div>
      <div>
        <ForwardRefFunctionComponent ref={forwardRef} />
      </div>
      <div>
        <input ref={elementRef} />
      </div>
      <div>
        <input type="button" onClick={changeInput} value="點擊加省略號" />
      </div>
      <div>
        <ClassComponent ref={classRef} />
      </div>
    </div>
  );
}

ReactDOM.render(<FunctionComponent />, document.getElementById('root'));
