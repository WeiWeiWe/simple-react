import React, { useRef, useImperativeHandle } from './react';
import ReactDOM from './react-dom';

const MyInput = React.forwardRef(function MyInput(props, ref) {
  const inputRef = useRef(null);
  useImperativeHandle(ref, () => {
    return {
      focus() {
        inputRef.current.focus();
      },
    };
  });
  return <input {...props} ref={inputRef} />;
});

function Form() {
  const ref = useRef(null);

  function handleClick() {
    ref.current.focus();
  }

  return (
    <div>
      <MyInput ref={ref} />
      <button onClick={handleClick}>Focus the input</button>
    </div>
  );
}

ReactDOM.render(<Form />, document.getElementById('root'));
