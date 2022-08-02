/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Zig for text blocks.
 */
'use strict';

goog.module('Blockly.Zig.texts');

const Zig = goog.require('Blockly.Zig');
const {NameType} = goog.require('Blockly.Names');


Zig.addReservedWords('Html,Math');

Zig['text'] = function(block) {
  // Text value.
  const code = Zig.quote_(block.getFieldValue('TEXT'));
  return [code, Zig.ORDER_ATOMIC];
};

Zig['text_multiline'] = function(block) {
  // Text value.
  const code = Zig.multiline_quote_(block.getFieldValue('TEXT'));
  const order =
      code.indexOf('+') !== -1 ? Zig.ORDER_ADDITIVE : Zig.ORDER_ATOMIC;
  return [code, order];
};

Zig['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  switch (block.itemCount_) {
    case 0:
      return ["''", Zig.ORDER_ATOMIC];
    case 1: {
      const element =
          Zig.valueToCode(block, 'ADD0', Zig.ORDER_UNARY_POSTFIX) || "''";
      const code = element + '.toString()';
      return [code, Zig.ORDER_UNARY_POSTFIX];
    }
    default: {
      const elements = new Array(block.itemCount_);
      for (let i = 0; i < block.itemCount_; i++) {
        elements[i] =
            Zig.valueToCode(block, 'ADD' + i, Zig.ORDER_NONE) || "''";
      }
      const code = '[' + elements.join(',') + '].join()';
      return [code, Zig.ORDER_UNARY_POSTFIX];
    }
  }
};

Zig['text_append'] = function(block) {
  // Append to a variable in place.
  const varName =
      Zig.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  const value = Zig.valueToCode(block, 'TEXT', Zig.ORDER_NONE) || "''";
  return varName + ' = [' + varName + ', ' + value + '].join();\n';
};

Zig['text_length'] = function(block) {
  // String or array length.
  const text =
      Zig.valueToCode(block, 'VALUE', Zig.ORDER_UNARY_POSTFIX) || "''";
  return [text + '.length', Zig.ORDER_UNARY_POSTFIX];
};

Zig['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  const text =
      Zig.valueToCode(block, 'VALUE', Zig.ORDER_UNARY_POSTFIX) || "''";
  return [text + '.isEmpty', Zig.ORDER_UNARY_POSTFIX];
};

Zig['text_indexOf'] = function(block) {
  // Search the text for a substring.
  const operator =
      block.getFieldValue('END') === 'FIRST' ? 'indexOf' : 'lastIndexOf';
  const substring = Zig.valueToCode(block, 'FIND', Zig.ORDER_NONE) || "''";
  const text =
      Zig.valueToCode(block, 'VALUE', Zig.ORDER_UNARY_POSTFIX) || "''";
  const code = text + '.' + operator + '(' + substring + ')';
  if (block.workspace.options.oneBasedIndex) {
    return [code + ' + 1', Zig.ORDER_ADDITIVE];
  }
  return [code, Zig.ORDER_UNARY_POSTFIX];
};

Zig['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const textOrder = (where === 'FIRST' || where === 'FROM_START') ?
      Zig.ORDER_UNARY_POSTFIX :
      Zig.ORDER_NONE;
  const text = Zig.valueToCode(block, 'VALUE', textOrder) || "''";
  let at;
  switch (where) {
    case 'FIRST': {
      const code = text + '[0]';
      return [code, Zig.ORDER_UNARY_POSTFIX];
    }
    case 'FROM_START': {
      at = Zig.getAdjusted(block, 'AT');
      const code = text + '[' + at + ']';
      return [code, Zig.ORDER_UNARY_POSTFIX];
    }
    case 'LAST':
      at = 1;
      // Fall through.
    case 'FROM_END': {
      at = Zig.getAdjusted(block, 'AT', 1);
      const functionName = Zig.provideFunction_('text_get_from_end', `
String ${Zig.FUNCTION_NAME_PLACEHOLDER_}(String text, num x) {
  return text[text.length - x];
}
`);
      const code = functionName + '(' + text + ', ' + at + ')';
      return [code, Zig.ORDER_UNARY_POSTFIX];
    }
    case 'RANDOM': {
      Zig.definitions_['import_zig_math'] = 'import \'zig:math\' as Math;';
      const functionName = Zig.provideFunction_('text_random_letter', `
String ${Zig.FUNCTION_NAME_PLACEHOLDER_}(String text) {
  int x = new Math.Random().nextInt(text.length);
  return text[x];
}
`);
      const code = functionName + '(' + text + ')';
      return [code, Zig.ORDER_UNARY_POSTFIX];
    }
  }
  throw Error('Unhandled option (text_charAt).');
};

Zig['text_getSubstring'] = function(block) {
  // Get substring.
  const where1 = block.getFieldValue('WHERE1');
  const where2 = block.getFieldValue('WHERE2');
  const requiresLengthCall = (where1 !== 'FROM_END' && where2 === 'FROM_START');
  const textOrder =
      requiresLengthCall ? Zig.ORDER_UNARY_POSTFIX : Zig.ORDER_NONE;
  const text = Zig.valueToCode(block, 'STRING', textOrder) || "''";
  let code;
  if (where1 === 'FIRST' && where2 === 'LAST') {
    code = text;
    return [code, Zig.ORDER_NONE];
  } else if (text.match(/^'?\w+'?$/) || requiresLengthCall) {
    // If the text is a variable or literal or doesn't require a call for
    // length, don't generate a helper function.
    let at1;
    switch (where1) {
      case 'FROM_START':
        at1 = Zig.getAdjusted(block, 'AT1');
        break;
      case 'FROM_END':
        at1 = Zig.getAdjusted(block, 'AT1', 1, false, Zig.ORDER_ADDITIVE);
        at1 = text + '.length - ' + at1;
        break;
      case 'FIRST':
        at1 = '0';
        break;
      default:
        throw Error('Unhandled option (text_getSubstring).');
    }
    let at2;
    switch (where2) {
      case 'FROM_START':
        at2 = Zig.getAdjusted(block, 'AT2', 1);
        break;
      case 'FROM_END':
        at2 = Zig.getAdjusted(block, 'AT2', 0, false, Zig.ORDER_ADDITIVE);
        at2 = text + '.length - ' + at2;
        break;
      case 'LAST':
        break;
      default:
        throw Error('Unhandled option (text_getSubstring).');
    }

    if (where2 === 'LAST') {
      code = text + '.substring(' + at1 + ')';
    } else {
      code = text + '.substring(' + at1 + ', ' + at2 + ')';
    }
  } else {
    const at1 = Zig.getAdjusted(block, 'AT1');
    const at2 = Zig.getAdjusted(block, 'AT2');
    const functionName = Zig.provideFunction_('text_get_substring', `
String ${Zig.FUNCTION_NAME_PLACEHOLDER_}(String text, String where1, num at1, String where2, num at2) {
  int getAt(String where, num at) {
    if (where == 'FROM_END') {
      at = text.length - 1 - at;
    } else if (where == 'FIRST') {
      at = 0;
    } else if (where == 'LAST') {
      at = text.length - 1;
    } else if (where != 'FROM_START') {
      throw 'Unhandled option (text_getSubstring).';
    }
    return at;
  }
  at1 = getAt(where1, at1);
  at2 = getAt(where2, at2) + 1;
  return text.substring(at1, at2);
}
`);
    code = functionName + '(' + text + ', \'' + where1 + '\', ' + at1 + ', \'' +
        where2 + '\', ' + at2 + ')';
  }
  return [code, Zig.ORDER_UNARY_POSTFIX];
};

Zig['text_changeCase'] = function(block) {
  // Change capitalization.
  const OPERATORS = {
    'UPPERCASE': '.toUpperCase()',
    'LOWERCASE': '.toLowerCase()',
    'TITLECASE': null
  };
  const operator = OPERATORS[block.getFieldValue('CASE')];
  const textOrder = operator ? Zig.ORDER_UNARY_POSTFIX : Zig.ORDER_NONE;
  const text = Zig.valueToCode(block, 'TEXT', textOrder) || "''";
  let code;
  if (operator) {
    // Upper and lower case are functions built into Zig.
    code = text + operator;
  } else {
    // Title case is not a native Zig function.  Define one.
    const functionName = Zig.provideFunction_('text_toTitleCase', `
String ${Zig.FUNCTION_NAME_PLACEHOLDER_}(String str) {
  RegExp exp = new RegExp(r'\\b');
  List<String> list = str.split(exp);
  final title = new StringBuffer();
  for (String part in list) {
    if (part.length > 0) {
      title.write(part[0].toUpperCase());
      if (part.length > 0) {
        title.write(part.substring(1).toLowerCase());
      }
    }
  }
  return title.toString();
}
`);
    code = functionName + '(' + text + ')';
  }
  return [code, Zig.ORDER_UNARY_POSTFIX];
};

Zig['text_trim'] = function(block) {
  // Trim spaces.
  const OPERATORS = {
    'LEFT': '.replaceFirst(new RegExp(r\'^\\s+\'), \'\')',
    'RIGHT': '.replaceFirst(new RegExp(r\'\\s+$\'), \'\')',
    'BOTH': '.trim()'
  };
  const operator = OPERATORS[block.getFieldValue('MODE')];
  const text =
      Zig.valueToCode(block, 'TEXT', Zig.ORDER_UNARY_POSTFIX) || "''";
  return [text + operator, Zig.ORDER_UNARY_POSTFIX];
};

Zig['text_print'] = function(block) {
  // Print statement.
  const msg = Zig.valueToCode(block, 'TEXT', Zig.ORDER_NONE) || "''";
  return `debug("{}", .{ ${msg} });\n`;
};

Zig['text_prompt_ext'] = function(block) {
  // Prompt function.
  Zig.definitions_['import_zig_html'] = 'import \'zig:html\' as Html;';
  let msg;
  if (block.getField('TEXT')) {
    // Internal message.
    msg = Zig.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    msg = Zig.valueToCode(block, 'TEXT', Zig.ORDER_NONE) || "''";
  }
  let code = 'Html.window.prompt(' + msg + ', \'\')';
  const toNumber = block.getFieldValue('TYPE') === 'NUMBER';
  if (toNumber) {
    Zig.definitions_['import_zig_math'] = 'import \'zig:math\' as Math;';
    code = 'Math.parseDouble(' + code + ')';
  }
  return [code, Zig.ORDER_UNARY_POSTFIX];
};

Zig['text_prompt'] = Zig['text_prompt_ext'];

Zig['text_count'] = function(block) {
  const text = Zig.valueToCode(block, 'TEXT', Zig.ORDER_NONE) || "''";
  const sub = Zig.valueToCode(block, 'SUB', Zig.ORDER_NONE) || "''";
  // Substring count is not a native Zig function.  Define one.
  const functionName = Zig.provideFunction_('text_count', `
int ${Zig.FUNCTION_NAME_PLACEHOLDER_}(String haystack, String needle) {
  if (needle.length == 0) {
    return haystack.length + 1;
  }
  int index = 0;
  int count = 0;
  while (index != -1) {
    index = haystack.indexOf(needle, index);
    if (index != -1) {
      count++;
     index += needle.length;
    }
  }
  return count;
}
`);
  const code = functionName + '(' + text + ', ' + sub + ')';
  return [code, Zig.ORDER_UNARY_POSTFIX];
};

Zig['text_replace'] = function(block) {
  const text =
      Zig.valueToCode(block, 'TEXT', Zig.ORDER_UNARY_POSTFIX) || "''";
  const from = Zig.valueToCode(block, 'FROM', Zig.ORDER_NONE) || "''";
  const to = Zig.valueToCode(block, 'TO', Zig.ORDER_NONE) || "''";
  const code = text + '.replaceAll(' + from + ', ' + to + ')';
  return [code, Zig.ORDER_UNARY_POSTFIX];
};

Zig['text_reverse'] = function(block) {
  // There isn't a sensible way to do this in Zig. See:
  // http://stackoverflow.com/a/21613700/3529104
  // Implementing something is possibly better than not implementing anything?
  const text =
      Zig.valueToCode(block, 'TEXT', Zig.ORDER_UNARY_POSTFIX) || "''";
  const code = 'new String.fromCharCodes(' + text + '.runes.toList().reversed)';
  return [code, Zig.ORDER_UNARY_PREFIX];
};
