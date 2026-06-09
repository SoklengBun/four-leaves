import defaultImage from '../assets/images/Priconne_Kokkoro_hurt.png';

export const imageDirective = (el: HTMLImageElement) => {
  el.onerror = () => {
    el.src = defaultImage;
  };

  //   const origin = window.location.origin;
  //   if (!el.src?.includes(origin)) return;
  //   if (el.src?.includes('assets')) return;
  //   if (el.src?.includes('/upload/image')) {
  //     const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;
  //     if (el.src?.includes(imageBaseUrl)) return;
  //     try {
  //       const url = new URL(el.src);
  //       const path = url.pathname.replace('/upload/image', '');
  //       el.src = `${imageBaseUrl}${path}`;
  //     } catch (error) {
  //       console.error('Invalid URL:', el.src, error);
  //     }
  //     return;
  //   }
  //   return;
};
