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
import type { Logger } from '../utils/logger.js';
import type { PromptService } from './prompt.js';
import type { TemplateService } from './template.js';
import type { FileSystemService } from './file.js';

/**
 * Interface defining the application service contract
 *
 * The ApplicationService is responsible for orchestrating the creation
 * of new script applications by coordinating between various services.
 */
export interface ApplicationService {
  /**
   * Creates a new script application with the specified name and template
   *
   * @param scriptAppName - Name for the new script application (optional, will prompt if not provided)
   * @param template - Template to use for the new application (optional, will prompt if not provided)
   * @returns A Promise that resolves when the application creation is complete
   */
  createScriptApp(scriptAppName?: string, template?: string): Promise<void>;
}

/**
 * Default implementation of the ApplicationService interface
 *
 * This service orchestrates the entire script app creation process by:
 * - Gathering necessary inputs (app name, template)
 * - Creating the project directory structure
 * - Copying template files
 * - Configuring the new project
 * - Providing final instructions to the user
 */
export class DefaultApplicationService implements ApplicationService {
  /**
   * Creates a new DefaultApplicationService instance
   *
   * @param logger - Logger service for recording application events
   * @param promptService - Service for prompting user for input
   * @param templateService - Service for managing templates
   * @param fileService - Service for file system operations
   */
  constructor(
    private logger: Logger,
    private promptService: PromptService,
    private templateService: TemplateService,
    private fileService: FileSystemService
  ) {}

  /**
   * Creates a new script application
   *
   * This method performs the following steps:
   * 1. Gets the application name (from params or by prompting)
   * 2. Determines which template to use (from params or by prompting)
   * 3. Creates and configures the project directory
   * 4. Copies template files into the new project
   * 5. Updates package.json with the correct project name
   * 6. Provides instructions for next steps
   *
   * @param scriptAppName - Optional script app name (will prompt if not provided)
   * @param template - Optional template name (will prompt if not provided)
   * @returns A Promise that resolves when the application creation is complete
   * @throws Error if directory already exists or other file operations fail
   */
  public async createScriptApp(scriptAppName?: string, template?: string): Promise<void> {
    // Get script app name if not provided
    const appName = scriptAppName || (await this.promptService.askForScriptAppName());

    // Get available templates
    const availableTemplates = this.templateService.getAvailableTemplates();

    // Get template if not provided or not valid
    let selectedTemplate = template;
    if (!selectedTemplate || !availableTemplates.includes(selectedTemplate)) {
      selectedTemplate = await this.promptService.askForTemplate(availableTemplates);
    }

    // Format the project name
    const formattedName = this.fileService.formatProjectName(appName);
    const finalPath = this.fileService.resolvePath(`./${formattedName}`);

    // Check if directory already exists
    if (this.fileService.directoryExists(finalPath)) {
      this.logger.error(`Directory already exists: ${finalPath}`);
      process.exit(1);
    }

    // Create the project directory
    this.fileService.createDirectory(finalPath);

    // Get template path
    const templatePath = this.templateService.getTemplatePath(selectedTemplate);

    // Copy template files
    this.fileService.copyRecursive(templatePath, finalPath);
    this.logger.info(`Scaffolding project in ${finalPath}`);

    // Generate a unique identifier for the ROOT_IDENTIFIER placeholder
    const timestamp = Date.now();
    const uniqueId = `${appName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;

    // Update all template placeholders
    this.fileService.updateTemplatePlaceholders(finalPath, appName, [
      { placeholder: '__ROOT_IDENTIFIER__', value: uniqueId },
    ]);

    // Log completion instructions
    this.logger.info(`Done. Now run:


			cd ${finalPath}
			npm install
			npm run dev
			

			# To deploy script app, make sure to check Environment (.env files) and update the credentials accordingly
			# And run:
			npm install
			npm run build
			npm run dx-deploy
		`);
    // Check if any errors occurred and provide info about log location
    this.logger.logSavingInfo();
  }
}
