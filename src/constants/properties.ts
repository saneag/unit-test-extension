import { AddPrefixToKeys } from "../helpers/commonHelpers";
import { TESTIFY_PREFIX } from "./common";

const RawTestifyProperties = {
  openTestFile: "openTestFile",
  openSourceFile: "openSourceFile",
  testDirectoryNames: "testDirectoryNames",
  testFileVariant: "testFileVariant",
};

export const TestifyProperties = AddPrefixToKeys(
  RawTestifyProperties,
  TESTIFY_PREFIX
);
