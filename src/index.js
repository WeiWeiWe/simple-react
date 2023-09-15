import React from './react';
import ReactDOM from './react-dom';

class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
    };
  }
  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000);
    console.log('componentDidMount');
  }
  componentWillUnmount() {
    clearInterval(this.timerID);
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdate', this.state.date);
  }
  tick() {
    this.setState({
      date: new Date(),
    });
  }
  render() {
    return (
      <div>
        <h1>It is {this.state.date.toLocaleTimeString()}.</h1>
      </div>
    );
  }
}

ReactDOM.render(<Clock />, document.getElementById('root'));
