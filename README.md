# MongoDB Compass Monorepo

This repository contains the source code and build tooling used in [MongoDB Compass](https://www.mongodb.com/products/compass).

![Aggregation Pipeline Builder Tab in Compass](packages/compass/compass-screenshot.png)

## Contributing

For contributing, please refer to [CONTRIBUTING.md](CONTRIBUTING.md)

For issues, please create a ticket in our [JIRA Project](https://jira.mongodb.org/browse/COMPASS).

Is there anything else you’d like to see in Compass? Let us know by submitting suggestions in out [feedback forum](https://feedback.mongodb.com/forums/924283-compass).

## Packages Overview

- [**mongodb-compass**](packages/compass): The MongoDB GUI

### Compass Plugins

- [**@cloud-mongodb-js/compass-aggregations**](packages/compass-aggregations): Compass Aggregation Pipeline Builder
- [**@cloud-mongodb-js/compass-crud**](packages/compass-crud): Compass Plugin for CRUD Operations
- [**@cloud-mongodb-js/compass-export-to-language**](packages/compass-export-to-language): Export MongoDB queries and aggregations to various languages
- [**@cloud-mongodb-js/compass-query-bar**](packages/compass-query-bar): Renders a component for executing MongoDB queries through a GUI

### Shared Libraries and Build Tools

- [**@cloud-mongodb-js/compass-components**](packages/compass-components): React Components used in Compass
- [**@cloud-mongodb-js/compass-editor**](packages/compass-editor): Reusable Compass editor component based on ace-editor with MongoDB-specific ace modes, themes, and autocompleters
- [**@cloud-mongodb-js/compass-logging**](packages/compass-logging): Shared helpers for logging in Compass packages
- [**@cloud-mongodb-js/compass-maybe-protect-connection-string**](packages/compass-maybe-protect-connection-string): Utility for protecting connection strings if requested
- [**@cloud-mongodb-js/compass-settings**](packages/compass-settings): Settings for compass
- [**@cloud-mongodb-js/compass-utils**](packages/compass-utils): Utilities for MongoDB Compass Development
- [**@mongodb-js/explain-plan-helper**](packages/explain-plan-helper): Explain plan utility methods for MongoDB Compass
- [**@mongodb-js/hadron-plugin-manager**](packages/hadron-plugin-manager): Hadron Plugin Manager
- [**@mongodb-js/mongodb-notary-service-client**](packages/notary-service-client): A client for our notary-service: an API for codesigning
- [**@mongodb-js/mongodb-redux-common**](packages/redux-common): Common Redux Modules for mongodb-js
- [**@mongodb-js/ssh-tunnel**](packages/ssh-tunnel): Yet another ssh tunnel based on ssh2
- [**app-migrations**](packages/app-migrations): Helper for application schema migrations
- [**bson-transpilers**](packages/bson-transpilers): Source to source compilers using ANTLR
- [**compass-e2e-tests**](packages/compass-e2e-tests): E2E test suite for Compass app that follows smoke tests / feature testing matrix
- [**compass-preferences-model**](packages/compass-preferences-model): Compass preferences model
- [**compass-user-model**](packages/compass-user-model): MongoDB user model
- [**electron-license**](packages/electron-license): Tools for electron apps to work with licenses
- [**hadron-app**](packages/hadron-app): Hadron Application Singleton
- [**hadron-app-registry**](packages/hadron-app-registry): Hadron App Registry
- [**hadron-build**](packages/hadron-build): Tooling for Hadron apps
- [**hadron-document**](packages/hadron-document): Hadron Document
- [**hadron-ipc**](packages/hadron-ipc): Simplified IPC for electron apps.
- [**hadron-reflux-store**](packages/reflux-store): Hadron Reflux Stores
- [**hadron-type-checker**](packages/hadron-type-checker): Hadron Type Checker
- [**mongodb-collection-model**](packages/collection-model): MongoDB collection model
- [**mongodb-connection-model**](packages/connection-model): MongoDB connection model
- [**mongodb-data-service**](packages/data-service): MongoDB Data Service
- [**mongodb-database-model**](packages/database-model): MongoDB database model
- [**mongodb-explain-compat**](packages/mongodb-explain-compat): Convert mongodb SBE explain output to 4.4 explain output
- [**mongodb-instance-model**](packages/instance-model): MongoDB instance model
- [**storage-mixin**](packages/storage-mixin): Ampersand model mixin to persist data via various storage backends

### Shared Configuration Files

- [**@cloud-mongodb-js/eslint-config-compass**](configs/eslint-config-compass): Shared Compass eslint configuration
- [**@cloud-mongodb-js/eslint-plugin-compass**](configs/eslint-plugin-compass): Custom eslint rules for Compass monorepo
- [**@cloud-mongodb-js/mocha-config-compass**](configs/mocha-config-compass): Shared mocha mocha configuration for Compass packages
- [**@cloud-mongodb-js/prettier-config-compass**](configs/prettier-config-compass): Shared Compass prettier configuration
- [**@cloud-mongodb-js/webpack-config-compass**](configs/webpack-config-compass): Shared webpack configuration for Compass application and plugins

## License

[SSPL](LICENSE)
