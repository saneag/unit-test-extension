import * as path from "path";
import * as vscode from "vscode";
import {
  createTestFileNameWithExtension,
  getFileNameWithExtension,
  TestFileVariant,
} from "./fileNameHelpers";
import { TEST_REGEX, TEST_SCRIPT_REGEX } from "../constants/common";
import { TestDirectoryMatch } from "../types/types";
import { isFileNotFoundError } from "./errorHandlers";
import { TestifyProperties } from "../constants/properties";

const TEST_FILE_VARIANTS: TestFileVariant[] = ["test", "spec"];

export const TEST_DIRECTORY_NAMES = vscode.workspace
  .getConfiguration()
  .get<string[]>(TestifyProperties.testDirectoryNames) ?? [
  "__tests__",
  "__test__",
  "tests",
  "test",
];

const TS_SCRIPT_EXTENSIONS: readonly string[] = [".ts", ".tsx"];

const getTsExtensionVariants = (filePath: string): string[] => {
  const ext = path.extname(filePath);
  const extLower = ext.toLowerCase();

  if (!TS_SCRIPT_EXTENSIONS.includes(extLower)) {
    return [filePath];
  }

  const basePath = filePath.slice(0, -ext.length);
  const orderedExtensions =
    extLower === ".ts"
      ? TS_SCRIPT_EXTENSIONS
      : [...TS_SCRIPT_EXTENSIONS].reverse();

  return orderedExtensions.map((extension) => `${basePath}${extension}`);
};

const doesFileExist = async (filePath: string): Promise<boolean> => {
  try {
    await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
    return true;
  } catch (error: any) {
    if (isFileNotFoundError(error)) {
      return false;
    }

    throw error;
  }
};

const findExistingTsVariant = async (
  filePath: string
): Promise<string | null> => {
  for (const candidate of getTsExtensionVariants(filePath)) {
    const exists = await doesFileExist(candidate);

    if (exists) {
      return candidate;
    }
  }

  return null;
};

const findNearestTestDirectory = async (
  startDir: string
): Promise<TestDirectoryMatch | null> => {
  let currentDir = startDir;
  let isFinalAttempt = false;

  const folder = vscode.workspace.workspaceFolders?.[0];

  do {
    isFinalAttempt = folder?.name
      ? currentDir.endsWith(folder?.name)
      : currentDir.endsWith("src");

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
  } while (!isFinalAttempt);

  return null;
};

const resolveTargetFilePath = async (
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

  return path.join(targetDir, path.basename(fileNameWithPath));
};

export const resolveTestFilePath = async (
  fileNameWithPath: string,
  variant?: TestFileVariant
): Promise<string> => {
  const targetFilePath = await resolveTargetFilePath(fileNameWithPath);
  const selectedVariant = variant ?? TEST_FILE_VARIANTS[0];

  return createTestFileNameWithExtension(targetFilePath, selectedVariant);
};

export const resolveTestFilePathVariants = async (
  fileNameWithPath: string,
  variants?: TestFileVariant[]
): Promise<string[]> => {
  const targetFilePath = await resolveTargetFilePath(fileNameWithPath);
  const variantsToUse =
    variants && variants.length > 0 ? variants : TEST_FILE_VARIANTS;
  const uniquePaths = new Set<string>();

  for (const variant of variantsToUse) {
    uniquePaths.add(createTestFileNameWithExtension(targetFilePath, variant));
  }

  return Array.from(uniquePaths);
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
    const fileToOpen = await findExistingTsVariant(filePath);

    if (fileToOpen) {
      await openFileInEditor(fileToOpen);
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
  const existingSourceFilePath = await findExistingTsVariant(
    sourceFileNameWithPath
  );

  if (!existingSourceFilePath) {
    vscode.window.showWarningMessage(
      `Source file could not be found for: ${fileName}`
    );
    return false;
  }

  const isOpenSourceFileAutomaticallyEnabled =
    vscode.workspace
      .getConfiguration()
      .get<boolean>(TestifyProperties.openSourceFile) ?? true;

  if (!showPrompt && isOpenSourceFileAutomaticallyEnabled) {
    await openFileInEditor(existingSourceFilePath);
    return true;
  }

  const selection = await vscode.window.showInformationMessage(
    `You are already in a test file: ${fileName}\nDo you want to open the source file?`,
    { modal: true },
    "Open Source File"
  );

  if (selection === "Open Source File") {
    await openFileInEditor(existingSourceFilePath);
    return true;
  }
};

export const isDirectory = async (uri: vscode.Uri) => {
  try {
    const stat = await vscode.workspace.fs.stat(uri);
    return stat.type === vscode.FileType.Directory;
  } catch (error: any) {
    if (isFileNotFoundError(error)) {
      return false;
    }

    throw error;
  }
};
