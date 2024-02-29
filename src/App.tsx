import { useEffect, useRef, useState } from "react";
import { Experience } from "./Experience/Experience.ts";
import { Vector2 } from "three";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  const [exp, setExp] = useState<Experience | null>(null);

  const [distance, setDistance] = useState(0);
  const [tooltip, setTooltip] = useState<Vector2 | null>(null);

  useEffect(() => {
    setExp(new Experience(canvasRef.current, viewerRef.current));
  }, []);

  useEffect(() => {
    const h = (v: number) => {
      setDistance(v);
    };

    exp?.world.addHandler("distance", h);

    return () => {
      exp?.world.removeHandlers("distance");
    };
  }, [exp]);

  useEffect(() => {
    const h = (v: Vector2) => {
      setTooltip(v);
    };

    exp?.world.addHandler("mid", h);

    return () => {
      exp?.world.removeHandlers("mid");
    };
  }, [exp]);

  return (
    <div className={"viewer-wrap"}>
      <div className={"viewer-controls"}>
        {/*<div className={"buttons"}></div>*/}
        <button
          onClick={() => {
            setDistance(0);
            setTooltip(null);
            exp?.world.emit("clear", undefined);
          }}
        >
          Clear
        </button>
        <div className={"distance"}>Distance: {distance.toFixed(2)}cm</div>
      </div>
      <div ref={viewerRef} className={"viewer"}>
        {tooltip &&
          !!distance &&
          tooltip.x >= 0 &&
          tooltip.x <= 1 &&
          tooltip.y >= 0 &&
          tooltip.y <= 1 && (
            <div
              className={"tooltip"}
              style={{
                left: `${tooltip.x * 100}%`,
                top: `${tooltip.y * 100}%`,
              }}
            >
              {distance.toFixed(2)}cm
            </div>
          )}
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
}

export default App;
