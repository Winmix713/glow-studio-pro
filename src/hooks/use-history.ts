// ─── History (Undo/Redo) Hook ───

import { useState, useCallback, useRef } from "react";

const MAX_HISTORY = 50;

export function useHistory<T>(initial: T) {
  const [state, setStateInternal] = useState(initial);
  const pastRef = useRef<T[]>([]);
  const futureRef = useRef<T[]>([]);

  const setState = useCallback((newState: T, skipHistory = false) => {
    if (!skipHistory) {
      pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), state];
      futureRef.current = [];
    }
    setStateInternal(newState);
  }, [state]);

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const prev = pastRef.current[pastRef.current.length - 1];
    pastRef.current = pastRef.current.slice(0, -1);
    futureRef.current = [state, ...futureRef.current];
    setStateInternal(prev);
  }, [state]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current[0];
    futureRef.current = futureRef.current.slice(1);
    pastRef.current = [...pastRef.current, state];
    setStateInternal(next);
  }, [state]);

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  return { state, setState, undo, redo, canUndo, canRedo };
}
