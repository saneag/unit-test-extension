import * as vscode from "vscode";
import { TestifyProperties } from "./properties";

export const TEST_DIRECTORY_NAMES = vscode.workspace
  .getConfiguration()
  .get<string[]>(TestifyProperties.testDirectoryNames) ?? [
  "__tests__",
  "__test__",
  "tests",
  "test",
];

export const TESTIFY_PREFIX = "testify";
export const TEST_SCRIPT_REGEX = /\.(test|spec)\.(js|ts|jsx|tsx)$/;
export const SCRIPT_EXTENSION_REGEX = /\.(js|ts|jsx|tsx)$/;
export const TEST_REGEX = /\.(test|spec)/;
