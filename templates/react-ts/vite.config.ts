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
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Environment-based configuration
 * You can use environment variables to change the target based on deployment environment
 * 
 * Examples:
 * - Local development: http://localhost:10039/wps/portal
 * - K8s deployment: https://your-target.com/wps/portal
 * 
 * To implement this, you can:
 * 1. Use import.meta.env.API_TARGET in your vite config
 * 2. Set in .env files: API_TARGET=https://your-target.com
 * 3. Or set at runtime: API_TARGET=https://your-target.com npm run dev
 */

// You can use this to determine the target based on environment
const getDxTarget = (): string => {
  return process.env.DX_TARGET || 'http://localhost:10039/wps/portal'
}

const getWcmApiTarget = (): string => {
  return process.env.WCM_API_TARGET || 'http://localhost:4000/dx/api/wcm/v2/explorer'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '',
  server: {
    port: 3000,
    proxy: {
      // Example proxy configuration
      // Format: '/path-prefix': { options }
      // To add a new proxy, follow this pattern:
      // '/your-prefix': {
      //   target: 'http://your-target-url.com',
      //   changeOrigin: true, // Needed for virtual hosted sites
      //   rewrite: (path) => path.replace(/^\/your-prefix/, ''), // Removes the prefix before forwarding
      // },
      
      '/dx': {
        target: getDxTarget(),
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/dx/, ''),
      },
      '/api/wcm': {
        target: getWcmApiTarget(),
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/wcm/, ''),
      },
    },
  },
})
