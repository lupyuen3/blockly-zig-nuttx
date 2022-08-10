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

// Generate CBOR Message
Zig['compose_msg'] = function(block) {
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.Zig.valueToCode(block, 'ADD' + i,
      Blockly.Zig.ORDER_NONE) || '\'\'';
  }
  const code = [
    'try composeCbor(.{  // Compose CBOR Message',
    //  Insert the indented elements.
    Blockly.Zig.prefixLines(
      elements.join('\n'),
      Blockly.Zig.INDENT),
    '})',
  ].join('\n');
  return [code, Blockly.Zig.ORDER_UNARY_POSTFIX];
};

// Generate a field for CBOR message
Zig['field'] = function(block) {
  const name = block.getFieldValue('NAME');
  const value = Blockly.Zig.valueToCode(block, 'name', Blockly.JavaScript.ORDER_ATOMIC);
  const code = `.{ "${name}", ${value} },`;
  return [code, Blockly.Zig.ORDER_NONE];
};

// Run this code every N seconds
Zig['every'] = function(block) {
  const duration = block.getFieldValue('DURATION');
  const stmts = Blockly.Zig.statementToCode(block, 'STMTS');
  const code = [
    ``,
    `// Every ${duration} seconds...`,
    `while (true) {`,
    stmts,
    Blockly.Zig.INDENT + `// Wait ${duration} seconds`,
    Blockly.Zig.INDENT + `c.sleep(${duration});`,
    `}`,
    ``,
  ].join('\n');
  return code;
};

// Read BME280 Sensor
Zig['bme280'] = function(block) {
  // Get the Sensor Data Field: temperature / pressure / humidity
  const field = block.getFieldValue('FIELD');

  // Get the Sensor Device Path, like "/dev/sensor/sensor_baro0"
  // TODO: Validate that path contains "sensor_humi" for humidity
  const path = block.getFieldValue('PATH');

  // Struct name is "sensor_humi" for humidity, else "sensor_baro"
  const struct = (field == 'humidity')
    ? 'struct_sensor_humi'
    : 'struct_sensor_baro';

  // Compose the code
  const code = [
    `try sen.readSensor(   // Read BME280 Sensor`,
    Blockly.Zig.INDENT + `c.${struct},  // Sensor Data Struct`,
    Blockly.Zig.INDENT + `"${field}",  // Sensor Data Field`,
    Blockly.Zig.INDENT + `"${path}"  // Path of Sensor Device`,
    `)`,
  ].join('\n');
  return [code, Blockly.Zig.ORDER_UNARY_POSTFIX];
};

// Transmit CBOR Message
Zig['transmit_msg'] = function(block) {
  const msg = Blockly.Zig.valueToCode(block, 'MSG', Blockly.Zig.ORDER_ATOMIC);
  const to = block.getFieldValue('TO');
  const code = [
    ``,
    `// Transmit message to LoRaWAN`,
    `try transmitLorawan(${msg});`,
    ``,
  ].join('\n');
  return code;
};
