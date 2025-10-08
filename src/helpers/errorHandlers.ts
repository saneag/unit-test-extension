import * as vscode from "vscode";

import { CreationFileError } from "../errors/CreationFileError";
import { ExistingFileError } from "../errors/ExistingFileError";
import { NoActiveEditorError } from "../errors/NoActiveEditorError";

export const handleErrorMessage = (error: unknown) => {
  if (
    error instanceof ExistingFileError ||
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

export const isFileNotFoundError = (error: any): boolean => {
  return (
    error?.code === "FileNotFound" ||
    error?.name === "EntryNotFound (FileSystemError)"
  );
};

export const getEditorOrThrow = () => {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    throw new NoActiveEditorError("No active editor found.");
  }

  return editor;
};
