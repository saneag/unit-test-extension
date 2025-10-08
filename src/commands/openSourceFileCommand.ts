import * as vscode from "vscode";

import { UnitTestHelperCommands } from "../constants/commands";
import { getEditorOrThrow, handleErrorMessage } from "../helpers/errorHandlers";
import { openSourceFileInEditorPrompt } from "../helpers/directoryPathHelpers";

export const openSourceFileCommand = vscode.commands.registerCommand(
  UnitTestHelperCommands.openSourceFile,
  async () => {
    try {
      const editor = getEditorOrThrow();

      const document = editor.document;
      const fileNameWithPath = document.fileName;

      await openSourceFileInEditorPrompt(fileNameWithPath);
    } catch (error) {
      handleErrorMessage(error);
    }
  }
);
