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

/**
 * @fileoverview
 * Unit tests for DefaultApplicationService.
 *
 * This test suite verifies the behavior of the DefaultApplicationService class, which is responsible
 * for orchestrating the creation of a script app using various services (logger, prompt, template, file system).
 *
 * The tests use Jest and mock all dependencies to ensure isolation and to verify interactions.
 *
 * Test coverage includes:
 * - Creating a script app with provided arguments
 * - Prompting for missing script app name
 * - Prompting for missing template
 * - Handling the case where the target directory already exists
 *
 * Each test case sets up the required mocks and expectations, then asserts that the service behaves as intended.
 */
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import type { DefaultApplicationService as DefaultApplicationServiceType } from '@/services/application';
import type { Logger } from '@/utils/logger';
import type { PromptService } from '@/services/prompt';
import type { TemplateService } from '@/services/template';
import type { FileSystemService } from '@/services/file';

// --- Mock Factory Functions ---
// These functions create fully mocked versions of the service dependencies.
const createMockLogger = (): jest.Mocked<Logger> => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  success: jest.fn(),
  logSavingInfo: jest.fn(),
  debug: jest.fn(),
});

const createMockPromptService = (): jest.Mocked<PromptService> => ({
  askForScriptAppName: jest.fn(),
  askForTemplate: jest.fn(),
});

const createMockTemplateService = (): jest.Mocked<TemplateService> => ({
  getAvailableTemplates: jest.fn(),
  getTemplatePath: jest.fn(),
});

const createMockFileSystemService = (): jest.Mocked<FileSystemService> => ({
  createDirectory: jest.fn(),
  copyRecursive: jest.fn(),
  formatProjectName: jest.fn(),
  resolvePath: jest.fn(),
  updateTemplatePlaceholders: jest.fn(),
  directoryExists: jest.fn(),
});

describe('DefaultApplicationService', () => {
  // Service class and mocks
  let DefaultApplicationService: typeof DefaultApplicationServiceType;
  let applicationService: DefaultApplicationServiceType;
  let logger: jest.Mocked<Logger>;
  let promptService: jest.Mocked<PromptService>;
  let templateService: jest.Mocked<TemplateService>;
  let fileService: jest.Mocked<FileSystemService>;

  // Set up a fresh instance and mocks before each test
  beforeEach(async () => {
    const applicationModule = await import('@/services/application');
    DefaultApplicationService = applicationModule.DefaultApplicationService;

    logger = createMockLogger();
    promptService = createMockPromptService();
    templateService = createMockTemplateService();
    fileService = createMockFileSystemService();

    applicationService = new DefaultApplicationService(
      logger,
      promptService,
      templateService,
      fileService
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  /**
   * Test: Should create script app with provided arguments
   *
   * Verifies that when both the app name and template are provided, the service:
   * - Formats the project name
   * - Resolves the path
   * - Checks directory existence
   * - Copies the template
   * - Updates placeholders
   * - Logs completion
   */
  it('should create script app with provided arguments', async () => {
    // Arrange
    templateService.getAvailableTemplates.mockReturnValue(['react-ts']);
    fileService.formatProjectName.mockReturnValue('my-app');
    fileService.resolvePath.mockReturnValue('/path/to/my-app');
    fileService.directoryExists.mockReturnValue(false);
    templateService.getTemplatePath.mockReturnValue('/template/path');

    // Act
    await applicationService.createScriptApp('my-app', 'react-ts');

    // Assert
    expect(fileService.createDirectory).toHaveBeenCalledWith('/path/to/my-app');
    expect(fileService.copyRecursive).toHaveBeenCalledWith('/template/path', '/path/to/my-app');

    // Check that updateTemplatePlaceholders was called with the correct first two arguments
    expect(fileService.updateTemplatePlaceholders).toHaveBeenCalled();
    const updateTemplateCall = fileService.updateTemplatePlaceholders.mock.calls[0];
    expect(updateTemplateCall[0]).toBe('/path/to/my-app');
    expect(updateTemplateCall[1]).toBe('my-app');

    // Check that the third argument is an array with the ROOT_IDENTIFIER placeholder
    expect(Array.isArray(updateTemplateCall[2])).toBe(true);
    expect(updateTemplateCall[2].length).toBe(1);
    expect(updateTemplateCall[2][0].placeholder).toBe('__ROOT_IDENTIFIER__');
    expect(updateTemplateCall[2][0].value).toMatch(/^my-app-\d+$/);
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Done. Now run:'));
  });

  /**
   * Test: Should prompt for script app name if not provided
   *
   * Verifies that if the script app name is missing, the service prompts the user for it
   * and then proceeds with the creation process using the provided name.
   */
  it('should prompt for script app name if not provided', async () => {
    // Arrange
    promptService.askForScriptAppName.mockResolvedValue('my-app-from-prompt');
    templateService.getAvailableTemplates.mockReturnValue(['react-ts']);
    fileService.formatProjectName.mockReturnValue('my-app-from-prompt');
    fileService.resolvePath.mockReturnValue('/path/to/my-app-from-prompt');
    fileService.directoryExists.mockReturnValue(false);

    // Act
    await applicationService.createScriptApp(undefined, 'react-ts');

    // Assert
    expect(promptService.askForScriptAppName).toHaveBeenCalled();
    expect(fileService.formatProjectName).toHaveBeenCalledWith('my-app-from-prompt');
  });

  /**
   * Test: Should prompt for template if not provided
   *
   * Verifies that if the template is missing, the service prompts the user to select one
   * from the available templates, then proceeds with the creation process.
   */
  it('should prompt for template if not provided', async () => {
    // Arrange
    templateService.getAvailableTemplates.mockReturnValue(['react-ts', 'react-js']);
    promptService.askForTemplate.mockResolvedValue('react-js');
    fileService.formatProjectName.mockReturnValue('my-app');
    fileService.resolvePath.mockReturnValue('/path/to/my-app');
    fileService.directoryExists.mockReturnValue(false);

    // Act
    await applicationService.createScriptApp('my-app', undefined);

    // Assert
    expect(promptService.askForTemplate).toHaveBeenCalledWith(['react-ts', 'react-js']);
    expect(templateService.getTemplatePath).toHaveBeenCalledWith('react-js');
  });

  /**
   * Test: Should exit if directory already exists
   *
   * Verifies that if the target directory already exists, the service logs an error
   * and exits the process with code 1.
   */
  it('should exit if directory already exists', async () => {
    // Arrange
    const mockExit = jest
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as (code?: number) => never);
    templateService.getAvailableTemplates.mockReturnValue(['react-ts']);
    fileService.formatProjectName.mockReturnValue('my-app');
    fileService.resolvePath.mockReturnValue('/path/to/my-app');
    fileService.directoryExists.mockReturnValue(true);

    // Act
    await applicationService.createScriptApp('my-app', 'react-ts');

    // Assert
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(logger.error).toHaveBeenCalledWith('Directory already exists: /path/to/my-app');
  });
});
