function captureTarget(elementId: string): HTMLElement {
  const root = document.getElementById(elementId);
  if (!root) throw new Error('Payslip content not found.');
  return (root.querySelector('article') as HTMLElement | null) ?? root;
}

function clearAncestorTransforms(el: HTMLElement): () => void {
  const restores: Array<() => void> = [];
  let parent = el.parentElement;

  while (parent) {
    const computed = window.getComputedStyle(parent);
    if (computed.transform && computed.transform !== 'none') {
      const prevTransform = parent.style.transform;
      parent.style.transform = 'none';
      restores.push(() => {
        parent!.style.transform = prevTransform;
      });
    }
    parent = parent.parentElement;
  }

  return () => {
    restores.forEach((restore) => restore());
  };
}

function measureCaptureSize(el: HTMLElement): { width: number; height: number } {
  const style = window.getComputedStyle(el);
  const padL = parseFloat(style.paddingLeft) || 0;
  const padR = parseFloat(style.paddingRight) || 0;
  const padB = parseFloat(style.paddingBottom) || 0;
  const borderL = parseFloat(style.borderLeftWidth) || 0;
  const borderR = parseFloat(style.borderRightWidth) || 0;
  const borderB = parseFloat(style.borderBottomWidth) || 0;

  const table = el.querySelector('table') as HTMLElement | null;
  if (table) {
    const top = el.getBoundingClientRect().top;
    const tableRect = table.getBoundingClientRect();
    return {
      width: Math.ceil(tableRect.width + padL + padR + borderL + borderR),
      height: Math.ceil(tableRect.bottom - top + padB + borderB),
    };
  }

  const rect = el.getBoundingClientRect();
  return {
    width: Math.ceil(rect.width),
    height: Math.ceil(rect.height),
  };
}

function prepareClone(clonedEl: HTMLElement): void {
  clonedEl.style.overflow = 'visible';
  clonedEl.style.width = 'fit-content';
  clonedEl.style.minWidth = '0';
  clonedEl.style.maxWidth = 'none';
  clonedEl.style.boxSizing = 'border-box';
  clonedEl.style.transform = 'none';

  const table = clonedEl.querySelector('table') as HTMLElement | null;
  if (table) {
    table.style.width = '';
    table.style.minWidth = '';
    table.style.tableLayout = 'fixed';
  }
}

export async function downloadPayslipPdf(elementId: string, filename: string): Promise<void> {
  const el = captureTarget(elementId);
  const restoreAncestors = clearAncestorTransforms(el);

  const prevWidth = el.style.width;
  const prevMinWidth = el.style.minWidth;
  const prevTransform = el.style.transform;
  el.style.width = 'fit-content';
  el.style.minWidth = '0';
  el.style.transform = 'none';

  const { width: captureWidth, height: captureHeight } = measureCaptureSize(el);
  const scale = 2;

  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const canvas = await html2canvas(el, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: captureWidth,
      height: captureHeight,
      windowWidth: captureWidth,
      windowHeight: captureHeight,
      scrollX: 0,
      scrollY: -window.scrollY,
      onclone: (_doc, clonedEl) => {
        prepareClone(clonedEl);
      },
    });

    const imgData = canvas.toDataURL('image/png');
    const margin = 4;
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
    restoreAncestors();
  }
}
