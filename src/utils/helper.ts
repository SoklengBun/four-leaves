export const requireImage = (link: string) => {
  return new URL(`../assets/${link}`, import.meta.url).href;
};

const getRandom = (num1: number, num2: number) => {
  return Math.floor(Math.random() * num2) + num1;
};

const getRadomPosition = (num1: number, num2: number) => {
  const posOrNeg = Math.random() < 0.5 ? -1 : 1;

  return getRandom(num1, num2) * posOrNeg;
};

export { getRandom, getRadomPosition };
