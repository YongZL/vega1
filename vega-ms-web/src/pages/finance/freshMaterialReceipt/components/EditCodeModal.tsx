import { Descriptions, Input, Modal } from 'antd';

interface EditProps {
	visible: boolean;
	clickItem: Record<string, any>;
	onOk: () => void;
	onCancel: () => void;
	editReceiptCode: (value: string) => void;
}

const EditModal = ({
	onOk,
	onCancel = () => {},
	visible,
	clickItem,
	editReceiptCode,
}: EditProps) => {
	return (
		<>
			<Modal
				title='修改收料单号'
				visible={visible}
				onOk={onOk}
				okText={'确认操作'}
				onCancel={onCancel}>
				<Descriptions>
					<Descriptions.Item>
						<Input
							id='codeId'
							maxLength={30}
							defaultValue={clickItem.receiptCode}
							onChange={(e) => editReceiptCode(e.target.value)}
						/>
					</Descriptions.Item>
				</Descriptions>
			</Modal>
		</>
	);
};

export default EditModal;
