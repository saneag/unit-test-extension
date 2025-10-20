import * as vscode from "vscode";
import { UnitTestHelperCommands } from "../constants/commands";
import { handleErrorMessage } from "../helpers/errorHandlers";
import { createUnitTestsForAllFiles } from "../helpers/createTestFilesForSelectedDirectoryHelpers";

export const createTestFilesForSelectedDirectory =
  vscode.commands.registerCommand(
    UnitTestHelperCommands.createTestFilesForSelectedDirectory,
    async (uri: vscode.Uri) => {
      try {
        await createUnitTestsForAllFiles(uri);
      } catch (error) {
        handleErrorMessage(error);
      }
    }
  );
