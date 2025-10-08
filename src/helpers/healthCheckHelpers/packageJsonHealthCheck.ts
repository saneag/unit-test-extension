import path from "path";
import { readFileSync } from "fs";

import { HealthCheckStatus } from "../../types/types";
import { UnitTestHelperCommands } from "../../constants/commands";
import { TestifyProperties } from "../../constants/properties";

const checkCommandsSpelling = (packageJson: any): HealthCheckStatus => {
  const commandsInPackageJson = packageJson.contributes.commands.map(
    (cmd: any) => cmd.command
  );

  const testifyCommands = Object.values(UnitTestHelperCommands);

  const missingCommands = testifyCommands.filter(
    (cmd) => !commandsInPackageJson.includes(cmd)
  );

  if (missingCommands.length > 0) {
    throw new Error(
      `Missing commands in package.json: ${missingCommands.join(", ")}`
    );
  }

  return {
    status: "ok",
  };
};

const checkPropertiesSpelling = (packageJson: any): HealthCheckStatus => {
  const propertiesInPackageJson = Object.keys(
    packageJson.contributes.configuration.properties
  );

  const testifyProperties = Object.values(TestifyProperties);

  const missingProperties = testifyProperties.filter(
    (prop) => !propertiesInPackageJson.includes(prop)
  );

  if (missingProperties.length > 0) {
    throw new Error(
      `Missing properties in package.json: ${missingProperties.join(", ")}`
    );
  }

  return {
    status: "ok",
  };
};

export const checkPackageJsonHealth = (): HealthCheckStatus => {
  const packageJsonPath = path.join(__dirname, "..", "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

  const commandsStatus = checkCommandsSpelling(packageJson);
  const propertiesStatus = checkPropertiesSpelling(packageJson);

  if (commandsStatus.status === "ok" && propertiesStatus.status === "ok") {
    return {
      status: "ok",
      message: "All commands and properties are correctly defined.",
    };
  }

  return {
    status: "error",
    message: "There are issues with commands or properties definitions.",
  };
};
