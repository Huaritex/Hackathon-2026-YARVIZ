/**
 * index.ts — Remotion entry point.
 * Registers the root component so the Studio / renderer can discover compositions.
 */

import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
