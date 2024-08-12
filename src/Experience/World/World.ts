import { Experience } from "../Experience";
import { Lights } from "./Lights";
import {
  AxesHelper,
  Box3,
  BufferGeometry,
  Points,
  PointsMaterial,
  Raycaster,
  TextureLoader,
  Vector2,
  Vector3,
} from "three";
import { PCDLoader } from "three/addons/loaders/PCDLoader.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { EventEmitter } from "../Utils/EventEmitter.ts";

import { Line2 } from "three/addons/lines/Line2.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { Utils } from "../Utils";
import { Tooltip3D } from "../../App.tsx";

const MODEL_SIZE = 5;

export type WorldEmitter = {
  clear: void;
  tooltips: Tooltip3D[];
};

const line = new Line2(
  new LineGeometry(),
  new LineMaterial({
    color: "#D73333",
    linewidth: 0.006,
    alphaToCoverage: true,
    transparent: true,
  }),
);

export class World extends EventEmitter<WorldEmitter> {
  experience = new Experience();
  lights = new Lights();
  pcdLoader = new PCDLoader();
  plyLoader = new PLYLoader();
  raycaster = new Raycaster();
  points?: Points;
  coords = new Vector2();
  lines: Line2[] = [];
  tLoader = new TextureLoader();

  ratio?: number;

  measureSpheres = new Points(
    undefined,
    new PointsMaterial({
      size: 10,
      transparent: true,
      sizeAttenuation: false,
      depthTest: false,
    }),
  );
  allCoords: Vector3[] = [];
  time: null | number = null;

  linesCoords: [Vector3, Vector3][] = [];

  mCoords: Vector3[] = [];
  constructor() {
    super();
    this.raycaster.params.Points.threshold = 0.03;
    this.experience.scene.add(new AxesHelper(2.5));
    this.experience.scene.add(this.measureSpheres);
    this.setPoints();
    this.tLoader.load("/portfolio/measurer/texture2.png", (t) => {
      this.measureSpheres.material.map = t;
    });
    this.experience.wrapper?.addEventListener("mousemove", (e) => {
      const t = e.target as Element;
      const bounds = t.getBoundingClientRect();
      this.coords.copy({
        x: ((e.clientX - bounds.x) / t.clientWidth) * 2 - 1,
        y: -((e.clientY - bounds.y) / t.clientHeight) * 2 + 1,
      });
      if (this.mCoords.length === 1 && this.points) {
        this.raycaster.setFromCamera(
          this.coords,
          this.experience.camera.instance,
        );
        const point = this.raycaster.intersectObject(this.points, false)?.[0]
          ?.point;
        if (!point) return;

        const lastLine = this.lines[this.lines.length - 1];
        if (!lastLine) return;
        const [p] = this.mCoords;
        lastLine.geometry = new LineGeometry().setPositions([
          p.x,
          p.y,
          p.z,
          point.x,
          point.y,
          point.z,
        ]);
        const lastCoord = this.linesCoords[this.linesCoords.length - 1];
        if (lastCoord) {
          lastCoord[1].copy(point);
        }
        this.set2DCoords();
      }
    });
    this.experience.wrapper?.addEventListener("mousedown", () => {
      this.time = Date.now();
    });
    this.experience.wrapper?.addEventListener("click", () => {
      const t = Date.now();
      if (this.time && t - this.time > 300) return;
      if (!this.points) return;
      this.raycaster.setFromCamera(
        this.coords,
        this.experience.camera.instance,
      );
      const point = this.raycaster.intersectObject(this.points, false)?.[0]
        ?.point;
      if (!point) return;

      //Real coords!
      if (this.ratio) {
        const realVec = new Vector3().copy(point).divideScalar(this.ratio);
        console.log(realVec);
      }

      this.allCoords.push(point);
      this.measureSpheres.geometry = new BufferGeometry().setFromPoints(
        this.allCoords,
      );

      this.mCoords.push(point);

      if (this.mCoords.length === 1) {
        const newLine = line.clone();
        this.lines.push(newLine);
        this.experience.scene.add(newLine);
        const [p] = this.mCoords;
        newLine.geometry = new LineGeometry().setPositions([p.x, p.y, p.z]);
        this.linesCoords.push([p, new Vector3()]);
      } else {
        const [p, p2] = this.mCoords;
        const lastLine = this.lines[this.lines.length - 1];
        const lastCoord = this.linesCoords[this.linesCoords.length - 1];
        if (!lastLine) return;
        if (lastCoord) {
          lastCoord[1].copy(p2);
        }
        lastLine.geometry = new LineGeometry().setPositions([
          p.x,
          p.y,
          p.z,
          p2.x,
          p2.y,
          p2.z,
        ]);
        this.mCoords = [];
      }
    });

    this.experience.camera.controls.addEventListener("change", () => {
      this.set2DCoords();
    });
    this.addHandler("clear", () => {
      this.mCoords = [];
      this.linesCoords = [];
      this.allCoords = [];
      this.measureSpheres.geometry.dispose();
      this.measureSpheres.geometry = new BufferGeometry();
      this.lines.forEach((el) => {
        line.geometry.dispose();
        line.material.dispose();
        this.experience.scene.remove(el);
      });
      this.lines = [];
    });
  }

  async setPoints() {
    // this.points = await this.pcdLoader.loadAsync("/portfolio/kek/high.pcd");
    this.points = new Points(
      await this.plyLoader.loadAsync("/test.ply"),
      new PointsMaterial({
        size: 0.005,
        depthWrite: false,
      }),
    );
    this.points.rotation.x = -Math.PI / 2;
    this.points.geometry.center();
    const box = new Box3().setFromObject(this.points);
    this.ratio = MODEL_SIZE / (box.max.z - box.min.z);
    this.points.scale.setScalar(this.ratio);

    this.experience.scene.add(this.points);
  }

  set2DCoords() {
    // const v2 = Utils.get2DProjection(v3, this.experience.camera.instance);
    if (!this.linesCoords.length || !this.ratio) return;
    const tooltips: Tooltip3D[] = this.linesCoords.map((el) => {
      return {
        pos: Utils.get2DProjection(
          Utils.getMiddle(el[0], el[1]),
          this.experience.camera.instance,
        ),
        distance:
          Utils.getDistance(el[0], el[1], false) / (this.ratio as number),
      };
    });
    this.emit("tooltips", tooltips);
  }
}
