import * as vscode from "vscode";
import { SCRIPT_EXTENSION_REGEX, TEST_REGEX } from "../constants/common";
import { resolveTestFilePath } from "./directoryPathHelpers";
import { createAndOpenTestFile } from "./createTestFileHelpers";

const getAllFilesThatCanBeTested = async (rootUri: vscode.Uri) => {
  const stack: vscode.Uri[] = [rootUri];
  const result: vscode.Uri[] = [];

  while (stack.length > 0) {
    const currentUri = stack.pop();

    if (!currentUri) {
      return result;
    }

    const entries = await vscode.workspace.fs.readDirectory(currentUri);

    for (const [fileName, fileType] of entries) {
      const entryUri = vscode.Uri.joinPath(currentUri, fileName);

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

export const createUnitTestsForAllFiles = async (uri: vscode.Uri) => {
  const files = await getAllFilesThatCanBeTested(uri);

  const resolvedPaths = await Promise.all(
    files.map(async (file) => ({
      fileNameWithPath: file.path,
      testFileNameWithPath: await resolveTestFilePath(file.path),
    }))
  );

  resolvedPaths.forEach(
    async ({ fileNameWithPath, testFileNameWithPath }) =>
      await createAndOpenTestFile(fileNameWithPath, testFileNameWithPath)
  );
};
