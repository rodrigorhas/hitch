/**
 * Input configuration for the game
 * This allows for easy key mapping and customization
 */
export class InputConfig {
    static KEY_MAPPINGS = {

        // Skill keys
        SKILL_1: ['1'],
        SKILL_2: ['2'],
        SKILL_3: ['3'],
        SKILL_4: ['4'],

        // Movement keys
        MOVE_LEFT: ['a', 'A', 'ArrowLeft'],
        MOVE_RIGHT: ['d', 'D', 'ArrowRight'],
        MOVE_UP: ['w', 'W', 'ArrowUp'],
        MOVE_DOWN: ['s', 'S', 'ArrowDown'],
        
        // Action keys
        INTERACT: ['e', 'E', 'Enter'],
        ATTACK: [' ', 'Space'],
        DEFEND: ['z', 'Z'],
        
        // System keys
        PAUSE: ['p', 'P', 'Escape'],
        DEBUG: ['.'],
        RESET: ['r', 'R'],
        TOGGLE_RUN: ['q', 'Q'],
        SPAWN_ENTITIES: [','],
        
        // Mouse buttons
        MOUSE_LEFT: [0],
        MOUSE_RIGHT: [2],
        MOUSE_MIDDLE: [1]
    };

    static GAMEPAD_MAPPINGS = {
        // D-pad
        MOVE_LEFT: [14], // D-pad left
        MOVE_RIGHT: [15], // D-pad right
        MOVE_UP: [12], // D-pad up
        MOVE_DOWN: [13], // D-pad down
        
        // Face buttons
        INTERACT: [0], // A button
        JUMP: [1], // B button
        ATTACK: [2], // X button
        DEFEND: [3], // Y button
        
        // Shoulder buttons
        PAUSE: [8], // Start button
        DEBUG: [9], // Select button
        
        // Triggers
        LEFT_TRIGGER: [6],
        RIGHT_TRIGGER: [7]
    };

    /**
     * Check if a key matches any of the configured keys for an action
     * @param {string} action - The action to check
     * @param {string} key - The key that was pressed
     * @returns {boolean}
     */
    static isKeyMapped(action, key) {
        const mappings = this.KEY_MAPPINGS[action];
        if (!mappings) return false;
        
        return mappings.includes(key);
    }

    /**
     * Check if a gamepad button matches any of the configured buttons for an action
     * @param {string} action - The action to check
     * @param {number} button - The button that was pressed
     * @returns {boolean}
     */
    static isGamepadButtonMapped(action, button) {
        const mappings = this.GAMEPAD_MAPPINGS[action];
        if (!mappings) return false;
        
        return mappings.includes(button);
    }

    /**
     * Get all keys mapped to an action
     * @param {string} action - The action to get keys for
     * @returns {string[]}
     */
    static getKeysForAction(action) {
        return this.KEY_MAPPINGS[action] || [];
    }

    /**
     * Get all gamepad buttons mapped to an action
     * @param {string} action - The action to get buttons for
     * @returns {number[]}
     */
    static getGamepadButtonsForAction(action) {
        return this.GAMEPAD_MAPPINGS[action] || [];
    }

    /**
     * Add a new key mapping for an action
     * @param {string} action - The action to map
     * @param {string} key - The key to map
     */
    static addKeyMapping(action, key) {
        if (!this.KEY_MAPPINGS[action]) {
            this.KEY_MAPPINGS[action] = [];
        }
        if (!this.KEY_MAPPINGS[action].includes(key)) {
            this.KEY_MAPPINGS[action].push(key);
        }
    }

    /**
     * Remove a key mapping for an action
     * @param {string} action - The action to unmap
     * @param {string} key - The key to unmap
     */
    static removeKeyMapping(action, key) {
        if (this.KEY_MAPPINGS[action]) {
            const index = this.KEY_MAPPINGS[action].indexOf(key);
            if (index > -1) {
                this.KEY_MAPPINGS[action].splice(index, 1);
            }
        }
    }
}