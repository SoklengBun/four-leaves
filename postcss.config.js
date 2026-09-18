module.exports = {
  plugins: {
    tailwindcss: {},
    'postcss-pxtorem': {
      rootValue: 16, // 设计稿宽度/10，如设计稿为1920px，则设为192
      propList: ['*'], // 需要转换的属性，*表示所有
      selectorBlackList: [], // 忽略的选择器
      replace: true,
      mediaQuery: false,
      minPixelValue: 0,
      exclude: /node_modules/i,
    },
    autoprefixer: {},
  },
};
