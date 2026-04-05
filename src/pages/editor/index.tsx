// ─── V3 Glow Studio Pro — Editor Orchestrator ───

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
import { Sparkles, Layers, Monitor } from "lucide-react";

const STORAGE_KEY = "glow-editor-document-v3";

export default function EditorPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const modeParam = searchParams.get("mode") as EditorMode | null;

  // Load initial doc: shared URL > localStorage > default
  const [storedDoc, setStoredDoc] = usePersistedState<GlowDocument>(
    STORAGE_KEY,
    createDefaultDocument(modeParam ?? "classic"),
  );

  // Check for share URL on mount
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

  // History wrapping the stored doc
  const { state: doc, setState: setDoc, undo, redo, canUndo, canRedo } = useHistory(storedDoc);

  // Sync history state back to persistence
  useEffect(() => {
    setStoredDoc(doc);
  }, [doc, setStoredDoc]);

  const mode = doc.mode;

  const handleModeChange = useCallback((newMode: EditorMode) => {
    if (newMode === mode) return;

    if (newMode === "studio") {
      // Classic → Studio: convert
      const result = glowDocumentToClassicState(doc);
      const newDoc = classicStateToGlowDocument(result.state);
      newDoc.id = doc.id;
      newDoc.mode = "studio";
      // Preserve the existing layers if we're already studio-like
      if (doc.layers.length > 0 && doc.mode === "classic") {
        // Use converted layers
        setDoc(newDoc);
      } else {
        setDoc({ ...doc, mode: "studio" });
      }
      toast.success("Switched to Studio Mode");
    } else {
      // Studio → Classic: best-effort
      const result = glowDocumentToClassicState(doc);
      if (result.warnings.length > 0) {
        toast.warning(
          "Some advanced settings were simplified in Classic mode",
          { description: result.warnings.join(" ") }
        );
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
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Top Bar */}
      <header className="flex h-11 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-bold tracking-wide">GLOW STUDIO PRO</h1>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">V3</span>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={mode === "classic" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleModeChange("classic")}
              >
                <Monitor className="mr-1 h-3 w-3" />
                Classic
              </Button>
            </TooltipTrigger>
            <TooltipContent>Single color, auto 4-layer glow</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={mode === "studio" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleModeChange("studio")}
              >
                <Layers className="mr-1 h-3 w-3" />
                Studio
              </Button>
            </TooltipTrigger>
            <TooltipContent>Unlimited layers, full control</TooltipContent>
          </Tooltip>
        </div>

        <div className="w-32" /> {/* spacer */}
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
  );
}
