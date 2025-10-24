/* ======================================================================== *
 * Copyright 2025 HCL America Inc.                                          *
 * Licensed under the Apache License, Version 2.0 (the "License");          *
 * you may not use this file except in compliance with the License.         *
 * You may obtain a copy of the License at                                  *
 *                                                                          *
 * http://www.apache.org/licenses/LICENSE-2.0                               *
 *                                                                          *
 * Unless required by applicable law or agreed to in writing, software      *
 * distributed under the License is distributed on an "AS IS" BASIS,        *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *
 * See the License for the specific language governing permissions and      *
 * limitations under the License.                                           *
 * ======================================================================== */
import { Command } from 'commander';

/**
 * Interface representing command-line options provided by the user
 *
 * @property {string} [template] - The template option specified by -t or --template
 * @property {string} [path] - The path option specified by -p or --path
 */
export interface CliOptions {
  template?: string;
  path?: string;
}

/**
 * Interface representing the complete result of CLI argument parsing
 *
 * @property {string} [scriptAppName] - The name of the script app provided as a positional argument
 * @property {CliOptions} options - The command-line options provided
 */
export interface CliResult {
  scriptAppName?: string;
  options: CliOptions;
}

/**
 * Service responsible for command-line interface operations
 *
 * The CliService handles the configuration and parsing of command-line arguments
 * using the Commander.js library. It defines the available commands, options,
 * and provides structured access to user input.
 */
export class CliService {
  /** The Commander instance used to define and parse commands */
  private program: Command;

  /**
   * Creates a new CliService instance
   *
   * Initializes a new Commander instance for parsing command-line arguments.
   */
  constructor() {
    this.program = new Command();
  }

  /**
   * Initializes the CLI configuration and parses command-line arguments
   *
   * This method:
   * 1. Defines the CLI command name and description
   * 2. Configures positional arguments (script app name)
   * 3. Sets up option flags (-t/--template, -p/--path)
   * 4. Parses the provided arguments
   * 5. Returns structured results
   *
   * @param args - Command line arguments (typically process.argv)
   * @returns Structured result containing the script app name and options
   */
  public parse(args: string[]): CliResult {
    this.program
      .name('create-dx-scriptapp')
      .description('Create a new DX script app')
      .argument('[scriptAppName]', 'Name of the project')
      .option('-t, --template <template>', 'Template to use')
      .option('-p, --path <path>', 'Path to create the project')
      .parse(args);

    const options = this.program.opts() as CliOptions;
    const scriptAppName = this.program.args[0];

    return {
      scriptAppName,
      options,
    };
  }
}
