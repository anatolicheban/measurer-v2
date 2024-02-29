import { Experience } from "./Experience";
import { PerspectiveCamera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class Camera {
  experience: Experience = new Experience();
  instance: PerspectiveCamera;
  controls: OrbitControls;

  constructor() {
    this.setInstance();
    this.setControls();
  }

  setInstance() {
    this.instance = new PerspectiveCamera(
      35,
      this.experience.sizes.width / this.experience.sizes.height,
      0.1,
      100,
    );
    this.instance.position.set(-1, 1, 1);
    this.experience.scene.add(this.instance);
  }

  resize() {
    this.instance.aspect =
      this.experience.sizes.width / this.experience.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  setControls() {
    this.controls = new OrbitControls(
      this.instance,
      this.experience.canvas as HTMLElement,
    );
    this.controls.enableDamping = true;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 10;
  }

  update() {
    this.controls.update();
  }
}
