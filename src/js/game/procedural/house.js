export const createHouse = (config, presets) => {
    const slots = [];

    for (const slotType in config.slots) {
        if (config.slots.hasOwnProperty(slotType)) {
            let slotCount = config.slots[slotType];
            const slotPresets = presets[slotType];

            while (slotCount > 0) {
                slots.push(
                    pickRandomPreset(slotPresets)
                );

                slotCount--;
            }
        }
    }

    return {
        ...config,
        rooms: slots
    }
}

export const pickRandomPreset = (presets = []) => {
    return presets[Math.floor(Math.random() * presets.length)];
}
