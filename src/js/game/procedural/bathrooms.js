import { createSlot } from "./slot.js";

export const sampleBathrooms = [
    createSlot({
        name: 'small bathroom',
        width: 1,
        height: 1,
    }),

    createSlot({
        name: 'medium bathroom',
        width: 2,
        height: 4,
    }),

    createSlot({
        name: 'large bathroom',
        width: 6,
        height: 4,
    }),
];
