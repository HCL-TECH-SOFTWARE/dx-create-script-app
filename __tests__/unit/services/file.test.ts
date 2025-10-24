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
 * Unit tests for the DefaultFileSystemService class.
 *
 * This test suite verifies file system operations such as directory existence,
 * directory creation, recursive copying, project name formatting, path resolution,
 * and template placeholder updates.
 *
 * All file system and path dependencies are mocked to ensure isolation and to verify
 * interactions and side effects.
 */
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import type { DefaultFileSystemService as DefaultFileSystemServiceType } from '@/services/file';
import type { Logger } from '@/utils/logger';

const createMockLogger = (): jest.Mocked<Logger> => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  success: jest.fn(),
});

const mockFs = {
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  statSync: jest.fn(),
  readdirSync: jest.fn(),
  copyFileSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
};

const mockPath = {
  resolve: jest.fn(),
  join: jest.fn(),
  dirname: jest.fn(),
  extname: jest.fn(),
  basename: jest.fn(),
};

jest.unstable_mockModule('fs', () => ({
  default: mockFs,
  ...mockFs,
}));

jest.unstable_mockModule('path', () => ({
  default: mockPath,
  ...mockPath,
}));

describe('DefaultFileSystemService', () => {
  /**
   * Test suite for the DefaultFileSystemService class.
   *
   * Covers:
   * - Directory existence and creation
   * - Recursive file and directory copying
   * - Project name formatting and path resolution
   * - Template placeholder replacement in files
   * - Edge cases for file and directory handling
   */
  let logger: jest.Mocked<Logger>;
  let fileSystemService: DefaultFileSystemServiceType;
  let fs: typeof mockFs;
  let path: typeof mockPath;

  beforeEach(async () => {
    const { DefaultFileSystemService } = await import('@/services/file');
    fs = (await import('fs')).default;
    path = (await import('path')).default;
    logger = createMockLogger();
    fileSystemService = new DefaultFileSystemService(logger);
    path.join.mockImplementation((...args) => args.join('/'));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('directoryExists', () => {
    it('should return true if directory exists', () => {
      // Arrange
      const dirPath = '/test-dir';
      mockFs.existsSync.mockReturnValue(true);

      // Act
      const result = fileSystemService.directoryExists(dirPath);

      // Assert
      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith(dirPath);
    });

    it('should return false if directory does not exist', () => {
      // Arrange
      const dirPath = '/test-dir';
      mockFs.existsSync.mockReturnValue(false);

      // Act
      const result = fileSystemService.directoryExists(dirPath);

      // Assert
      expect(result).toBe(false);
      expect(fs.existsSync).toHaveBeenCalledWith(dirPath);
    });
  });

  describe('createDirectory', () => {
    it('should create directory if it does not exist', () => {
      // Arrange
      const dirPath = '/test-dir';
      mockFs.existsSync.mockReturnValue(false);

      // Act
      fileSystemService.createDirectory(dirPath);

      // Assert
      expect(fs.mkdirSync).toHaveBeenCalledWith(dirPath, { recursive: true });
      expect(logger.info).toHaveBeenCalledWith(`Created directory: ${dirPath}`);
    });

    it('should not create directory if it already exists', () => {
      // Arrange
      const dirPath = '/test-dir';
      mockFs.existsSync.mockReturnValue(true);

      // Act
      fileSystemService.createDirectory(dirPath);

      // Assert
      expect(fs.mkdirSync).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe('copyRecursive', () => {
    it('should copy a file', () => {
      // Arrange
      const src = '/src/file.txt';
      const dest = '/dest/file.txt';
      mockFs.statSync.mockReturnValue({ isDirectory: () => false });

      // Act
      fileSystemService.copyRecursive(src, dest);

      // Assert
      expect(fs.copyFileSync).toHaveBeenCalledWith(src, dest);
    });

    it('should copy a directory', () => {
      // Arrange
      const src = '/src/dir';
      const dest = '/dest/dir';
      mockFs.statSync.mockImplementation((path) => ({
        isDirectory: () => path === src,
      }));
      mockFs.readdirSync.mockReturnValue(['file.txt']);
      mockFs.existsSync.mockReturnValue(false);

      // Act
      fileSystemService.copyRecursive(src, dest);

      // Assert
      expect(fs.mkdirSync).toHaveBeenCalledWith(dest);
      expect(fs.copyFileSync).toHaveBeenCalledWith('/src/dir/file.txt', '/dest/dir/file.txt');
    });

    it('should copy a directory when destination exists', () => {
      // Arrange
      const src = '/src/dir';
      const dest = '/dest/dir';
      mockFs.statSync.mockImplementation((path) => ({
        isDirectory: () => path === src,
      }));
      mockFs.readdirSync.mockReturnValue(['file.txt']);
      mockFs.existsSync.mockReturnValue(true); // Destination exists

      // Act
      fileSystemService.copyRecursive(src, dest);

      // Assert
      expect(fs.mkdirSync).not.toHaveBeenCalled();
      expect(fs.copyFileSync).toHaveBeenCalledWith('/src/dir/file.txt', '/dest/dir/file.txt');
    });
  });

  describe('updateTemplatePlaceholders', () => {
    it('should update package.json in directory', () => {
      // Arrange
      const dirPath = '/path/to';
      const pkgPath = '/path/to/package.json';
      const scriptAppName = 'my-app';
      const pkg = {
        scripts: {
          'dx-deploy':
            'dx-script-deploy --content-root __CONTENT_ROOT__ --wcm-content __WCM_CONTENT_NAME__',
        },
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dir) => (dir === dirPath ? ['package.json'] : []));
      mockFs.statSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });
      mockFs.readFileSync.mockReturnValue(JSON.stringify(pkg));
      mockPath.extname.mockReturnValue('.json');
      mockPath.basename.mockReturnValue('package.json');

      // Act
      fileSystemService.updateTemplatePlaceholders(dirPath, scriptAppName);

      // Assert
      const expectedPkg = {
        scripts: {
          'dx-deploy': 'dx-script-deploy --content-root ./dist --wcm-content my-app',
        },
      };
      expect(fs.writeFileSync).toHaveBeenCalledWith(pkgPath, JSON.stringify(expectedPkg, null, 2));
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Updated placeholders in:'));
    });

    it('should replace __SCRIPT_APP_NAME__ in package name', () => {
      // Arrange
      const dirPath = '/path/to';
      const pkgPath = '/path/to/package.json';
      const scriptAppName = 'my-app';
      const pkg = {
        name: '__SCRIPT_APP_NAME__',
        scripts: {
          'dx-deploy':
            'dx-script-deploy --content-root __CONTENT_ROOT__ --wcm-content __WCM_CONTENT_NAME__',
        },
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dir) => (dir === dirPath ? ['package.json'] : []));
      mockFs.statSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });
      mockFs.readFileSync.mockReturnValue(JSON.stringify(pkg));
      mockPath.extname.mockReturnValue('.json');
      mockPath.basename.mockReturnValue('package.json');

      // Act
      fileSystemService.updateTemplatePlaceholders(dirPath, scriptAppName);

      // Assert
      const expectedPkg = {
        name: 'my-app',
        scripts: {
          'dx-deploy': 'dx-script-deploy --content-root ./dist --wcm-content my-app',
        },
      };
      expect(fs.writeFileSync).toHaveBeenCalledWith(pkgPath, JSON.stringify(expectedPkg, null, 2));
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Updated placeholders in:'));
    });

    it('should not update package.json if it does not exist', () => {
      // Arrange
      const dirPath = '/path/to';
      const scriptAppName = 'my-app';
      mockFs.existsSync.mockReturnValue(false);
      mockFs.readdirSync.mockReturnValue([]);

      // Act
      fileSystemService.updateTemplatePlaceholders(dirPath, scriptAppName);

      // Assert
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should not update package.json if dx-deploy script is not present', () => {
      // Arrange
      const dirPath = '/path/to';
      const pkgPath = '/path/to/package.json';
      const scriptAppName = 'my-app';
      const pkg = {
        scripts: {},
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dir) => (dir === dirPath ? ['package.json'] : []));
      mockFs.statSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });
      mockFs.readFileSync.mockReturnValue(JSON.stringify(pkg));
      mockPath.extname.mockReturnValue('.json');
      mockPath.basename.mockReturnValue('package.json');

      // Act
      fileSystemService.updateTemplatePlaceholders(dirPath, scriptAppName);

      // Assert
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('updateTemplatePlaceholders edge cases', () => {
    it('should replace __SCRIPT_APP_NAME__ in deeply nested package.json fields', () => {
      const dirPath = '/path/to';
      const pkgPath = '/path/to/package.json';
      const scriptAppName = 'my-app';
      const pkg = {
        name: 'outer',
        nested: {
          inner: {
            value: '__SCRIPT_APP_NAME__',
          },
        },
        scripts: {},
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dir) => (dir === dirPath ? ['package.json'] : []));
      mockFs.statSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });
      mockFs.readFileSync.mockReturnValue(JSON.stringify(pkg));
      mockPath.extname.mockReturnValue('.json');
      mockPath.basename.mockReturnValue('package.json');

      fileSystemService.updateTemplatePlaceholders(dirPath, scriptAppName);

      const expectedPkg = {
        name: 'outer',
        nested: {
          inner: {
            value: 'my-app',
          },
        },
        scripts: {},
      };
      expect(fs.writeFileSync).toHaveBeenCalledWith(pkgPath, JSON.stringify(expectedPkg, null, 2));
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Updated placeholders in:'));
    });

    it('should replace __SCRIPT_APP_NAME__ in a non-package.json file', () => {
      const dirPath = '/path/to';
      const filePath = '/path/to/index.html';
      const scriptAppName = 'my-app';
      const fileContent = '<body id="__SCRIPT_APP_NAME__">';
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dir) => (dir === dirPath ? ['index.html'] : []));
      mockFs.statSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });
      mockFs.readFileSync.mockReturnValue(fileContent);
      mockPath.extname.mockReturnValue('.html');
      mockPath.basename.mockReturnValue('index.html');

      fileSystemService.updateTemplatePlaceholders(dirPath, scriptAppName);

      expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, '<body id="my-app">', 'utf-8');
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Updated placeholders in:'));
    });

    it('should skip node_modules directory', () => {
      const dirPath = '/path/to';
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dir) =>
        dir === dirPath ? ['node_modules', 'file.txt'] : []
      );
      mockFs.statSync.mockImplementation((file) => ({
        isDirectory: () => file === '/path/to/node_modules',
        isFile: () => file === '/path/to/file.txt',
      }));
      mockFs.readFileSync.mockReturnValue('no match');
      mockPath.extname.mockReturnValue('.txt');
      mockPath.basename.mockReturnValue('file.txt');

      fileSystemService.updateTemplatePlaceholders(dirPath, 'my-app');
      // Should not throw or process node_modules
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should not write if file does not contain __SCRIPT_APP_NAME__', () => {
      const dirPath = '/path/to';
      const filePath = '/path/to/empty.txt';
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dir) => (dir === dirPath ? ['empty.txt'] : []));
      mockFs.statSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });
      mockFs.readFileSync.mockReturnValue('no match');
      mockPath.extname.mockReturnValue('.txt');
      mockPath.basename.mockReturnValue('empty.txt');

      fileSystemService.updateTemplatePlaceholders(dirPath, 'my-app');
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should skip non-text (binary) files', () => {
      const dirPath = '/path/to';
      const filePath = '/path/to/image.png';
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dir) => (dir === dirPath ? ['image.png'] : []));
      mockFs.statSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });
      mockPath.extname.mockReturnValue('.png');
      mockPath.basename.mockReturnValue('image.png');

      fileSystemService.updateTemplatePlaceholders(dirPath, 'my-app');
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should skip entries that are neither files nor directories', () => {
      const dirPath = '/path/to';
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dir) => (dir === dirPath ? ['weird'] : []));
      mockFs.statSync.mockReturnValue({
        isDirectory: () => false,
        isFile: () => false,
      });
      // Should not throw or process
      fileSystemService.updateTemplatePlaceholders(dirPath, 'my-app');
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('formatProjectName', () => {
    it('should format project name correctly', () => {
      // Arrange
      const name = ' Test Project ';

      // Act
      const result = fileSystemService.formatProjectName(name);

      // Assert
      expect(result).toBe('test-project');
    });
  });

  describe('resolvePath', () => {
    it('should resolve path correctly', () => {
      // Arrange
      const relativePath = 'test-project';
      const expectedPath = '/resolved/path/test-project';
      mockPath.resolve.mockReturnValue(expectedPath);

      // Act
      const result = fileSystemService.resolvePath(relativePath);

      // Assert
      expect(result).toBe(expectedPath);
      expect(path.resolve).toHaveBeenCalledWith(relativePath);
    });
  });
  
  describe('updateTemplatePlaceholders with custom placeholders', () => {
    it('should replace custom placeholders in files', () => {
      // Arrange
      const dirPath = '/path/to';
      const filePath = '/path/to/index.html';
      const scriptAppName = 'my-app';
      const customPlaceholders = [
        { placeholder: '__APP_TITLE__', value: 'My Custom App' },
        { placeholder: '__APP_VERSION__', value: '1.0.0' }
      ];
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dir) => (dir === dirPath ? ['index.html'] : []));
      mockFs.statSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });
      mockFs.readFileSync.mockReturnValue('<title>__APP_TITLE__</title><meta name="version" content="__APP_VERSION__">');
      mockPath.extname.mockReturnValue('.html');
      mockPath.basename.mockReturnValue('index.html');

      // Act
      fileSystemService.updateTemplatePlaceholders(dirPath, scriptAppName, customPlaceholders);

      // Assert
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        filePath, 
        '<title>My Custom App</title><meta name="version" content="1.0.0">', 
        'utf-8'
      );
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Updated placeholders in:'));
    });
    
    it('should handle both default and custom placeholders', () => {
      // Arrange
      const dirPath = '/path/to';
      const filePath = '/path/to/index.html';
      const scriptAppName = 'my-app';
      const customPlaceholders = [
        { placeholder: '__APP_TITLE__', value: 'My Custom App' }
      ];
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dir) => (dir === dirPath ? ['index.html'] : []));
      mockFs.statSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });
      mockFs.readFileSync.mockReturnValue('<title>__APP_TITLE__</title><div id="__SCRIPT_APP_NAME__">');
      mockPath.extname.mockReturnValue('.html');
      mockPath.basename.mockReturnValue('index.html');

      // Act
      fileSystemService.updateTemplatePlaceholders(dirPath, scriptAppName, customPlaceholders);

      // Assert
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        filePath, 
        '<title>My Custom App</title><div id="my-app">', 
        'utf-8'
      );
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Updated placeholders in:'));
    });
  });
});
