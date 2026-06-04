export const requireImage = (link: string) => {
  return new URL(`../assets/${link}`, import.meta.url).href;
};

export const getRandom = (num1: number, num2: number) => {
  return Math.floor(Math.random() * num2) + num1;
};

export const getRadomPosition = (num1: number, num2: number) => {
  const posOrNeg = Math.random() < 0.5 ? -1 : 1;

  return getRandom(num1, num2) * posOrNeg;
};

export const pxToRem = (px: number, withUnit = true) => {
  // root size 16px
  const rootFontSize = 16;

  const rem = px / rootFontSize;

  if (withUnit) return rem + 'rem';

  return rem;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const pxOfCurrentScreenSize = (px: number) => {
  const currentRoot = getComputedStyle(document.documentElement).fontSize.replace('px', '');

  // root size 16px
  const rootFontSize = 16;

  return (px / rootFontSize) * +currentRoot;
};
