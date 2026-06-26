import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import { userLogin, userQuickLogin, userSignUp } from '~/services/user';
import type { LoginForm, SignUpForm } from '~/services/user';
import showToast from '~/utils/toast';
import type { User } from '~/types/user';

export const useAuth = defineStore('auth', () => {
  const token = useLocalStorage<string | null>('auth_token', null);
  const isLoggedIn = ref<boolean>(false);
  const user = ref<User | null>(null);

  const quickLogin = async () => {
    if (!token.value) return;
    const { data } = await userQuickLogin();

    if (data.value.code !== 0) {
      showToast({ message: data.value.message, type: 'error' });
      token.value = null; // clear invalid token
      return;
    }

    isLoggedIn.value = true;
    user.value = (data.value.data.user as User) ?? null;
    const tokenStr = (data.value.data && (data.value.data.token as string)) ?? null;
    if (tokenStr) token.value = tokenStr;
  };

  const login = async ({ username, password }: LoginForm) => {
    const { data } = await userLogin({ username, password });

    if (data.value.code !== 0) {
      showToast({ message: data.value.message, type: 'error' });
      return;
    }

    isLoggedIn.value = true;
    // set user and token if API returns payload
    user.value = (data.value.data.user as User) ?? null;
    const tokenStr = (data.value.data && (data.value.data.token as string)) ?? null;
    if (tokenStr) token.value = tokenStr;

    return true;
  };

  const signUp = async ({ username, password, name }: SignUpForm) => {
    const { data } = await userSignUp({ username, password, name });

    if (data.value.code !== 0) {
      showToast({ message: data.value.message, type: 'error' });
      return;
    }

    isLoggedIn.value = true;
    user.value = (data.value.data.user as User) ?? null;
    const tokenStr = (data.value.data && (data.value.data.token as string)) ?? null;
    if (tokenStr) token.value = tokenStr;

    return true;
  };

  const logout = () => {
    isLoggedIn.value = false;
    user.value = null;
    token.value = null;
  };

  return { isLoggedIn, user, token, login, signUp, logout, quickLogin };
});
