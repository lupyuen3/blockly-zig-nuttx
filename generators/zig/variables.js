/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Zig for variable blocks.
 */
'use strict';

goog.module('Blockly.Zig.variables');

const Zig = goog.require('Blockly.Zig');
const {NameType} = goog.require('Blockly.Names');


Zig['variables_get'] = function(block) {
  // Variable getter.
  const code =
      Zig.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return [code, Zig.ORDER_ATOMIC];
};

Zig['variables_set'] = function(block) {
  // Variable setter.
  const argument0 =
      Zig.valueToCode(block, 'VALUE', Zig.ORDER_ASSIGNMENT) || '0';
  const varName =
      Zig.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' = ' + argument0 + ';\n';
};
