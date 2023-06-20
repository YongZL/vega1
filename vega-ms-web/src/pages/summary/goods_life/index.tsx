import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ResizableTable';
import { getPageList as getSuppliersList } from '@/services/distributor';
import { getGoodsItemWithDeleted } from '@/services/stock';
import { Badge, Card } from 'antd';
import moment from 'moment';
import React, { useRef, useState } from 'react';
import { useModel, useAccess } from 'umi';
import CheckModal from './components/Detail';
import { formatStrConnect } from '@/utils/format';

const approvaStatus = {
	put_on_shelf_pending: { text: '待上架', color: CONFIG_LESS['@c_starus_await'] },
	put_on_shelf: { text: '已上架', color: CONFIG_LESS['@c_starus_done'] },
	put_off_shelf: { text: '已下架', color: CONFIG_LESS['@c_starus_warning'] },
	return_goods: { text: '已退货', color: CONFIG_LESS['@c_starus_underway'] },
	delivering: { text: '推送中', color: CONFIG_LESS['@c_starus_await'] },
	consumed: { text: '已消耗', color: CONFIG_LESS['@c_starus_done'] },
	return_goods_pending: { text: '退货中', color: CONFIG_LESS['@c_starus_warning'] },
	reallocate_pending: { text: '调拨中', color: CONFIG_LESS['@c_starus_underway'] },
	occupied: { text: '已占用', color: CONFIG_LESS['@c_starus_await'] },
	unpacked: { text: '已拆包', color: CONFIG_LESS['@c_starus_done'] },
	picked: { text: '已配货', color: CONFIG_LESS['@c_starus_warning'] },
};

const approvaStatuss = [
	{ label: '待上架', value: 'put_on_shelf_pending', color: CONFIG_LESS['@c_starus_await'] },
	{ label: '已上架', value: 'put_on_shelf', color: CONFIG_LESS['@c_starus_done'] },
	{ label: '已下架', value: 'put_off_shelf', color: CONFIG_LESS['@c_starus_warning'] },
	{ label: '已退货', value: 'return_goods', color: CONFIG_LESS['@c_starus_underway'] },
	{ label: '推送中', value: 'delivering', color: CONFIG_LESS['@c_starus_await'] },
	{ label: '已消耗', value: 'consumed', color: CONFIG_LESS['@c_starus_done'] },
	{ label: '退货中', value: 'return_goods_pending', color: CONFIG_LESS['@c_starus_warning'] },
	{ label: '调拨中', value: 'reallocate_pending', color: CONFIG_LESS['@c_starus_underway'] },
	{ label: '已占用', value: 'occupied', color: CONFIG_LESS['@c_starus_await'] },
	{ label: '已拆包', value: 'unpacked', color: CONFIG_LESS['@c_starus_done'] },
	{ label: '已配货', value: 'picked', color: CONFIG_LESS['@c_starus_warning'] },
];

const PickingList: React.FC = () => {
	const { fields } = useModel('fieldsMapping');
	const [createModalVisible, handleModalVisible] = useState<boolean>(false);
	const [goodsRequestId, setGoodsRequestId] = useState<StockController.GoodsItem>(
		{} as StockController.GoodsItem,
	);
	const access = useAccess();
	const tableRef = useRef<ProTableAction>();
	// 打开查看弹窗
	const openModal = (record: object) => {
		handleModalVisible(true);
		setGoodsRequestId(record);
	};
	// 关闭弹窗
	const handleCancel = () => {
		handleModalVisible(false);
	};

	const columns: ProColumns<StockController.GoodsItem>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			render: (text, redord, index) => <span>{index + 1}</span>,
			width: 'XXXS',
		},
		{
			title: '状态',
			dataIndex: 'status',
			key: 'status',
			width: 120,
			render: (text: any, record: any) =>
				record.status ? (
					<Badge
						color={approvaStatus[text].color}
						text={approvaStatus[text].text}
					/>
				) : (
					'-'
				),
		},
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 180,
			ellipsis: true,
		},
		{
			title: 'UDI',
			dataIndex: 'udiCode',
			key: 'udiCode',
			width: 180,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 150,
			ellipsis: true,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 150,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			render: (text: any, record: any) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorName',
			key: 'distributorName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '生成时间',
			dataIndex: 'timeCreated',
			key: 'mgi.time_created',
			width: 170,
			hideInSearch: true,
			show: true,
			sorter: true,
			render: (time: number, record) => {
				return record.timeCreated ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			fixed: 'right',
			width: 62,
			render: (id, record) => {
				return (
					access.goods_life_detail &&
					(record.succeeded || record.processed ? null : (
						<div className='operation'>
							<span
								className='handleLink'
								onClick={() => {
									openModal(record);
								}}>
								查看
							</span>
						</div>
					))
				);
			},
		},
	];
	const checkModals = {
		visible: createModalVisible,
		onCancel: handleCancel,
		detail: goodsRequestId,
	};

	const searchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'statusList',
			valueType: 'tagSelect',
			fieldProps: {
				options: approvaStatuss,
			},
		},
		{
			title: '生成时间',
			dataIndex: 'timeCreated',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: [
					{
						label: '近三天',
						type: 'day',
						count: -3,
					},
					{
						label: '最近一周',
						type: 'day',
						count: -7,
					},
					{
						label: '近一个月',
						type: 'month',
						count: -1,
					},
				],
			},
		},
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorId',
			valueType: 'apiSelect',
			fieldProps: {
				api: getSuppliersList,
				params: {
					pageNum: 0,
					pageSize: 999,
					ageSize: 10000,
				},
				fieldConfig: {
					label: 'companyName',
					value: 'id',
				},
				filterOption: (input: any, option: any) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
	];

	return (
		// <div>
		//   <Breadcrumb config={['报表业务', '实例明细查询']} />
		//   <Card bordered={false}>
		//     <FormSearch searchTabeList={searchTabeList} reSetFormSearch={reSetFormSearch} />
		//     <TableBox
		//
		//       tableInfoId="105"
		//       options={{
		//         reload: () => getFormList({}),
		//       }}
		//       rowKey="id"
		//       scroll={{
		//         x: '100%',
		//         y: global.scrollY + 7,
		//       }}
		//       onChange={handleChangeTable}
		//       dataSource={list}
		//       loading={loading}
		//       columns={columns}
		//     />
		//     {total > 0 && (
		//       <PaginationBox
		//         data={{ total, ...pageConfig }}
		//         pageChange={(pageNum: number, pageSize: number) => getFormList({ pageNum, pageSize })}
		//       />
		//     )}
		//   </Card>
		//   <CheckModal {...checkModals} />
		// </div>
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<Card>
				<ProTable<StockController.GoodsItem>
					tableInfoCode='goods_life_list'
					columns={columns}
					rowKey='id'
					api={getGoodsItemWithDeleted}
					params={{}}
					tableRef={tableRef}
					dateFormat={{
						//把时间字符串转换成时间戳，并改变参数名字
						timeCreated: {
							startKey: 'barcodeCreatedTimeFrom',
							endKey: 'barcodeCreatedTimeTo',
						},
					}}
					searchConfig={{
						columns: searchColumns,
					}}
					loadConfig={{
						request: false,
					}}
				/>
			</Card>
			<CheckModal {...checkModals} />
		</div>
	);
};

export default PickingList;
