export class AlreadyTestFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AlreadyTestFileError";
  }
}
