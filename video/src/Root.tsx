/**
 * Root.tsx
 *
 * Remotion root: registers the YARVIZ promo composition.
 * 720 frames @ 60fps = 12s, 1920×1080.
 */

import React from "react";
import { Composition } from "remotion";
import { YarvizPromo } from "./YarvizPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="YarvizPromo"
        component={YarvizPromo}
        durationInFrames={720}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
