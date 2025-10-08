export function AddPrefixToKeys<
  T extends Record<string, string>,
  P extends string
>(rawCommands: T, prefix: P): { [K in keyof T]: `${P}.${T[K]}` } {
  return Object.fromEntries(
    Object.entries(rawCommands).map(([key, value]) => [
      key,
      `${prefix}.${value}` as `${P}.${T[keyof T]}`,
    ])
  ) as { [K in keyof T]: `${P}.${T[K]}` };
}
