/// Custom blocks exported from Block Exporter based on zig_library.xml.
/// See zig_functions.js for Code Generator Functions.
var zig_blocks =
// Begin Block Exporter
[{
  "type": "every",
  "message0": "every %1 seconds %2 %3",
  "args0": [
    {
      "type": "field_number",
      "name": "DURATION",
      "value": 10,
      "min": 0
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "STMTS"
    }
  ],
  "colour": 120,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "field",
  "message0": "field %1 %2 value %3",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "field_input",
      "name": "NAME",
      "text": "name"
    },
    {
      "type": "input_value",
      "name": "name"
    }
  ],
  "inputsInline": true,
  "output": null,
  "colour": 120,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "bme280",
  "message0": "BME280 Sensor %1 read %2 %3 from %4",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "field_dropdown",
      "name": "FIELD",
      "options": [
        [
          "temperature",
          "temperature"
        ],
        [
          "pressure",
          "pressure"
        ],
        [
          "humidity",
          "humidity"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "field_input",
      "name": "PATH",
      "text": "/dev/sensor/sensor_baro0"
    }
  ],
  "output": "Number",
  "colour": 330,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "transmit_msg",
  "message0": "transmit message %1 to %2",
  "args0": [
    {
      "type": "input_value",
      "name": "MSG"
    },
    {
      "type": "field_dropdown",
      "name": "TO",
      "options": [
        [
          "LoRaWAN",
          "lorawan"
        ]
      ]
    }
  ],
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
}]
// End Block Exporter
;