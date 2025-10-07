<!-- Write me a README for my unit-test-helper extension -->

# Unit Test Helper

A Visual Studio Code extension that helps you quickly create unit test files for your source code files. It works by generating a test file in the closest test directory (like `test` or `__test__`) relative to the current file, or in the same directory if no test directory is found.

## Features

- **Create Test File**: Automatically generates a test file for the currently active source code file.
- **Smart Directory Detection**: Searches for the nearest test directory (`test` or `__test__`) to place the new test file. If none is found, it creates the test file in the same directory as the source file.
- **Error Handling**: Provides informative error messages if the operation cannot be completed (e.g., if the active file is already a test file or if a test file already exists).
