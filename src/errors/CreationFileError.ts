export class CreationFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CreationFileError";
  }
}
