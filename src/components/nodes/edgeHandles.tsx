import { Handle, Position } from '@xyflow/react';

const sides = [
  { id: 'top', position: Position.Top },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
  { id: 'left', position: Position.Left },
] as const;

const offsets = ['25%', '75%'] as const;
const suffixes = ['a', 'b'] as const;

type EdgeHandlesProps = {
  accentClass?: string;
};

export function EdgeHandles({ accentClass }: EdgeHandlesProps) {
  const handleClass =
    accentClass ??
    '!h-2.5 !w-2.5 !border-2 !border-white/35 !bg-indigo-400 opacity-0 transition-opacity group-hover:opacity-100';

  return (
    <>
      {sides.flatMap(({ id: side, position }) =>
        offsets.map((offset, index) => {
          const style =
            position === Position.Top || position === Position.Bottom
              ? { left: offset, transform: 'translateX(-50%)' }
              : { top: offset, transform: 'translateY(-50%)' };

          return (
            <Handle
              key={`${side}-${suffixes[index]}`}
              id={`source-${side}-${suffixes[index]}`}
              type="source"
              position={position}
              style={style}
              className={handleClass}
            />
          );
        }),
      )}
    </>
  );
}
