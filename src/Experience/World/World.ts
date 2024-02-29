import { Experience } from "../Experience";
import { Lights } from "./Lights";
import {
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

export type WorldEmitter = {
  clear: void;
  distance: number;
  mid: Vector2;
};
export class World extends EventEmitter<WorldEmitter> {
  experience: Experience;
  lights: Lights;
  pcdLoader = new PCDLoader();
  plyLoader = new PLYLoader();
  raycaster = new Raycaster();
  points?: Points;
  coords = new Vector2();
  tLine = new Line2(
    new LineGeometry(),
    new LineMaterial({
      color: "#D73333",
      linewidth: 0.006,
      alphaToCoverage: true,
      transparent: true,
    }),
  );
  tLoader = new TextureLoader();
  measureSpheres = new Points(
    undefined,
    new PointsMaterial({
      size: 10,
      transparent: true,
      sizeAttenuation: false,
      depthTest: false,
    }),
  );
  time: null | number = null;

  mCoords: Vector3[] = [];
  mid: Vector3 | null = null;
  constructor() {
    super();
    this.raycaster.params.Points.threshold = 0.008;
    this.experience = new Experience();
    this.lights = new Lights();
    this.experience.scene.add(this.tLine);
    this.experience.scene.add(this.measureSpheres);
    this.setPoints();
    this.tLoader.load("/portfolio/kek/texture2.png", (t) => {
      this.measureSpheres.material.map = t;
    });
    this.experience.wrapper?.addEventListener("mousemove", (e) => {
      const t = e.target as Element;
      const bounds = t.getBoundingClientRect();
      this.coords.copy({
        x: ((e.clientX - bounds.x) / t.clientWidth) * 2 - 1,
        y: -((e.clientY - bounds.y) / t.clientHeight) * 2 + 1,
      });
      this.raycaster.setFromCamera(
        this.coords,
        this.experience.camera.instance,
      );
      if (this.mCoords.length === 1 && this.points) {
        const point = this.raycaster.intersectObject(this.points, false)?.[0]
          ?.point;
        if (!point) return;
        const g = new LineGeometry();
        g.setPositions([
          this.mCoords[0].x,
          this.mCoords[0].y,
          this.mCoords[0].z,
          point.x,
          point.y,
          point.z,
        ]);
        this.tLine.geometry.dispose();
        this.tLine.geometry = g;
        this.mid = new Vector3().lerpVectors(this.mCoords[0], point, 0.5);
        this.set2DCoords(this.mid);
        this.emit(
          "distance",
          new Vector3().copy(this.mCoords[0]).distanceTo(point) * 100,
        );
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

      if (this.mCoords.length < 2) {
        this.mCoords.push(point);
      }

      const g = new BufferGeometry().setFromPoints(this.mCoords);
      this.measureSpheres.geometry.dispose();
      this.measureSpheres.geometry = g;
      if (this.mCoords.length >= 2) {
        this.tLine.geometry.dispose();
        const g = new LineGeometry();
        g.setPositions([
          this.mCoords[0].x,
          this.mCoords[0].y,
          this.mCoords[0].z,
          this.mCoords[1].x,
          this.mCoords[1].y,
          this.mCoords[1].z,
        ]);
        this.tLine.geometry = g;
        this.emit(
          "distance",
          new Vector3().copy(this.mCoords[0]).distanceTo(this.mCoords[1]) * 100,
        );
        this.mid = new Vector3().lerpVectors(
          this.mCoords[0],
          this.mCoords[1],
          0.5,
        );
        this.set2DCoords(this.mid);
      }
    });

    this.experience.camera.controls.addEventListener("change", () => {
      this.set2DCoords(this.mid);
    });
    this.addHandler("clear", () => {
      this.mCoords = [];
      this.measureSpheres.geometry.dispose();
      this.tLine.geometry.dispose();
      this.measureSpheres.geometry = new BufferGeometry();
      this.tLine.geometry = new LineGeometry();
    });
  }

  async setPoints() {
    // this.points = await this.pcdLoader.loadAsync("/portfolio/kek/high.pcd");
    this.points = new Points(
      await this.plyLoader.loadAsync("/portfolio/kek/result.ply"),
      new PointsMaterial({
        size: 0.02,
        depthWrite: false,
      }),
    );
    this.points.geometry.center();
    this.experience.scene.add(this.points);
  }

  set2DCoords(v3: Vector3 | null) {
    const wrap = this.experience.wrapper;
    if (!wrap || !v3) return;
    const newV = v3.clone();
    newV.project(this.experience.camera.instance);
    const x = (newV.x + 1) / 2;
    const y = -(newV.y - 1) / 2;
    const v2 = new Vector2(x, y);
    this.emit("mid", v2);
  }
}
