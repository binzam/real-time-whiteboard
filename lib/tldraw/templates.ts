import { Editor, createShapeId, TLShapeId, toRichText } from "tldraw";

export type Template = {
  id: string;
  name: string;
  description: string;
  apply: (editor: Editor, center: { x: number; y: number }) => void;
};

export const TEMPLATES: Template[] = [
  {
    id: "kanban",
    name: "Kanban Board",
    description:
      "Standard To Do, In Progress, and Done lanes for task management.",
    apply: (editor, center) => {
      const lanes = ["To Do", "In Progress", "Done"];
      const laneWidth = 300;
      const laneHeight = 600;
      const gap = 40;
      const startX = center.x - (laneWidth * 3 + gap * 2) / 2;

      lanes.forEach((lane, index) => {
        const laneId = createShapeId();
        const xOffset = startX + index * (laneWidth + gap);

        // Lane Container
        editor.createShape({
          id: laneId,
          type: "geo",
          x: xOffset,
          y: center.y - laneHeight / 2,
          props: {
            geo: "rectangle",
            w: laneWidth,
            h: laneHeight,
            fill: "none",
            color: "grey",
            dash: "dashed",
            richText: toRichText(lane),
            align: "middle",
            verticalAlign: "start",
          },
        });
      });
    },
  },
  {
    id: "swot",
    name: "SWOT Analysis",
    description:
      "2x2 grid for Strengths, Weaknesses, Opportunities, and Threats.",
    apply: (editor, center) => {
      const size = 300;
      const gap = 20;
      const quadrants = [
        {
          text: "Strengths",
          color: "green",
          dx: -size - gap / 2,
          dy: -size - gap / 2,
        },
        { text: "Weaknesses", color: "red", dx: gap / 2, dy: -size - gap / 2 },
        {
          text: "Opportunities",
          color: "blue",
          dx: -size - gap / 2,
          dy: gap / 2,
        },
        { text: "Threats", color: "orange", dx: gap / 2, dy: gap / 2 },
      ] as const;

      quadrants.forEach((q) => {
        editor.createShape({
          id: createShapeId(),
          type: "geo",
          x: center.x + q.dx,
          y: center.y + q.dy,
          props: {
            geo: "rectangle",
            w: size,
            h: size,
            color: q.color,
            fill: "semi",
            richText: toRichText(q.text),
            size: "l",
          },
        });
      });
    },
  },
  {
    id: "mindmap",
    name: "Mind Map Starter",
    description: "A central idea branching out into three child nodes.",
    apply: (editor, center) => {
      const rootId = createShapeId();

      // Central Node
      editor.createShape({
        id: rootId,
        type: "geo",
        x: center.x - 100,
        y: center.y - 40,
        props: {
          geo: "ellipse",
          w: 200,
          h: 80,
          richText: toRichText("Central Idea"),
          color: "blue",
          fill: "solid",
        },
      });

      // Child Nodes
      const children = [
        { dx: -250, dy: -150 },
        { dx: 250, dy: -150 },
        { dx: 0, dy: 150 },
      ];

      children.forEach((c) => {
        const childId = createShapeId();
        const arrowId = createShapeId();

        editor.createShape({
          id: childId,
          type: "geo",
          x: center.x + c.dx - 75,
          y: center.y + c.dy - 30,
          props: {
            geo: "rectangle",
            w: 150,
            h: 60,
            richText: toRichText("Sub-topic"),
            color: "light-blue",
            fill: "semi",
          },
        });

        // Connect with Arrow
        editor.createShape({
          id: arrowId,
          type: "arrow",
          props: { color: "grey", dash: "draw" },
        });
        editor.createBinding({
          type: "arrow",
          fromId: arrowId,
          toId: rootId,
          props: { terminal: "start", normalizedAnchor: { x: 0.5, y: 0.5 } },
        });
        editor.createBinding({
          type: "arrow",
          fromId: arrowId,
          toId: childId,
          props: { terminal: "end", normalizedAnchor: { x: 0.5, y: 0.5 } },
        });
      });
    },
  },
  {
    id: "venn",
    name: "Venn Diagram",
    description: "Two overlapping circles to show relationships.",
    apply: (editor, center) => {
      const radius = 250;
      const offset = 100;

      editor.createShape({
        id: createShapeId(),
        type: "geo",
        x: center.x - radius - offset + radius / 2,
        y: center.y - radius / 2,
        props: {
          geo: "ellipse",
          w: radius,
          h: radius,
          color: "blue",
          fill: "semi",
          richText: toRichText("Concept A"),
        },
      });

      editor.createShape({
        id: createShapeId(),
        type: "geo",
        x: center.x - radius / 2 + offset,
        y: center.y - radius / 2,
        props: {
          geo: "ellipse",
          w: radius,
          h: radius,
          color: "red",
          fill: "semi",
          richText: toRichText("Concept B"),
        },
      });
    },
  },
  {
    id: "flowchart",
    name: "Basic Flowchart",
    description: "A standard start-process-decision-end flow.",
    apply: (editor, center) => {
      const startId = createShapeId();
      const processId = createShapeId();
      const decisionId = createShapeId();
      const endId = createShapeId();

      const startY = center.y - 300;
      const spacing = 150;

      // Start
      editor.createShape({
        id: startId,
        type: "geo",
        x: center.x - 75,
        y: startY,

        props: {
          geo: "ellipse",
          w: 150,
          h: 60,
          richText: toRichText("Start"),
          color: "black",
        },
      });
      // Process
      editor.createShape({
        id: processId,
        type: "geo",
        x: center.x - 75,
        y: startY + spacing,
        props: {
          geo: "rectangle",
          w: 150,
          h: 60,
          richText: toRichText("Process"),
          color: "blue",
        },
      });
      // Decision
      editor.createShape({
        id: decisionId,
        type: "geo",
        x: center.x - 75,
        y: startY + spacing * 2,
        props: {
          geo: "diamond",
          w: 150,
          h: 100,
          richText: toRichText("Decision?"),
          color: "orange",
        },
      });
      // End
      editor.createShape({
        id: endId,
        type: "geo",
        x: center.x - 75,
        y: startY + spacing * 3 + 40,
        props: {
          geo: "ellipse",
          w: 150,
          h: 60,
          richText: toRichText("End"),
          color: "black",
        },
      });

      // Helper to connect arrows vertically
      const connect = (from: TLShapeId, to: TLShapeId) => {
        const arrowId = createShapeId();
        editor.createShape({
          id: arrowId,
          type: "arrow",
          props: { color: "black" },
        });
        editor.createBinding({
          type: "arrow",
          fromId: arrowId,
          toId: from,
          props: { terminal: "start", normalizedAnchor: { x: 0.5, y: 0.5 } },
        });
        editor.createBinding({
          type: "arrow",
          fromId: arrowId,
          toId: to,
          props: { terminal: "end", normalizedAnchor: { x: 0.5, y: 0.5 } },
        });
      };

      connect(startId, processId);
      connect(processId, decisionId);
      connect(decisionId, endId);
    },
  },
];
