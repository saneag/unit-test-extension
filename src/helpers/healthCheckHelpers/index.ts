import * as vscode from "vscode";

import { checkPackageJsonHealth } from "./packageJsonHealthCheck";
import { HealthCheckStatus } from "../../types/types";

const getStatuses = (): HealthCheckStatus[] => {
  // Add other health checks here as needed
  const packageStatus = checkPackageJsonHealth();

  return [packageStatus];
};

export const healthCheck = (context: vscode.ExtensionContext) => {
  try {
    const hasRunBefore = context.globalState.get<boolean>("hasRunBefore");

    if (!hasRunBefore) {
      const statuses = getStatuses();

      if (statuses.some((status) => status.status === "error")) {
        const errorMessages = statuses
          .filter((status) => status.status === "error")
          .map((status) => status.message)
          .join(", ");

        throw new Error(`Health check failed: ${errorMessages}`);
      }

      context.globalState.update("hasRunBefore", true);

      return {
        status: "ok",
        message: "Health check passed.",
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: (error as Error).message,
    };
  }
};
