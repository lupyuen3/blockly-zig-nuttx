/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Zig for logic blocks.
 */
'use strict';

goog.module('Blockly.Zig.logic');

const Zig = goog.require('Blockly.Zig');


Zig['controls_if'] = function(block) {
  // If/elseif/else condition.
  let n = 0;
  let code = '', branchCode, conditionCode;
  if (Zig.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += Zig.injectId(Zig.STATEMENT_PREFIX, block);
  }
  do {
    conditionCode =
        Zig.valueToCode(block, 'IF' + n, Zig.ORDER_NONE) || 'false';
    branchCode = Zig.statementToCode(block, 'DO' + n);
    if (Zig.STATEMENT_SUFFIX) {
      branchCode =
          Zig.prefixLines(
              Zig.injectId(Zig.STATEMENT_SUFFIX, block), Zig.INDENT) +
          branchCode;
    }
    code += (n > 0 ? 'else ' : '') + 'if (' + conditionCode + ') {\n' +
        branchCode + '}';
    n++;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE') || Zig.STATEMENT_SUFFIX) {
    branchCode = Zig.statementToCode(block, 'ELSE');
    if (Zig.STATEMENT_SUFFIX) {
      branchCode =
          Zig.prefixLines(
              Zig.injectId(Zig.STATEMENT_SUFFIX, block), Zig.INDENT) +
          branchCode;
    }
    code += ' else {\n' + branchCode + '}';
  }
  return code + '\n';
};

Zig['controls_ifelse'] = Zig['controls_if'];

Zig['logic_compare'] = function(block) {
  // Comparison operator.
  const OPERATORS =
      {'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>='};
  const operator = OPERATORS[block.getFieldValue('OP')];
  const order = (operator === '==' || operator === '!=') ?
      Zig.ORDER_EQUALITY :
      Zig.ORDER_RELATIONAL;
  const argument0 = Zig.valueToCode(block, 'A', order) || '0';
  const argument1 = Zig.valueToCode(block, 'B', order) || '0';
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Zig['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  const operator = (block.getFieldValue('OP') === 'AND') ? '&&' : '||';
  const order =
      (operator === '&&') ? Zig.ORDER_LOGICAL_AND : Zig.ORDER_LOGICAL_OR;
  let argument0 = Zig.valueToCode(block, 'A', order);
  let argument1 = Zig.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'false';
    argument1 = 'false';
  } else {
    // Single missing arguments have no effect on the return value.
    const defaultArgument = (operator === '&&') ? 'true' : 'false';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Zig['logic_negate'] = function(block) {
  // Negation.
  const order = Zig.ORDER_UNARY_PREFIX;
  const argument0 = Zig.valueToCode(block, 'BOOL', order) || 'true';
  const code = '!' + argument0;
  return [code, order];
};

Zig['logic_boolean'] = function(block) {
  // Boolean values true and false.
  const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'true' : 'false';
  return [code, Zig.ORDER_ATOMIC];
};

Zig['logic_null'] = function(block) {
  // Null data type.
  return ['null', Zig.ORDER_ATOMIC];
};

Zig['logic_ternary'] = function(block) {
  // Ternary operator.
  const value_if =
      Zig.valueToCode(block, 'IF', Zig.ORDER_CONDITIONAL) || 'false';
  const value_then =
      Zig.valueToCode(block, 'THEN', Zig.ORDER_CONDITIONAL) || 'null';
  const value_else =
      Zig.valueToCode(block, 'ELSE', Zig.ORDER_CONDITIONAL) || 'null';
  const code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, Zig.ORDER_CONDITIONAL];
};
