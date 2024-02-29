import { AmbientLight, DirectionalLight, HemisphereLight } from "three";
import { Experience } from "../Experience";

export class Lights {
  experience = new Experience();

  constructor() {
    const ambientLight = new AmbientLight(0xffffff);
    this.experience.scene.add(ambientLight);
    const directionalLight = new DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(6, 5, 7);
    this.experience.scene.add(directionalLight);
    const directionalLight2 = new DirectionalLight(0xffffff, 1.2);
    directionalLight2.position.set(-6, 5, -7);
    this.experience.scene.add(directionalLight2);
    const hemisphereLight = new HemisphereLight(0xffffff, 0xc9c9c9, 3);
    this.experience.scene.add(hemisphereLight);
  }
}
