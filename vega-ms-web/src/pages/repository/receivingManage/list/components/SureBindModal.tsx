import { ProColumns } from '@ant-design/pro-table/lib/typing';

import ProTable from '@/components/ProTable';
import { Button, Modal } from 'antd';
import { useState } from 'react';
import { useModel } from 'umi';
import { formatStrConnect } from '@/utils/format';

const SureBindModal = ({
	dataSource,
	closeModal,
	udiCode,
	checkDelivery,
	scanCodePassParams,
}: {
	checkDelivery: (params: ReceivingOrderController.ScanCodePassData) => Promise<string>;
	scanCodePassParams: ReceivingOrderController.ScanCodePassData | undefined;
	udiCode: string;
	dataSource: ReceivingOrderController.GoodsBeans[];
	closeModal: () => void;
}) => {
	const { fields } = useModel('fieldsMapping');
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [selectedKeys, setSelectedKeys] = useState<number[]>([]);

	// 确定绑定
	const handleSubmit = () => {
		setSubmitLoading(true);
		try {
			checkDelivery({ ...scanCodePassParams!, quantity: 1, goodsId: selectedKeys[0] });
		} finally {
			setSubmitLoading(false);
		}
		closeModal();
	};

	const columns: ProColumns<ReceivingOrderController.GoodsBeans>[] = [
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 135,
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			key: 'name',
			width: 150,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
	];

	// 选择
	const selectRow = (selectData: ReceivingOrderController.DetailGoodsList, status: boolean) => {
		if (status) {
			setSelectedKeys([selectData.id]);
		} else {
			setSelectedKeys([]);
		}
	};

	const rowSelection = {
		selectedRowKeys: selectedKeys,
		onSelect: selectRow,
		type: 'radio',
	};

	return (
		<Modal
			visible={true}
			title='验收&amp;绑定选择'
			maskClosable={false}
			onCancel={closeModal}
			destroyOnClose={true}
			className='ant-detail-modal shippingModal'
			footer={[
				<Button onClick={closeModal}>取消</Button>,
				<Button
					key='submit'
					type='primary'
					onClick={handleSubmit}
					loading={submitLoading}
					disabled={selectedKeys.length === 0}>
					{selectedKeys[0] &&
					!dataSource.filter((item) => item.id === selectedKeys[0])[0].isBarcodeControlled
						? '确认绑定DI'
						: '验收&绑定DI'}
				</Button>,
			]}>
			<div style={{ marginBottom: 24 }}>
				<div style={{ marginBottom: 10 }}>UDI: {udiCode}</div>
				<div>
					扫描UDI中DI部分找不到{fields.goods}匹配，请确认是否要为以下未绑定的{fields.goods}绑定DI
				</div>
			</div>
			<ProTable<ReceivingOrderController.GoodsBeans>
				dataSource={dataSource}
				columns={columns}
				rowKey='id'
				rowSelection={rowSelection as Record<string, any>}
				options={{ density: false, fullScreen: false, setting: false }}
				pagination={false}
				scroll={{ y: 300 }}
			/>
		</Modal>
	);
};

export default SureBindModal;
