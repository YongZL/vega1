// 数据处理函数，主要针对对象、数组等数据的处理
import { cloneDeep } from 'lodash';
import { defaultPagerFieldConfig } from '@/config';

/**
 * list转valueEnum
 *
 * @param {Array<Record<string, any>>} list
 */
export function optionsToValueEnum(
	list: Record<string, any>[],
): Record<string | number, Record<string, string>> {
	const map = {};
	list.forEach((item) => {
		map[`${item.value}`] = {
			...item,
			text: item.text || item.label,
		};
	});

	return map;
}

/**
 * list转textMap
 *
 * @param {Array<Record<string, any>>} list
 */
export function optionsToTextMap(list: Record<string, any>[]): Record<string | number, string> {
	const map = {};
	list.forEach((item) => {
		map[`${item.value}`] = item.text || item.label;
	});

	return map;
}

// 获取状态
export function getStatus(list: Record<string, any>[], text: any) {
	return list.find((item) => item.value === text) || {};
}

/**
 * 获取路由的access，默认全部为false
 *
 * @param {array} routes 根目录config里面的路由配置
 * @returns {Record<string, boolean>}
 */
export function genMenuAccess(routes: Record<string, any>[]) {
	let routeCodeMap = {};
	routes.forEach((route) => {
		const { routes: children, access } = route;
		if (access) {
			routeCodeMap[access] = false;
		}
		if (children && children.length > 0) {
			routeCodeMap = {
				...routeCodeMap,
				...genMenuAccess(children),
			};
		}
	});
	return routeCodeMap;
}

/**
 * 获取分页数据
 *
 * @param {Record<string, any>} data 获取pager的数据
 * @param {PagerFieldConfig} pagerFieldConfig pager字段配置
 * @returns {Pager} 分页数据
 */
export function getPager<T extends Record<string, any>>(
	data: T,
	pagerFieldConfig: PagerFieldConfig = defaultPagerFieldConfig,
) {
	const pager: Pager = {} as Pager;
	Reflect.ownKeys(pagerFieldConfig).forEach((key) => {
		const value = data[pagerFieldConfig[key]];
		if (value) {
			pager[pagerFieldConfig[key]] = value;
		}
	});

	const { endField, pageSizeField, pageNumField, totalField } = pagerFieldConfig;
	const startPage = pagerFieldConfig.startPage || 0;

	pager[endField] =
		typeof pager[endField] === 'boolean'
			? pager[endField]
			: pager[pageSizeField] * ((pager[pageNumField] || 0) + (startPage > 0 ? 0 : 1)) >
			pager[totalField];

	return pager;
}

/**
 * 计算字符串长度
 *
 * @param {string} str 字符串
 * @returns {number} 字符串长度
 */
export function calcStringLen(str: string) {
	let num = 0;
	if (str && str.length) {
		for (let i = 0; i < str.length; i++) {
			if (str.charCodeAt(i) > 255) {
				//字符编码大于255，说明是双字节字符
				num += 2;
			} else {
				num++;
			}
		}
		return num;
	} else {
		return 0;
	}
}

/**
 * 分割数组
 *
 * @param {Array<any>} array 需要分割的数组
 * @param {number} size 分割的长度
 * @returns
 */
export function sliceArray(array: any[], size: number) {
	const result = [];
	const len = Math.ceil(array.length / size);

	for (let i = 0; i < len; i++) {
		const start = i * size;
		const end = start + size;

		result.push(array.slice(start, end));
	}

	return result;
}

/**
 * 获取字符串的渲染宽度(columns总百分比须为100%)
 * @param {string} text
 * @returns
 */
export const getRenderLineNum = (text: string | number, width: string, isVertical: boolean) => {
	let str = String(text);
	let strWidth = 0;
	const bodyDom = document.querySelector('body');
	const spanDom = document.createElement('span');
	spanDom.innerText = str;
	spanDom.id = 'stringLength';
	bodyDom?.appendChild(spanDom);
	strWidth = bodyDom?.querySelector('#stringLength')?.offsetWidth;
	bodyDom?.removeChild(spanDom);
	// columns总百分比为100%
	// 1%等于7px/10px 减去<td />左右边距10px
	const onePercentWidth = isVertical ? 7.5 : 10;
	const data = strWidth / (parseInt(width) * onePercentWidth - 10);
	const lineNumber = Math.ceil(data);
	return lineNumber;
};

/**
 * 分页数据转换
 * @param {boolean} isVertical 是否竖向打印
 * @param {Record<string, any>[]} dataList
 * @param {Record<string, any>[]} columns
 * @param {number} maxLineNum
 * @returns
 */
export const getPrintSplitList = ({
	isVertical = false,
	dataList,
	columns,
	maxLineNum,
}: {
	isVertical?: boolean;
	dataList: Record<string, any>[];
	columns: Record<string, any>[];
	maxLineNum: number; // 每列最高展示行数累加，每页最多展示多少行
}) => {
	let lineNumSum = 0;
	let indexNumber = 0;
	let newPageList: any = [];
	let canInsetList: Record<string, any>[] = [];
	dataList.forEach((item: Record<string, any>) => {
		indexNumber++;
		let currentMaxLineNum = 0; // 取每行最高行数的col
		let hasBarCode = false;
		columns.forEach((colItem: Record<string, any>) => {
			const { width, show, dataIndex, render, tdMethods } = colItem;
			let renderText: any = '';
			if (show === false) renderText = '';
			if (typeof render === 'function') {
				renderText = render(item[dataIndex], item, indexNumber);
				// 有二维码高度行数最低为3
				if (dataIndex === 'operatorBarcode' && renderText !== '-') {
					hasBarCode = true;
				}
			}
			if (typeof item[dataIndex] !== 'undefined' && item[dataIndex] !== null) {
				renderText = item[dataIndex] || '-';
			}
			// 获取字符串换行行数
			const lineNum = getRenderLineNum(renderText, width, isVertical);
			// tdMethods 为类名（超过7行隐藏）
			const lineNumber = tdMethods && lineNum > 7 ? 7 : lineNum;
			currentMaxLineNum = currentMaxLineNum > lineNumber ? currentMaxLineNum : lineNumber;
		});
		const maxNumber = hasBarCode
			? currentMaxLineNum > 3
				? currentMaxLineNum
				: 3
			: currentMaxLineNum;
		lineNumSum += maxNumber;
		// 超过最大行进行分页
		if (lineNumSum <= maxLineNum) {
			canInsetList.push(item);
		} else {
			lineNumSum = 0;
			newPageList.push([...canInsetList]);
			canInsetList = [];
			canInsetList.push(item);
			lineNumSum += currentMaxLineNum;
		}
	});
	newPageList.push([...canInsetList]);
	return newPageList;
};

/**
 * antd Tree.treeData处理
 *
 * @param {Array<Record<string, any>>} data
 * @returns {Array<Record<string, any>>}
 */
export function genTreeData<T = Record<string, any>, R = { value: any;[key: string]: any }>(
	data: T[],
): R[] {
	if (data.length) {
		return data.map(function (o: Record<string, any>) {
			const oNew: Record<string, any> = {
				title: o.name,
				key: o.id,
				value: o.id,
				type: o.type,
			};
			if (Array.isArray(o.children)) {
				oNew.children = genTreeData(o.children);
			}
			return oNew;
		}) as R[];
	}
	return [];
}

/**
 * antd Cascader.options处理
 *
 * @param {Array<Record<string, any>>} data
 * @returns {Array<Record<string, any>>}
 */
export function genCascaderData<T = Record<string, any>, R = { value: any;[key: string]: any }>(
	data: T[],
): R[] {
	if (data.length) {
		return data.map(function (o: Record<string, any>) {
			const oNew: Record<string, any> = {
				label: o.name,
				key: o.id,
				value: o.id,
			};
			if (Array.isArray(o.children)) {
				oNew.children = genCascaderData(o.children);
			}
			return oNew;
		}) as R[];
	}
	return [];
}

/**
 *
 * @param {Array<Record<string, any>>} alls 全部的分类
 * @param {Array<number>} selectedIds 已选择分类的id
 */
export function businessScope(alls: Record<string, any>[], selectedIds: number[]) {
	let all = cloneDeep(alls);
	for (let i = all.length - 1; i >= 0; i--) {
		const { children = [] } = all[i];
		for (let i1 = children.length - 1; i1 >= 0; i1--) {
			const { children: list } = children[i1];
			for (let i2 = list.length - 1; i2 >= 0; i2--) {
				if (selectedIds.indexOf(Number(list[i2].id)) == -1) {
					list.splice(i2, 1);
				}
			}
		}
	}

	for (let idx = all.length - 1; idx >= 0; idx--) {
		const { children } = all[idx];
		for (let idx1 = children.length - 1; idx1 >= 0; idx1--) {
			if (children[idx1].children.length === 0) {
				children.splice(idx1, 1);
			}
		}
	}

	for (let index = all.length - 1; index >= 0; index--) {
		const { children } = all[index];
		if (children && children.length === 0) {
			all.splice(index, 1);
		}
	}
	return all;
}

/**
 * 数据统计
 *
 * @param {T[]} data 统计数据的列表
 * @param {string} key 统计的字段
 * @returns {number | string}
 */
export function summary<T extends Record<string, any> = Record<string, any>>(
	data: T[] = [],
	key?: string,
) {
	if (!data || !data.length || !key) {
		return '0.00';
	}
	return data.reduce((prev, next) => {
		return (Number(next[key]) || 0) + prev;
	}, 0);
}
/**
 * 30天内处理方法
 * @param endTime 结束时间
 * @param beginTime 开始时间
 * @returns
 */
export function lessThan_30Days<T extends boolean>(
	endTime: number,
	beginTime?: number | undefined,
) {
	return endTime
		? endTime - Date.parse(new Date().toString()) <= 2592000000 - 86400000 + 1000 &&
			endTime >= Date.parse(new Date().toString()) - 86400000 + 1000
			? true
			: false
		: false;
}

export const dealPackNum = (largeNum: string | number, smallNum: string | number) => {
	return `${largeNum || ''}${largeNum && smallNum ? '/' : ''} ${smallNum || ''}`;
};
