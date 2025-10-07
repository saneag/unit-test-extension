export const getFileNameWithExtension = (fileNameWithPath: string): string => {
  return fileNameWithPath.split("/").pop() || "";
};

export const getFileNameWithoutExtension = (
  fileNameWithPath: string
): string => {
  return (
    fileNameWithPath
      .split("/")
      .pop()
      ?.replace(/(\.js|\.ts)$/, "") || ""
  );
};

export const createTestFileNameWithExtension = (
  fileNameWithPath: string
): string => {
  return fileNameWithPath.replace(/(\.js|\.ts)$/, ".test$1");
};
