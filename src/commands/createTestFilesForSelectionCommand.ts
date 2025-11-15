import * as vscode from "vscode";
import { UnitTestHelperCommands } from "../constants/commands";
import { handleErrorMessage } from "../helpers/errorHandlers";
import { createUnitTestsForAllFiles } from "../helpers/createTestFilesForSelectedDirectoryHelpers";

export const createTestFilesForSelectionCommand =
  vscode.commands.registerCommand(
    UnitTestHelperCommands.createTestFilesForSelection,
    async (uri: vscode.Uri, uris: vscode.Uri[]) => {
      try {
        const selectedUris = uris && uris.length > 0 ? uris : [uri];
        await createUnitTestsForAllFiles(selectedUris);
      } catch (error) {
        handleErrorMessage(error);
      }
    }
  );
