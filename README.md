# Unit Test Helper

A Visual Studio Code extension that helps you quickly create unit test files for your source code files. It works by generating a test file in the closest test directory relative to the current file, or in the same directory if no test directory is found.

## Features

- Automatically generates a test file for the currently active source code file and opens it in new tab when you run **Testify: Create Test File** command.
- Searches for the nearest test directory (**test**, **\_\_test\_\_**, **tests**, **\_\_tests\_\_**) to place the new test file. If none is found, it creates the test file in the same directory as the source file.
- Opens the test file that corresponds to the currently active source code file.
- Opens the source file that corresponds to the currently active test file.
- Creates test files for multiple selected files in the Explorer view.
- Creates test files for all files in the currently selected directory.
- Provides informative error messages if the operation cannot be completed (e.g., if the active file is already a test file or if a test file already exists).

## Commands

- **Testify: Create Test File**: Generates a unit test file for the currently active source code file.
- **Testify: Open Test File**: Opens the test file corresponding to the currently active source code file.
- **Testify: Open Source File**: Opens the source code file corresponding to the currently active test file.
- **Testify: Create Test Files**: Generates unit test files for all selected files in the Explorer view or for all files in the selected directory.

## Configurations

> **Open source file**: Toggles the command to open the source file from a test file automatically.

> **Open test file**: Toggles the command to open the test file from a source file automatically.

> **Test file variant**: Choose the suffix for generated tests (**.test** or **.spec**, default: **.test**).

> **Test Directory Names**: Configurable list of directory names to search for test files (default: **test**, **\_\_test\_\_**, **tests**, **\_\_tests\_\_**).
