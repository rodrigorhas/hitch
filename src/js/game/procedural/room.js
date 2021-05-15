import { createSlot } from "./slot.js";

export const sampleRooms = [
    createSlot({
        name: 'single room',
        width: 2,
        height: 3,
    }),

    createSlot({
        name: 'couple room',
        width: 2,
        height: 6,
    }),

    createSlot({
        name: 'master room',
        width: 6,
        height: 8,
    }),
];
