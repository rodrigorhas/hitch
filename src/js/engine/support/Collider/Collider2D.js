export class Collider2D {
    /**
     * @param {BoxCollider} box1
     * @param {BoxCollider} box2
     * @returns {boolean}
     */
    static BoxColliding(box1, box2) {
        return !(
            box1.bounds.x > box2.bounds.x + box2.bounds.width
            || box1.bounds.x + box1.bounds.width < box2.bounds.x
            || box1.bounds.y > box2.bounds.y + box2.bounds.height
            || box1.bounds.y + box1.bounds.height < box2.bounds.y
        );
    }

    /**
     * @param {Vector2} point
     * @param {BoxCollider} box
     * @return boolean
     */
    static PointBoxColliding(point, box) {
        const { x, y, w, h } = box.bounds

        return (point.x > x && point.x < x + w && point.y > y && point.y < y + h);
    }

    /**
     * @param {CircleCollider} circle
     * @param {Vector2} point
     * @return boolean
     */
    static CirclePointColliding(circle, point) {
        return Math.sqrt(
            (circle.bounds.x - point.x) * (circle.bounds.x - point.x) +
            (circle.bounds.y - point.y) * (circle.bounds.y - point.y)
        ) < circle.bounds.radius
    }

    /**
     * @param {BoxCollider} box1
     * @param {BoxCollider} box2
     * @return boolean
     */
    static BoxBoxColliding(box1, box2) {
        return (
            box1.bounds.x <= box2.bounds.x + box2.bounds.width && box1.bounds.x + box1.bounds.width >= box2.bounds.x &&
            box1.bounds.y <= box2.bounds.y + box2.bounds.height && box1.bounds.y + box1.bounds.height > box2.bounds.y
        )
    }

    /**
     * @param {CircleCollider} circle1
     * @param {CircleCollider} circle2
     * @return boolean
     */
    static CircleCircleColliding(circle1, circle2) {
        return (
            Math.sqrt(
                (circle1.bounds.x - circle2.bounds.x) * (circle1.bounds.x - circle2.bounds.x) +
                (circle1.bounds.y - circle2.bounds.y) * (circle1.bounds.y - circle2.bounds.y)
            ) < circle1.bounds.radius + circle2.bounds.radius
        )
    }

    /**
     * @param {BoxCollider} box
     * @param {CircleCollider} circle
     * @return boolean
     */
    static BoxCircleColliding(box, circle) {
        // Get the distance between the two objects
        const distX = Math.abs(circle.bounds.x - box.bounds.x - box.bounds.width / 2);
        const distY = Math.abs(circle.bounds.y - box.bounds.y - box.bounds.height / 2);

        // Check to make sure it is definitely not overlapping
        if (distX > (box.bounds.width / 2 + circle.bounds.radius)) {
            return false;
        }

        if (distY > (box.bounds.height / 2 + circle.bounds.radius)) {
            return false;
        }

        // Check to see if it is definitely overlapping
        if (distX <= (box.bounds.width / 2)) {
            return true;
        }

        if (distY <= (box.bounds.height / 2)) {
            return true;
        }

        // Last Resort to see if they are overlapping
        const dx = distX - box.bounds.width / 2;
        const dy = distY - box.bounds.height / 2;

        return (dx * dx + dy * dy <= (circle.bounds.radius * circle.bounds.radius));
    }
}
