# Contributing Guidelines

## Contributor Roles
Open source is more than just writing code. A good project also needs:
- Documentation writers
- Testers
- Tutorial writers
- Evangelists
- Automation builders

If you want to get involved in any role (including ones we may have missed!), reach out to one of the committers.

## Working on Issues
- Ensure there is a GitHub issue for any bug before submitting a PR.
- Discuss enhancements and create a feature request issue before starting work.
- Fork the repo and raise a PR for your work.
- Update documentation and changelog as needed.

## Development Environment
- Develop code with TypeScript.
- Use JSDoc in source code to document methods.
- Use the current Node.js version (see `package.json` `engines`).
- Favor built-ins over packages (e.g., use `fetch`).

## Version Management
- Update the `version` field in `package.json` using semantic versioning for every release.
- Document all changes in `CHANGELOG.md` using the Keep a Changelog format.
- Run tests and lint before submitting PRs.
- Update documentation as needed.

## Release Workflow
- Releases are automated via GitHub Actions (`.github/workflows/npm-publish.yaml`).
- Dependabot is enabled for dependency updates.

## Pull Requests (PRs)
- When ready, submit a PR.
- Review requirements for submitting a PR, including updating documentation and changelog.

