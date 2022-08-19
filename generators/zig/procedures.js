/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Zig for procedure blocks.
 */
'use strict';

goog.module('Blockly.Zig.procedures');

const Zig = goog.require('Blockly.Zig');
const {NameType} = goog.require('Blockly.Names');


Zig['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  const funcName =
      Zig.nameDB_.getName(block.getFieldValue('NAME'), NameType.PROCEDURE);
  let xfix1 = '';
  if (Zig.STATEMENT_PREFIX) {
    xfix1 += Zig.injectId(Zig.STATEMENT_PREFIX, block);
  }
  if (Zig.STATEMENT_SUFFIX) {
    xfix1 += Zig.injectId(Zig.STATEMENT_SUFFIX, block);
  }
  if (xfix1) {
    xfix1 = Zig.prefixLines(xfix1, Zig.INDENT);
  }
  let loopTrap = '';
  if (Zig.INFINITE_LOOP_TRAP) {
    loopTrap = Zig.prefixLines(
        Zig.injectId(Zig.INFINITE_LOOP_TRAP, block), Zig.INDENT);
  }
  const branch = Zig.statementToCode(block, 'STACK');
  let returnValue = Zig.valueToCode(block, 'RETURN', Zig.ORDER_NONE) || '';
  let xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = Zig.INDENT + 'return ' + returnValue + ';\n';
  }
  const returnType = returnValue ? '!f32' : '!void';
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = [
      Zig.nameDB_.getName(variables[i], NameType.VARIABLE),
      ': f32',
    ].join('');
  }
  let code = [
    'fn ' + funcName + '(' + args.join(', ') + ') ' + returnType + ' {\n',
    xfix1,
    loopTrap,
    branch,
    xfix2,
    returnValue,
    '}',
  ].join('');
  code = Zig.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Zig.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Zig['procedures_defnoreturn'] = Zig['procedures_defreturn'];

Zig['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  const funcName =
      Zig.nameDB_.getName(block.getFieldValue('NAME'), NameType.PROCEDURE);
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = Zig.valueToCode(block, 'ARG' + i, Zig.ORDER_NONE) || 'null';
  }
  let code = [
    'try ',
    funcName,
    '(',
    args.join(', '),
    ')',
  ].join('');
  return [code, Zig.ORDER_UNARY_POSTFIX];
};

Zig['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  const tuple = Zig['procedures_callreturn'](block);
  return tuple[0] + ';\n';
};

Zig['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  const condition =
      Zig.valueToCode(block, 'CONDITION', Zig.ORDER_NONE) || 'false';
  let code = 'if (' + condition + ') {\n';
  if (Zig.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the return is triggered.
    code += Zig.prefixLines(
        Zig.injectId(Zig.STATEMENT_SUFFIX, block), Zig.INDENT);
  }
  if (block.hasReturnValue_) {
    const value = Zig.valueToCode(block, 'VALUE', Zig.ORDER_NONE) || 'null';
    code += Zig.INDENT + 'return ' + value + ';\n';
  } else {
    code += Zig.INDENT + 'return;\n';
  }
  code += '}\n';
  return code;
};
