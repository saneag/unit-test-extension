import * as path from "path";
import * as vscode from "vscode";
import {
  createTestFileNameWithExtension,
  getFileNameWithExtension,
} from "./fileNameHelpers";
import {
  TEST_DIRECTORY_NAMES,
  TEST_REGEX,
  TEST_SCRIPT_REGEX,
} from "../constants/common";
import { TestDirectoryMatch } from "../types/types";
import { isFileNotFoundError } from "./errorHandlers";
import { TestifyProperties } from "../constants/properties";

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

export const resolveSourceFilePath = (testFileNameWithPath: string): string => {
  const fileDir = path.dirname(testFileNameWithPath);
  const sourceFileName = path
    .basename(testFileNameWithPath)
    .replace(TEST_REGEX, "");

  let currentDir = fileDir;

  while (true) {
    const dirName = path.basename(currentDir);

    if (TEST_DIRECTORY_NAMES.includes(dirName)) {
      const anchorDir = path.dirname(currentDir);
      const relativeSubDir = path.relative(currentDir, fileDir);

      const targetDir =
        !relativeSubDir || relativeSubDir === "."
          ? anchorDir
          : path.join(anchorDir, relativeSubDir);

      return path.join(targetDir, sourceFileName);
    }

    const parentDir = path.dirname(currentDir);

    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
  }

  return path.join(fileDir, sourceFileName);
};

export const checkIfTestFileExistsAndOpen = async (filePath: string) => {
  try {
    const fileStat = await vscode.workspace.fs.stat(vscode.Uri.file(filePath));

    if (fileStat) {
      await openFileInEditor(filePath);
      return true;
    }
  } catch (error: any) {
    if (isFileNotFoundError(error)) {
      return false;
    }

    throw error;
  }
};

export const isTestFile = (fileNameWithPath: string) => {
  return TEST_SCRIPT_REGEX.test(fileNameWithPath);
};

export const openFileInEditor = async (filePath: string) => {
  const document = await vscode.workspace.openTextDocument(
    vscode.Uri.file(filePath)
  );
  await vscode.window.showTextDocument(document, { preview: false });
};

export const openSourceFileInEditorPrompt = async (
  testFileNameWithPath: string,
  showPrompt = false
) => {
  const fileName = getFileNameWithExtension(testFileNameWithPath);

  if (!isTestFile(testFileNameWithPath)) {
    vscode.window.showInformationMessage(
      `The current file is not recognized as a test file: ${fileName}`
    );
    return false;
  }

  const sourceFileNameWithPath = resolveSourceFilePath(testFileNameWithPath);

  const isOpenSourceFileAutomaticallyEnabled =
    vscode.workspace
      .getConfiguration()
      .get<boolean>(TestifyProperties.openSourceFile) ?? true;

  if (!showPrompt && isOpenSourceFileAutomaticallyEnabled) {
    await openFileInEditor(sourceFileNameWithPath);
    return true;
  }

  const selection = await vscode.window.showInformationMessage(
    `You are already in a test file: ${fileName}\nDo you want to open the source file?`,
    { modal: true },
    "Open Source File"
  );

  if (selection === "Open Source File") {
    await openFileInEditor(sourceFileNameWithPath);
    return true;
  }
};
