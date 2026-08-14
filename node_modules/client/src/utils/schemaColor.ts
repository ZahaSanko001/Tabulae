const PALETTE = ["#F59E0B", "#38BDF8", "#34D399", "#F472B6", "#A78BFA", "#FB923C"];

export function schemaColor(schema: string): string {
  let hash = 0;
  for (let i = 0; i < schema.length; i++) hash = (hash * 31 + schema.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}