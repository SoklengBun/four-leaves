export const disableContextMenu = () => {
  document.addEventListener('contextmenu', (e) => e.preventDefault());
};

const ctrlKey = (e: KeyboardEvent, keyCode: string) => {
  return e.ctrlKey && e.key === keyCode;
};

const ctrlShiftKey = (e: KeyboardEvent, keyCode: string) => {
  return e.ctrlKey && e.shiftKey && e.keyCode === keyCode.charCodeAt(0);
};

export const disableDevToolWithKeyboard = () => {
  document.onkeydown = (e: KeyboardEvent) => {
    // Disable F12, Ctrl + Shift + I, Ctrl + Shift + J, Ctrl + U
    if (
      e.key === 'F12' ||
      ctrlKey(e, 'U') ||
      ctrlShiftKey(e, 'I') ||
      ctrlShiftKey(e, 'J') ||
      ctrlShiftKey(e, 'C')
    )
      return false;
    return;
  };
};
