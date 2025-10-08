import * as vscode from "vscode";

import { createTestFileCommand } from "./commands/createTestFileCommand";
import { openTestFileCommand } from "./commands/openTestFileCommand";
import { openSourceFileCommand } from "./commands/openSourceFileCommand";

export function activate(context: vscode.ExtensionContext) {
  const commands = [
    createTestFileCommand,
    openTestFileCommand,
    openSourceFileCommand,
  ];

  for (const command of commands) {
    context.subscriptions.push(command);
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
