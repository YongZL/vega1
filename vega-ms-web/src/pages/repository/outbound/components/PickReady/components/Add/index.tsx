import ProTable from '@/components/ProTable';
import type { ProColumns } from '@/components/ProTable/typings';
import { pickingPendingSourceTextMap } from '@/constants/dictionary';
import { queryCreatPickOrder } from '@/services/pickOrder';
import { accessNameMap } from '@/utils';
import { notification } from '@/utils/ui';
import { formatStrConnect } from '@/utils/format';
import { Button, Modal } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import { useModel } from 'umi';
type Props = {
	visible: boolean;
	onCancel: () => void;
	selectedItemList: {
		'1': PickPendingController.QueryRuleRecord[];
		'3': PickPendingController.QueryRuleRecord[];
	};
	selectedIDList: {
		'1': number[];
		'3': number[];
	};
	remove: (id: number) => void;
	reset: () => void;
	searchTabeList: () => void;
	currentIndex: '1' | '3';
};
const CheckModal: FC<Props> = ({
	visible,
	onCancel,
	searchTabeList,
	selectedItemList,
	selectedIDList,
	remove,
	reset,
	currentIndex,
}) => {
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const goodsData = selectedItemList['1'];
	const surgicalsData = selectedItemList['3'];
	const accessName = accessNameMap(); // 权限名称

	//提交
	const handleSubmit = async () => {
		setLoading(true);
		const selectedData = [...goodsData, ...surgicalsData];
		const selectedIds = [...selectedIDList['1'], ...selectedIDList['3']];
		const res = await queryCreatPickOrder({
			pendingIds: selectedIds,
			storageAreaId: selectedData[0].storageAreaId,
		});
		if (res && res.code === 0) {
			notification.success('提交成功');
			onCancel();
			reset();
			searchTabeList();
		}
		setLoading(false);
	};
	// 移除
	const handleDelete = (id: number) => () => {
		let newData = [...goodsData, ...surgicalsData];
		if (newData.length == 1) {
			onCancel();
		}
		remove(id);
	};
	const goodsColumns: ProColumns<PickPendingController.QueryRuleRecord>[] = [
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
			width: 140,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			renderText: (_text, record) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '配货数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
			renderText: (text, record) =>
				text + (currentIndex === '1' ? record.unit : record.packageBulkUnit),
		},
		{
			title: '可用库存',
			dataIndex: 'stock',
			key: 'stock',
			width: 100,
			renderText: (text, record) => text + record.unit,
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 62,
			fixed: 'right',
			render: (_text, record) => {
				return (
					<div className='operation'>
						<span
							className='handleLink'
							onClick={handleDelete(record.id)}>
							删除
						</span>
					</div>
				);
			},
		},
	];
	const columnsSurgicals: ProColumns<PickPendingController.QueryRuleRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 80,
			render: (text, record, index) => {
				return <span>{index + 1}</span>;
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'ordinaryCode',
			key: 'ordinaryCode',
			width: 140,
		},
		{
			title: '医耗套包名称',
			dataIndex: 'ordinaryName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '类别',
			dataIndex: 'source',
			key: 'source',
			width: 100,
			renderText: (text) => pickingPendingSourceTextMap[text],
		},
		{
			title: '医耗套包说明',
			dataIndex: 'ordinaryDetailGoodsMessage',
			width: 200,
			render: (_text, record) => (
				<div
					className='detailGoodsMessage'
					title={record.description ? record.description : record.ordinaryDetailGoodsMessage}>
					{record.description ? record.description : record.ordinaryDetailGoodsMessage}
				</div>
			),
		},
		{
			title: '配货数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
			renderText: (text, record) =>
				text + (currentIndex === '1' ? record.unit : record.packageBulkUnit),
		},
		{
			title: '可用库存',
			dataIndex: 'stock',
			key: 'stock',
			width: 100,
			renderText: (text, record) => text + record.unit,
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 62,
			fixed: 'right',
			render: (id, record) => {
				return (
					<div className='operation'>
						<span
							className='handleLink'
							onClick={handleDelete(record.id)}>
							删除
						</span>
					</div>
				);
			},
		},
	];
	return (
		<div>
			<Modal
				className='ant-detail-modal'
				visible={visible}
				title={accessName['generate_process_pick_order']}
				onCancel={onCancel}
				footer={[
					<Button
						key='submit'
						type='primary'
						loading={loading}
						onClick={handleSubmit}>
						提交
					</Button>,
				]}>
				<div>
					{goodsData.length > 0 && (
						<ProTable<PickPendingController.QueryRuleRecord>
							title={() => <h3>{fields.baseGoods}</h3>}
							pagination={false}
							options={{ density: false, fullScreen: false, setting: false }}
							columns={goodsColumns}
							dataSource={goodsData}
							scroll={{
								y: 300,
							}}
						/>
					)}
					{surgicalsData.length > 0 && (
						<ProTable<PickPendingController.QueryRuleRecord>
							title={() => <h3>医耗套包</h3>}
							pagination={false}
							options={{ density: false, fullScreen: false, setting: false }}
							columns={columnsSurgicals}
							dataSource={surgicalsData}
							scroll={{
								y: 300,
								// x: getScrollX(columnsSurgicals, true),
							}}
						/>
					)}
				</div>
			</Modal>
		</div>
	);
};
export default CheckModal;
