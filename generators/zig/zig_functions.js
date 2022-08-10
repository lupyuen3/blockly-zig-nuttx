/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Code Generator Functions for Zig Custom Blocks
 * @suppress {checkTypes|visibility}
 */
'use strict';

goog.module('Blockly.Zig.functions');

const Zig = goog.require('Blockly.Zig');

Zig['compose_msg'] = function(block) {
  //  Generate CBOR message.
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.Zig.valueToCode(block, 'ADD' + i,
      Blockly.Zig.ORDER_NONE) || '\'\'';
  }
  var code = [
    '"TODO: Compose CBOR Message"',
    'composeCBOR({',
    //  Insert the indented elements.
    Blockly.Zig.prefixLines(
      elements.join(',\n'), 
      Blockly.Zig.INDENT),
    '})',
  ].join('\n');
  return [code, Blockly.Zig.ORDER_UNARY_POSTFIX];
};

Zig['field'] = function(block) {
  //  Generate a field for CBOR message: `name: value`
  var text_name = block.getFieldValue('NAME');
  var value_name = Blockly.Zig.valueToCode(block, 'name', Blockly.JavaScript.ORDER_ATOMIC);
  var code = [
    '"TODO: Compose Message Field"\n',
    '"', text_name, '"',
    ': ',
    value_name,
  ].join('');
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Zig.ORDER_NONE];
};

Zig['every'] = function(block) {
  //  Run this code every N seconds.
  var statements_stmts = Blockly.Zig.statementToCode(block, 'STMTS');
  var code = statements_stmts;
  code = [
    `// TODO: Every Loop`,
    `while (true) {`,
    code + `}`,
  ].join('\n');
  return code;
};

Zig['bme280'] = function(block) {
  var dropdown_field = block.getFieldValue('FIELD');
  var text_path = block.getFieldValue('PATH');
  // TODO: Assemble Zig into code variable.
  var code = '"TODO: Read BME280 Sensor"';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Zig.ORDER_NONE];
};

Zig['transmit_msg'] = function(block) {
  var value_msg = Blockly.Zig.valueToCode(block, 'MSG', Blockly.Zig.ORDER_ATOMIC);
  var dropdown_to = block.getFieldValue('TO');
  // TODO: Assemble Zig into code variable.
  var code = '// TODO: Transmit Message\n';
  return code;
};
