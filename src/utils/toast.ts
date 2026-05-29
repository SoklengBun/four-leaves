import { reactive } from 'vue';

export type ToastType = 'normal' | 'success' | 'warning' | 'error';

export type Toast = {
  id: number;
  message: string;
  type: ToastType;
  timeout: number;
};

const state = reactive({
  toasts: [] as Toast[],
});

export const toasts = state.toasts;

export function showToast(opts: { message: string; type?: ToastType; timeout?: number }) {
  const { message, type = 'normal', timeout = 3000 } = opts;
  const id = Date.now() + Math.floor(Math.random() * 1000);
  const t: Toast = { id, message, type, timeout };
  state.toasts.push(t);

  if (timeout > 0) {
    setTimeout(() => removeToast(id), timeout);
  }

  return id;
}

export function removeToast(id: number) {
  const idx = state.toasts.findIndex((s) => s.id === id);
  if (idx >= 0) state.toasts.splice(idx, 1);
}

export default showToast;
