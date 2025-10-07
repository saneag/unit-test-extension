import * as vscode from "vscode";

import { AlreadyTestFileError } from "../errors/AlreadyTestFileError";
import { CreationFileError } from "../errors/CreationFileError";
import { ExistingFileError } from "../errors/ExistingFileError";
import { NoActiveEditorError } from "../errors/NoActiveEditorError";
import { TEST_SCRIPT_REGEX } from "../constants/common";
import { getFileNameWithExtension } from "./fileNameHelpers";

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

export const checkIfIsTestFileOrThrow = (fileNameWithPath: string) => {
  const isTestFile = TEST_SCRIPT_REGEX.test(fileNameWithPath);
  const fileName = getFileNameWithExtension(fileNameWithPath);

  if (isTestFile) {
    throw new AlreadyTestFileError(
      `You are already in a test file: ${fileName}`
    );
  }
};
