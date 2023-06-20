import type { ProColumns } from '@/components//ProTable/typings';
import ProTable from '@/components/ProTable';
import { getOrdinaryConsumeDetails, queryConsumeDetails } from '@/services/consume';
import { Modal } from 'antd';
import type { FC } from 'react';
import { cloneElement, useState } from 'react';

import { consumeTypeTextMap } from '@/constants/dictionary';
import { useModel } from 'umi';
import { accessNameMap } from '@/utils';
interface Props {
	trigger: JSX.Element;
	type: string;
	ItemId: number;
}
const DetailModal: FC<Props> = ({ trigger, type, ItemId }) => {
	const { fields } = useModel('fieldsMapping');
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [list, setList] = useState<
		ConsumeController.QueryConsumeDetails[] | ConsumeController.QueryConsumeDetails[]
	>([]);
	const accessNameMaplist: Record<string, any> = accessNameMap();
	const goodscolumnsModal: ProColumns<ConsumeController.QueryConsumeDetails>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render: (text, record, index) => {
				return <span>{index + 1}</span>;
			},
		},
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 220,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 150,
			ellipsis: true,
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorName',
			key: 'distributorName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '消耗科室',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 130,
			ellipsis: true,
		},
		{
			title: '消耗方式',
			dataIndex: 'consumeType',
			key: 'consumeType',
			width: 120,
			render: (text) => {
				return <span>{consumeTypeTextMap[text as string]}</span>;
			},
		},
	];
	const ordinarycolumnsModal: ProColumns<ConsumeController.QueryGetOrdinaryConsumeDetails>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render: (text, record, index) => {
				return <span>{index + 1}</span>;
			},
		},
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 220,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 150,
			ellipsis: true,
		},
		{
			title: '数量',
			dataIndex: 'unitNum',
			key: 'unitNum',
			width: 100,
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorName',
			key: 'distributorName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '科室名称',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 130,
			ellipsis: true,
		},
		{
			title: '消耗方式',
			dataIndex: 'consumeType',
			key: 'consumeType',
			width: 120,
			render: (text) => {
				return <span>{consumeTypeTextMap[text as string]}</span>;
			},
		},
	];

	const queryDetails = async () => {
		if (type === 'goods') {
			let res = await queryConsumeDetails({ goodsItemId: ItemId });
			if (res && res.code == 0) {
				setList(res.data);
			}
		} else {
			let res = await getOrdinaryConsumeDetails({ ordinaryItemId: ItemId });
			if (res && res.code == 0) {
				setList(res.data);
			}
		}
	};
	let columnsModal = type === 'goods' ? goodscolumnsModal : ordinarycolumnsModal;
	const modal = {
		title: accessNameMaplist.consume_history_detail,
		visible: modalVisible,
		maskClosable: false,
		onCancel: () => setModalVisible(false),
		width: '80%',
		footer: false,
		destroyOnClose: true,
	};
	return (
		<>
			{cloneElement(trigger, {
				onClick: () => {
					setModalVisible(true);
					queryDetails();
				},
			})}
			<Modal
				{...modal}
				className='ant-detail-modal'>
				<ProTable
					columns={columnsModal}
					rowKey={(record, index) => String(index)}
					dataSource={list}
					className='mb2'
					options={{ density: false, fullScreen: false, setting: false }}
					scroll={{ x: '100%', y: 300 }}
					// pagination={false}
					size='small'
					// tableInfoId="74"
				/>
			</Modal>
		</>
	);
};

export default DetailModal;
