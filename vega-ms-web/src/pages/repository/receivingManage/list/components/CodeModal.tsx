import { goodsBarcodeCompletedForWeb } from '@/services/goodsBarcode';
import { notification } from '@/utils/ui';
import { Checkbox, InputNumber, Modal } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { useState } from 'react';
import style from '../style.less';

type PropsType = {
	onCancel: () => void;
	record?: GoodsBarcodeRecordController.GoodsBarcodeRecord;
	getDetail: () => void;
};
const CodeModal = ({ onCancel, record, getDetail }: PropsType) => {
	const [checked, setChecked] = useState<CheckboxChangeEvent | boolean>(true);
	const [inputNum, setInputNum] = useState<number>(1);
	const { quantityInMin = 0, barcodeQuantity = 0, goodsItemId } = record || {};

	const onConfirm = async () => {
		const res = await goodsBarcodeCompletedForWeb({
			quantity: inputNum,
			itemId: goodsItemId,
			batchBarcode: checked,
		});
		if (res.code === 0) {
			notification.success('操作成功！');
			onCancel();
			getDetail();
		}
	};

	return (
		<Modal
			title='赋码处理'
			onOk={onConfirm}
			onCancel={onCancel}
			visible={true}
			width={340}
			maskClosable={false}>
			请输入单条条码所含物资数量：
			<InputNumber
				value={inputNum}
				min={1}
				max={quantityInMin - barcodeQuantity}
				onChange={(val) => {
					const newValue = val ? Math.floor(val) : 1;
					setInputNum(newValue);
				}}
			/>
			<div className={style.line}>*当前最大可赋码数量：{quantityInMin - barcodeQuantity}</div>
			<div className={style.line}>
				<Checkbox
					defaultChecked={true}
					onChange={(e) => setChecked(e.target.checked)}
					className={style.line}
				/>
				<span style={{ marginLeft: 5 }}>批量赋码</span>
			</div>
			<div
				style={{ color: 'red' }}
				className={style.line}>
				*如未赋码数量不能整除条码数量，末位赋码条码所含物资数量进行取余处理
			</div>
		</Modal>
	);
};

export default CodeModal;
