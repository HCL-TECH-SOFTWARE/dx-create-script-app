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
import prompts from 'prompts';
import type { Logger } from '../utils/logger.js';

/**
 * Interface defining the prompt service contract
 *
 * The PromptService is responsible for gathering user input interactively
 * through command-line prompts during the script app creation process.
 */
export interface PromptService {
  /**
   * Prompts the user to enter a name for the script app
   *
   * @returns A Promise that resolves to the user-provided script app name
   * @throws Exits the process if the user doesn't provide a valid name
   */
  askForScriptAppName(): Promise<string>;

  /**
   * Prompts the user to select a template from the available options
   *
   * @param availableTemplates - Array of available template names to choose from
   * @returns A Promise that resolves to the selected template name
   */
  askForTemplate(availableTemplates: string[]): Promise<string>;
}

/**
 * Default implementation of the PromptService interface
 *
 * This service handles interactive user prompts for gathering information
 * needed during the script app creation process, such as the app name
 * and template selection.
 */
export class DefaultPromptService implements PromptService {
  /**
   * Creates a new DefaultPromptService instance
   *
   * @param logger - Logger service for recording prompt events and errors
   */
  constructor(private logger: Logger) {}

  /**
   * Prompts the user to enter a name for the script app
   *
   * This method:
   * 1. Displays a text prompt asking for the script app name
   * 2. Validates that the user provided a non-empty value
   * 3. Performs additional validation on the input
   * 4. Exits the process with an error message if validation fails
   *
   * @returns A Promise that resolves to the validated script app name
   * @throws Exits the process if the user doesn't provide a valid name
   */
  public validateScriptAppName(name: string): boolean | string {
    if (!name) {
      return 'Script App name is required';
    }
    // Only allow ASCII letters, numbers, underscores, and hyphens.
    // Restricting to ASCII avoids issues with file systems, tooling, and cross-platform compatibility.
    // Allowing Unicode or non-ASCII characters may cause problems in some environments.
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      return 'Name must only contain letters, numbers, underscores, or hyphens (no spaces or special characters).';
    }
    return true;
  }

  public async askForScriptAppName(): Promise<string> {
    const response = await prompts({
      type: 'text',
      name: 'scriptAppName',
      message: 'Enter the script app name:',
      validate: this.validateScriptAppName,
    });

    const scriptAppName = response.scriptAppName;

    let isValid = true;
    if (!scriptAppName) {
      isValid = false;
    } else if (typeof scriptAppName !== 'string') {
      isValid = false;
    } else if (scriptAppName.trim().length === 0) {
      isValid = false;
    }

    if (!isValid) {
      this.logger.error('Project name is required.');
      process.exit(1);
    }

    return scriptAppName as string;
  }

  /**
   * Prompts the user to select a template from the available options
   *
   * This method:
   * 1. Displays a selection prompt with the available templates as choices
   * 2. Allows the user to navigate and select a template
   * 3. Returns the selected template name
   *
   * @param availableTemplates - Array of available template names to choose from
   * @returns A Promise that resolves to the selected template name
   */
  public async askForTemplate(availableTemplates: string[]): Promise<string> {
    const response = await prompts({
      type: 'select',
      name: 'frameworkTemplate',
      message: 'Select a framework template:',
      choices: availableTemplates.map((folder) => ({ title: folder, value: folder })),
    });

    return response.frameworkTemplate;
  }
}
