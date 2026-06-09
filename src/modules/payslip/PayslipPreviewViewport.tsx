import React from 'react';

const MIN_SCALE = 0.55;

type Props = {
  children: React.ReactNode;
};

/** Scales wide payslip to fit preview; PDF captures the article at full size. */
export const PayslipPreviewViewport: React.FC<Props> = ({ children }) => {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [layout, setLayout] = React.useState({ scale: 1, width: 0, height: 0, needsScroll: false });

  const measure = React.useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    const article = content.querySelector('article');
    const naturalWidth = article?.scrollWidth || content.scrollWidth;
    const naturalHeight = article?.scrollHeight || content.scrollHeight;
    if (!naturalWidth || !naturalHeight) return;

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
    <div
      ref={viewportRef}
      className={[
        'w-fit max-w-full',
        layout.needsScroll ? 'overflow-x-auto' : 'overflow-x-hidden',
      ].join(' ')}
    >
      <div
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
            width:
              layout.scale < 1 && layout.scale > 0 && layout.width > 0
                ? layout.width / layout.scale
                : undefined,
          }}
          className="inline-block"
        >
          {children}
        </div>
      </div>
    </div>
  );
};
