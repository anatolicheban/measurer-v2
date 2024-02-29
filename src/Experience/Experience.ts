import { Scene } from "three";
import { Camera } from "./Camera";
import { Renderer } from "./Renderer";
import { Sizes } from "./Utils/Sizes";
import { Time } from "./Utils/Time";
import { World } from "./World/World";

let instance: Experience;

export class Experience {
  canvas: HTMLCanvasElement | null;
  sizes: Sizes;
  time: Time;
  scene: Scene;
  camera: Camera;
  world: World;
  renderer: Renderer;
  wrapper: HTMLElement | null;
  constructor(
    element?: HTMLCanvasElement | null,
    wrapper?: HTMLElement | null,
  ) {
    if (instance) {
      return instance;
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    instance = this;

    //Options
    this.canvas = element || null;
    this.wrapper = wrapper || null;

    //Setup
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new Scene();

    // this.resources = new Resources(sources);
    this.camera = new Camera();
    this.world = new World();
    this.renderer = new Renderer();

    this.sizes.addHandler("resize", () => {
      this.resize();
    });
    this.time.addHandler("tick", () => {
      this.update();
    });
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    this.renderer.update();
    this.camera.update();
  }
}
