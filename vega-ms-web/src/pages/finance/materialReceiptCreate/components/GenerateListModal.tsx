import { countTotal } from '@/utils/calculate';
import { convertPriceWithDecimal } from '@/utils/format';
import { Descriptions, Modal, Radio } from 'antd';
import { accessNameMap } from '@/utils';
interface ModalType {
	visible: boolean;
	checkedValue: string;
	onOk: () => void;
	onCancel: () => void;
	onChecked: (value: string) => void;
	selectedKeys: number[];
	selectRowKeys: ReceiptController.GoodsListRecord[];
}
const accessNameMaplist: Record<string, any> = accessNameMap();
const GenerateListModal = ({
	visible,
	selectedKeys,
	onOk,
	onCancel,
	checkedValue,
	onChecked,
	selectRowKeys,
}: ModalType) => {
	const converts: any = countTotal(selectRowKeys, 'rowPrice');

	return (
		<Modal
			title={accessNameMaplist.fresh_receipt_add}
			visible={visible}
			onOk={onOk}
			okText={'确认操作'}
			onCancel={onCancel}>
			<Descriptions>
				<Descriptions.Item>
					本次将生成{Math.ceil(selectedKeys.length / 8)}张收料单
				</Descriptions.Item>
			</Descriptions>
			<Descriptions>
				<Descriptions.Item label='总金额(元)'>
					{convertPriceWithDecimal(converts)}
				</Descriptions.Item>
			</Descriptions>
			<Descriptions>
				<Descriptions.Item label='付款方式'>
					<Radio.Group
						onChange={(e) => onChecked(e.target.value)}
						defaultValue={checkedValue}>
						<Radio value='cash'>现金</Radio>
						<Radio value='cheque'>支票</Radio>
						<Radio value='clientPayment'>付委</Radio>
					</Radio.Group>
				</Descriptions.Item>
			</Descriptions>
		</Modal>
	);
};

export default GenerateListModal;
