export class ExistingFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExistingFileError";
  }
}
