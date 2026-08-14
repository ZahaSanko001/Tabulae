import { toPng, toSvg } from "html-to-image";
import { getNodesBounds, getViewportForBounds, type Node } from "reactflow";

const EXPORT_PADDING = 40;

function prepareExport(nodes: Node[]) {
  const bounds = getNodesBounds(nodes);
  const width = bounds.width + EXPORT_PADDING * 2;
  const height = bounds.height + EXPORT_PADDING * 2;
  const viewport = getViewportForBounds(bounds, width, height, 0.5, 2, EXPORT_PADDING);
  return { width, height, viewport };
}

async function captureViewport(
  nodes: Node[],
  method: typeof toPng | typeof toSvg,
): Promise<string> {
  const el = document.querySelector(".react-flow__viewport") as HTMLElement;
  if (!el) throw new Error("Canvas not found");

  const { width, height, viewport } = prepareExport(nodes);

  return method(el, {
    width,
    height,
    backgroundColor: "#0B1120",
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    },
  });
}

function download(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function exportPng(nodes: Node[], filename = "schema.png") {
  const dataUrl = await captureViewport(nodes, toPng);
  download(dataUrl, filename);
}

export async function exportSvg(nodes: Node[], filename = "schema.svg") {
  const dataUrl = await captureViewport(nodes, toSvg);
  download(dataUrl, filename);
}