import * as path from "path";
import * as vscode from "vscode";
import { createTestFileNameWithExtension } from "./fileNameHelpers";
import { TEST_DIRECTORY_NAMES } from "../constants/common";
import { TestDirectoryMatch } from "../types/types";
import { isFileNotFoundError } from "./errorHandlers";
import { openFileInEditor } from "./createTestFileHelpers";

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

export const checkIfTestFileExistsAndOpen = async (filePath: string) => {
  try {
    const fileStat = await vscode.workspace.fs.stat(vscode.Uri.file(filePath));

    if (fileStat) {
      await openFileInEditor(filePath);
      return true;
    }
  } catch (error: any) {
    if (isFileNotFoundError(error)) {
      return;
    }

    throw error;
  }
};
