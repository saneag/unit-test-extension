import * as vscode from "vscode";

import { createTestFileCommand } from "./commands/createTestFileCommand";
import { openTestFileCommand } from "./commands/openTestFileCommand";
import { openSourceFileCommand } from "./commands/openSourceFileCommand";
import { healthCheck } from "./helpers/healthCheckHelpers";
import { createTestFilesForSelectionCommand } from "./commands/createTestFilesForSelectionCommand";

export function activate(context: vscode.ExtensionContext) {
  try {
    healthCheck(context);

    const commands = [
      createTestFileCommand,
      openTestFileCommand,
      openSourceFileCommand,
      createTestFilesForSelectionCommand,
    ];

    for (const command of commands) {
      context.subscriptions.push(command);
    }
  } catch (error) {
    console.error("Error activating extension:", error);
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
