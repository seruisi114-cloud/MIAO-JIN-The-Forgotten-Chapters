import { CSSProperties } from "react";

type LakeSparkleStyle = CSSProperties & {
  "--lake-sparkle-x": string;
  "--lake-sparkle-y": string;
  "--lake-sparkle-width": string;
  "--lake-sparkle-delay": string;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const random = seededRandom(20260719);
const lakeSparkles = Array.from({ length: 30 }, (_, id) => ({
  id,
  style: {
    "--lake-sparkle-x": `${7 + random() * 86}%`,
    "--lake-sparkle-y": `${8 + random() * 66}%`,
    "--lake-sparkle-width": `${1.5 + random() * 5}px`,
    "--lake-sparkle-delay": `${-random() * 13}s`,
  } as LakeSparkleStyle,
}));

export function DreamLake() {
  return (
    <>
      <div className="moonlit-lake-surface" aria-hidden="true">
        <i /><i /><i />
      </div>
      <div className="moonlit-lake-ripples" aria-hidden="true">
        <i /><i /><i /><i /><i />
      </div>
      <div className="moonlit-lake-sparkles" aria-hidden="true">
        {lakeSparkles.map((sparkle) => <i key={sparkle.id} style={sparkle.style} />)}
      </div>
      <div className="moonlit-lake-caustics" aria-hidden="true">
        <i /><i /><i /><i />
      </div>
    </>
  );
}
