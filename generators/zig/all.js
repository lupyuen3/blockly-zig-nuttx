/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Complete helper functions for generating Zig for
 *     blocks.  This is the entrypoint for zig_compressed.js.
 * @suppress {extraRequire}
 */
'use strict';

goog.module('Blockly.Zig.all');

// Common Blocks
goog.require('Blockly.Zig.colour');
goog.require('Blockly.Zig.lists');
goog.require('Blockly.Zig.logic');
goog.require('Blockly.Zig.loops');
goog.require('Blockly.Zig.math');
goog.require('Blockly.Zig.procedures');
goog.require('Blockly.Zig.texts');
goog.require('Blockly.Zig.variables');
goog.require('Blockly.Zig.variablesDynamic');

// Zig Custom Blocks
goog.require('Blockly.Zig.blocks');

// Compose Message Block
goog.require('Blockly.Zig.composeMessage');
