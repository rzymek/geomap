import { checkIntersection } from "line-intersect";

interface Point {
    x: number,
    y: number
};
interface Line {
    p1: Point,
    p2: Point
};
export function lineIntersecion(line1: Line, line2: Line): Point {
    const result = checkIntersection(
        line1.p1.x, line1.p1.y,
        line1.p2.x, line1.p2.y,
        line2.p1.x, line2.p1.y,
        line2.p2.x, line2.p2.y,
    );
    return result.point;
}