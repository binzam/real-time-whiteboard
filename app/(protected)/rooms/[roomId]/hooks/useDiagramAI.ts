import { useState, useCallback } from "react";
import { Editor, createShapeId, toRichText, TLShapeId } from "tldraw";

type ActionState = "idle" | "explaining" | "completing" | "generating";

export function useDiagramAI(editor: Editor | null) {
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [explanation, setExplanation] = useState<string | null>(null);

  const getCanvasContext = useCallback(async () => {
    if (!editor) return null;
    const shapeIds = Array.from(editor.getCurrentPageShapeIds());
    if (shapeIds.length === 0) return null;

    const exportResult = await editor.toImageDataUrl(shapeIds, {
      format: "png",
      background: true,
      padding: 32,
    });
    const base64Image = exportResult.url;
    const existingShapes = shapeIds.map((id) => {
      const shape = editor.getShape(id);
      return {
        id: shape!.id,
        type: shape!.type,
        x: shape!.x,
        y: shape!.y,
        // @ts-expect-error anc
        text: shape!.props?.text || shape!.props?.richText?.text || "",
      };
    });

    return { base64Image, existingShapes };
  }, [editor]);

  const explainDiagram = async () => {
    const context = await getCanvasContext();
    if (!context) return alert("Canvas is empty!");

    setActionState("explaining");
    try {
      const res = await fetch("/api/analyze-diagram", {
        method: "POST",
        body: JSON.stringify({
          image: context.base64Image,
          action: "explain",
          existingShapes: context.existingShapes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setExplanation(data.explanation);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze diagram.");
    } finally {
      setActionState("idle");
    }
  };

  const autocompleteDiagram = async () => {
    const context = await getCanvasContext();
    if (!context || !editor) return;

    setActionState("completing");
    try {
      const res = await fetch("/api/analyze-diagram", {
        method: "POST",
        body: JSON.stringify({
          image: context.base64Image,
          action: "autocomplete",
          existingShapes: context.existingShapes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await renderDiagramData(data, editor, null);
    } catch (err) {
      alert("Failed to autocomplete");
      console.error("error in autocomplete", err);
    } finally {
      setActionState("idle");
    }
  };

  const generateFromPrompt = async (prompt: string) => {
    if (!editor || !prompt.trim()) return;
    setActionState("generating");
    const center = editor.getViewportPageBounds().center;

    try {
      const res = await fetch("/api/generate-diagram", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      await renderDiagramData(data, editor, center);
    } catch (err) {
      alert("Generation failed");
    } finally {
      setActionState("idle");
    }
  };

  async function renderDiagramData(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    ed: Editor,
    center: { x: number; y: number } | null,
  ) {
    const idMap = new Map<string, TLShapeId>();
    const toSelect: TLShapeId[] = [];

    for (const s of data.shapes) {
      const newId = createShapeId();
      idMap.set(s.id, newId);
      toSelect.push(newId);
      ed.createShape({
        id: newId,
        type: "geo",
        x: (center?.x ?? 0) + s.x,
        y: (center?.y ?? 0) + s.y,
        props: {
          geo: s.geo,
          w: s.w,
          h: s.h,
          richText: toRichText(s.text),
          color: s.color,
          fill: "semi",
        },
      });
      await new Promise((r) => setTimeout(r, 100));
    }

    for (const a of data.arrows) {
      const arrowId = createShapeId();
      const fromId =
        idMap.get(a.fromId) ||
        (a.fromId.startsWith("shape:") ? a.fromId : null);
      const toId =
        idMap.get(a.toId) || (a.toId.startsWith("shape:") ? a.toId : null);
      if (fromId && toId) {
        toSelect.push(arrowId);
        ed.createShape({
          id: arrowId,
          type: "arrow",
          props: { color: "black", dash: "draw" },
        });
        ed.createBinding({
          type: "arrow",
          fromId: arrowId,
          toId: fromId,
          props: { terminal: "start", normalizedAnchor: { x: 0.5, y: 0.5 } },
        });
        ed.createBinding({
          type: "arrow",
          fromId: arrowId,
          toId: toId,
          props: { terminal: "end", normalizedAnchor: { x: 0.5, y: 0.5 } },
        });
      }
    }
    ed.select(...toSelect);
    ed.zoomToSelection({ animation: { duration: 500 } });
    ed.selectNone();
  }

  return {
    actionState,
    explanation,
    setExplanation,
    explainDiagram,
    autocompleteDiagram,
    generateFromPrompt,
  };
}
