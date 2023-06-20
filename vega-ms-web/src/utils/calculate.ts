// 计算、统计相关

/**
 * 计算总数
 *
 * @param {*} arr 数组
 * @param {*} keyName '要计算字段'
 * @returns total '总共数量
 */
export function countTotal(arr: Record<string, any>[], keyName: string) {
	return arr.reduce((total, currentValue) => {
		return currentValue[keyName] ? total + currentValue[keyName] : total;
	}, 0);
}

/**
 * 计算总数 大单位
 *
 * @param {Array} list
 * @param {string} key
 *
 * @returns {number}
 */
export function getTotalUnitNum(list: Record<string, any>[], key: string) {
	if (!list || !list.length) {
		return;
	}
	let totalNum = 0;
	list.forEach((item) => {
		totalNum += item[key] / item.unitNum;
	});

	let lastNumber = String(totalNum).indexOf('.') > -1 ? totalNum.toFixed(2) : totalNum;

	return lastNumber;
}

/**
 * 计算总数 小单位
 *
 * @param {Array} list
 * @param {string} key
 *
 * @returns {number}
 */
export function getTotalNum(list: Record<string, any>[], key: string) {
	if (!list || !list.length) {
		return;
	}
	let totalNum = 0;
	list.map((item) => {
		totalNum += item[key];
	});
	return totalNum;
}
