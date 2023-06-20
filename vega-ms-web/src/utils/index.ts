// 未分类工具函数
import moment from 'moment';
import { cloneDeep } from 'lodash';

/**
 * 获取准确的数据类型
 * @param {any} value 需要判断的值
 * @return {string} 类型
 */
export function typeOf(value: any) {
	return Object.prototype.toString
		.call(value)
		.replace(/\[object\s(\w+)\]/, '$1')
		.toLowerCase();
}

/**
 * TODO 项目中有几个地方打印逻辑相同可用该函数替代，抽离公共逻辑，待版本更新后处理，便于测试
 *
 * 打印失败重新尝试
 * @param {React.RefObject<T>.current} thermalPrint 打印对象
 * @param {Array<Record<string, any>>} data  打印数据
 * @param {number} count 尝试打印次数
 * @param {number} time  尝试打印间隔时间
 */
export async function retryPrintBarcode(
	thermalPrint: any,
	data: Record<string, any>[],
	count: number = 0,
	time: number = 0,
) {
	return new Promise((resolve) => {
		setTimeout(
			() => {
				if (!thermalPrint) {
					resolve('noPrinter');
				} else {
					const retryResult = thermalPrint.print(data);
					retryResult.xhr.onreadystatechange = async function () {
						if (retryResult.xhr.readyState === 4) {
							if (retryResult.xhr.status >= 500 && count < 5) {
								count += 1;
								// 这里错的竟然没人发现？是不是没有走过这一步，retryPrintBarcode.apply(thermalPrint, data, count) => thermalPrint.retryPrintBarcode(data)？还是我理解错了，算了，有空再验证吧
								const res = await retryPrintBarcode.apply(thermalPrint, data, count);
								// const res = await retryPrintBarcode(thermalPrint, data, count);
								resolve(res);
							} else if (retryResult.xhr.status >= 500 && count >= 5) {
								resolve('error');
							} else if (retryResult.xhr.status === 200) {
								resolve('success');
							} else {
								resolve('other');
							}
						}
					};
				}
			},
			time ? 1000 * (count + 1) + time : 1000,
		);
	});
}

/**
 * 把antd的form实例收集到的数据转换成我们需要的数据结构
 */
export function convertFormValues(values: Record<string, any>) {
	const target = {};

	for (const key in values) {
		let value = values[key];

		// 「上传图片」处理
		if (Array.isArray(value)) {
			// 空数组的处理
			if (value.length === 0) {
				value = undefined;
			} else {
				// 有值的处理
				const isUploadImg = value[0] && value[0].hasOwnProperty('uid');
				if (isUploadImg) {
					value = value[0].response.data ? value[0].response.data.urlName : value[0].response;
				}
			}
		}

		// 「日期」 「下拉框」 的处理
		if (typeof value === 'object' && value !== null) {
			const isDate = moment.isMoment(value);
			const isSelect = value.hasOwnProperty('key') && value.hasOwnProperty('label');

			if (isDate) {
				value = value.valueOf();
			} else if (isSelect) {
				// 下拉框的值是对象 要转成 字符串
				value = value.key;
			}
		}

		if (value !== undefined) {
			target[key] = value;
		}
	}

	return target;
}

export const genNumList = (start: number, end: number) => {
	const l = end - start;
	return [...Array(l + 1).keys()].map((n) => n + start);
};

/**
 * 用于转换输入框内输入的全角字符转为半角传给后端
 * @param {需要转换圆角为半角的数据} item
 */
export function transformSBCtoDBC(item: any) {
	if (!item) {
		return item;
	}
	if (typeof item === 'string') {
		let tmp = '';
		for (let i = 0; i < item.length; i++) {
			if (item.charCodeAt(i) > 65248 && item.charCodeAt(i) < 65375) {
				tmp += String.fromCharCode(item.charCodeAt(i) - 65248);
			} else {
				tmp += String.fromCharCode(item.charCodeAt(i));
			}
		}
		return tmp;
	}
	if (Array.isArray(item)) {
		item = item.map((child) => transformSBCtoDBC(child));
		return item;
	}
	if (typeof item === 'object') {
		for (const key in item) {
			try {
				item[key] = transformSBCtoDBC(item[key]);
			} catch (e) {
				return item[key];
			}
		}
		return item;
	}
	return item;
}

/**
 * 倍率放大表格除操作列以外的部分
 *
 * @param {any[]} columns 表格列
 * @param {boolean} navFoldState 右侧导航是否折叠
 * @param {number} rest.extraWidth 是否有部分内容占据表格宽度，例如基础数据科室部分
 * @param {number} rest.extraWidth 是否有部分内容占据表格宽度，例如基础数据科室部分
 *
 * @returns {any[]} 新的表格列
 */
export function calColumnsWidth(
	columns: any[],
	navFoldState = false,
	rest = { extraWidth: 0, modalWidth: '' },
) {
	columns = cloneDeep(columns);
	let siderWidth; // 侧边栏宽度
	if (navFoldState) {
		siderWidth = 50;
	} else {
		siderWidth = 256;
	}
	let clientWidth;
	if (rest.modalWidth) {
		const paddingCountWidth = 118; // 除去modal的padding值
		clientWidth =
			document.documentElement.clientWidth *
				(Number(`${rest.modalWidth || ''}`.replace('%', '')) / 100) -
			paddingCountWidth;
	} else {
		const paddingCountWidth = 98; // 除去侧边栏以外的paddingmargin和
		clientWidth =
			document.documentElement.clientWidth - paddingCountWidth - siderWidth - rest.extraWidth; // 表格撑满宽度
	}

	const operationColumn = columns.filter((item) => item.title === '操作')[0]; // 操作列
	if (!operationColumn) {
		return columns;
	}
	if (document.documentElement.clientWidth <= 1024) {
		operationColumn.width =
			(operationColumn.width - 32) * 1.35 + (operationColumn.width < 80 ? 25 : 10); // 操作列适配ipad
	}
	const operateColumnsWidth = operationColumn.width;
	const restColumnWidthCount = columns
		.filter((item) => {
			return item.title !== '操作';
		})
		.reduce((acc, cur) => {
			return acc + (cur.width ? cur.width : 0);
		}, 0);
	const widthMissdistance = clientWidth - operateColumnsWidth - restColumnWidthCount;
	if (widthMissdistance <= 0) {
		operationColumn.fixed = 'right';
		return columns;
	}
	const widthRatio = (clientWidth - operateColumnsWidth) / restColumnWidthCount - 0.05; // 恰巧乘比例的话，会因为旁边17px的滚动条影响显示效果，所以略微减小一点放大比例
	columns = columns
		.filter((item) => item.title !== '操作')
		.map((item) => {
			item.width *= widthRatio;
			return item;
		});
	columns.push(operationColumn);
	return columns;
}

/**
 * 获取参数
 *
 * @param {string} query
 * @param {string} key
 * @returns
 */
export function getUrlParam(query: string, key: string) {
	const vars = query.substring(1).split('&');
	for (let i = 0; i < vars.length; i++) {
		const pair = vars[i].split('=');
		if (pair[0] === key) {
			return pair[1];
		}
	}
	return false;
}

/**
 * 将时间戳转换成当天的零点时间戳（东八区）
 */
export function parseTargetStampToDayStartStamp(time: number) {
	return (
		Math.floor((time + 8 * 3600 * 1000) / (3600 * 1000 * 24)) * 3600 * 1000 * 24 - 8 * 3600 * 1000
	);
}

/**
 * 替换某一项|若干项
 * @param {Array} columns
 * @param {string} key
 * @param {Object | Array} dataItem
 */
export function replaceColumItemByData(
	columns: Record<string, any>[],
	key: any,
	newItem: any[] | Record<string, any>,
) {
	if (!(key instanceof Array)) {
		return columns.map((item) => {
			if (key == item.key) {
				return newItem;
			}
			return item;
		});
	}
	const isInvalid = () => {
		let flag = true;
		try {
			if (key.length != newItem.length) {
				flag = false;
				throw '数据格式不正确';
			}
			key.map((item, index) => {
				flag = false;
				if (item != newItem[index].key) {
					throw '数据格式不正确';
				}
			});
		} catch (err) {
			console.log('table列替换出错,replaceColumItemByData:', err);
		}
		return flag;
	};
	if (isInvalid()) {
		return columns;
	}
	return columns.map((item) => {
		if (key.length > 0 && key[0] == item.key) {
			key.shift();
			const rtnItem = newItem[0];
			newItem.shift();
			return rtnItem;
		}
		return item;
	});
}

/**
 * 删除对应列
 *
 * @param {Array} columns
 * @param {Array<any>} keyStrList
 */
export function removeColumItemByKey(columns: Record<string, any>[], keyStrList: any[]) {
	return columns.filter((item) => {
		if (keyStrList.indexOf(item.key) >= 0) {
			return false;
		}
		return true;
	});
}

/**
 * 提取 打印失败的基础物资operatorBarcode
 */
export function extractOperatorBarcode(printString: string) {
	let operatorBarCode;
	const barCodeReg = /\^FH\\\^FDLA\,\w+\^FS/;
	const barCodeReg2 = /\FDOP.*?\FS/;
	const barCodeReg3 = /\FDID.*?\FS/;
	if (barCodeReg.exec(printString)) {
		operatorBarCode = (barCodeReg as any)
			.exec(printString)[0]
			.replace('^FH\\^FDLA,', '')
			.replace('^FS', '');
	}
	if (barCodeReg2.exec(printString)) {
		operatorBarCode = (barCodeReg2 as any)
			.exec(printString)[0]
			.replace('FDOP', 'OP')
			.replace('^FS', '');
	}
	if (barCodeReg3.exec(printString)) {
		operatorBarCode = (barCodeReg3 as any)
			.exec(printString)[0]
			.replace('FDID', 'ID')
			.replace('^FS', '');
	}
	return operatorBarCode;
}

/**
 * 计算table横向滚动长度
 *
 * @param {Array} columns
 * @param {boolean} isModal 是否是弹窗
 * @returns
 */
export function getScrollX(columns: Record<string, any>[], isModal: boolean = false) {
	let num = 0;
	const list = columns;
	list.forEach((val) => {
		if (val.width) {
			num += parseInt(val.width);
		}
	});
	// //当前浏览器窗口大小，减去左侧导航宽度(+padding)，如果大于列宽度和，表格不需要scrollX，否则scrollX为计算结果
	// if (!modal && document.documentElement.clientWidth - 270 > num) {
	//   return 0;
	// }
	// todo 需要获取到菜单收缩状态修改256数值 96为右侧面板padding值之和
	if (!isModal && num <= document.documentElement.clientWidth - 98 - 256) {
		return 0;
	}

	if (isModal && num <= document.documentElement.clientWidth * 0.8) {
		return undefined;
	} else {
		return num;
	}
}

/**
 * 获取当天数据
 *
 * @param {number | string | Date} val
 * @param {string} type
 * @returns
 */
export function getDay(val: number | string | Date, type?: string) {
	const time = new Date(new Date(val).toDateString()).getTime();
	if (type === 'end') {
		return time + 24 * 60 * 60 * 1000 - 1;
	}
	return time;
}

/**
 * 获取某一天的开始时间
 *
 * @param {string | number | undefined} time
 * @returns Date 格式化后的日期
 */
export function getStartTime(time?: string | number) {
	let t = time ? new Date(time) : new Date();
	return new Date(new Date(t.toLocaleDateString()).getTime());
}

/**
 * 获取某一天的结束时间
 *
 * @param {string | number | undefined} time
 * @returns Date 格式化后的日期
 */
export function getEndTime(time?: string | number) {
	const t = time ? new Date(time) : new Date();
	return new Date(new Date(t.toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1);
}

/**
 * 移除 table data-selected
 *
 * @param {Element} tableEl 表格元素
 */
export function removeRowAttr(tableEl: Element) {
	const rowSelectEles = tableEl?.querySelectorAll('.ant-table-row[data-selected]');
	if ((rowSelectEles || []).length) {
		rowSelectEles.forEach((row) => {
			row.removeAttribute('data-selected');
		});
	}
}

/**
 * 点击table某行变色
 *
 * @param {Element} tableEl 表格元素
 * @param {Record<string, any>} record 表格某一行的数据
 * @param {number} 表格序号
 */
// 点击某行变色
export function setRowAttr<T extends Record<string, any> = Record<string, any>>({
	tableEl,
	record,
	rowKey,
	index,
}: {
	tableEl: Element;
	record?: T;
	rowKey?: string;
	index?: number; // 如果不传index，或者index不是大于等于0的正数，则record和rowKey必传
}) {
	const rowEls = tableEl.querySelectorAll('.ant-table-row');
	removeRowAttr(tableEl);
	const len = rowEls.length;
	if (rowEls.length) {
		if (typeof index === 'number' && index > -1) {
			rowEls[index].setAttribute('data-selected', '');
			return;
		}
		for (let i = 0; i < len; i++) {
			if (
				(rowEls[i] as any).dataset[rowKey as string] ===
				`${(record as Record<string, any>)[rowKey as string]}`
			) {
				rowEls[i].setAttribute('data-selected', '');
				break;
			}
		}
	}
}

/**
 * 滚动table 列表到指定位置
 *
 * @param id 包裹ProTable 元素的id 例如：<div id="tableEle"> <ProTable /> </div> id 就为tableEle
 * @param columnIndex 在table 中纵向排在第几个位置
 * @param horizontalIndex 在table 中横向排在第几个位置
 */
export function scrollTable(columnIndex: number, id: string, horizontalIndex?: number) {
	let allTd;
	let horizontalScrollDistance = 0; //水平滚动距离
	let columnScrollDistance = 0; //垂直方向滚动距离
	let tableBody = document?.getElementById(`${id}`)?.querySelector('.ant-table-body');

	let allTr = tableBody?.querySelectorAll('.ant-table-row'); //获取tableBody下所有的tr元素;

	if (horizontalIndex) {
		allTd = allTr && allTr[0]?.querySelectorAll('td'); //获取指定行下所有的td 元素;
	}
	if (allTr && columnIndex) {
		let cIndex = columnIndex - 1;
		for (let i = 0, len = (allTr as { length: number }).length || 0; i < len; i++) {
			if (i < cIndex) {
				columnScrollDistance += allTr[i]?.clientHeight || 0;
			} else {
				break;
			}
		}
	}
	if (allTd && horizontalIndex) {
		for (let j = 0, len = (allTd as { length: number }).length || 0; j < len; j++) {
			if (j < horizontalIndex) {
				horizontalScrollDistance += allTd[j]?.clientWidth || 0;
			} else {
				break;
			}
		}
	}
	tableBody?.scrollTo(horizontalScrollDistance, columnScrollDistance);
}

/** 加工本地缓存accessName，使其转换成标准的(权限编码: 权限名称)键值对 */
export function accessNameMap() {
	const accessName = JSON.parse(sessionStorage.getItem('accessName') || '{}');
	const newAccessName = {};
	for (let key in accessName) {
		newAccessName[key.split('.').pop()!] = accessName[key];
	}
	return newAccessName;
}

/**
 * 条码或udi展示判断
 * @param record 物资信息object
 * @param notControlledEmpty  非条码管控展示'-'
 * @returns code string
 */
export function judgeBarCodeOrUDI(record: Record<string, any>, notControlledEmpty = false) {
	if (!record) return;
	const { printed, operatorBarcode, goodsOperatorBarcode, udiCode } = record;
	// 判断是否条码管控
	if (record.barcodeControlled || record.isBarcodeControlled) {
		return printed ? operatorBarcode || goodsOperatorBarcode : udiCode;
	} else {
		return notControlledEmpty ? '-' : operatorBarcode || goodsOperatorBarcode || '-';
	}
}
