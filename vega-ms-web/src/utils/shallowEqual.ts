/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

const hasOwn = Object.prototype.hasOwnProperty;

function is(x: number, y: number) {
	if (x === y) {
		return x !== 0 || 1 / x === 1 / y;
	}
	return x !== x && y !== y;
}

export default function shallowEqual(objA: any, objB: any) {
	if (is(objA, objB)) {
		return true;
	}

	if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
		return false;
	}

	const keysA = Object.keys(objA);
	const keysB = Object.keys(objB);

	if (keysA.length !== keysB.length) {
		return false;
	}

	for (let i = 0; i < keysA.length; i++) {
		if (!hasOwn.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
			return false;
		}
	}

	return true;
}
