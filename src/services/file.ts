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
import type { Logger } from '../utils/logger.js';

/**
 * Defines a mapping between a placeholder and its replacement value
 */
export interface PlaceholderMapping {
  /**
   * The placeholder string to search for (e.g., __SCRIPT_APP_NAME__)
   */
  placeholder: string;
  
  /**
   * The value to replace the placeholder with
   */
  value: string;
}

/**
 * Interface defining the file system service contract
 *
 * The FileSystemService is responsible for all file and directory operations
 * required during the script app creation process, including directory creation,
 * file copying, path manipulation, and configuration file updates.
 */
export interface FileSystemService {
  /**
   * Checks if a directory exists at the specified path
   *
   * @param dirPath - Path to check for directory existence
   * @returns True if the directory exists, false otherwise
   */
  directoryExists(dirPath: string): boolean;

  /**
   * Creates a new directory at the specified path
   *
   * @param dirPath - Path where the directory should be created
   */
  createDirectory(dirPath: string): void;

  /**
   * Recursively copies files and directories from source to destination
   *
   * @param src - Source path to copy from
   * @param dest - Destination path to copy to
   */
  copyRecursive(src: string, dest: string): void;

  /**
   * Formats a project name for file system use
   *
   * @param name - Raw project name to format
   * @returns Formatted project name suitable for file system use
   */
  formatProjectName(name: string): string;

  /**
   * Resolves a relative path to an absolute path
   *
   * @param relativePath - Relative path to resolve
   * @returns Absolute path
   */
  resolvePath(relativePath: string): string;

  /**
   * Recursively replaces placeholders in all files under the given directory.
   *
   * @param dirPath - Path to the template directory
   * @param scriptAppName - Name of the script app to be used in the configuration
   * @param placeholders - Optional array of placeholder objects to replace. Default placeholders will be added if not provided.
   */
  updateTemplatePlaceholders(dirPath: string, scriptAppName: string, placeholders?: PlaceholderMapping[]): void;
}

/**
 * Default implementation of the FileSystemService interface
 *
 * This service handles all file system operations required during the application
 * creation process, including directory management, file copying, and configuration
 * file updates.
 */
export class DefaultFileSystemService implements FileSystemService {
  /**
   * Creates a new DefaultFileSystemService instance
   *
   * @param logger - Logger service for recording file system operations
   */
  constructor(private logger: Logger) {}

  /**
   * Checks if a directory exists at the specified path
   *
   * Uses the Node.js fs.existsSync method to verify directory existence.
   *
   * @param dirPath - Path to check for directory existence
   * @returns True if the directory exists, false otherwise
   */
  public directoryExists(dirPath: string): boolean {
    return fs.existsSync(dirPath);
  }

  /**
   * Creates a new directory at the specified path
   *
   * Creates the directory only if it doesn't already exist.
   * Uses recursive mode to create parent directories as needed.
   * Logs the directory creation using the logger service.
   *
   * @param dirPath - Path where the directory should be created
   */
  public createDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      this.logger.info(`Created directory: ${dirPath}`);
    }
  }

  /**
   * Recursively copies files and directories from source to destination
   *
   * This method:
   * 1. Checks if the source is a directory
   * 2. If it's a directory, creates the destination directory if needed
   * 3. Recursively copies each item within the source directory
   * 4. If it's a file, copies it directly to the destination
   *
   * @param src - Source path to copy from
   * @param dest - Destination path to copy to
   */
  public copyRecursive(src: string, dest: string): void {
    if (fs.statSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
      }
      for (const item of fs.readdirSync(src)) {
        this.copyRecursive(path.join(src, item), path.join(dest, item));
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  /**
   * Formats a project name for file system use
   *
   * Transforms the raw project name by:
   * - Trimming whitespace
   * - Converting to lowercase
   * - Replacing spaces with hyphens
   *
   * @param name - Raw project name to format
   * @returns Formatted project name suitable for file system use
   */
  public formatProjectName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Resolves a relative path to an absolute path
   *
   * Converts a relative path like './my-folder' to an absolute path
   * using Node.js path.resolve.
   *
   * @param relativePath - Relative path to resolve
   * @returns Absolute path
   */
  public resolvePath(relativePath: string): string {
    return path.resolve(relativePath);
  }

  /**
   * Recursively replaces placeholders in all files under the given directory.
   *
   * This method:
   * 1. Traverses all files in the directory (excluding node_modules and binary files)
   * 2. Replaces all occurrences of each placeholder with its corresponding value
   * 3. Handles package.json special logic for dx-deploy and name
   * 4. Logs each file updated
   *
   * @param dirPath - Path to the template directory
   * @param scriptAppName - Name of the script app to be used in the configuration
   * @param placeholders - Optional array of placeholder objects to replace. Default placeholders will be added if not provided.
   */
  public updateTemplatePlaceholders(dirPath: string, scriptAppName: string, placeholders?: PlaceholderMapping[]): void {
    // Create default placeholders if none are provided
    const allPlaceholders: PlaceholderMapping[] = [
      { placeholder: '__SCRIPT_APP_NAME__', value: scriptAppName },
      { placeholder: '__CONTENT_ROOT__', value: './dist' },
      { placeholder: '__WCM_CONTENT_NAME__', value: scriptAppName },
      ...(placeholders || [])
    ];

    const isTextFile = (filePath: string) => {
      // Simple check for text files by extension
      const textExtensions = [
        '.js',
        '.ts',
        '.jsx',
        '.tsx',
        '.json',
        '.html',
        '.css',
        '.md',
        '.txt',
        '.env',
        '.local',
      ];
      return textExtensions.includes(path.extname(filePath));
    };

    const processFile = (filePath: string) => {
      if (!isTextFile(filePath)) return;
      let updated = false;
      let content = fs.readFileSync(filePath, 'utf-8');
      
      if (path.basename(filePath) === 'package.json') {
        // Special handling for package.json
        const pkg = JSON.parse(content);
        
        // Handle dx-deploy script specially
        if (pkg.scripts && pkg.scripts['dx-deploy']) {
          let newScript = pkg.scripts['dx-deploy'];
          for (const { placeholder, value } of allPlaceholders) {
            if (newScript.includes(placeholder)) {
              newScript = newScript.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
            }
          }
          
          if (newScript !== pkg.scripts['dx-deploy']) {
            pkg.scripts['dx-deploy'] = newScript;
            updated = true;
          }
        }
        
        // Replace placeholders in any string field in package.json
        const replaceInObject = (obj: Record<string, unknown>) => {
          for (const key in obj) {
            const value = obj[key];
            if (typeof value === 'string') {
              let newValue = value;
              let valueUpdated = false;
              
              for (const { placeholder, value: replacement } of allPlaceholders) {
                if (newValue.includes(placeholder)) {
                  newValue = newValue.replace(
                    new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
                    replacement
                  );
                  valueUpdated = true;
                }
              }
              
              if (valueUpdated) {
                obj[key] = newValue;
                updated = true;
              }
            } else if (typeof value === 'object' && value !== null) {
              replaceInObject(value as Record<string, unknown>);
            }
          }
        };
        
        replaceInObject(pkg);
        
        if (updated) {
          fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2));
          this.logger.info(`Updated placeholders in: ${filePath}`);
        }
      } else {
        // For non-package.json files
        let contentUpdated = false;
        
        for (const { placeholder, value } of allPlaceholders) {
          if (content.includes(placeholder)) {
            content = content.replace(
              new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
              value
            );
            contentUpdated = true;
          }
        }
        
        if (contentUpdated) {
          fs.writeFileSync(filePath, content, 'utf-8');
          this.logger.info(`Updated placeholders in: ${filePath}`);
        }
      }
    };

    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir)) {
        if (entry === 'node_modules') continue;
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (stat.isFile()) {
          processFile(fullPath);
        }
      }
    };

    walk(dirPath);
  }
}
