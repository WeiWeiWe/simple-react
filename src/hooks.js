import { emitUpdateForHooks } from './react-dom';

const states = [];
let hookIndex = 0;

export function resetHookIndex() {
  hookIndex = 0;
}

export function useState(initialValue) {
  states[hookIndex] = states[hookIndex] || initialValue;
  const currentIndex = hookIndex;
  function setState(newState) {
    states[currentIndex] = newState;
    emitUpdateForHooks();
  }
  return [states[hookIndex++], setState];
}

export function useReducer(reducer, initialValue) {
  states[hookIndex] = states[hookIndex] || initialValue;
  const currentIndex = hookIndex;
  function dispatch(action) {
    states[currentIndex] = reducer(states[currentIndex], action);
    emitUpdateForHooks();
  }
  return [states[hookIndex++], dispatch];
}

export function useEffect(effectFunction, deps = []) {
  const [destroyFunction, preDeps] = states[hookIndex] || [null, null];
  const currentIndex = hookIndex;
  if (
    !states[hookIndex] ||
    deps.some((item, index) => item !== preDeps[index])
  ) {
    setTimeout(() => {
      destroyFunction && destroyFunction();
      states[currentIndex] = [effectFunction(), deps];
    });
  }
  hookIndex++;
}

export function useLayoutEffect(effectFunction, deps = []) {
  const [destroyFunction, preDeps] = states[hookIndex] || [null, null];
  const currentIndex = hookIndex;
  if (
    !states[hookIndex] ||
    deps.some((item, index) => item !== preDeps[index])
  ) {
    queueMicrotask(() => {
      destroyFunction && destroyFunction();
      states[currentIndex] = [effectFunction(), deps];
    });
  }
  hookIndex++;
}
