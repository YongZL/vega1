import { sortArray } from '@/utils/format';

type GoodsReportItem = Required<ScanCountReportController.GoodsReportItem>;
type EquipmentDto = Required<ScanCountReportController.EquipmentDto>;
type DataItem = GoodsReportItem & EquipmentDto & { rowKey: number };

// 根据operatorBarcode拆分数组
export const splitTableData = (value: string, tableData: DataItem[]) => {
	let arr: DataItem[] = [];
	let arr1: DataItem[] = [];
	if (tableData.length) {
		tableData.forEach((item: any) => {
			if (item.operatorBarcode === value) {
				arr.push(item);
			} else {
				arr1.push(item);
			}
		});
		return [arr, arr1];
	}
	return [arr, arr1];
};

// 清除设备数据，用于创建临时行时使用
export const resetEquipment = () => {
	return {
		equipmentNames: '',
		idEquipments: '',
		materialCodes: '',
		createdName: '',
		departmentNames: '',
		equipmentCodes: '',
		equipmentBarcodes: '',
		equipmentStoragePlace: '',
		assetClassification: '',
	};
};

// 给数据添加rowKey
export const addRowKey = (data: any) => {
	return data && data.rowKey ? {} : { rowKey: (data && data.rowKey) || new Date().getTime() };
};

/**
 * 给相同数据的行添加same-element的属性
 *
 * @param {Element} tableEl
 * @param {string} code 当前operatorBarcode
 * @param {T[]} dataSource 表格数据
 */
export const addRowAttribute = <T extends Record<string, any> = Record<string, any>>(
	tableEl: Element,
	code: string,
	dataSource: T[],
) => {
	setTimeout(() => {
		const key = 'operatorBarcode';
		const attr = 'same-element';
		const rowEles = tableEl.querySelectorAll('.ant-table-row');

		dataSource.map((item: T, index: number) => {
			if (item[key] === code) {
				rowEles[index].setAttribute(attr, '');
			} else {
				const row = rowEles[index];
				if (row.hasAttribute(attr)) {
					row.removeAttribute(attr);
				}
			}
		});
	}, 200);
};

/**
 * 校验剩余容量最多的数据的剩余容量是否小于当前扫码容量
 * @param item 当前扫码数据
 * @param list 当前列表数据
 * @returns {boolean}
 */
export const validateData = (
	item: ScanCountReportController.GoodsReportItem,
	list: (ScanCountReportController.GoodsReportItem & ScanCountReportController.EquipmentDto)[],
) => {
	const { operatorBarcode, remainingCapacity } = item;
	const arr = list.filter((i) => i?.operatorBarcode === operatorBarcode);

	if (arr.length > 0) {
		// 剩余容量按从大到小排序取第一个试剂的剩余容量去对比
		const result = sortArray({ list: [...arr], key: 'remainingCapacity', desc: true })[0];
		const { scanQuantity, splitQuantity, scanCapacity } = result;
		// 扫码容量
		const count = (Number(scanQuantity || 0) + Number(splitQuantity || 0)) * (scanCapacity || 0);
		return (remainingCapacity as number) < count;
	}
	return false;
};
