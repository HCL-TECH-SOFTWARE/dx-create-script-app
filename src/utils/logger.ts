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
import os from 'os';

/**
 * Log level types supported by the Logger class
 */
type LogLevel = 'info' | 'success' | 'error' | 'debug';

/**
 * Logger class for application logging
 *
 * Provides logging functionality with different log levels and formats
 * logs for both console output and file storage.
 */
export class Logger {
  private logFile: string;
  private errorCount = 0;

  /**
   * Creates a new Logger instance
   *
   * @param logFilePath - Optional custom path for the log file. If not provided,
   *                      logs will be stored in ~/.dx-script-app/logs/logger.log
   */
  constructor(logFilePath?: string) {
    // Use ~/.dx-script-app/logs as the log directory
    const logsDir = path.join(os.homedir(), '.dx-script-app', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    this.logFile = logFilePath ? path.resolve(logFilePath) : path.join(logsDir, 'logger.log');
  }

  /**
   * Formats the current timestamp for log entries
   *
   * @returns Formatted timestamp string in ISO format without milliseconds
   * @private
   */
  private formatTimestamp(): string {
    return new Date().toISOString().replace('T', ' ').split('.')[0];
  }

  /**
   * Formats a log message with timestamp, level, and contextual information
   *
   * @param level - The log level of the message
   * @param args - Array of arguments to be logged
   * @param isFile - Whether the message is for file logging (true) or console output (false)
   * @returns Formatted log message string
   * @private
   */
  private formatMessage(level: LogLevel, args: unknown[], isFile: boolean): string {
    const timestamp = this.formatTimestamp();
    const pid = process.pid;
    const host = os.hostname();
    const msg = args.map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg))).join(' ');

    if (isFile) {
      return `[${timestamp}] ${level.toUpperCase().padEnd(7)} (PID ${pid} @ ${host}) ${msg}`;
    } else {
      return `[${timestamp}] ${level.toUpperCase().padEnd(7)} ${msg}`;
    }
  }

  /**
   * Writes a log line to the log file
   *
   * @param line - The formatted log line to write to the file
   * @private
   */
  private writeToFile(line: string): void {
    fs.appendFileSync(this.logFile, line + '\n', 'utf8');
  }

  /**
   * Core logging method that handles both file and console logging
   *
   * @param level - The log level of the message
   * @param args - Arguments to be logged
   * @private
   */
  private log(level: LogLevel, ...args: unknown[]): void {
    const fileLine = this.formatMessage(level, args, true);
    const consoleLine = this.formatMessage(level, args, false);
    this.writeToFile(fileLine);

    if (level !== 'debug') {
      console.log(consoleLine);
    }
  }

  /**
   * Logs information about where to find the full logs if errors occurred
   *
   * Useful to show at the end of program execution to direct users to log file
   * when errors have occurred
   */
  logSavingInfo() {
    if (this.errorCount > 0) {
      this.info(`Full logs can be found at: ${this.logFile}`);
    }
  }

  /**
   * Logs an informational message
   *
   * @param args - Arguments to be logged with 'info' level
   */
  info(...args: unknown[]) {
    this.log('info', ...args);
  }

  /**
   * Logs a success message
   *
   * @param args - Arguments to be logged with 'success' level
   */
  success(...args: unknown[]) {
    this.log('success', ...args);
  }

  /**
   * Logs an error message and increments the error counter
   *
   * @param args - Arguments to be logged with 'error' level
   */
  error(...args: unknown[]) {
    this.errorCount++;
    this.log('error', ...args);
  }

  /**
   * Logs a debug message (only to file, not to console)
   *
   * @param args - Arguments to be logged with 'debug' level
   */
  debug(...args: unknown[]) {
    this.log('debug', ...args);
  }
}
