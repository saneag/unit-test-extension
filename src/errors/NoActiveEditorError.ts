export class NoActiveEditorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoActiveEditorError";
  }
}
