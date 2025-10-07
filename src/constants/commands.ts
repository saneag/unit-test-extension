const TESTIFY_PREFIX = "testify";

const RawTestifyCommands = {
  createTestFile: "createTestFile",
  openTestFileAfterCreation: "openTestFileAfterCreation",
};

function GenericCommands<T extends Record<string, string>, P extends string>(
  rawCommands: T,
  prefix: P
): { [K in keyof T]: `${P}.${T[K]}` } {
  return Object.fromEntries(
    Object.entries(rawCommands).map(([key, value]) => [
      key,
      `${prefix}.${value}` as `${P}.${T[keyof T]}`,
    ])
  ) as { [K in keyof T]: `${P}.${T[K]}` };
}

export const UnitTestHelperCommands = GenericCommands(
  RawTestifyCommands,
  TESTIFY_PREFIX
);
