"use client";

import { AquaSeaMotion } from "@/components/AquaSeaMotion";
import { CleanMinimalMotion } from "@/components/CleanMinimalMotion";
import { DarkPremiumMotion } from "@/components/DarkPremiumMotion";
import { IndonesiaWarmMotion } from "@/components/IndonesiaWarmMotion";
import { PinkCuteMotion } from "@/components/PinkCuteMotion";
import { useTheme } from "@/components/ThemeProvider";
import type { SiteTheme } from "@/lib/theme";
import type { ReactNode } from "react";

const MOTION_BY_THEME: Record<SiteTheme, () => ReactNode> = {
  pink: PinkCuteMotion,
  clean: CleanMinimalMotion,
  indonesia: IndonesiaWarmMotion,
  dark: DarkPremiumMotion,
  aqua: AquaSeaMotion,
};

export function ThemeMotionOverlay() {
  const { theme, motionEnabled } = useTheme();
  if (!motionEnabled) return null;
  const Motion = MOTION_BY_THEME[theme];
  return <Motion />;
}
