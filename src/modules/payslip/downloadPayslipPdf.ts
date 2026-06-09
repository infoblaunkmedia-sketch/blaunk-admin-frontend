function captureTarget(elementId: string): HTMLElement | null {
  const root = document.getElementById(elementId);
  if (!root) return null;
  return (root.querySelector('article.payslip-capture-root') as HTMLElement | null)
    ?? (root.querySelector('article') as HTMLElement | null)
    ?? root;
}

function measureContentBounds(root: HTMLElement): { width: number; height: number } {
  const width = Math.ceil(root.scrollWidth || root.offsetWidth);
  const height = Math.ceil(root.scrollHeight || root.offsetHeight);
  if (width > 0 && height > 0) {
    return { width, height };
  }

  const rect = root.getBoundingClientRect();
  return {
    width: Math.ceil(rect.width) || 1,
    height: Math.ceil(rect.height) || 1,
  };
}

function neutralizePreviewTransforms(el: HTMLElement): () => void {
  const restores: Array<() => void> = [];
  let node: HTMLElement | null = el.parentElement;

  while (node && node.id !== 'payslip-print-area') {
    const computed = window.getComputedStyle(node);
    const needsReset =
      (computed.transform && computed.transform !== 'none')
      || (computed.width && computed.width !== 'auto' && node.style.width);

    if (needsReset || computed.transform !== 'none') {
      const target = node;
      const prev = {
        transform: target.style.transform,
        width: target.style.width,
        height: target.style.height,
        overflow: target.style.overflow,
      };
      target.style.transform = 'none';
      target.style.width = 'auto';
      target.style.height = 'auto';
      target.style.overflow = 'visible';
      restores.push(() => {
        target.style.transform = prev.transform;
        target.style.width = prev.width;
        target.style.height = prev.height;
        target.style.overflow = prev.overflow;
      });
    }
    node = node.parentElement;
  }

  return () => {
    restores.reverse().forEach((restore) => restore());
  };
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        }),
    ),
  );
}

function cropCanvas(source: HTMLCanvasElement, widthPx: number, heightPx: number): HTMLCanvasElement {
  const w = Math.min(source.width, Math.max(1, Math.ceil(widthPx)));
  const h = Math.min(source.height, Math.max(1, Math.ceil(heightPx)));
  if (w <= 1 || h <= 1) return source;
  if (source.width === w && source.height === h) return source;

  const cropped = document.createElement('canvas');
  cropped.width = w;
  cropped.height = h;
  const ctx = cropped.getContext('2d');
  if (!ctx) return source;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(source, 0, 0, w, h, 0, 0, w, h);
  return cropped;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

export async function downloadPayslipPdf(elementId: string, filename: string): Promise<void> {
  const el = captureTarget(elementId);
  if (!el) {
    throw new Error('Payslip content not found.');
  }

  const restoreParents = neutralizePreviewTransforms(el);
  const prevWidth = el.style.width;
  const prevMinWidth = el.style.minWidth;
  const prevTransform = el.style.transform;
  el.style.width = 'fit-content';
  el.style.minWidth = '0';
  el.style.transform = 'none';

  try {
    await waitForImages(el);
    await nextFrame();
    await nextFrame();

    const { width: captureWidth, height: captureHeight } = measureContentBounds(el);
    const scale = 2;

    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const rawCanvas = await html2canvas(el, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY,
    });

    const canvas = cropCanvas(rawCanvas, captureWidth * scale, captureHeight * scale);
    if (canvas.width < 20 || canvas.height < 20) {
      throw new Error('PDF capture produced empty content. Please try again.');
    }

    const imgData = canvas.toDataURL('image/png');
    const margin = 2;
    const pxToMm = 25.4 / (scale * 96);
    const contentWidthMm = canvas.width * pxToMm;
    const contentHeightMm = canvas.height * pxToMm;
    const pageWidth = contentWidthMm + margin * 2;
    const pageHeight = contentHeightMm + margin * 2;

    const pdf = new jsPDF({
      unit: 'mm',
      format: [pageWidth, pageHeight],
      orientation: pageWidth >= pageHeight ? 'landscape' : 'portrait',
    });

    pdf.addImage(imgData, 'PNG', margin, margin, contentWidthMm, contentHeightMm);
    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  } finally {
    el.style.width = prevWidth;
    el.style.minWidth = prevMinWidth;
    el.style.transform = prevTransform;
    restoreParents();
  }
}
