import * as vscode from "vscode";
import path from "path";
import { getFileNameWithoutExtension } from "./fileNameHelpers";
import { CreationFileError } from "../errors/CreationFileError";
import { UnitTestHelperCommands } from "../constants/commands";

const isFunction = (line: string) => {
  const functionPattern = /^(export\s+)?(async\s+)?function\s+\w+/;
  return functionPattern.test(line.trim());
};

const isArrowFunction = (line: string) => {
  const arrowFunctionPattern =
    /^(export\s+)?(const|let|var)\s+\w+\s*=\s*(async\s+)?\(/;
  return arrowFunctionPattern.test(line.trim());
};

export const createTestFileContent = async (fileNameWithPath: string) => {
  const testFileName = getFileNameWithoutExtension(fileNameWithPath);

  const exportedFunctions: string[] = [];

  const document = await vscode.workspace.openTextDocument(
    vscode.Uri.file(fileNameWithPath)
  );

  const lines = document.getText().split("\n");
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (isFunction(trimmedLine) || isArrowFunction(trimmedLine)) {
      const functionNameMatch = trimmedLine.match(
        /export (function|const|let|var) (\w+)/
      );
      if (functionNameMatch && functionNameMatch[2]) {
        exportedFunctions.push(functionNameMatch[2]);
      }
    }
  }

  if (exportedFunctions.length <= 1) {
    return `describe("${testFileName}", () => {\n  it("should", () => {});\n})`;
  }

  let testFileContent = `describe("${testFileName}", () => {\n`;
  for (const func of exportedFunctions) {
    const isLastFunction =
      func === exportedFunctions[exportedFunctions.length - 1];

    testFileContent += `  describe("${func}", () => {\n    it("should", () => {});\n  });\n${
      isLastFunction ? "" : "\n"
    }`;
  }
  testFileContent += `})`;

  return testFileContent;
};

export const createTestFile = async (
  fileNameWithPath: string,
  testFileNameWithPath: string
): Promise<void> => {
  try {
    const testFileDirectory = path.dirname(testFileNameWithPath);
    await vscode.workspace.fs.createDirectory(
      vscode.Uri.file(testFileDirectory)
    );

    const testFileContent = await createTestFileContent(fileNameWithPath);
    await vscode.workspace.fs.writeFile(
      vscode.Uri.file(testFileNameWithPath),
      Buffer.from(testFileContent, "utf8")
    );

    vscode.window.showInformationMessage(
      `Test file created: ${testFileNameWithPath}`
    );
  } catch (error) {
    throw new CreationFileError(
      `Failed to create test file: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const openFileInEditor = async (filePath: string) => {
  const document = await vscode.workspace.openTextDocument(
    vscode.Uri.file(filePath)
  );
  await vscode.window.showTextDocument(document, { preview: false });
};

export const createAndOpenTestFile = async (
  fileNameWithPath: string,
  testFileNameWithPath: string
): Promise<void> => {
  await createTestFile(fileNameWithPath, testFileNameWithPath);

  const shouldOpenFile =
    vscode.workspace
      .getConfiguration()
      .get<boolean>(UnitTestHelperCommands.openTestFile) ?? true;

  if (shouldOpenFile) {
    await openFileInEditor(testFileNameWithPath);
  }
};
