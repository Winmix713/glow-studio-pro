// ─── V3 Glow Studio Pro — Editor Orchestrator (ComponentSynth Design) ───

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { GlowDocument, EditorMode } from "@/core/glow-engine/state";
import { createDefaultDocument, CANVAS_SHAPES } from "@/core/glow-engine/state";
import { classicStateToGlowDocument, glowDocumentToClassicState } from "@/core/glow-engine/converters";
import { decodeDocumentFromUrl, clearShareHash } from "@/core/glow-engine/share";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { useHistory } from "@/hooks/use-history";
import { ClassicShell } from "@/components/glow-editor/classic-shell";
import { StudioShell } from "@/components/glow-editor/studio-shell";
import { StatusBar } from "@/components/shared/status-bar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Layers, Monitor, Bell, Settings } from "lucide-react";

const STORAGE_KEY = "glow-editor-document-v3";

export default function EditorPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const modeParam = searchParams.get("mode") as EditorMode | null;

  const [storedDoc, setStoredDoc] = usePersistedState<GlowDocument>(
    STORAGE_KEY,
    createDefaultDocument(modeParam ?? "classic"),
  );

  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    const shared = decodeDocumentFromUrl();
    if (shared) {
      setStoredDoc(shared);
      clearShareHash();
      toast.success("Loaded shared glow effect!");
    }
  }, [initialized, setStoredDoc]);

  const { state: doc, setState: setDoc, undo, redo, canUndo, canRedo } = useHistory(storedDoc);

  useEffect(() => {
    setStoredDoc(doc);
  }, [doc, setStoredDoc]);

  const mode = doc.mode;

  const handleModeChange = useCallback((newMode: EditorMode) => {
    if (newMode === mode) return;
    if (newMode === "studio") {
      const result = glowDocumentToClassicState(doc);
      const newDoc = classicStateToGlowDocument(result.state);
      newDoc.id = doc.id;
      newDoc.mode = "studio";
      if (doc.layers.length > 0 && doc.mode === "classic") {
        setDoc(newDoc);
      } else {
        setDoc({ ...doc, mode: "studio" });
      }
      toast.success("Switched to Studio Mode");
    } else {
      const result = glowDocumentToClassicState(doc);
      if (result.warnings.length > 0) {
        toast.warning("Some advanced settings were simplified in Classic mode", { description: result.warnings.join(" ") });
      }
      const newDoc = classicStateToGlowDocument(result.state);
      newDoc.id = doc.id;
      newDoc.mode = "classic";
      setDoc(newDoc);
      toast.success("Switched to Classic Mode");
    }
    setSearchParams({ mode: newMode });
  }, [mode, doc, setDoc, setSearchParams]);

  const handleDocChange = useCallback((newDoc: GlowDocument) => {
    setDoc(newDoc);
  }, [setDoc]);

  const activeLayerName = useMemo(() => {
    return doc.layers.find((l) => l.id === doc.selectedLayerId)?.name;
  }, [doc.layers, doc.selectedLayerId]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-0 md:p-4 lg:p-6">
      {/* Main App Window */}
      <div className="w-full h-screen md:h-[94vh] md:max-w-[1600px] md:min-h-[700px] bg-cs-panel md:rounded-[2rem] border-0 md:border border-white/5 flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-5 z-20 shrink-0 border-b border-white/5 bg-cs-panel/80 backdrop-blur-md">
          {/* Logo */}
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 bg-secondary rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden">
              <div className="w-4 h-4 bg-primary rounded-full mix-blend-screen shadow-[0_0_15px_hsl(var(--primary)/0.5)]" />
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary/60 rounded-full mix-blend-screen" />
              <div className="absolute bottom-1 left-1.5 w-2.5 h-2.5 bg-primary/30 rounded-full mix-blend-screen" />
            </div>
            <span className="text-base font-semibold text-white tracking-tight">Glow Studio Pro</span>
            <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-medium text-primary">V3</span>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-1 rounded-full border border-white/5 bg-white/[0.03] p-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${mode === "classic" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => handleModeChange("classic")}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  Classic
                </button>
              </TooltipTrigger>
              <TooltipContent>Single color, auto 4-layer glow</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${mode === "studio" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => handleModeChange("studio")}
                >
                  <Layers className="h-3.5 w-3.5" />
                  Studio
                </button>
              </TooltipTrigger>
              <TooltipContent>Unlimited layers, full control</TooltipContent>
            </Tooltip>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" aria-label="Notifications">
              <Bell className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" aria-label="Settings">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Shell */}
        <main className="flex-1 overflow-hidden">
          {mode === "classic" ? (
            <ClassicShell
              document={doc}
              onDocumentChange={handleDocChange}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          ) : (
            <StudioShell
              document={doc}
              onDocumentChange={handleDocChange}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          )}
        </main>

        {/* Status Bar */}
        <StatusBar
          mode={mode}
          shape={doc.canvas.shape}
          layerCount={doc.layers.length}
          activeLayerName={activeLayerName}
          power={doc.power}
        />
      </div>
    </div>
  );
}
