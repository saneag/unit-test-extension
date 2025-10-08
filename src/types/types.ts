export interface TestDirectoryMatch {
  anchorDir: string;
  testDir: string;
}

export interface HealthCheckStatus {
  status: "ok" | "error";
  message?: string;
}
