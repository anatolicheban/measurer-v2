import { Camera, Vector2, Vector3 } from "three";

export class Utils {
  static get2DProjection(v3: Vector3, camera: Camera) {
    const newV = v3.clone();
    newV.project(camera);
    const x = (newV.x + 1) / 2;
    const y = -(newV.y - 1) / 2;
    return new Vector2(x, y);
  }
  static getDistance(start: Vector3, end: Vector3, inCm = true) {
    return new Vector3().copy(start).distanceTo(end) * (inCm ? 100 : 1);
  }
  static getMiddle(start: Vector3, end: Vector3) {
    return new Vector3().lerpVectors(start, end, 0.5);
  }
}
