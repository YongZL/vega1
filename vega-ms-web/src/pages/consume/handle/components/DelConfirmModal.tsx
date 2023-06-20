import type { ModalProps } from 'antd';

import BaseModal from '@/components/BaseModal';
import { getCode } from '@/services/scanCountReport';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { splitTableData } from '../utils';

type GoodsReportItem = Required<ScanCountReportController.GoodsReportItem>;
type EquipmentDto = Required<ScanCountReportController.EquipmentDto>;
type DataItem = GoodsReportItem & EquipmentDto & { rowKey: number };
interface IProps {
	dataSource: DataItem[];
	postData: (dataSource: DataItem[], tip: string, type?: string) => void;
	selectRowData?: DataItem;
	selectedRowKeys: React.Key[];
	setDataSource: React.Dispatch<React.SetStateAction<DataItem[]>>;
	onCancel?: ModalProps['onCancel'];
	onFinish: (goodsReportItem: GoodsReportItem, dataSource: DataItem[]) => void;
}

const DelConfirmModal = ({
	dataSource,
	postData,
	selectRowData = {} as DataItem,
	selectedRowKeys,
	setDataSource,
	onCancel,
	onFinish,
}: IProps) => {
	const { fields } = useModel('fieldsMapping');
	const [saveData, setSaveData] = useState<any>([]);
	const onConfirm = async () => {
		const { operatorBarcode } = selectRowData;
		const arr: DataItem[][] = splitTableData(operatorBarcode, dataSource);

		// 逻辑删除逻辑
		if (saveData.length === 0) {
			const res = await getCode({
				code: operatorBarcode,
				isReport: true,
				deleteDepartmentId: selectRowData.departmentId,
			});
			if (res && res.code === 0) {
				const { goodsReportItem } = res.data;
				onFinish(goodsReportItem as GoodsReportItem, arr[1]);
			}
		} else {
			setDataSource([...arr[1]]);
			postData(saveData, '删除', 'del');
		}
	};

	useEffect(() => {
		const { operatorBarcode } = selectRowData || {};
		const arr: DataItem[][] = splitTableData(operatorBarcode, dataSource);
		const data = arr[0];

		if (data.length) {
			// 有选中
			if (selectedRowKeys.length && data.length !== selectedRowKeys.length) {
				// 按remainingCapacity从大到小进行排序
				const list = data.sort((a, b) => b.remainingCapacity - a.remainingCapacity);
				const maxItem = list[0];
				const {
					remainingCapacity: mrc,
					scanQuantity: mscq,
					scanCapacity: msc,
					splitQuantity: mspq,
				} = maxItem;
				// 排序后获取最大剩余容量值（扫码容量 + 人工拆分容量 + 剩余容量）
				let maxValue = (mrc || 0) + ((mscq || 0) + (mspq || 0)) * msc;

				// 取没有勾选的数据进行数据处理
				const result = list
					.filter((item) => !selectedRowKeys.includes(item.rowKey))
					.map((item: any) => {
						const { scanQuantity, scanCapacity, splitQuantity } = item;
						// 扫描加人工拆分的容量
						const nowValue = ((scanQuantity || 0) + (splitQuantity || 0)) * scanCapacity;
						// 记录当前最大剩余容量的值
						maxValue -= nowValue;
						return {
							...item,
							remainingCapacity: maxValue,
						};
					});

				setSaveData([...result]);
			} else if (!selectedRowKeys.length) {
				setSaveData(data);
			}
		}
	}, [selectRowData, selectedRowKeys, dataSource]);

	return (
		<BaseModal
			width={270}
			okText='是'
			cancelText='否'
			destroyOnClose
			closable={false}
			maskClosable={false}
			onOk={onConfirm}
			onCancel={onCancel}
			visible>
			<p>是否“确认该{fields.goods}条码之前分拆操作&删除本次分拆操作”？</p>
		</BaseModal>
	);
};

export default DelConfirmModal;
