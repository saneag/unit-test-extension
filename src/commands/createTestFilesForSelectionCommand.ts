import * as vscode from "vscode";
import { UnitTestHelperCommands } from "../constants/commands";
import { handleErrorMessage } from "../helpers/errorHandlers";
import { createUnitTestsForAllFiles } from "../helpers/createTestFilesForSelectedDirectoryHelpers";

export const createTestFilesForSelectionCommand =
  vscode.commands.registerCommand(
    UnitTestHelperCommands.createTestFilesForSelection,
    async (uri: vscode.Uri) => {
      try {
        await createUnitTestsForAllFiles(uri);
      } catch (error) {
        handleErrorMessage(error);
      }
    }
  );
