import { EventEmitter } from "./EventEmitter";

export class Time extends EventEmitter<{ tick: undefined }> {
  start: number;
  current: number;
  elapsed: number;
  delta: number;

  constructor() {
    super();

    //Setup
    this.start = Date.now();
    this.current = this.start;
    this.elapsed = 0;
    this.delta = 16;

    this.tick();
  }

  tick() {
    const currentTime = Date.now();
    this.delta = currentTime - this.current;
    this.current = currentTime;
    this.elapsed = this.current - this.start;
    this.emit("tick", undefined);
    window.requestAnimationFrame(() => {
      this.tick();
    });
  }
}
