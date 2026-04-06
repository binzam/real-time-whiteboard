import { useState, useCallback } from "react";
import { Editor, createShapeId, toRichText, TLShapeId } from "tldraw";
import dagre from "dagre";

export type ActionState = "idle" | "explaining" | "completing" | "generating";
export interface AlertState {
  title?: string;
  message: string;
  variant: "default" | "destructive" | "success" | "info";
  layout?: "default" | "fixed" | "sticky" | "fixed-bottom";
}
export interface DiagramData {
  shapes: Array<{
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    geo: string | any;
    text: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    color: string | any;
  }>;
  arrows: Array<{
    fromId: TLShapeId;
    toId: TLShapeId;
  }>;
}
export function useDiagramAI(editor: Editor | null) {
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<AlertState | null>(null);
  const triggerAlert = useCallback((alertProps: AlertState) => {
    setAlertState(alertProps);
    setTimeout(() => {
      setAlertState(null);
    }, 4000);
  }, []);
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

    const existingShapes = shapeIds
      .map((id) => {
        const shape = editor.getShape(id);
        if (!shape) return null;
        const props =
          "props" in shape
            ? (shape.props as { text?: string; richText?: { text: string } })
            : {};
        const text = props.text ?? props.richText?.text ?? "";
        return {
          id: shape!.id,
          type: shape!.type,
          x: shape!.x,
          y: shape!.y,
          text,
        };
      })
      .filter(Boolean);

    return { base64Image, existingShapes };
  }, [editor]);

  const explainDiagram = async () => {
    const context = await getCanvasContext();
    if (!context) {
      triggerAlert({
        message: "Canvas is empty!",
        variant: "destructive",
        layout: "fixed",
      });
      return;
    }

    setActionState("explaining");
    try {
      const res = await fetch("/api/explain-diagram", {
        method: "POST",
        body: JSON.stringify({
          image: context.base64Image,
          existingShapes: context.existingShapes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setExplanation(data.explanation);
    } catch (error) {
      console.error("Failed to analyze diagram.", error);
      triggerAlert({
        title: "Error",
        message: "Failed to analyze diagram.",
        variant: "destructive",
        layout: "fixed",
      });
    } finally {
      setActionState("idle");
    }
  };

  const autocompleteDiagram = async () => {
    const context = await getCanvasContext();
    if (!context || !editor) {
      triggerAlert({
        message: "Canvas is empty!",
        variant: "destructive",
        layout: "fixed",
      });
      return;
    }

    setActionState("completing");
    try {
      const res = await fetch("/api/complete-diagram", {
        method: "POST",
        body: JSON.stringify({
          image: context.base64Image,
          existingShapes: context.existingShapes,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error || "Something Went Wrong. Please Try Again.",
        );
      let targetCenter = null;
      if (data.arrows && data.arrows.length > 0) {
        for (const arrow of data.arrows) {
          // AI might attach fromId to the existing shape, or toId
          let connectedShape = editor.getShape(arrow.fromId as TLShapeId);
          if (!connectedShape) {
            connectedShape = editor.getShape(arrow.toId as TLShapeId);
          }

          if (connectedShape) {
            const bounds = editor.getShapePageBounds(connectedShape);
            if (bounds) {
              targetCenter = {
                x: bounds.center.x, // Align horizontally with the parent node
                y: bounds.maxY + 120, // Add 120px padding below the parent node
              };
              break;
            }
          }
        }
      }

      // 2. Fallback: If no connection found, place below the bounding box of ALL existing shapes
      if (!targetCenter) {
        const existingShapeIds = Array.from(editor.getCurrentPageShapeIds());
        if (existingShapeIds.length > 0) {
          let minX = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;

          existingShapeIds.forEach((id) => {
            const bounds = editor.getShapePageBounds(id);
            if (bounds) {
              minX = Math.min(minX, bounds.minX);
              maxX = Math.max(maxX, bounds.maxX);
              maxY = Math.max(maxY, bounds.maxY);
            }
          });

          targetCenter = {
            x: minX + (maxX - minX) / 2, // Center of the whole diagram
            y: maxY + 150, // Safely below everything
          };
        } else {
          // Last resort fallback
          targetCenter = editor.getViewportPageBounds().center;
        }
      }
      await renderDiagramData(data, editor, targetCenter);
      triggerAlert({
        title: "Success",
        message: "Diagram auto-completed successfully.",
        variant: "success",
        layout: "fixed",
      });
    } catch (err) {
      console.error("Failed to auto complete diagram", err);
      triggerAlert({
        title: "Error",
        message: "Failed to autocomplete diagram.",
        variant: "destructive",
        layout: "fixed",
      });
    } finally {
      setActionState("idle");
    }
  };

  const generateFromPrompt = async (
    prompt: string,
    layoutDir: "TB" | "LR" = "TB",
  ) => {
    if (!editor || !prompt.trim()) return;
    setActionState("generating");
    const center = editor.getViewportPageBounds().center;

    try {
      const res = await fetch("/api/generate-diagram", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error || "Something Went Wrong. Please Try Again.",
        );

      await renderDiagramData(data, editor, center, layoutDir);
      triggerAlert({
        title: "Success",
        message: "Diagram generated successfully",
        variant: "success",
        layout: "fixed",
      });
    } catch (err) {
      console.error("Error Generating Diagram from prompt", err);
      triggerAlert({
        title: "Error",
        message: "Failed to Generate Diagram.",
        variant: "destructive",
        layout: "fixed",
      });
    } finally {
      setActionState("idle");
    }
  };

  async function renderDiagramData(
    data: DiagramData,
    ed: Editor,
    center: { x: number; y: number } | null,
    direction: "TB" | "LR" = "TB",
  ) {
    const idMap = new Map<string, TLShapeId>();
    const toSelect: TLShapeId[] = [];

    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: direction, nodesep: 100, ranksep: 100 });
    g.setDefaultEdgeLabel(() => ({}));

    for (const s of data.shapes) {
      g.setNode(s.id, { width: s.w || 150, height: s.h || 80 });
    }
    for (const a of data.arrows) {
      g.setEdge(a.fromId, a.toId);
    }
    dagre.layout(g);
    const graphWidth = g.graph().width ?? 0;
    const graphHeight = g.graph().height ?? 0;

    const baseX = center?.x ?? 0;
    const baseY = center?.y ?? 0;

    for (const s of data.shapes) {
      const newId = createShapeId();
      idMap.set(s.id, newId);
      toSelect.push(newId);
      const nodeParams = g.node(s.id);
      const finalX = baseX + nodeParams.x - s.w / 2 - graphWidth / 2;

      const finalY =
        direction === "LR"
          ? baseY + nodeParams.y - s.h / 2 - graphHeight / 2
          : baseY + nodeParams.y - s.h / 2;
      ed.createShape({
        id: newId,
        type: "geo",
        x: finalX,
        y: finalY,
        props: {
          geo: s.geo,
          w: s.w,
          h: s.h,
          richText: toRichText(s.text),
          color: s.color,
          fill: "semi",
        },
      });
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
    alertState,
    setAlertState,
  };
}
