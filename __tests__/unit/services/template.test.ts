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
 * Unit tests for the DefaultTemplateService class.
 *
 * This test suite verifies template directory resolution, available template listing,
 * and template path resolution logic.
 *
 * All file system, path, and URL dependencies are mocked to ensure isolation and to verify
 * interactions and side effects.
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import type { DefaultTemplateService as DefaultTemplateServiceType } from '@/services/template';

const mockFs = {
  readdirSync: jest.fn(),
  statSync: jest.fn(),
};

const mockPath = {
  dirname: jest.fn(),
  join: jest.fn(),
};

const mockUrl = {
  fileURLToPath: jest.fn(),
};

jest.unstable_mockModule('fs', () => ({
  default: mockFs,
}));

jest.unstable_mockModule('path', () => ({
  default: mockPath,
}));

jest.unstable_mockModule('url', () => mockUrl);

describe('DefaultTemplateService', () => {
  /**
   * Test suite for the DefaultTemplateService class.
   *
   * Covers:
   * - Template directory resolution
   * - Listing available templates
   * - Resolving template paths
   */
  let DefaultTemplateService: typeof DefaultTemplateServiceType;
  let templateService: DefaultTemplateServiceType;

  beforeEach(async () => {
    const templateModule = await import('@/services/template');
    DefaultTemplateService = templateModule.DefaultTemplateService;

    mockUrl.fileURLToPath.mockReturnValue('/path/to/file');
    mockPath.dirname.mockReturnValue('/path/to');
    mockPath.join.mockImplementation((...args) => args.join('/'));

    templateService = new DefaultTemplateService('file:///path/to/file');
  });

  it('should get templates directory', () => {
    // Arrange
    // (no special setup needed)

    // Act
    const templatesDir = templateService.getTemplatesDir();

    // Assert
    expect(templatesDir).toBe('/path/to/../templates');
  });

  it('should get available templates', () => {
    // Arrange
    mockFs.readdirSync.mockReturnValue(['react-ts', 'react-js', 'file.txt']);
    mockFs.statSync.mockImplementation((path) => ({
      isDirectory: () => path.endsWith('react-ts') || path.endsWith('react-js'),
    }));

    // Act
    const templates = templateService.getAvailableTemplates();

    // Assert
    expect(templates).toEqual(['react-ts', 'react-js']);
  });

  it('should get template path', () => {
    // Arrange
    // (no special setup needed)

    // Act
    const templatePath = templateService.getTemplatePath('react-ts');

    // Assert
    expect(templatePath).toBe('/path/to/../templates/react-ts');
  });
});
