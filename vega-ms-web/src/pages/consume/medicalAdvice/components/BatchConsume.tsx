import { notification } from '@/utils/ui';
import { Button, InputNumber, Modal } from 'antd';
import { useState } from 'react';

interface Props {
	isStageType: boolean;
	goodsInfo: Record<string, any>;
	dataList: MedicalAdviceController.DetailListRecord[];
	setDataList: (data: MedicalAdviceController.DetailListRecord[]) => void;
	setIsDisabled: (value: boolean) => void;
	closeModal: () => void;
}

const BatchConsume: React.FC<Props> = ({
	isStageType,
	goodsInfo,
	dataList,
	setDataList,
	setIsDisabled,
	closeModal,
}) => {
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [consumeNumber, setConsumeNumber] = useState<number>();

	let maxCount = 0; // 最大可消耗数量
	if (isStageType) {
		maxCount = dataList.filter((item) => !(item.materialCode || item.status === 'consumed')).length;
	} else {
		const maxNumber = goodsInfo.maximumConsumable || 1;
		// 当前列表能进行消耗的医嘱数量
		const maxListCount = dataList.filter((item) => {
			return !(item.operatorBarcode || item.status === 'consumed');
		}).length;
		maxCount = maxNumber > maxListCount ? maxListCount : maxNumber;
	}

	// 批量消耗提交
	const modalSubmit = async () => {
		if (!consumeNumber) {
			notification.warning('请输入消耗数量！');
			return;
		}
		if (consumeNumber > maxCount) {
			notification.warning('批量消耗数量大于可消耗数量！');
			return;
		}
		setSubmitLoading(true);
		let count = 1;
		const barCodeList = goodsInfo.operatorBarcodeList || [];
		const list = dataList.map((item, index) => {
			if (item.materialCode || item.operatorBarcode || item.status === 'consumed') {
				return item;
			} else if (count <= consumeNumber) {
				count++;
				// 非跟台物资
				if (!isStageType) {
					return {
						...item,
						...goodsInfo,
						newOperatorBarcode: barCodeList[index] ?? undefined,
						status: item.status,
					};
				}
				return {
					...item,
					udiCode: goodsInfo.udiCode,
					materialCode: goodsInfo.materialCode,
					goodsName: goodsInfo.goodsName,
					specification: goodsInfo.specification,
					model: goodsInfo.model,
					manufacturerName: goodsInfo.manufacturerName,
					distributorBeans: goodsInfo.distributorBeans ?? undefined,
					distributorName: goodsInfo.distributorName ?? undefined,
					distributorId: goodsInfo.distributorId ?? undefined,
					lotNum: goodsInfo.lotNum,
					isLotNum: goodsInfo.lotNum ? true : false,
					isProductionDate: goodsInfo.productionDate ? true : false,
					isExpirationDate: goodsInfo.expirationDate ? true : false,
					expirationDate: goodsInfo.expirationDate ?? undefined,
					productionDate: goodsInfo.productionDate ?? undefined,
					isScan: true,
				};
			} else {
				return item;
			}
		});
		setDataList(list);
		setSubmitLoading(false);
		// 扫码框禁用判断
		const isAllConsumedList = list.filter(
			(item) => item.isScan || item.operatorBarcode || item.status === 'consumed',
		);
		setIsDisabled(isAllConsumedList.length == list.length);
		closeModal();
	};

	return (
		<Modal
			visible
			width={400}
			destroyOnClose
			onCancel={closeModal}
			maskClosable={false}
			title='批量消耗'
			footer={[
				<Button onClick={closeModal}>取消</Button>,
				<Button
					type='primary'
					loading={submitLoading}
					onClick={modalSubmit}>
					确认
				</Button>,
			]}>
			<div>
				<span>批量消耗数量：</span>
				<InputNumber
					min={1}
					max={maxCount}
					style={{ width: 100 }}
					value={consumeNumber}
					onChange={(value) => setConsumeNumber(value ?? 1)}
				/>
			</div>
			<div style={{ marginTop: 10 }}>当前最大可消耗数量：{maxCount}</div>
		</Modal>
	);
};

export default BatchConsume;
