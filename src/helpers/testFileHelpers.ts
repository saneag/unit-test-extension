import * as vscode from "vscode";
import {
  getFileNameWithExtension,
  getFileNameWithoutExtension,
} from "./fileNameHelpers";
import { ExistingFileError } from "../errors/ExistingFileError";
import { AlreadyTestFileError } from "../errors/AlreadyTestFileError";
import { NoActiveEditorError } from "../errors/NoActiveEditorError";
import { CreationFileError } from "../errors/CreationFileError";

export const getEditorOrThrow = () => {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    throw new NoActiveEditorError("No active editor found.");
  }

  return editor;
};

export const checkIfIsTestFileOrThrow = (fileNameWithPath: string) => {
  const isTestFile = /\.test\.(js|ts)$/.test(fileNameWithPath);
  const fileName = getFileNameWithExtension(fileNameWithPath);

  if (isTestFile) {
    throw new AlreadyTestFileError(
      `You are already in a test file: ${fileName}`
    );
  }
};

export const checkIfTestFileExistsOrThrow = async (filePath: string) => {
  try {
    const fileStat = await vscode.workspace.fs.stat(vscode.Uri.file(filePath));

    if (fileStat) {
      throw new ExistingFileError(`Test file already exists: ${filePath}`);
    }
  } catch (error: any) {
    if (
      error?.code === "FileNotFound" ||
      error.name === "EntryNotFound (FileSystemError)"
    ) {
      return;
    }

    throw error;
  }
};

export const createTestFile = async (
  fileNameWithPath: string,
  testFileNameWithPath: string
): Promise<void> => {
  try {
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
