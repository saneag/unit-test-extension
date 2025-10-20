import { AddPrefixToKeys } from "../helpers/commonHelpers";
import { TESTIFY_PREFIX } from "./common";

const RawTestifyCommands = {
  createTestFile: "createTestFile",
  openTestFile: "openTestFile",
  openSourceFile: "openSourceFile",
  createTestFilesForSelectedDirectory: "createTestFilesForSelectedDirectory",
};

export const UnitTestHelperCommands = AddPrefixToKeys(
  RawTestifyCommands,
  TESTIFY_PREFIX
);
