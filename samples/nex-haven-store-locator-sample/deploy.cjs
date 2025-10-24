/* ********************************************************************
 * Copyright 2025 HCL America Inc.                                    *
 * Licensed under the Apache License, Version 2.0 (the "License");    *
 * you may not use this file except in compliance with the License.   *
 * You may obtain a copy of the License at                            *
 *                                                                    *
 * http://www.apache.org/licenses/LICENSE-2.0                         *
 *                                                                    *
 * Unless required by applicable law or agreed to in writing,         *
 * software distributed under the License is distributed on an "AS    *
 * IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either    *
 * express or implied. See the License for the specific language      *
 * governing permissions and limitations under the License.           *
 ******************************************************************** */

const { execSync } = require('child_process');

require('dotenv').config({ path: process.env.DX_ENV_FILE || '.env.local' });


// Always derive DX_HOSTNAME, DX_PROTOCOL, and DX_PORT from DX_TARGET if DX_TARGET is set
if (process.env.DX_TARGET) {
  try {
    const url = new URL(process.env.DX_TARGET);
    process.env.DX_HOSTNAME = url.hostname;
    process.env.DX_PROTOCOL = url.protocol.replace(':', '');
    // Derive DX_PORT from DX_TARGET if present, otherwise default to 443 for https and 80 for http
    process.env.DX_PORT = url.port || (process.env.DX_PROTOCOL === 'https' ? '443' : '80');
    console.log('DX_HOSTNAME derived from DX_TARGET:', process.env.DX_HOSTNAME);
    console.log('DX_PROTOCOL derived from DX_TARGET:', process.env.DX_PROTOCOL);
    console.log('DX_PORT derived from DX_TARGET:', process.env.DX_PORT);
  } catch (e) {
    console.warn('Could not parse DX_TARGET to derive DX_HOSTNAME, DX_PROTOCOL, or DX_PORT.');
  }
}

// List of required environment variables
const requiredVars = [
  'DX_PROTOCOL',
  'DX_HOSTNAME',
  'DX_PORT',
  'DX_USERNAME',
  'DX_PASSWORD',
  'DX_CONTENT_HANDLER_PATH',
  'DX_MAIN_HTML_FILE',
  'DX_SITE_AREA',
  'DX_CONTENT_NAME',
  'DX_CONTENT_TITLE',
  'DX_CONTENT_ROOT'
];


console.log("Resolved deployment variables:");
console.log("DX_PROTOCOL:", process.env.DX_PROTOCOL);
console.log("DX_HOSTNAME:", process.env.DX_HOSTNAME);
console.log("DX_PORT:", process.env.DX_PORT);
console.log("DX_USERNAME:", process.env.DX_USERNAME);
console.log("DX_CONTENT_HANDLER_PATH:", process.env.DX_CONTENT_HANDLER_PATH);
console.log("DX_MAIN_HTML_FILE:", process.env.DX_MAIN_HTML_FILE);
console.log("DX_SITE_AREA:", process.env.DX_SITE_AREA);
console.log("DX_CONTENT_NAME:", process.env.DX_CONTENT_NAME);
console.log("DX_CONTENT_TITLE:", process.env.DX_CONTENT_TITLE);
console.log("DX_CONTENT_ROOT:", process.env.DX_CONTENT_ROOT);
console.log("DX_VIRTUAL_PORTAL_CONTEXT:", process.env.DX_VIRTUAL_PORTAL_CONTEXT);
console.log("DX_PROJECT_CONTEXT:", process.env.DX_PROJECT_CONTEXT);

const cmd = [
  "dxclient deploy-scriptapplication push",
  `--dxProtocol \"${process.env.DX_PROTOCOL}\"`,
  `--hostname \"${process.env.DX_HOSTNAME}\"`,
  `--dxPort \"${process.env.DX_PORT}\"`,
  `--dxUsername \"${process.env.DX_USERNAME}\"`,
  `--dxPassword \"${process.env.DX_PASSWORD}\"`,
  `--contenthandlerPath \"${process.env.DX_CONTENT_HANDLER_PATH}\"`,
  `--virtualPortalContext \"${process.env.DX_VIRTUAL_PORTAL_CONTEXT}\"`,
  `--projectContext \"${process.env.DX_PROJECT_CONTEXT}\"`,
  `--mainHtmlFile \"${process.env.DX_MAIN_HTML_FILE}\"`,
  `--wcmSiteArea \"${process.env.DX_SITE_AREA}\"`,
  `--wcmContentName \"${process.env.DX_CONTENT_NAME}\"`,
  `--wcmContentTitle \"${process.env.DX_CONTENT_TITLE}\"`,
  `--contentRoot \"${process.env.DX_CONTENT_ROOT}\"`
].filter(Boolean).join(" ");

console.log('Running:', cmd);
execSync(cmd, { stdio: 'inherit' });
