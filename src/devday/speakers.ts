import { FACE_PALETTE, FACE_PRESETS, type FaceConfig } from "./faces";

/**
 * Each speaker owns one face for the whole event: library card, talk cover,
 * footer and agenda. Change the talk/speaker pairing in the talk's deck.ts,
 * never by reusing someone else's face.
 */
export type Speaker = {
  id: string;
  name: string;
  /** Optional: leave it out until the speaker confirms how they want to be introduced. */
  role?: string;
  /** Portrait under public/speakers/, if the speaker provided one. */
  photo?: string;
  face: FaceConfig;
};

export const speakers = {
  fernando: {
    id: "fernando-borea",
    name: "Fernando Borea",
    role: "Founder & CEO, Borea Labs",
    face: { ...FACE_PRESETS.squeeze, color: FACE_PALETTE.blue, rotation: -8 },
  },
  daniela: {
    id: "daniela-huezo",
    name: "Daniela Huezo",
    role: "Co-founder, Ai Labs",
    photo: "/speakers/daniela-huezo.png",
    face: { ...FACE_PRESETS.wink, color: FACE_PALETTE.orange },
  },
  saul: {
    id: "saul-calderon",
    name: "Saul Calderon",
    role: "AI Product Engineer",
    face: { ...FACE_PRESETS.plus, color: FACE_PALETTE.green, gaze: { x: 0.1, y: 0.1 } },
  },
  frank: {
    id: "frank-calderon",
    name: "Frank Calderon",
    face: { ...FACE_PRESETS.curious, color: FACE_PALETTE.purple },
  },
  rodrigo: {
    id: "rodrigo-garciaguirre",
    name: "Rodrigo Garciaguirre",
    face: { ...FACE_PRESETS.spark, color: FACE_PALETTE.gray, rotation: 8 },
  },
  walter: {
    id: "walter-morales",
    name: "Walter Morales",
    role: "Co-founder, Ai Labs",
    photo: "/speakers/walter-morales.png",
    face: { ...FACE_PRESETS.happy, color: FACE_PALETTE.charcoal, rotation: 0, gaze: { x: 0.1, y: -0.2 } },
  },
} satisfies Record<string, Speaker>;

export const firstName = (speaker: Speaker) => speaker.name.split(" ")[0];
