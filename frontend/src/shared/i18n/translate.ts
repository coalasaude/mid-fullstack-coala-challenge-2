import type { MessageTree } from './messages';

export function getStringAtPath(tree: MessageTree, path: string): string {
  const segments = path.split('.');
  let current: unknown = tree;
  for (const segment of segments) {
    if (current === null || typeof current !== 'object') return path;
    current = (current as Record<string, unknown>)[segment];
  }
  return typeof current === 'string' ? current : path;
}

export function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : '',
  );
}
