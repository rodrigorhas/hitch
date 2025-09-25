import { Position } from "../components/Position.js";
import { Vector2 } from "../../engine/support/Vectors/Vector2.js";
import { BoxCollider } from "../../engine/support/Collider/BoxCollider.js";

export function separateBoxColliders(entityA, entityB) {
    // Get position and collider bounds for both entities
    const posA = entityA.getComponent(Position);
    const colA = entityA.getComponent(BoxCollider).getBounds();
    const posB = entityB.getComponent(Position);
    const colB = entityB.getComponent(BoxCollider).getBounds();

    // Calculate the overlap on each axis using AABB intersection
    const leftA = colA.x;
    const rightA = colA.x + colA.width;
    const topA = colA.y;
    const bottomA = colA.y + colA.height;

    const leftB = colB.x;
    const rightB = colB.x + colB.width;
    const topB = colB.y;
    const bottomB = colB.y + colB.height;

    // Check if there's an overlap
    const overlapX = Math.min(rightA, rightB) - Math.max(leftA, leftB);
    const overlapY = Math.min(bottomA, bottomB) - Math.max(topA, topB);

    // Only resolve if there's actually an overlap
    if (overlapX > 0 && overlapY > 0) {
        // Determine which axis has the smaller overlap
        if (overlapX < overlapY) {
            // Resolve horizontal overlap
            const centerA = leftA + colA.width / 2;
            const centerB = leftB + colB.width / 2;
            
            if (centerA < centerB) {
                // EntityA is to the left, move it further left
                posA.x -= overlapX / 2;
                posB.x += overlapX / 2;
            } else {
                // EntityA is to the right, move it further right
                posA.x += overlapX / 2;
                posB.x -= overlapX / 2;
            }
        } else {
            // Resolve vertical overlap
            const centerA = topA + colA.height / 2;
            const centerB = topB + colB.height / 2;
            
            if (centerA < centerB) {
                // EntityA is above, move it further up
                posA.y -= overlapY / 2;
                posB.y += overlapY / 2;
            } else {
                // EntityA is below, move it further down
                posA.y += overlapY / 2;
                posB.y -= overlapY / 2;
            }
        }
    }
}

export default {
    separateBoxColliders
}