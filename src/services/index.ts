import { createFetch, useLocalStorage } from '@vueuse/core';

const baseUrl = import.meta.env.VITE_API_BASEURL;

// keep a single reactive ref for the token (handles SSR safely)
const tokenRef = useLocalStorage<string | null>('auth_token', null);

const useAppFetch = createFetch({
  baseUrl,
  options: {
    beforeFetch({ options }) {
      options.headers = {
        ...options.headers,
      };

      const token = tokenRef.value;
      if (token) {
        (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }

      return { options };
    },
    updateDataOnError: true,
    onFetchError(ctx) {
      console.log('Fetch error:', ctx);
      return {
        ...ctx,
        data: {
          code: -1,
          message: 'Network error',
          data: null,
        },
      };
    },
  },
});

export default useAppFetch;
