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
 * Unit tests for the Logger utility class.
 *
 * This test suite verifies the logging behavior, file operations, and error tracking
 * of the Logger class, including info, success, error, debug, and log-saving features.
 *
 * All file system and OS dependencies are mocked to ensure isolation and to verify
 * interactions and side effects.
 */
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import type { Logger as LoggerType } from '@/utils/logger';

const mockFs = {
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  appendFileSync: jest.fn(),
};

const mockPath = {
  join: jest.fn(),
  resolve: jest.fn(),
};

const mockOs = {
  homedir: jest.fn(),
  hostname: jest.fn(),
};

const mockConsole = {
  log: jest.fn(),
};

global.console = mockConsole as any;

jest.unstable_mockModule('fs', () => ({
  default: mockFs,
  ...mockFs,
}));

jest.unstable_mockModule('path', () => ({
  default: mockPath,
  ...mockPath,
}));

jest.unstable_mockModule('os', () => ({
  default: mockOs,
  ...mockOs,
}));

describe('Logger', () => {
  /**
   * Test suite for the Logger class.
   *
   * Covers:
   * - Directory creation for logs
   * - Logging of info, success, error, and debug messages
   * - Error counting and log-saving info
   * - File and console output verification
   */
  let Logger: typeof LoggerType;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));

    mockOs.homedir.mockReturnValue('/home/user');
    mockOs.hostname.mockReturnValue('test-host');
    mockPath.join.mockImplementation((...args) => args.join('/'));
    mockPath.resolve.mockImplementation((p) => p);

    const loggerModule = await import('@/utils/logger');
    Logger = loggerModule.Logger;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it('should create logs directory if it does not exist', () => {
    // Arrange
    mockFs.existsSync.mockReturnValue(false);

    // Act
    new Logger();

    // Assert
    expect(mockFs.mkdirSync).toHaveBeenCalledWith('/home/user/.dx-script-app/logs', {
      recursive: true,
    });
  });

  it('should not create logs directory if it already exists', () => {
    // Arrange
    mockFs.existsSync.mockReturnValue(true);

    // Act
    new Logger();

    // Assert
    expect(mockFs.mkdirSync).not.toHaveBeenCalled();
  });

  it('should log info messages', () => {
    // Arrange
    const logger = new Logger();

    // Act
    logger.info('test message');

    // Assert
    expect(mockConsole.log).toHaveBeenCalledWith('[2025-01-01 00:00:00] INFO    test message');
    expect(mockFs.appendFileSync).toHaveBeenCalledWith(
      '/home/user/.dx-script-app/logs/logger.log',
      expect.stringContaining('INFO    (PID ' + process.pid + ' @ test-host) test message'),
      'utf8'
    );
  });

  it('should log success messages', () => {
    // Arrange
    const logger = new Logger();

    // Act
    logger.success('test message');

    // Assert
    expect(mockConsole.log).toHaveBeenCalledWith('[2025-01-01 00:00:00] SUCCESS test message');
    expect(mockFs.appendFileSync).toHaveBeenCalledWith(
      '/home/user/.dx-script-app/logs/logger.log',
      expect.stringContaining('SUCCESS (PID ' + process.pid + ' @ test-host) test message'),
      'utf8'
    );
  });

  it('should log error messages and increment error count', () => {
    // Arrange
    const logger = new Logger();

    // Act
    logger.error('test message');

    // Assert
    expect(mockConsole.log).toHaveBeenCalledWith('[2025-01-01 00:00:00] ERROR   test message');
    expect(mockFs.appendFileSync).toHaveBeenCalledWith(
      '/home/user/.dx-script-app/logs/logger.log',
      expect.stringContaining('ERROR   (PID ' + process.pid + ' @ test-host) test message'),
      'utf8'
    );
    // @ts-expect-error errorCount is private
    expect(logger.errorCount).toBe(1);
  });

  it('should log debug messages only to file', () => {
    // Arrange
    const logger = new Logger();

    // Act
    logger.debug('test message');

    // Assert
    expect(mockConsole.log).not.toHaveBeenCalled();
    expect(mockFs.appendFileSync).toHaveBeenCalledWith(
      '/home/user/.dx-script-app/logs/logger.log',
      expect.stringContaining('DEBUG   (PID ' + process.pid + ' @ test-host) test message'),
      'utf8'
    );
  });

  it('should log saving info if there are errors', () => {
    // Arrange
    const logger = new Logger();
    logger.error('some error');

    // Act
    logger.logSavingInfo();

    // Assert
    expect(mockConsole.log).toHaveBeenCalledWith(
      expect.stringContaining('Full logs can be found at')
    );
  });

  it('should not log saving info if there are no errors', () => {
    // Arrange
    const logger = new Logger();

    // Act
    logger.logSavingInfo();

    // Assert
    expect(mockConsole.log).not.toHaveBeenCalled();
  });
});
