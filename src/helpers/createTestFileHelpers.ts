import * as vscode from "vscode";
import path from "path";
import { getFileNameWithoutExtension } from "./fileNameHelpers";
import { CreationFileError } from "../errors/CreationFileError";
import { UnitTestHelperCommands } from "../constants/commands";

export const createTestFile = async (
  fileNameWithPath: string,
  testFileNameWithPath: string
): Promise<void> => {
  try {
    const testFileDirectory = path.dirname(testFileNameWithPath);
    await vscode.workspace.fs.createDirectory(
      vscode.Uri.file(testFileDirectory)
    );

    const testFileName = getFileNameWithoutExtension(fileNameWithPath);

    const testFileContent = `describe("${testFileName}", () => {\n  it("should", () => {});\n})`;

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

  const isOpenFileInEditor = vscode.workspace
    .getConfiguration()
    .get<boolean>(UnitTestHelperCommands.openTestFileAfterCreation);

  if (isOpenFileInEditor) {
    await openFileInEditor(testFileNameWithPath);
  }
};
