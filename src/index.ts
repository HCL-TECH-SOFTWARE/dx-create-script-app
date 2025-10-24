#!/usr/bin/env node
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
import { Logger } from './utils/logger.js';
import { CliService } from './services/cli.js';
import { DefaultPromptService } from './services/prompt.js';
import { DefaultTemplateService } from './services/template.js';
import { DefaultFileSystemService } from './services/file.js';
import { DefaultApplicationService } from './services/application.js';

/**
 * Main entry point for the DX Script App CLI tool
 *
 * This self-executing async function orchestrates the entire application lifecycle:
 * 1. Initializes all required services using dependency injection pattern
 * 2. Processes command-line arguments to determine user intent
 * 3. Creates a new script app based on the specified template
 * 4. Handles errors gracefully with proper logging
 *
 * The application follows a service-oriented architecture where each component
 * has a single responsibility and dependencies are explicitly injected.
 */
(async () => {
  try {
    // Create services with dependency injection
    const logger = new Logger();
    const cliService = new CliService();
    const promptService = new DefaultPromptService(logger);
    const templateService = new DefaultTemplateService(import.meta.url);
    const fileService = new DefaultFileSystemService(logger);
    const appService = new DefaultApplicationService(
      logger,
      promptService,
      templateService,
      fileService
    );

    // Parse command line arguments
    const { scriptAppName, options } = cliService.parse(process.argv);

    // Create the script app
    await appService.createScriptApp(scriptAppName, options.template);
  } catch (error) {
    // Handle unexpected errors
    const logger = new Logger();
    logger.error(
      `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
    );
    // Exit with error code to indicate failure
    process.exit(1);
  }
})();
