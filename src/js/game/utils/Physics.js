import { Position } from "../components/Position.js";
import { Vector2 } from "../../engine/support/Vectors/Vector2.js";
import { BoxCollider } from "../../engine/support/Collider/BoxCollider.js";

export function separateBoxColliders(entityA, entityB) {
    // Assume each entity's Position is a Vector2 and it has a Collider component with width and height

    const posA = entityA.getComponent(Position);
    const colA = entityA.getComponent(BoxCollider).getBounds();
    const posB = entityB.getComponent(Position);
    const colB = entityB.getComponent(BoxCollider).getBounds();

    // Calculate the centers of each entity
    const centerA = new Vector2(posA.x + colA.width / 2, posA.y + colA.height / 2);
    const centerB = new Vector2(posB.x + colB.width / 2, posB.y + colB.height / 2);

    // Calculate the overlap on each axis
    const delta = Vector2.subtract(centerB, centerA);
    const overlapX = Math.abs(delta.x) - (colA.width / 2 + colB.width / 2);
    const overlapY = Math.abs(delta.y) - (colA.height / 2 + colB.height / 2);

    // Adjust positions to resolve overlap
    // Ensure overlap is negative (indicating an actual overlap)
    if (overlapX < 0 && overlapY < 0) {
        // Determine the minimum amount of movement needed to resolve the overlap
        if (-overlapX < -overlapY) {
            // Horizontal collision, adjust along x-axis
            const adjustment = delta.x > 0 ? new Vector2(overlapX, 0) : new Vector2(-overlapX, 0);
            posA.add(adjustment.divide(2)); // Move entityA half the overlap away
            posB.subtract(adjustment.divide(2)); // Move entityB half the overlap away
        } else {
            // Vertical collision, adjust along y-axis
            const adjustment = delta.y > 0 ? new Vector2(0, overlapY) : new Vector2(0, -overlapY);
            posA.add(adjustment.divide(2)); // Move entityA half the overlap away
            posB.subtract(adjustment.divide(2)); // Move entityB half the overlap away
        }
    }
}

export default {
    separateBoxColliders
}