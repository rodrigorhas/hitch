import { Box } from "../entities/Box.js";
import { Player } from "../entities/player/Player.js";
import { withGrid } from "../utils/Utils.js";

export const BattleStage = function (game) {
    const entities = [
        Player.make({
            isControlled: true,
            name: 'Player',
            walkSpeed: 10,
            runningSpeed: 15,
            tooltip: {
                color: 'black',
            },
            dimension: {
                width: 32,
                height: 32,
            },
            position: {
                x: withGrid(4),
                y: withGrid(4)
            }
        }),
        // Adiciona alguns blobs inimigos
        // Blob.make({
        //     name: 'Blob 1',
        //     health: 100,
        //     detectionRange: 100,
        //     attackRange: 20,
        //     chaseSpeed: 1.5,
        //     guardSpeed: 0.8,
        //     tooltip: {
        //         color: 'red',
        //     },
        //     dimension: {
        //         width: 24,
        //         height: 24,
        //     },
        //     position: {
        //         x: withGrid(4),
        //         y: withGrid(4)
        //     }
        // }),
        // Blob.make({
        //     name: 'Blob 2',
        //     health: 100,
        //     detectionRange: 100,
        //     attackRange: 20,
        //     chaseSpeed: 1.5,
        //     guardSpeed: 0.8,
        //     tooltip: {
        //         color: 'red',
        //     },
        //     dimension: {
        //         width: 24,
        //         height: 24,
        //     },
        //     position: {
        //         x: withGrid(4),
        //         y: withGrid(3)
        //     }
        // }),
    ];
    
    // Adiciona caixas aleatoriamente pelo mapa
    const boxes = Box.randomBoxes(game, 2);

    game.ecs.entities
        .add(entities)
        .add(boxes)
}