import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import type { CSSProperties } from 'react';
import { textInk } from '../../lib/colors';
import { resolveEdgeLabelFontSize } from '../../lib/edgeLabel';
import type { CanvasColor, EdgeData } from '../../types/jsonCanvas';
import { useTheme } from '../../theme/ThemeProvider';

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
  data,
  interactionWidth,
}: EdgeProps) {
  const { theme } = useTheme();
  const edgeData = data as EdgeData | undefined;
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const text = typeof label === 'string' ? label.trim() : '';
  const fontSize = resolveEdgeLabelFontSize(edgeData?.labelFontSize);
  const labelColor = edgeData?.labelColor as CanvasColor | undefined;
  const ink = labelColor ? textInk(labelColor, theme) : undefined;

  const labelBoxStyle: CSSProperties = {
    position: 'absolute',
    transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
    pointerEvents: 'none',
    fontSize,
    ...(ink
      ? ({
          color: ink,
          ['--ms-edge-label-ink' as string]: ink,
        } as CSSProperties)
      : {}),
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
