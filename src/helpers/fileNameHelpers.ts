import path from "path";
import { SCRIPT_EXTENSION_REGEX } from "../constants/common";

export const getFileNameWithExtension = (fileNameWithPath: string): string => {
  return path.basename(fileNameWithPath) || "";
};

export const getFileNameWithoutExtension = (
  fileNameWithPath: string
): string => {
  return (
    path.basename(fileNameWithPath).replace(SCRIPT_EXTENSION_REGEX, "") || ""
  );
};

export const createTestFileNameWithExtension = (
  fileNameWithPath: string
): string => {
  return fileNameWithPath.replace(SCRIPT_EXTENSION_REGEX, ".test.$1");
};
