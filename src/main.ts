import * as vscode from "vscode";

import { createTestFileCommand } from "./commands/createTestFileCommand";
import { openTestFileCommand } from "./commands/openTestFileCommand";

export function activate(context: vscode.ExtensionContext) {
  const commands = [createTestFileCommand, openTestFileCommand];

  for (const command of commands) {
    context.subscriptions.push(command);
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
