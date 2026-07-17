import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import type { CSSProperties } from 'react';

/**
 * Smoothstep-ребро с HTML-подписью (EdgeLabelRenderer).
 * SVG EdgeText при печати часто обрезает длинный текст из‑за getBBox/шрифтов.
 */
export function MindSmoothStepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  markerStart,
  label,
  interactionWidth,
}: EdgeProps) {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const text = typeof label === 'string' ? label.trim() : '';

  const labelBoxStyle: CSSProperties = {
    position: 'absolute',
    transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
    pointerEvents: 'none',
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={style}
        markerEnd={markerEnd}
        markerStart={markerStart}
        interactionWidth={interactionWidth}
      />
      {text ? (
        <EdgeLabelRenderer>
          <div className="ms-edge-label nodrag nopan" style={labelBoxStyle}>
            {text}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
