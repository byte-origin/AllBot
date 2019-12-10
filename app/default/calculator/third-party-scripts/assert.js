// @ts-nocheck
var assert = function() {
	return assert.ok.apply(this, arguments);
};
(function(exports) {
	"use strict";
	// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
	//
	// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
	//
	// Originally from narwhal.js (http://narwhaljs.org)
	// Copyright (c) 2009 Thomas Robinson <280north.com>
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the 'Software'), to
	// deal in the Software without restriction, including without limitation the
	// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
	// sell copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
	// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	var pSlice = Array.prototype.slice;
	var assert = exports;
	assert.AssertionError = function AssertionError(options) {
		this.name = 'AssertionError';
		this.message = options.message;
		this.actual = options.actual;
		this.expected = options.expected;
		this.operator = options.operator;
		var stackStartFunction = options.stackStartFunction || fail;
		if(Error.captureStackTrace) {
			Error.captureStackTrace(this, stackStartFunction);
		}
	};
	assert.AssertionError.prototype = Object.create(Error.prototype);
	assert.AssertionError.prototype.toString = function() {
		if(this.message) {
			return [this.name + ':', this.message].join(' ');
		} else {
			return [this.name + ':', JSON.stringify(this.expected), this.operator, JSON.stringify(this.actual)].join(' ');
		}
	};
	assert.AssertionError.__proto__ = Error.prototype;
	function fail(actual, expected, message, operator, stackStartFunction) {
		throw new assert.AssertionError({
			message: message,
			actual: actual,
			expected: expected,
			operator: operator,
			stackStartFunction: stackStartFunction
		});
	}
	assert.fail = fail;
	assert.ok = function ok(value, message) {
		if(!!!value) fail(value, true, message, '==', assert.ok);
	};
	assert.equal = function equal(actual, expected, message) {
		if(actual != expected) fail(actual, expected, message, '==', assert.equal);
	};
	assert.notEqual = function notEqual(actual, expected, message) {
		if(actual == expected) {
			fail(actual, expected, message, '!=', assert.notEqual);
		}
	};
	assert.deepEqual = function deepEqual(actual, expected, message) {
		if(!_deepEqual(actual, expected)) {
			fail(actual, expected, message, 'deepEqual', assert.deepEqual);
		}
	};
	function _deepEqual(actual, expected) {
		if(actual === expected) {
			return true;
		} else if(actual instanceof Date && expected instanceof Date) {
			return actual.getTime() === expected.getTime();
		} else if(typeof actual != 'object' && typeof expected != 'object') {
			return actual == expected;
		} else {
			return objEquiv(actual, expected);
		}
	}
	function isUndefinedOrNull(value) {
		return value === null || value === undefined;
	}
	function isArguments(object) {
		return Object.prototype.toString.call(object) == '[object Arguments]';
	}
	function objEquiv(a, b) {
		if(isUndefinedOrNull(a) || isUndefinedOrNull(b))
			return false;
		if(a.prototype !== b.prototype) return false;
		if(isArguments(a)) {
			if(!isArguments(b)) {
				return false;
			}
			a = pSlice.call(a);
			b = pSlice.call(b);
			return _deepEqual(a, b);
		}
		try {
			var ka = Object.keys(a), kb = Object.keys(b), key, i;
		} catch(e) {
			return false;
		}
		if(ka.length != kb.length)
			return false;
		ka.sort();
		kb.sort();
		for(i = ka.length - 1; i >= 0; i--) {
			if(ka[i] != kb[i]) return false;
		}
		for(i = ka.length - 1; i >= 0; i--) {
			key = ka[i];
			if(!_deepEqual(a[key], b[key])) return false;
		}
		return true;
	}
	assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
		if(_deepEqual(actual, expected)) {
			fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
		}
	};
	assert.strictEqual = function strictEqual(actual, expected, message) {
		if(actual !== expected) {
			fail(actual, expected, message, '===', assert.strictEqual);
		}
	};
	assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
		if(actual === expected) {
			fail(actual, expected, message, '!==', assert.notStrictEqual);
		}
	};
	function expectedException(actual, expected) {
		if(!actual || !expected) return false;

		if(expected instanceof (RegExp)) {
			return expected.test(actual);
		} else if(actual instanceof (expected)) {
			return true;
		} else if(expected.call({}, actual) === true) {
			return true;
		}
		return false;
	}

	function _throws(shouldThrow, block, expected, message) {
		var actual;
		if(typeof (expected) === 'string') {
			message = expected;
			expected = null;
		}
		try {
			block();
		} catch(e) {
			actual = e;
		}
		message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
			(message ? ' ' + message : '.');
		if(shouldThrow && !actual) {
			fail(`Missing expected exceptio ${message}`);
		}
		if(!shouldThrow && expectedException(actual, expected)) {
			fail(`Got unwanted exception ${message}`);
		}
		if((shouldThrow && actual && expected &&
			!expectedException(actual, expected)) || (!shouldThrow && actual)) {
			throw actual;
		}
	}
	assert.throws = function(block, error, message) {
		_throws.apply(this, [true].concat(pSlice.call(arguments)));
	};
	assert.doesNotThrow = function(block, error, message) {
		_throws.apply(this, [false].concat(pSlice.call(arguments)));
	};
	assert.ifError = function(err) {
		if(err) {
			throw err;
		}
	};
}(assert));