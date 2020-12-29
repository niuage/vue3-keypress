import { watch, onMounted, onUnmounted } from 'vue';
import keyCodes from './key_codes.js';

const supportedModifiers = ['altKey', 'metaKey', 'ctrlKey', 'shiftKey'];

const useKeypress = ({ keyEvent, keyBinds, onAnyKey, isActive: isListenerActiveRef }) => {
  let eventListener = null;

  for (let keyBind of keyBinds) {
    keyBind.keyCode = keyCodes[keyBind.keyCode] || keyBind.keyCode;
  }

  const addListener = () => {
    if (!eventListener) eventListener = eventHandler();
    window.addEventListener(keyEvent, eventListener);
  }

  const removeListener = () => {
    if (!eventListener) return;
    window.removeEventListener(keyEvent, eventListener);
  }

  const eventHandler = () => {
    return (event) => {
      const callbackData = (eventData = {}) => ({ event, keyEvent, ...eventData });

      if (typeof onAnyKey == "function") onAnyKey(callbackData({ any: true }));

      for (const { keyCode, modifiers, success, preventDefault = true } of keyBinds) {
        // Check if the correct keys have been clicked:
        if (keyCode !== event.keyCode) continue;

        if (modifiers && modifiers.length > 0) {
          if (!requiredModifiersPressed(event, modifiers)) continue;
        } else {
          if (anyModifiersPress(event, modifiers)) continue;
        }

        if (preventDefault) event.preventDefault();

        // SUCCESS -> the correct key was pressed if we got to this point
        success(callbackData({ keyCode, modifiers, preventDefault }));

        return !preventDefault;
      }
    }
  }

  const requiredModifiersPressed = (event, modifiers) => {
    return supportedModifiers.every(
      (modifier) => event[modifier] == (modifiers.indexOf(modifier) !== -1)
    )
  }

  const anyModifiersPress = (event, modifiers) => {
    return supportedModifiers.some((modifier) => !!event[modifier]);
  }

  if (isListenerActiveRef) {
    if (isListenerActiveRef.value) addListener();

    watch(isListenerActiveRef, (active) => active ? addListener() : removeListener());
  } else {
    onMounted(() => addListener());
  }

  onUnmounted(() => removeListener());
}

export {
  useKeypress
}