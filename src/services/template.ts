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
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Interface defining the template service contract
 *
 * The TemplateService is responsible for managing project templates,
 * including locating templates, listing available options, and providing
 * template paths for the application creation process.
 */
export interface TemplateService {
  /**
   * Gets the directory where templates are stored
   *
   * @returns The absolute path to the templates directory
   */
  getTemplatesDir(): string;

  /**
   * Gets a list of all available templates
   *
   * @returns Array of template names that can be used to create new applications
   */
  getAvailableTemplates(): string[];

  /**
   * Gets the path to a specific template
   *
   * @param template - The name of the template to locate
   * @returns The absolute path to the specified template directory
   */
  getTemplatePath(template: string): string;
}

/**
 * Default implementation of the TemplateService interface
 *
 * This service handles template management operations including:
 * - Locating the templates directory based on the module path
 * - Listing available templates
 * - Providing paths to specific templates
 */
export class DefaultTemplateService implements TemplateService {
  /** The absolute path to the templates directory */
  private templatesDir: string;

  /**
   * Creates a new DefaultTemplateService instance
   *
   * Initializes the service by calculating the templates directory path
   * based on the provided import.meta.url, which allows for correct path
   * resolution regardless of how the module is imported.
   *
   * @param importMetaUrl - The import.meta.url value from the calling module
   */
  constructor(private importMetaUrl: string) {
    // Calculate templates directory based on import.meta.url
    const dirname = path.dirname(fileURLToPath(this.importMetaUrl));
    this.templatesDir = path.join(dirname, '../templates');
  }

  /**
   * Gets the templates directory path
   *
   * Returns the absolute path to the directory containing all available
   * project templates.
   *
   * @returns The absolute path to the templates directory
   */
  public getTemplatesDir(): string {
    return this.templatesDir;
  }

  /**
   * Gets a list of all available templates
   *
   * This method:
   * 1. Reads the contents of the templates directory
   * 2. Filters the results to include only directories (not files)
   * 3. Returns the names of these directories as available templates
   *
   * @returns Array of template names that can be used to create new applications
   */
  public getAvailableTemplates(): string[] {
    return fs.readdirSync(this.templatesDir).filter((file) => {
      return fs.statSync(path.join(this.templatesDir, file)).isDirectory();
    });
  }

  /**
   * Gets the path to a specific template
   *
   * Combines the templates directory path with the specified template name
   * to provide the absolute path to the template.
   *
   * @param template - The name of the template to locate
   * @returns The absolute path to the specified template directory
   */
  public getTemplatePath(template: string): string {
    return path.join(this.templatesDir, template);
  }
}
