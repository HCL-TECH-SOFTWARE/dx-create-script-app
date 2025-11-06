# Create DX Script App

A modular toolkit for scaffolding modern React applications on HCL DX using Vite. This tool helps you quickly create production-ready React applications with JavaScript or TypeScript that integrate seamlessly with the HCL Digital Experience platform. This package depends on the [Vite](https://github.com/vitejs/vite).

(C) 2025 HCL America Inc. Apache-2.0 license [https://www.apache.org/licenses/LICENSE-2.0](https://www.apache.org/licenses/LICENSE-2.0)

## Features

- **Ready-made Templates:** JavaScript and TypeScript React templates with optimal configurations
- **Developer Experience:** Preconfigured ESLint, Vite, and HMR for rapid development
- **DX Integration:** Built-in deployment scripts and HCL DX-specific configurations
- **Environment Management:** Flexible configuration for different deployment environments
- **Modular Architecture:** Core logic separated from templates for easy maintenance

## Requirements

- **Node.js ≥ 20.19**
- **npm ≥ 9.6**

## Quick Start

### Create a new application

```bash
# Using npx (requires npm 5.2+ to be installed)
npx @hcl-software/create-dx-script-app

# Using npm init
npm init @hcl-software/dx-script-app

# Using yarn create
yarn create @hcl-software/dx-script-app
```

Follow the interactive prompts to set up your project with your preferred template and options.

### Development workflow

After creating your project:

```bash
cd your-project-name
npm install
npm run dev
```

Your application will be running at http://localhost:3000 with hot module replacement enabled.
If you want to deploy the app into DX Server, Edit `.env.local` in your project root with your HCL DX connection details and run:

```bash
cd your-project-name
npm install
npm run dx-deploy
```

## Installation Options

### Via NPM (Recommended)

```bash
npm create @hcl-software/dx-script-app
```

### Building and using locally

```bash
# Clone the repository
git clone <repository_url/dx-create-script-app.git>
cd dx-create-script-app/

# Install dependencies and build
npm install
npm run build

# Now you can run it locally
./dist/index.js
```

## Project Configuration

After scaffolding, you'll find a `.env.local` file in your new project directory. This file controls:

- HCL DX connection settings
- Deployment configuration
- Development proxies

## Environment Configuration

The tool generates appropriate environment configuration files for different deployment targets:

```env
# Sample environment variables
DX_TARGET=http://localhost:10039/wps/portal
DX_PROTOCOL=https
DX_HOSTNAME=your-dx-hostname
DX_PORT=443
DX_USERNAME=your-username
DX_PASSWORD=your-password
```

By default, the deployment script reads from `.env.local` or falls back to `.env` if not found.

> To use a different environment file (such as `.env.custom.name` or `.env.prod`), set the `DX_ENV_FILE` environment variable:

```
DX_ENV_FILE=.env.custom.name npm run dx-deploy
```

This allows you to deploy with different DX credentials or settings for each environment.

> Missing values will be supplemented by any existing values from your system's environment variables.

### Fallback Configuration

If a parameter is not set or specified in the environment file, dxclient will automatically use default values from `store/config.json`. This ensures that deployment can proceed with pre-configured settings even without custom environment variables.

See the comments inside `.env.local` for details on configuring each option.

### Customization

Projects created with this tool can be customized by:

- Updating assets in `public/` and `src/assets/` folders
- Modifying ESLint, Vite, and TypeScript configurations
- Adjusting store configuration files in each template's `store/` directory

### Proxy Configuration

Generated projects include pre-configured proxy settings to handle API requests during development:

- `/dx` → Routes to the DX Portal
- `/api/wcm` → Routes to the WCM API

You can add additional proxy configurations in the `vite.config.js/ts` file following this pattern:

```javascript
'/your-prefix': {
  target: 'http://your-target-url.com',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/your-prefix/, ''),
}
```

### Environment Configuration

Set custom API endpoints using environment variables:

```bash
# In .env.local file
DX_TARGET=https://your-dx-server.com/wps/portal
API_TARGET=https://your-api-server.com/dx/api/wcm/v2/explorer

# Or at runtime
DX_TARGET=https://your-dx-server.com/wps/portal npm run dev
```

## Additional Information

This tool helps you create and deploy Script Applications that work seamlessly with HCL Digital Experience. For comprehensive information about Script Applications in HCL DX, refer to the official documentation:

- [DXClient Script Applications Documentation](https://help.hcl-software.com/digital-experience/9.5/CF230/extend_dx/development_tools/dxclient/dxclient_artifact_types/scriptapplications/)

The documentation covers:

- Script Application artifact types
- How to create, update, and deploy Script Applications using DXClient
- Working with Script Application properties and configurations
- Integration with the HCL DX platform

This tool abstracts many of the complexities of working with DXClient directly, but understanding the underlying concepts will help you make the most of your HCL DX development experience.
