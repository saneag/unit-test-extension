import { SCRIPT_EXTENSION_REGEX } from "../constants/common";

export const getFileNameWithExtension = (fileNameWithPath: string): string => {
  return fileNameWithPath.split("/").pop() || "";
};

export const getFileNameWithoutExtension = (
  fileNameWithPath: string
): string => {
  return (
    fileNameWithPath.split("/").pop()?.replace(SCRIPT_EXTENSION_REGEX, "") || ""
  );
};

export const createTestFileNameWithExtension = (
  fileNameWithPath: string
): string => {
  return fileNameWithPath.replace(SCRIPT_EXTENSION_REGEX, ".test.$1");
};
