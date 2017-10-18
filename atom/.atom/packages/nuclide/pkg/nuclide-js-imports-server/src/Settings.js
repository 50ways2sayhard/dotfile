"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const Settings = exports.Settings = {
  // If initializationOptions are not used or the whitelist is empty, this will
  // determine whether diagnostics + code actions are displayed.
  shouldProvideDiagnosticsDefault: true,
  // If initializationOptions are not used or the whitelist is empty, this will
  // determine whether autocompletion results will be provided.
  shouldProvideAutocompleteDefault: true,
  moduleExportsSettings: {
    // When true, module.exports = {a, b} will export IDs a & b
    shouldIndexEachObjectProperty: true,
    // When true, module.exports = {a, b, c} will export entire object as file name.
    shouldIndexObjectAsDefault: true
  },
  hasteSettings: {
    // When true, we will assume that all JS files have a default export
    // with the same ID as the filename.
    shouldAddAllFilesAsDefaultExport: true
  },
  indexNodeModulesWhiteList: [/^(.)*\/Nuclide/]
};