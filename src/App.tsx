import { useEffect, useRef, useState } from "react";
import { Experience } from "./Experience/Experience.ts";
import { Vector2 } from "three";

export type Tooltip3D = { pos: Vector2; distance: number };

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  const [exp, setExp] = useState<Experience | null>(null);

  const [toolTips, setTooltips] = useState<Tooltip3D[]>([]);

  useEffect(() => {
    setExp(new Experience(canvasRef.current, viewerRef.current));
  }, []);

  useEffect(() => {
    exp?.world.addHandler("tooltips", (t) => {
      setTooltips(t);
    });

    return () => {
      exp?.world.removeHandlers("tooltips");
    };
  }, [exp]);

  return (
    <div className={"viewer-wrap"}>
      <div className={"viewer-controls"}>
        <button
          onClick={() => {
            exp?.world.emit("clear", undefined);
            setTooltips([]);
          }}
        >
          Clear
        </button>
        {/*<div className={"distance"}>Distance: 100cm</div>*/}
      </div>
      <div ref={viewerRef} className={"viewer"}>
        {toolTips.map(({ pos, distance }, i) => {
          return (
            pos.x >= 0 &&
            pos.x <= 1 &&
            pos.y >= 0 &&
            pos.y <= 1 && (
              <div
                key={i}
                className={"tooltip"}
                style={{
                  left: `${pos.x * 100}%`,
                  top: `${pos.y * 100}%`,
                }}
              >
                {distance.toFixed(2)}m
              </div>
            )
          );
        })}
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
}

export default App;
