import * as path from "path";
import * as vscode from "vscode";
import {
  getFileNameWithExtension,
  getFileNameWithoutExtension,
  createTestFileNameWithExtension,
} from "./fileNameHelpers";
import { ExistingFileError } from "../errors/ExistingFileError";
import { AlreadyTestFileError } from "../errors/AlreadyTestFileError";
import { NoActiveEditorError } from "../errors/NoActiveEditorError";
import { CreationFileError } from "../errors/CreationFileError";
import { TEST_DIRECTORY_NAMES, TEST_SCRIPT_REGEX } from "../constants/common";
import { TestDirectoryMatch } from "../types/types";

const isFileNotFoundError = (error: any): boolean => {
  return (
    error?.code === "FileNotFound" ||
    error?.name === "EntryNotFound (FileSystemError)"
  );
};

const findNearestTestDirectory = async (
  startDir: string
): Promise<TestDirectoryMatch | null> => {
  let currentDir = startDir;

  while (true) {
    for (const dirName of TEST_DIRECTORY_NAMES) {
      const candidate = path.join(currentDir, dirName);

      try {
        const stat = await vscode.workspace.fs.stat(vscode.Uri.file(candidate));

        if (stat.type === vscode.FileType.Directory) {
          return { anchorDir: currentDir, testDir: candidate };
        }
      } catch (error: any) {
        if (isFileNotFoundError(error)) {
          continue;
        }

        throw error;
      }
    }

    const parentDir = path.dirname(currentDir);

    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
  }

  return null;
};

export const resolveTestFilePath = async (
  fileNameWithPath: string
): Promise<string> => {
  const fileDir = path.dirname(fileNameWithPath);
  const match = await findNearestTestDirectory(fileDir);

  const targetDir = (() => {
    if (!match) {
      return fileDir;
    }

    const relativeSubDir = path.relative(match.anchorDir, fileDir);

    if (!relativeSubDir || relativeSubDir === ".") {
      return match.testDir;
    }

    return path.join(match.testDir, relativeSubDir);
  })();

  const targetFilePath = path.join(targetDir, path.basename(fileNameWithPath));

  return createTestFileNameWithExtension(targetFilePath);
};

export const getEditorOrThrow = () => {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    throw new NoActiveEditorError("No active editor found.");
  }

  return editor;
};

export const checkIfIsTestFileOrThrow = (fileNameWithPath: string) => {
  const isTestFile = TEST_SCRIPT_REGEX.test(fileNameWithPath);
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
    if (isFileNotFoundError(error)) {
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
