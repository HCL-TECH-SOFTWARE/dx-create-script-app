# React DX Script Application

This project was created using `create-dx-script-app` and provides a modern React setup optimized for deployment to HCL Digital Experience.

## Quick Start

### Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```
   Your application will run at http://localhost:3000 with hot module replacement.

### Deployment to HCL DX

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure your environment**
   
   Edit `.env.local` in your project root with your HCL DX connection details.

3. **Build the application**
   ```bash
   npm run build
   ```

4. **Deploy to HCL DX**
   ```bash
   npm run dx-deploy
   ```

## Environment Configuration

All DX connection settings and deployment configurations are managed through environment files:

## Example `.env.local` file
```env
# Core DX connection settings
DX_PROTOCOL=https
DX_HOSTNAME=your-dx-hostname
DX_PORT=443
DX_USERNAME=your-username
DX_PASSWORD=your-password

# Content deployment settings
DX_CONTENT_HANDLER_PATH=/wps/mycontenthandler
DX_MAIN_HTML_FILE=index.html
DX_SITE_AREA=Script Application Library/Script Applications/
DX_CONTENT_NAME=your-app-name
DX_CONTENT_TITLE=your-app-title
DX_CONTENT_ROOT=./dist

# Development proxy targets
DX_TARGET=http://localhost:10039/wps/portal
API_TARGET=http://localhost:4000/dx/api/wcm/v2/explorer
```

### Multi-Environment Deployment

To deploy to different environments (dev, test, prod):

```bash
# Create environment-specific files (.env.dev, .env.uat, .env.prod)
# Then deploy using:
DX_ENV_FILE=.env.uat npm run dx-deploy
```

## Development Tools

### Proxy Configuration

The application includes pre-configured proxies for local development:

- `/dx` - Routes to the DX Portal (controlled via `DX_TARGET` env variable)
- `/api/wcm` - Routes to the WCM API (controlled via `API_TARGET` env variable)

You can add additional proxy configurations in the `vite.config.js` file following this pattern:

```javascript
'/your-prefix': {
  target: 'http://your-target-url.com',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/your-prefix/, ''),
}
```

### Environment File Configuration

By default, the deployment script reads from `.env.local` or falls back to `.env` if not found.
> To use a different environment file (such as `.env.custom.name` or `.env.prod`), set the `DX_ENV_FILE` environment variable:
```
DX_ENV_FILE=.env.custom.name npm run dx-deploy
```
This allows you to deploy with different DX credentials or settings for each environment.
> Missing values will be supplemented by any existing values from your system's environment variables.

### Fallback Configuration

If a parameter is not set or specified in the environment file, dxclient will automatically use default values from `store/config.json`. This ensures that deployment can proceed with pre-configured settings even without custom environment variables.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run dx-deploy` - Deploy to HCL DX
- `npm run lint` - Check code with ESLint
- `npm run lint-fix` - Automatically fix ESLint issues
- `npm run test` - Run tests with Vitest
- `npm run test-dev` - Run tests in watch mode

## Testing

Tests are located in `src/__tests__/` and configured with Vitest. The testing setup includes:

- `vitest.config.js` - Test configuration
- `vitest.setup.js` - Global test setup and mocks

## Store Configuration

The `store/config.json` file contains DX integration settings that need not be modified.

## HCL DX Script Applications and DXClient

This project was created as a Script Application for HCL Digital Experience. For comprehensive information about Script Applications in HCL DX, refer to the official documentation:

- [DXClient Script Applications Documentation](https://help.hcl-software.com/digital-experience/9.5/CF230/extend_dx/development_tools/dxclient/dxclient_artifact_types/scriptapplications/)

The documentation covers:
- Script Application artifact types
- How to create, update, and deploy Script Applications using DXClient
- Working with Script Application properties and configurations
- Integration with the HCL DX platform

## Extending ESLint Configuration

For additional React-specific linting rules, you can install and configure:

- `eslint-plugin-react-x` - Advanced React linting rules
- `eslint-plugin-react-dom` - React DOM-specific linting

See the ESLint documentation for configuration details.

```javascript
// Example ESLint configuration
export default eslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      // Enable lint rules for React
      reactX.configs.recommended,
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    // other options...
  },
]);
```

