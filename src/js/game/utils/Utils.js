import Constants from "./Constants.js";

export const withGrid = (value) => value * Constants.TILE_SIZE
export const toGridCell = (value) => Math.round(value / Constants.TILE_SIZE)

export const noop = () => {};