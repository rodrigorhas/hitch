export const randomHash = (size = 7) => Math.random().toString(36).substring(size)
export const randomHex = () => '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
export const randomNumber = (min, max) => Math.random() * (max - min) + min;
export const fastRandomNumber = (min, max) => (Math.random() * (max - min + 1) ) << 0
