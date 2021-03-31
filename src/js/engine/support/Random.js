export const randomHash = (length = 7) => [ ...Array(length) ].map(() => (~~(Math.random() * 36)).toString(36)).join('');
export const randomHex = () => '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
export const randomNumber = (min, max) => Math.random() * (max - min) + min;
export const fastRandomNumber = (min, max) => (Math.random() * (max - min + 1) ) << 0

