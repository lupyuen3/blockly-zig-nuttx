/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Compose Message block
 * @suppress {checkTypes|visibility}
 */
'use strict';

goog.module('Blockly.Zig.composeMessage');

/* eslint-disable-next-line no-unused-vars */
const AbstractEvent = goog.requireType('Blockly.Events.Abstract');
const ContextMenu = goog.require('Blockly.ContextMenu');
const Events = goog.require('Blockly.Events');
const Procedures = goog.require('Blockly.Procedures');
const Variables = goog.require('Blockly.Variables');
const Xml = goog.require('Blockly.Xml');
const xmlUtils = goog.require('Blockly.utils.xml');
const {Align} = goog.require('Blockly.Input');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
/* eslint-disable-next-line no-unused-vars */
const {BlockDefinition} = goog.requireType('Blockly.blocks');
const {config} = goog.require('Blockly.config');
/* eslint-disable-next-line no-unused-vars */
const {FieldCheckbox} = goog.require('Blockly.FieldCheckbox');
const {FieldLabel} = goog.require('Blockly.FieldLabel');
const {FieldTextInput} = goog.require('Blockly.FieldTextInput');
const {Msg} = goog.require('Blockly.Msg');
const {Mutator} = goog.require('Blockly.Mutator');
const {Names} = goog.require('Blockly.Names');
/* eslint-disable-next-line no-unused-vars */
const {VariableModel} = goog.requireType('Blockly.VariableModel');
/* eslint-disable-next-line no-unused-vars */
const {Workspace} = goog.requireType('Blockly.Workspace');
const {defineBlocks} = goog.require('Blockly.common');
/** @suppress {extraRequire} */
goog.require('Blockly.Comment');
/** @suppress {extraRequire} */
goog.require('Blockly.Warning');


/**
 * A dictionary of the block definitions provided by this module.
 * @type {!Object<string, !BlockDefinition>}
 */
const blocks = {};
exports.blocks = blocks;

/**
 * Unused constant for the common HSV hue for all blocks in this category.
 * @deprecated Use Blockly.Msg['TEXTS_HUE']. (2018 April 5)
 */
blocks.HUE = 120;

Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
  {
    "type": "compose_msg",
    "message0": "",
    "output": "String",
    "style": "text_blocks",  //  TODO
    "helpUrl": "%{BKY_TEXT_JOIN_HELPURL}",
    "tooltip": "Compose Message",
    "mutator": "compose_msg_mutator"
  },
  {
    "type": "compose_msg_container",
    "message0": "compose message %1 %2",
    "args0": [{
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "STACK"
    }],
    "style": "text_blocks",  //  TODO
    "tooltip": "Message Fields",
    "enableContextMenu": false
  },
  {
    "type": "compose_msg_item",
    "message0": "item",
    "previousStatement": null,
    "nextStatement": null,
    "style": "text_blocks",  //  TODO
    "tooltip": "Message Field",
    "enableContextMenu": false
  }
]);  // END JSON EXTRACT (Do not delete this comment.)

/**
 * Mixin for mutator functions in the 'compose_msg_mutator' extension.
 * @mixin
 * @augments Blockly.Block
 * @package
 */
blocks.COMPOSE_MSG_MUTATOR_MIXIN = {
  /**
   * Create XML to represent the Message Fields.
   * @return {!Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the Message Fields.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function(xmlElement) {
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this {Blockly.Block}
   */
  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('compose_msg_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var i = 0; i < this.itemCount_; i++) {
      var itemBlock = workspace.newBlock('compose_msg_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  compose: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    // Count number of inputs.
    var connections = [];
    while (itemBlock) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    // Disconnect any children that don't belong.
    for (var i = 0; i < this.itemCount_; i++) {
      var connection = this.getInput('ADD' + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) == -1) {
        connection.disconnect();
      }
    }
    this.itemCount_ = connections.length;
    this.updateShape_();
    // Reconnect any child blocks.
    for (var i = 0; i < this.itemCount_; i++) {
      Blockly.Mutator.reconnect(connections[i], this, 'ADD' + i);
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var i = 0;
    while (itemBlock) {
      var input = this.getInput('ADD' + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      i++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this {Blockly.Block}
   */
  updateShape_: function() {
    if (this.itemCount_ && this.getInput('EMPTY')) {
      this.removeInput('EMPTY');
    } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
      this.appendDummyInput('EMPTY')
          .appendField(this.newQuote_(true))
          .appendField(this.newQuote_(false));
    }
    // Add new inputs.
    for (var i = 0; i < this.itemCount_; i++) {
      if (!this.getInput('ADD' + i)) {
        var input = this.appendValueInput('ADD' + i);
        if (i == 0) {
          input.appendField('compose message');
        }
      }
    }
    // Remove deleted inputs.
    while (this.getInput('ADD' + i)) {
      this.removeInput('ADD' + i);
      i++;
    }
  }
};

/**
 * Performs final setup of a Compose Message block.
 * @this {Blockly.Block}
 */
blocks.COMPOSE_MSG_EXTENSION = function() {

  // Initialize the mutator values.
  this.itemCount_ = 2;
  this.updateShape_();

  // Configure the mutator UI.
  this.setMutator(new Blockly.Mutator(['compose_msg_item']));
};

Blockly.Extensions.registerMutator('compose_msg_mutator',
    blocks.COMPOSE_MSG_MUTATOR_MIXIN,
    blocks.COMPOSE_MSG_EXTENSION);
