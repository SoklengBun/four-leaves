import useAppFetch from '.';

export type LoginForm = {
  username: string;
  password: string;
};

export type SignUpForm = {
  username: string;
  password: string;
  name: string;
};

export const userQuickLogin = async () => {
  return useAppFetch('user/quick-login').get().json();
};

export const userLogin = async (payload: LoginForm) => {
  return useAppFetch('user/login').post(payload).json();
};

export const userSignUp = async (payload: SignUpForm) => {
  return useAppFetch('user/register').post(payload).json();
};
