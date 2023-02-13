export const requireImage = (link: string) => {
  return new URL(`../assets/${link}`, import.meta.url).href;
};
