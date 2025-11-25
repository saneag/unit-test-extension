import * as vscode from "vscode";
import { SCRIPT_EXTENSION_REGEX, TEST_REGEX } from "../constants/common";
import {
  checkIfTestFileExistsAndOpen,
  isDirectory,
  resolveTestFilePath,
} from "./directoryPathHelpers";
import { createAndOpenTestFile } from "./createTestFileHelpers";
import path from "path";

const getAllFilesThatCanBeTested = async (selectedUris: vscode.Uri[]) => {
  const stack: vscode.Uri[] = selectedUris;
  const result: vscode.Uri[] = [];
  let wasWarningShown = false;

  while (stack.length > 0) {
    const currentUri = stack.pop();

    if (!currentUri) {
      return result;
    }

    let entries: [string, vscode.FileType][] = [];

    if (await isDirectory(currentUri)) {
      entries = await vscode.workspace.fs.readDirectory(currentUri);
    } else {
      entries = [[path.basename(currentUri.path) || "", vscode.FileType.File]];
    }

    for (const [fileName, fileType] of entries) {
      let entryUri: vscode.Uri;

      if (await isDirectory(currentUri)) {
        entryUri = vscode.Uri.joinPath(currentUri, fileName);
      } else {
        entryUri = currentUri;
      }

      const isTestFile = TEST_REGEX.test(fileName);

      if (isTestFile) {
        if (!wasWarningShown) {
          vscode.window.showWarningMessage(
            "Test files were skipped when creating test files."
          );
          wasWarningShown = true;
        }

        continue;
      }

      const isScriptFile =
        SCRIPT_EXTENSION_REGEX.test(fileName) && !TEST_REGEX.test(fileName);

      if (fileType === vscode.FileType.Directory) {
        stack.push(entryUri);
      } else if (fileType === vscode.FileType.File && isScriptFile) {
        result.push(entryUri);
      }
    }
  }

  return result;
};

export const createUnitTestsForAllFiles = async (
  selectedUris: vscode.Uri[]
) => {
  const files = await getAllFilesThatCanBeTested(selectedUris);

  const resolvedPaths = await Promise.all(
    files.map(async (file) => ({
      fileNameWithPath: file.path,
      testFileNameWithPath: await resolveTestFilePath(file.path),
    }))
  );

  if (resolvedPaths.length === 0) {
    vscode.window.showInformationMessage(
      `No files found to create test files for.`
    );
    return;
  }

  let createdCount = 0;

  for (const { fileNameWithPath, testFileNameWithPath } of resolvedPaths) {
    const isTestFileOpened = await checkIfTestFileExistsAndOpen(
      testFileNameWithPath
    );

    if (isTestFileOpened) {
      continue;
    }

    await createAndOpenTestFile(fileNameWithPath, testFileNameWithPath, true);
    createdCount++;
  }

  if (createdCount > 0) {
    vscode.window.showInformationMessage(
      `Created ${createdCount} test file(s) successfully.`
    );
  } else {
    vscode.window.showInformationMessage(
      `No new test files created. Existing test files were opened instead.`
    );
  }
};
