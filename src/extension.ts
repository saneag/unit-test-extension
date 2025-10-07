import * as vscode from "vscode";
import { UnitTestHelperCommands } from "./constants/commands";
import {
  checkIfIsTestFileOrThrow,
  checkIfTestFileExistsOrThrow,
  createTestFile,
  getEditorOrThrow,
  resolveTestFilePath,
} from "./helpers/testFileHelpers";
import { handleErrorMessage } from "./helpers/handleErrorMessages";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    UnitTestHelperCommands.createTestFile,
    async () => {
      try {
        const editor = getEditorOrThrow();

        const document = editor.document;
        const fileNameWithPath = document.fileName;

        checkIfIsTestFileOrThrow(fileNameWithPath);

        const testFileNameWithPath = await resolveTestFilePath(
          fileNameWithPath
        );

        await checkIfTestFileExistsOrThrow(testFileNameWithPath);

        await createTestFile(fileNameWithPath, testFileNameWithPath);
      } catch (error) {
        handleErrorMessage(error);
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
