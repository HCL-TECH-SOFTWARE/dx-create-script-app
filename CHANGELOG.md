# Changelog

All notable changes to this project will be documented in this file.

## [1.0.3] - 2026-09-16
### Changed
- Updated runtime baseline to Node.js 24 and npm 11.19.1.
- Pinned package versions exactly across the root package, templates, and sample app.
- Aligned shared dependency versions across TypeScript and JavaScript templates.
- Updated `@hcl-software/dxclient` to `237.0.0`.
- Updated GitHub Actions workflows to use Node.js 24.
- Updated Vite to `7.3.6` and Vitest packages to `5.0.0`.
- Normalized script app names before placeholder replacement so names with spaces generate valid package names, paths, IDs, and CSS selectors.

### Added
- Added per-package `.npmrc` supply-chain controls with `min-release-age=7` and `save-exact=true`.
- Added `DEFERRED-UPGRADES.md` to document dependency upgrades intentionally deferred.

### Removed
- Removed unused root `dotenv` dependency.
- Removed unused root `stylis` override.

## [1.0.0] - 2025-10-10
### Added
- Initial release with:
  - Robust environment-based configuration and dynamic deployment scripts
  - Advanced ESLint configuration and onboarding documentation
  - Version management, changelog, dependency updates
  - Scaffolding features for rapid setup when creating a DX script application
  - Support for custom environment files: set the `DX_ENV_FILE` variable to use a specific file (e.g. `.env.custom.name`, `.env.prod`):
    `DX_ENV_FILE=.env.custom.name npm run dx-deploy`

