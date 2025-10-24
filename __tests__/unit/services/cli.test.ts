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
 * Unit tests for the CliService class.
 *
 * This test suite verifies the argument parsing logic of the CLI service, ensuring
 * that script app names and options are correctly extracted from command-line arguments.
 */
import { describe, it, expect } from '@jest/globals';
import { CliService } from '@/services/cli';

describe('CliService', () => {
  /**
   * Test suite for the CliService class.
   *
   * Covers:
   * - Parsing of script app name
   * - Parsing of template and path options
   * - Handling of missing or partial arguments
   */
  let cliService: CliService;

  beforeEach(() => {
    cliService = new CliService();
  });

  it('should parse scriptAppName', () => {
    // Arrange
    // (no special setup needed)

    // Act
    const result = cliService.parse(['node', 'script.js', 'my-app']);

    // Assert
    expect(result.scriptAppName).toBe('my-app');
  });

  it('should parse template option', () => {
    // Arrange
    // (no special setup needed)

    // Act
    const result = cliService.parse(['node', 'script.js', '-t', 'react-ts']);

    // Assert
    expect(result.options.template).toBe('react-ts');
  });

  it('should parse path option', () => {
    // Arrange
    // (no special setup needed)

    // Act
    const result = cliService.parse(['node', 'script.js', '-p', '/my/path']);

    // Assert
    expect(result.options.path).toBe('/my/path');
  });

  it('should parse all arguments', () => {
    // Arrange
    const args = ['node', 'script.js', 'my-app', '-t', 'react-ts', '-p', '/my/path'];

    // Act
    const result = cliService.parse(args);

    // Assert
    expect(result.scriptAppName).toBe('my-app');
    expect(result.options.template).toBe('react-ts');
    expect(result.options.path).toBe('/my/path');
  });

  it('should handle no arguments', () => {
    // Arrange
    // (no special setup needed)

    // Act
    const result = cliService.parse(['node', 'script.js']);

    // Assert
    expect(result.scriptAppName).toBeUndefined();
    expect(result.options.template).toBeUndefined();
    expect(result.options.path).toBeUndefined();
  });
});
