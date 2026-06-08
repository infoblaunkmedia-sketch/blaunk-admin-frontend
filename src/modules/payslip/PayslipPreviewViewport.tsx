import React from 'react';

const MIN_SCALE = 0.62;

type Props = {
  children: React.ReactNode;
};

/** Fits wide payslip previews on screen; PDF capture uses inner content at full size. */
export const PayslipPreviewViewport: React.FC<Props> = ({ children }) => {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [layout, setLayout] = React.useState({ scale: 1, width: 0, height: 0, needsScroll: false });

  const measure = React.useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    const naturalWidth = content.scrollWidth;
    const naturalHeight = content.scrollHeight;
    if (!naturalWidth) return;

    const available = viewport.clientWidth;
    let scale = 1;
    let needsScroll = false;

    if (naturalWidth > available) {
      scale = Math.max(MIN_SCALE, available / naturalWidth);
      if (naturalWidth * scale > available + 1) {
        needsScroll = true;
      }
    }

    setLayout({
      scale,
      width: naturalWidth * scale,
      height: naturalHeight * scale,
      needsScroll,
    });
  }, []);

  React.useLayoutEffect(() => {
    measure();
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return undefined;

    const ro = new ResizeObserver(() => measure());
    ro.observe(viewport);
    ro.observe(content);
    return () => ro.disconnect();
  }, [children, measure]);

  return (
    <div className="space-y-2">
      {layout.needsScroll ? (
        <p className="text-xs text-slate-500">Scroll horizontally to view the full payslip.</p>
      ) : null}
      <div
        ref={viewportRef}
        className={[
          'w-full max-w-full rounded-md bg-slate-50/50 p-2',
          layout.needsScroll ? 'overflow-x-auto' : 'overflow-x-hidden',
        ].join(' ')}
      >
        <div
          className="mx-auto"
          style={{
            width: layout.width || undefined,
            height: layout.height || undefined,
          }}
        >
          <div
            ref={contentRef}
            style={{
              transform: layout.scale < 1 ? `scale(${layout.scale})` : undefined,
              transformOrigin: 'top left',
              width: layout.scale < 1 && layout.scale > 0 ? layout.width / layout.scale : undefined,
            }}
            className="inline-block"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
