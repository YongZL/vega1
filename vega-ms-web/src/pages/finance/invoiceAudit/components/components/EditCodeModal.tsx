import { Descriptions, Input, Modal, Radio } from 'antd';
import { useEffect, useState } from 'react';
interface EditProps {
	visible: boolean;
	clickItem: Record<string, any>;
	checkedValue: string;
	setCheckedValue: (value: string) => void;
	onOk: () => void;
	onCancel: () => void;
	editReceiptCode: (value: string) => void;
	setnewInvoiceCode: (value: string) => void;
}

const EditModal = ({
	onOk,
	onCancel = () => {},
	visible,
	clickItem,
	checkedValue,
	editReceiptCode,
	setnewInvoiceCode,
	setCheckedValue,
}: EditProps) => {
	useEffect(() => {
		if (clickItem.title === 'receiptCode') {
			editReceiptCode(clickItem.receiptCode);
		}
		if (clickItem.title === 'invoiceCode') {
			setnewInvoiceCode(clickItem.invoiceCode);
		}
	}, []);
	return (
		<>
			<Modal
				title={
					clickItem.title === 'receiptCode'
						? '修改收料单号'
						: clickItem.title === 'invoiceCode'
						? '修改发票编号'
						: ''
				}
				visible={visible}
				onOk={onOk}
				okText={'确认操作'}
				onCancel={onCancel}>
				<Descriptions>
					<Descriptions.Item
						label={
							clickItem.title === 'receiptCode'
								? '收料单号'
								: clickItem.title === 'invoiceCode'
								? '发票编号'
								: ''
						}>
						<Input
							id='codeId'
							maxLength={30}
							defaultValue={
								clickItem.title === 'receiptCode' ? clickItem.receiptCode : clickItem.invoiceCode
							}
							style={{ marginTop: -5 }}
							onChange={(e) => {
								if (clickItem.title === 'receiptCode') {
									editReceiptCode(e.target.value);
								}
								if (clickItem.title === 'invoiceCode') {
									setnewInvoiceCode(e.target.value);
								}
							}}
						/>
					</Descriptions.Item>
				</Descriptions>
				{clickItem.title === 'invoiceCode' && (
					<Descriptions>
						<Descriptions.Item label='付款方式'>
							<Radio.Group
								onChange={(e) => setCheckedValue(e.target.value)}
								defaultValue={checkedValue}>
								<Radio value='cash'>现金</Radio>
								<Radio value='cheque'>支票</Radio>
								<Radio value='clientPayment'>付委</Radio>
							</Radio.Group>
						</Descriptions.Item>
					</Descriptions>
				)}
			</Modal>
		</>
	);
};

export default EditModal;
