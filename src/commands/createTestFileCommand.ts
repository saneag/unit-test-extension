import * as vscode from "vscode";
import { UnitTestHelperCommands } from "../constants/commands";
import {
  checkIfIsTestFileOrThrow,
  getEditorOrThrow,
  handleErrorMessage,
} from "../helpers/errorHandlers";
import {
  checkIfTestFileExistsAndOpen,
  resolveTestFilePath,
} from "../helpers/directoryPathHelpers";
import { createAndOpenTestFile } from "../helpers/createTestFileHelpers";

export const createTestFileCommand = vscode.commands.registerCommand(
  UnitTestHelperCommands.createTestFile,
  async () => {
    try {
      const editor = getEditorOrThrow();

      const document = editor.document;
      const fileNameWithPath = document.fileName;

      checkIfIsTestFileOrThrow(fileNameWithPath);

      const testFileNameWithPath = await resolveTestFilePath(fileNameWithPath);

      const isTestFileOpened = await checkIfTestFileExistsAndOpen(
        testFileNameWithPath
      );

      if (isTestFileOpened) {
        return;
      }

      await createAndOpenTestFile(fileNameWithPath, testFileNameWithPath);
    } catch (error) {
      handleErrorMessage(error);
    }
  }
);
