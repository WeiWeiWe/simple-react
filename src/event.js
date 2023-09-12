import { updaterQueue, flushUpdaterQueue } from './Component';

export function addEvent(dom, eventName, bindFunction) {
  dom.attach = dom.attach || {};
  dom.attach[eventName] = bindFunction;

  // 事件合成機制核心點一： 事件綁定到 document 上
  if (document[eventName]) return;
  document[eventName] = dispatchEvent;
}

function dispatchEvent(nativeEvent) {
  updaterQueue.isBatch = true;

  // 事件合成機制核心點二： 屏蔽瀏覽器之間的差異
  const syntheticEvent = createSyntheticEvent(nativeEvent);

  let target = nativeEvent.target;
  while (target) {
    syntheticEvent.currentTarget = target;
    const eventName = `on${nativeEvent.type}`;
    const bindFunction = target.attach && target.attach[eventName];
    bindFunction && bindFunction(syntheticEvent);
    if (syntheticEvent.isPropagationStopped) {
      break;
    }
    target = target.parentNode;
  }

  flushUpdaterQueue();
}

function createSyntheticEvent(nativeEvent) {
  const natvieEventKeyValues = {};
  for (const key in nativeEvent) {
    // function 需要把 this 指向綁定過去，避免有 this 指向錯誤的情況
    natvieEventKeyValues[key] =
      typeof nativeEvent[key] === 'function'
        ? nativeEvent[key].bind(nativeEvent)
        : nativeEvent[key];
  }

  const syntheticEvent = Object.assign(natvieEventKeyValues, {
    nativeEvent,
    isDefaultPrevented: false, // 是否阻止默認行為
    isPropagationStopped: false, // 是否阻止冒泡
    preventDefault: function () {
      this.isDefaultPrevented = true;
      if (this.nativeEvent.preventDefault) {
        this.nativeEvent.preventDefault();
      } else {
        this.nativeEvent.returnValue = false;
      }
    },
    stopPropagation: function () {
      this.isPropagationStopped = true;
      if (this.nativeEvent.stopPropagation) {
        this.nativeEvent.stopPropagation();
      } else {
        this.nativeEvent.cancelBubble = true;
      }
    },
  });
  return syntheticEvent;
}
