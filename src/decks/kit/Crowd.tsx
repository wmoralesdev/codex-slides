import type { CSSProperties } from "react";
import { Face, Mark } from "../../devday/Face";
import type { CrowdFace, CrowdMark } from "./crowd-layout";

/** Decorative faces placed in slide units. Motion only runs on a stage with data-motion-state="running". */
export function Crowd({
  faces,
  marks = [],
  className = "",
}: {
  faces: CrowdFace[];
  marks?: CrowdMark[];
  className?: string;
}) {
  return (
    <div className={`dd-crowd ${className}`} aria-hidden="true">
      {faces.map(({ x, y, size, face }, index) => (
        <span
          key={`face-${index}`}
          className="dd-crowd-item"
          style={{ "--x": `${x}cqw`, "--y": `${y}cqw`, "--size": `${size}cqw`, "--i": index, "--xn": x } as CSSProperties}
        >
          <Face config={face} />
        </span>
      ))}
      {marks.map(({ x, y, size, kind, color }, index) => (
        <span
          key={`mark-${index}`}
          className="dd-crowd-item dd-crowd-mark"
          style={{ "--x": `${x}cqw`, "--y": `${y}cqw`, "--size": `${size}cqw`, "--i": index + 3, "--xn": x } as CSSProperties}
        >
          <Mark kind={kind} color={color} />
        </span>
      ))}
    </div>
  );
}
