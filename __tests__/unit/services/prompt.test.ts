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
 * Unit tests for the DefaultPromptService class.
 *
 * This test suite verifies user prompt logic for script app name and template selection,
 * including validation and error handling.
 *
 * All prompt and logger dependencies are mocked to ensure isolation and to verify
 * interactions and side effects.
 */
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import type { DefaultPromptService as DefaultPromptServiceType } from '@/services/prompt';
import type { Logger } from '@/utils/logger';

const createMockLogger = (): jest.Mocked<Logger> => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  success: jest.fn(),
  logSavingInfo: jest.fn(),
  debug: jest.fn(),
});

const mockPrompts = jest.fn();

jest.unstable_mockModule('prompts', () => ({
  default: mockPrompts,
}));

describe('DefaultPromptService', () => {
  /**
   * Test suite for the DefaultPromptService class.
   *
   * Covers:
   * - Prompting for script app name
   * - Prompting for template selection
   * - Validation and error handling for user input
   */
  let DefaultPromptService: typeof DefaultPromptServiceType;
  let promptService: DefaultPromptServiceType;
  let logger: jest.Mocked<Logger>;

  beforeEach(async () => {
    logger = createMockLogger();
    const promptModule = await import('@/services/prompt');
    DefaultPromptService = promptModule.DefaultPromptService;
    promptService = new DefaultPromptService(logger);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('askForScriptAppName', () => {
    it('should return script app name when provided', async () => {
      // Arrange
      mockPrompts.mockResolvedValue({ scriptAppName: 'my-app' });

      // Act
      const scriptAppName = await promptService.askForScriptAppName();

      // Assert
      expect(scriptAppName).toBe('my-app');
    });

    it('should exit if script app name is not provided', async () => {
      // Arrange
      const mockExit = jest
        .spyOn(process, 'exit')
        .mockImplementation((() => {}) as (code?: number) => never);
      mockPrompts.mockResolvedValue({ scriptAppName: '' });

      // Act
      await promptService.askForScriptAppName();

      // Assert
      expect(mockExit).toHaveBeenCalledWith(1);
      expect(logger.error).toHaveBeenCalledWith('Project name is required.');
    });

    it('should exit if script app name is undefined', async () => {
      // Arrange
      const mockExit = jest
        .spyOn(process, 'exit')
        .mockImplementation((() => {}) as (code?: number) => never);
      mockPrompts.mockResolvedValue({ scriptAppName: undefined });

      // Act
      await promptService.askForScriptAppName();

      // Assert
      expect(mockExit).toHaveBeenCalledWith(1);
      expect(logger.error).toHaveBeenCalledWith('Project name is required.');
    });

    it('should exit if script app name is only whitespace', async () => {
      // Arrange
      const mockExit = jest
        .spyOn(process, 'exit')
        .mockImplementation((() => {}) as (code?: number) => never);
      mockPrompts.mockResolvedValue({ scriptAppName: '   ' });

      // Act
      await promptService.askForScriptAppName();

      // Assert
      expect(mockExit).toHaveBeenCalledWith(1);
      expect(logger.error).toHaveBeenCalledWith('Project name is required.');
    });

    it('should exit if script app name is not a string', async () => {
      // Arrange
      const mockExit = jest
        .spyOn(process, 'exit')
        .mockImplementation((() => {}) as (code?: number) => never);
      mockPrompts.mockResolvedValue({ scriptAppName: 123 });

      // Act
      await promptService.askForScriptAppName();

      // Assert
      expect(mockExit).toHaveBeenCalledWith(1);
      expect(logger.error).toHaveBeenCalledWith('Project name is required.');
    });
  });

  describe('askForScriptAppName validator', () => {
    it('should return error string for invalid characters', () => {
      // Arrange
      logger = createMockLogger();
      promptService = new DefaultPromptService(logger);

      // Act & Assert
      expect(promptService.validateScriptAppName('bad name!')).toMatch(/Name must only contain/);
    });

    it('should return true for valid characters', () => {
      // Arrange
      logger = createMockLogger();
      promptService = new DefaultPromptService(logger);

      // Act & Assert
      expect(promptService.validateScriptAppName('good_name-123')).toBe(true);
    });
  });

  describe('askForTemplate', () => {
    it('should return selected template', async () => {
      // Arrange
      mockPrompts.mockResolvedValue({ frameworkTemplate: 'react-ts' });

      // Act
      const template = await promptService.askForTemplate(['react-ts', 'react-js']);

      // Assert
      expect(template).toBe('react-ts');
      expect(mockPrompts).toHaveBeenCalledWith({
        type: 'select',
        name: 'frameworkTemplate',
        message: 'Select a framework template:',
        choices: [
          { title: 'react-ts', value: 'react-ts' },
          { title: 'react-js', value: 'react-js' },
        ],
      });
    });
  });
});
