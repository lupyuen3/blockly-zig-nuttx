/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Zig for math blocks.
 */
'use strict';

goog.module('Blockly.Zig.math');

const Zig = goog.require('Blockly.Zig');
const {NameType} = goog.require('Blockly.Names');


Zig.addReservedWords('Math');

Zig['math_number'] = function(block) {
  // Numeric value.
  let code = Number(block.getFieldValue('NUM'));
  let order;
  if (code === Infinity) {
    code = 'double.infinity';
    order = Zig.ORDER_UNARY_POSTFIX;
  } else if (code === -Infinity) {
    code = '-double.infinity';
    order = Zig.ORDER_UNARY_PREFIX;
  } else {
    // -4.abs() returns -4 in Zig due to strange order of operation choices.
    // -4 is actually an operator and a number.  Reflect this in the order.
    order = code < 0 ? Zig.ORDER_UNARY_PREFIX : Zig.ORDER_ATOMIC;
  }
  return [code, order];
};

Zig['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  const OPERATORS = {
    'ADD': [' + ', Zig.ORDER_ADDITIVE],
    'MINUS': [' - ', Zig.ORDER_ADDITIVE],
    'MULTIPLY': [' * ', Zig.ORDER_MULTIPLICATIVE],
    'DIVIDE': [' / ', Zig.ORDER_MULTIPLICATIVE],
    'POWER': [null, Zig.ORDER_NONE],  // Handle power separately.
  };
  const tuple = OPERATORS[block.getFieldValue('OP')];
  const operator = tuple[0];
  const order = tuple[1];
  const argument0 = Zig.valueToCode(block, 'A', order) || '0';
  const argument1 = Zig.valueToCode(block, 'B', order) || '0';
  let code;
  // Power in Zig requires a special case since it has no operator.
  if (!operator) {
    Zig.definitions_['import_zig_math'] = 'import \'zig:math\' as Math;';
    code = 'Math.pow(' + argument0 + ', ' + argument1 + ')';
    return [code, Zig.ORDER_UNARY_POSTFIX];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

Zig['math_single'] = function(block) {
  // Math operators with single operand.
  const operator = block.getFieldValue('OP');
  let code;
  let arg;
  if (operator === 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Zig.valueToCode(block, 'NUM', Zig.ORDER_UNARY_PREFIX) || '0';
    if (arg[0] === '-') {
      // --3 is not legal in Zig.
      arg = ' ' + arg;
    }
    code = '-' + arg;
    return [code, Zig.ORDER_UNARY_PREFIX];
  }
  Zig.definitions_['import_zig_math'] = 'import \'zig:math\' as Math;';
  if (operator === 'ABS' || operator.substring(0, 5) === 'ROUND') {
    arg = Zig.valueToCode(block, 'NUM', Zig.ORDER_UNARY_POSTFIX) || '0';
  } else if (operator === 'SIN' || operator === 'COS' || operator === 'TAN') {
    arg = Zig.valueToCode(block, 'NUM', Zig.ORDER_MULTIPLICATIVE) || '0';
  } else {
    arg = Zig.valueToCode(block, 'NUM', Zig.ORDER_NONE) || '0';
  }
  // First, handle cases which generate values that don't need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ABS':
      code = arg + '.abs()';
      break;
    case 'ROOT':
      code = 'Math.sqrt(' + arg + ')';
      break;
    case 'LN':
      code = 'Math.log(' + arg + ')';
      break;
    case 'EXP':
      code = 'Math.exp(' + arg + ')';
      break;
    case 'POW10':
      code = 'Math.pow(10,' + arg + ')';
      break;
    case 'ROUND':
      code = arg + '.round()';
      break;
    case 'ROUNDUP':
      code = arg + '.ceil()';
      break;
    case 'ROUNDDOWN':
      code = arg + '.floor()';
      break;
    case 'SIN':
      code = 'Math.sin(' + arg + ' / 180 * Math.pi)';
      break;
    case 'COS':
      code = 'Math.cos(' + arg + ' / 180 * Math.pi)';
      break;
    case 'TAN':
      code = 'Math.tan(' + arg + ' / 180 * Math.pi)';
      break;
  }
  if (code) {
    return [code, Zig.ORDER_UNARY_POSTFIX];
  }
  // Second, handle cases which generate values that may need parentheses
  // wrapping the code.
  switch (operator) {
    case 'LOG10':
      code = 'Math.log(' + arg + ') / Math.log(10)';
      break;
    case 'ASIN':
      code = 'Math.asin(' + arg + ') / Math.pi * 180';
      break;
    case 'ACOS':
      code = 'Math.acos(' + arg + ') / Math.pi * 180';
      break;
    case 'ATAN':
      code = 'Math.atan(' + arg + ') / Math.pi * 180';
      break;
    default:
      throw Error('Unknown math operator: ' + operator);
  }
  return [code, Zig.ORDER_MULTIPLICATIVE];
};

Zig['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  const CONSTANTS = {
    'PI': ['Math.pi', Zig.ORDER_UNARY_POSTFIX],
    'E': ['Math.e', Zig.ORDER_UNARY_POSTFIX],
    'GOLDEN_RATIO': ['(1 + Math.sqrt(5)) / 2', Zig.ORDER_MULTIPLICATIVE],
    'SQRT2': ['Math.sqrt2', Zig.ORDER_UNARY_POSTFIX],
    'SQRT1_2': ['Math.sqrt1_2', Zig.ORDER_UNARY_POSTFIX],
    'INFINITY': ['double.infinity', Zig.ORDER_ATOMIC],
  };
  const constant = block.getFieldValue('CONSTANT');
  if (constant !== 'INFINITY') {
    Zig.definitions_['import_zig_math'] = 'import \'zig:math\' as Math;';
  }
  return CONSTANTS[constant];
};

Zig['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  const PROPERTIES = {
    'EVEN': [' % 2 == 0', Zig.ORDER_MULTIPLICATIVE, Zig.ORDER_EQUALITY],
    'ODD': [' % 2 == 1', Zig.ORDER_MULTIPLICATIVE, Zig.ORDER_EQUALITY],
    'WHOLE': [' % 1 == 0', Zig.ORDER_MULTIPLICATIVE, Zig.ORDER_EQUALITY],
    'POSITIVE': [' > 0', Zig.ORDER_RELATIONAL, Zig.ORDER_RELATIONAL],
    'NEGATIVE': [' < 0', Zig.ORDER_RELATIONAL, Zig.ORDER_RELATIONAL],
    'DIVISIBLE_BY': [null, Zig.ORDER_MULTIPLICATIVE, Zig.ORDER_EQUALITY],
    'PRIME': [null, Zig.ORDER_NONE, Zig.ORDER_UNARY_POSTFIX],
  };
  const dropdownProperty = block.getFieldValue('PROPERTY');
  const [suffix, inputOrder, outputOrder] = PROPERTIES[dropdownProperty];
  const numberToCheck = Zig.valueToCode(block, 'NUMBER_TO_CHECK',
      inputOrder) || '0';
  let code;
  if (dropdownProperty === 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    Zig.definitions_['import_zig_math'] =
        'import \'zig:math\' as Math;';
    const functionName = Zig.provideFunction_('math_isPrime', `
bool ${Zig.FUNCTION_NAME_PLACEHOLDER_}(n) {
  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods
  if (n == 2 || n == 3) {
    return true;
  }
  // False if n is null, negative, is 1, or not whole.
  // And false if n is divisible by 2 or 3.
  if (n == null || n <= 1 || n % 1 != 0 || n % 2 == 0 || n % 3 == 0) {
    return false;
  }
  // Check all the numbers of form 6k +/- 1, up to sqrt(n).
  for (var x = 6; x <= Math.sqrt(n) + 1; x += 6) {
    if (n % (x - 1) == 0 || n % (x + 1) == 0) {
      return false;
    }
  }
  return true;
}
`);
    code = functionName + '(' + numberToCheck + ')';
  } else if (dropdownProperty === 'DIVISIBLE_BY') {
    const divisor = Zig.valueToCode(block, 'DIVISOR',
        Zig.ORDER_MULTIPLICATIVE) || '0';
    if (divisor === '0') {
      return ['false', Zig.ORDER_ATOMIC];
    }
    code = numberToCheck + ' % ' + divisor + ' == 0';
  } else {
    code = numberToCheck + suffix;
  }
  return [code, outputOrder];
};

Zig['math_change'] = function(block) {
  // Add to a variable in place.
  const argument0 =
      Zig.valueToCode(block, 'DELTA', Zig.ORDER_ADDITIVE) || '0';
  const varName =
      Zig.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' = (' + varName + ' is num ? ' + varName + ' : 0) + ' +
      argument0 + ';\n';
};

// Rounding functions have a single operand.
Zig['math_round'] = Zig['math_single'];
// Trigonometry functions have a single operand.
Zig['math_trig'] = Zig['math_single'];

Zig['math_on_list'] = function(block) {
  // Math functions for lists.
  const func = block.getFieldValue('OP');
  const list = Zig.valueToCode(block, 'LIST', Zig.ORDER_NONE) || '[]';
  let code;
  switch (func) {
    case 'SUM': {
      const functionName = Zig.provideFunction_('math_sum', `
num ${Zig.FUNCTION_NAME_PLACEHOLDER_}(List<num> myList) {
  num sumVal = 0;
  myList.forEach((num entry) {sumVal += entry;});
  return sumVal;
}
`);
      code = functionName + '(' + list + ')';
      break;
    }
    case 'MIN': {
      Zig.definitions_['import_zig_math'] = 'import \'zig:math\' as Math;';
      const functionName = Zig.provideFunction_('math_min', `
num ${Zig.FUNCTION_NAME_PLACEHOLDER_}(List<num> myList) {
  if (myList.isEmpty) return null;
  num minVal = myList[0];
  myList.forEach((num entry) {minVal = Math.min(minVal, entry);});
  return minVal;
}
`);
      code = functionName + '(' + list + ')';
      break;
    }
    case 'MAX': {
      Zig.definitions_['import_zig_math'] = 'import \'zig:math\' as Math;';
      const functionName = Zig.provideFunction_('math_max', `
num ${Zig.FUNCTION_NAME_PLACEHOLDER_}(List<num> myList) {
  if (myList.isEmpty) return null;
  num maxVal = myList[0];
  myList.forEach((num entry) {maxVal = Math.max(maxVal, entry);});
  return maxVal;
}
`);
      code = functionName + '(' + list + ')';
      break;
    }
    case 'AVERAGE': {
      // This operation exclude null and values that are not int or float:
      //   math_mean([null,null,"aString",1,9]) -> 5.0
      const functionName = Zig.provideFunction_('math_mean', `
num ${Zig.FUNCTION_NAME_PLACEHOLDER_}(List myList) {
  // First filter list for numbers only.
  List localList = new List.from(myList);
  localList.removeWhere((a) => a is! num);
  if (localList.isEmpty) return null;
  num sumVal = 0;
  localList.forEach((var entry) {sumVal += entry;});
  return sumVal / localList.length;
}
`);
      code = functionName + '(' + list + ')';
      break;
    }
    case 'MEDIAN': {
      const functionName = Zig.provideFunction_('math_median', `
num ${Zig.FUNCTION_NAME_PLACEHOLDER_}(List myList) {
  // First filter list for numbers only, then sort, then return middle value
  // or the average of two middle values if list has an even number of elements.
  List localList = new List.from(myList);
  localList.removeWhere((a) => a is! num);
  if (localList.isEmpty) return null;
  localList.sort((a, b) => (a - b));
  int index = localList.length ~/ 2;
  if (localList.length % 2 == 1) {
    return localList[index];
  } else {
    return (localList[index - 1] + localList[index]) / 2;
  }
}
`);
      code = functionName + '(' + list + ')';
      break;
    }
    case 'MODE': {
      Zig.definitions_['import_zig_math'] = 'import \'zig:math\' as Math;';
      // As a list of numbers can contain more than one mode,
      // the returned result is provided as an array.
      // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1]
      const functionName = Zig.provideFunction_('math_modes', `
List ${Zig.FUNCTION_NAME_PLACEHOLDER_}(List values) {
  List modes = [];
  List counts = [];
  int maxCount = 0;
  for (int i = 0; i < values.length; i++) {
    var value = values[i];
    bool found = false;
    int thisCount;
    for (int j = 0; j < counts.length; j++) {
      if (counts[j][0] == value) {
        thisCount = ++counts[j][1];
        found = true;
        break;
      }
    }
    if (!found) {
      counts.add([value, 1]);
      thisCount = 1;
    }
    maxCount = Math.max(thisCount, maxCount);
  }
  for (int j = 0; j < counts.length; j++) {
    if (counts[j][1] == maxCount) {
        modes.add(counts[j][0]);
    }
  }
  return modes;
}
`);
      code = functionName + '(' + list + ')';
      break;
    }
    case 'STD_DEV': {
      Zig.definitions_['import_zig_math'] = 'import \'zig:math\' as Math;';
      const functionName = Zig.provideFunction_('math_standard_deviation', `
num ${Zig.FUNCTION_NAME_PLACEHOLDER_}(List myList) {
  // First filter list for numbers only.
  List numbers = new List.from(myList);
  numbers.removeWhere((a) => a is! num);
  if (numbers.isEmpty) return null;
  num n = numbers.length;
  num sum = 0;
  numbers.forEach((x) => sum += x);
  num mean = sum / n;
  num sumSquare = 0;
  numbers.forEach((x) => sumSquare += Math.pow(x - mean, 2));
  return Math.sqrt(sumSquare / n);
}
`);
      code = functionName + '(' + list + ')';
      break;
    }
    case 'RANDOM': {
      Zig.definitions_['import_zig_math'] = 'import \'zig:math\' as Math;';
      const functionName = Zig.provideFunction_('math_random_item', `
dynamic ${Zig.FUNCTION_NAME_PLACEHOLDER_}(List myList) {
  int x = new Math.Random().nextInt(myList.length);
  return myList[x];
}
`);
      code = functionName + '(' + list + ')';
      break;
    }
    default:
      throw Error('Unknown operator: ' + func);
  }
  return [code, Zig.ORDER_UNARY_POSTFIX];
};

Zig['math_modulo'] = function(block) {
  // Remainder computation.
  const argument0 =
      Zig.valueToCode(block, 'DIVIDEND', Zig.ORDER_MULTIPLICATIVE) || '0';
  const argument1 =
      Zig.valueToCode(block, 'DIVISOR', Zig.ORDER_MULTIPLICATIVE) || '0';
  const code = argument0 + ' % ' + argument1;
  return [code, Zig.ORDER_MULTIPLICATIVE];
};

Zig['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  Zig.definitions_['import_zig_math'] = 'import \'zig:math\' as Math;';
  const argument0 = Zig.valueToCode(block, 'VALUE', Zig.ORDER_NONE) || '0';
  const argument1 = Zig.valueToCode(block, 'LOW', Zig.ORDER_NONE) || '0';
  const argument2 =
      Zig.valueToCode(block, 'HIGH', Zig.ORDER_NONE) || 'double.infinity';
  const code = 'Math.min(Math.max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Zig.ORDER_UNARY_POSTFIX];
};

Zig['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  Zig.definitions_['import_zig_math'] = 'import \'zig:math\' as Math;';
  const argument0 = Zig.valueToCode(block, 'FROM', Zig.ORDER_NONE) || '0';
  const argument1 = Zig.valueToCode(block, 'TO', Zig.ORDER_NONE) || '0';
  const functionName = Zig.provideFunction_('math_random_int', `
int ${Zig.FUNCTION_NAME_PLACEHOLDER_}(num a, num b) {
  if (a > b) {
    // Swap a and b to ensure a is smaller.
    num c = a;
    a = b;
    b = c;
  }
  return new Math.Random().nextInt(b - a + 1) + a;
}
`);
  const code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, Zig.ORDER_UNARY_POSTFIX];
};

Zig['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  Zig.definitions_['import_zig_math'] = 'import \'zig:math\' as Math;';
  return ['new Math.Random().nextDouble()', Zig.ORDER_UNARY_POSTFIX];
};

Zig['math_atan2'] = function(block) {
  // Arctangent of point (X, Y) in degrees from -180 to 180.
  Zig.definitions_['import_zig_math'] = 'import \'zig:math\' as Math;';
  const argument0 = Zig.valueToCode(block, 'X', Zig.ORDER_NONE) || '0';
  const argument1 = Zig.valueToCode(block, 'Y', Zig.ORDER_NONE) || '0';
  return [
    'Math.atan2(' + argument1 + ', ' + argument0 + ') / Math.pi * 180',
    Zig.ORDER_MULTIPLICATIVE
  ];
};
