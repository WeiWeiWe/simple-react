import React from './react';
import ReactDOM from './react-dom';

class DerivedState extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prevName: 'aaa',
      email: 'aaa@xxx.com',
    };
  }
  static getDerivedStateFromProps(props, state) {
    if (props.name !== state.prevName) {
      return {
        prevName: props.name,
        email: props.name + '@xxx.com',
      };
    }
  }
  render() {
    return (
      <div>
        <h1>Email:</h1>
        <h2>{this.state.email}</h2>
      </div>
    );
  }
}

class ParentClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'aaa',
    };
  }
  changeName = () => {
    this.setState({
      name: 'bbb',
    });
  };
  render() {
    return (
      <div>
        <input
          type="button"
          value="點擊改變id"
          onClick={() => this.changeName()}
        />
        <DerivedState name={this.state.name} />
      </div>
    );
  }
}

ReactDOM.render(<ParentClass />, document.getElementById('root'));
