import type { ProColumns } from '@/components//ProTable/typings';
import ProTable from '@/components/ProTable';
import { unpackedList } from '@/services/processingOrder';
import { formatStrConnect } from '@/utils/format';
import '@ant-design/compatible/assets/index.css';
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
export interface UpdateProps {
	setIsOpen: (value: boolean) => void;
	isOpen: boolean;
	orderId: number;
}

const UnpackedModal: React.FC<UpdateProps> = (props) => {
	const { fields } = useModel('fieldsMapping');
	const [list, setList] = useState<ProcessingOrderController.UnpackedListRecord[]>([]);
	const [loading, setLoading] = useState(false);
	const { isOpen, setIsOpen, orderId } = props;

	// 获取基础物资列表
	const getList = async () => {
		setLoading(true);
		const res = await unpackedList({ processOrderId: orderId });
		if (res && res.code === 0) {
			setList(res.data);
		}
		setLoading(false);
	};

	const columns: ProColumns<ProcessingOrderController.UnpackedListRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 80,
			renderText: (_text, _record, index) => index + 1,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 150,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			renderText: (text: string, record) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 150,
		},
	];

	useEffect(() => {
		if (isOpen) {
			getList();
		}
	}, [isOpen]);

	return (
		<Modal
			className='ant-detail-modal'
			destroyOnClose
			maskClosable={false}
			visible={isOpen}
			title='配货详情'
			footer={null}
			onCancel={() => setIsOpen(false)}>
			<ProTable<ProcessingOrderController.UnpackedListRecord>
				loading={loading}
				columns={columns}
				options={{ density: false, fullScreen: false, setting: false }}
				scroll={{ x: '100%', y: 300 }}
				rowKey='id'
				// tableInfoId="217"
				dataSource={list}
				pagination={false}
			/>
		</Modal>
	);
};

export default UnpackedModal;
