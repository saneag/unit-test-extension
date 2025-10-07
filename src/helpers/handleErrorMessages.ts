import * as vscode from "vscode";

import { AlreadyTestFileError } from "../errors/AlreadyTestFileError";
import { CreationFileError } from "../errors/CreationFileError";
import { ExistingFileError } from "../errors/ExistingFileError";
import { NoActiveEditorError } from "../errors/NoActiveEditorError";

export const handleErrorMessage = (error: unknown) => {
  if (
    error instanceof ExistingFileError ||
    error instanceof AlreadyTestFileError ||
    error instanceof NoActiveEditorError ||
    error instanceof CreationFileError
  ) {
    vscode.window.showInformationMessage(error.message);
    return;
  }

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
};
