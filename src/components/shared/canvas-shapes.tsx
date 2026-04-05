// ─── Canvas Shape Content Renderers ───

import React from "react";
import type { CanvasShape, ComponentType } from "@/core/glow-engine/state";

interface ShapeContentProps {
  shape: CanvasShape;
  componentType?: ComponentType;
}

export const PhoneContent = React.memo(() => (
  <div className="flex flex-col items-center gap-3 p-6 text-center opacity-40">
    <div className="h-2 w-12 rounded-full bg-current" />
    <div className="mt-4 h-3 w-32 rounded bg-current opacity-60" />
    <div className="h-2 w-24 rounded bg-current opacity-40" />
    <div className="mt-6 flex gap-3">
      <div className="h-10 w-10 rounded-lg bg-current opacity-30" />
      <div className="h-10 w-10 rounded-lg bg-current opacity-30" />
      <div className="h-10 w-10 rounded-lg bg-current opacity-30" />
    </div>
  </div>
));

export const CardContent = React.memo(() => (
  <div className="flex flex-col gap-2 p-5 opacity-40">
    <div className="h-3 w-28 rounded bg-current opacity-70" />
    <div className="h-2 w-full rounded bg-current opacity-30" />
    <div className="h-2 w-3/4 rounded bg-current opacity-30" />
    <div className="mt-3 h-8 w-20 rounded-md bg-current opacity-40" />
  </div>
));

export const HeroContent = React.memo(() => (
  <div className="flex flex-col items-center justify-center gap-3 p-8 text-center opacity-40">
    <div className="h-4 w-48 rounded bg-current opacity-70" />
    <div className="h-2 w-64 rounded bg-current opacity-40" />
    <div className="mt-4 flex gap-3">
      <div className="h-10 w-24 rounded-lg bg-current opacity-50" />
      <div className="h-10 w-24 rounded-lg border border-current opacity-30" />
    </div>
  </div>
));

export const SquareContent = React.memo(() => (
  <div className="flex items-center justify-center p-8 opacity-40">
    <div className="h-16 w-16 rounded-xl bg-current opacity-40" />
  </div>
));

export const DesktopContent = React.memo(() => (
  <div className="flex gap-4 p-6 opacity-40">
    <div className="flex w-16 flex-col gap-2">
      <div className="h-2 w-full rounded bg-current opacity-50" />
      <div className="h-2 w-full rounded bg-current opacity-30" />
      <div className="h-2 w-full rounded bg-current opacity-30" />
    </div>
    <div className="flex-1">
      <div className="h-3 w-48 rounded bg-current opacity-50" />
      <div className="mt-3 h-2 w-full rounded bg-current opacity-20" />
      <div className="mt-1 h-2 w-3/4 rounded bg-current opacity-20" />
    </div>
  </div>
));

export const TabletContent = React.memo(() => (
  <div className="flex flex-col items-center gap-4 p-6 opacity-40">
    <div className="h-3 w-40 rounded bg-current opacity-60" />
    <div className="grid grid-cols-2 gap-3">
      <div className="h-20 w-28 rounded-lg bg-current opacity-20" />
      <div className="h-20 w-28 rounded-lg bg-current opacity-20" />
    </div>
  </div>
));

export const CanvasShapeContent = React.memo<ShapeContentProps>(({ shape }) => {
  switch (shape) {
    case "phone": return <PhoneContent />;
    case "card": return <CardContent />;
    case "hero": return <HeroContent />;
    case "square": return <SquareContent />;
    case "desktop": return <DesktopContent />;
    case "tablet": return <TabletContent />;
    default: return <PhoneContent />;
  }
});
