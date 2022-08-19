/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Zig for dynamic variable blocks.
 */
'use strict';

goog.module('Blockly.Zig.variablesDynamic');

const Zig = goog.require('Blockly.Zig');
/** @suppress {extraRequire} */
goog.require('Blockly.Zig.variables');


// Zig is dynamically typed.
Zig['variables_get_dynamic'] = Zig['variables_get'];
Zig['variables_set_dynamic'] = Zig['variables_set'];
