const FIELD_BASES = [
  "/src/components/Field/",
  "/src/components/Field/Basic/",
  "/src/components/Field/General/",
  "/src/components/Field/JegElementorKit/",
  "/src/components/Field/Pro/",
  "/src/components/Field/Other/",
  "/src/components/Field/ElementsKit/",
];

/**
 * @param {unknown} data
 * @returns {Array<Record<string, unknown>>}
 */
export function normalizeElementorRoots(data) {
  if (data == null) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "object") return [data];
  return [];
}

/**
 * @param {string} widgetType
 * @returns {string[]}
 */
export function fieldPathsForWidgetType(widgetType) {
  if (!widgetType) return [];
  const names = [widgetType];
  if (widgetType.includes("_")) {
    names.push(widgetType.replace(/_/g, "-"));
  }
  const paths = [];
  for (const base of FIELD_BASES) {
    for (const name of names) {
      paths.push(`${base}${name}.vue`);
    }
  }
  return [...new Set(paths)];
}

/**
 * @param {Record<string, { default?: unknown }>} modules import.meta.glob(..., { eager: true })
 * @param {string} widgetType
 * @returns {unknown | null} Vue 组件（default export）
 */
export function pickFieldModule(modules, widgetType) {
  for (const p of fieldPathsForWidgetType(widgetType)) {
    const mod = modules[p];
    if (mod?.default) return mod.default;
  }
  return null;
}
