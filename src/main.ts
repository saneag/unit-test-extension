import * as vscode from "vscode";

import { createTestFileCommand } from "./commands/createTestFileCommand";

export function activate(context: vscode.ExtensionContext) {
  const commands = [createTestFileCommand];

  for (const command of commands) {
    context.subscriptions.push(command);
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
