import PaginationBox from '@/components/Pagination';
import { getScrollX } from '@/utils';
import { notification } from '@/utils/ui';
import { Button, Descriptions, Empty, Input, Modal, Statistic, Table } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import DetailColumns from '../colums.tsx';
import EditModal from './edit';

import { stockTakingStatusTextMap } from '@/constants/dictionary';
import '@ant-design/compatible/assets/index.css';
import { useModel } from 'umi';
import { detailList, finish, getDetail } from '../service';

export interface UpdateProps {
	setIsOpen: (value: boolean) => void;
	isOpen: boolean;
	orderId: string;
	getFormList?: () => void;
}

const DetailModal: React.FC<UpdateProps> = (props) => {
	const { fields } = useModel('fieldsMapping');
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const [goodsList, setGoodsList] = useState([]);
	const [bulkList, setBulkList] = useState([]);
	const [surgicalList, setSurgicalList] = useState([]);

	const [goodsHas, setGoodsHas] = useState(true);
	const [bulkHas, setBulkHas] = useState(true);
	const [surgicalHas, setSurgicalHas] = useState(true);

	const [goodsConfig, setGoodsConfig] = useState({ pageNum: 0, pageSize: 50, total: 0 });
	const [bulkConfig, setBulkConfig] = useState({ pageNum: 0, pageSize: 50, total: 0 });
	const [surgicalConfig, setSurgicalConfig] = useState({ pageNum: 0, pageSize: 50, total: 0 });

	const [detail, setDetail] = useState({});

	const [goodsLoading, setGoodsLoading] = useState(false);
	const [bulkLoading, setBulkLoading] = useState(false);
	const [surgicalLoading, setSurgicalLoading] = useState(false);
	const [submitLoading, setSubmitLoading] = useState(false);

	const [modalEditVisible, setModalEditVisible] = useState(false);
	const [itemId, setItemId] = useState('');
	const [itemType, setItemType] = useState('');
	const { isOpen, orderId, setIsOpen, getFormList } = props;

	// 弹窗详情
	const getDetailInfo = async () => {
		const res = await getDetail(orderId);
		if (res && res.code === 0) {
			setDetail(res.data);
		}
	};

	// 详情列表
	const getDetailList = async (type: string, param: any, has = false) => {
		if (type === 'goods') {
			setGoodsLoading(true);
			const params = {
				type: 'goods',
				stockTakingOrderId: orderId,
				pageNum: goodsConfig.pageNum,
				pageSize: goodsConfig.pageSize,
				...param,
			};
			const res = await detailList(params);
			if (res && res.code === 0) {
				setGoodsList(res.data.rows);
				setGoodsConfig({
					pageNum: res.data.pageNum,
					pageSize: res.data.pageSize,
					total: res.data.totalCount,
				});
				if (has && res.data.rows.length === 0) {
					setGoodsHas(false);
				} else {
					setGoodsHas(true);
				}
			}
			setGoodsLoading(false);
		}
		if (type === 'package_bulk') {
			setBulkLoading(true);
			const params = {
				type: 'package_bulk',
				stockTakingOrderId: orderId,
				pageNum: bulkConfig.pageNum,
				pageSize: bulkConfig.pageSize,
				...param,
			};
			const res = await detailList(params);
			if (res && res.code === 0) {
				setBulkList(res.data.rows);
				setBulkConfig({
					pageNum: res.data.pageNum,
					pageSize: res.data.pageSize,
					total: res.data.totalCount,
				});
				if (has && res.data.rows.length === 0) {
					setBulkHas(false);
				} else {
					setBulkHas(true);
				}
			}
			setBulkLoading(false);
		}
		if (type === 'package_surgical') {
			setSurgicalLoading(true);
			const params = {
				type: 'package_surgical',
				stockTakingOrderId: orderId,
				pageNum: surgicalConfig.pageNum,
				pageSize: surgicalConfig.pageSize,
				...param,
			};
			const res = await detailList(params);
			if (res && res.code === 0) {
				setSurgicalList(res.data.rows);
				setSurgicalConfig({
					pageNum: res.data.pageNum,
					pageSize: res.data.pageSize,
					total: res.data.totalCount,
				});
				if (has && res.data.rows.length === 0) {
					setSurgicalHas(false);
				} else {
					setSurgicalHas(true);
				}
			}
			setSurgicalLoading(false);
		}
	};

	// 关闭弹窗
	const modalCancel = (update: boolean) => {
		setIsOpen(false);
		if (update) {
			getFormList();
		}
	};

	// 完成盘库
	const handleSubmit = async () => {
		setSubmitLoading(true);
		const res = await finish({ stockTakingOrderId: orderId });
		if (res && res.code === 0) {
			notification.success('提交成功!');
			modalCancel(true);
		}
		setSubmitLoading(false);
	};

	// 编辑
	const handleEdit = (record: any, type: string) => {
		setItemId(record.id);
		setModalEditVisible(true);
		setItemType(type);
	};

	const columns = (patialColumns: any, type: string) => {
		let list = [];
		if (detail.status !== 'finished' && permissions.includes('edit_stock_taking_order')) {
			list = [
				...patialColumns,
				{
					title: '操作',
					dataIndex: 'option',
					key: 'option',
					width: 62,
					render: (id, record) => {
						return (
							<div className='operation'>
								{record.systemStockQuantity !== record.actualStockQuantity ? (
									<span
										onClick={() => handleEdit(record, type)}
										className='handleLink'>
										编辑
									</span>
								) : null}
							</div>
						);
					},
				},
			];
		} else {
			list = [...patialColumns];
		}
		return list;
	};

	const tabs = [
		{
			name: fields.baseGoods,
			type: 'goods',
			columns: columns(DetailColumns.goodsColumns, 'goods'),
			list: goodsList,
			pageConfig: goodsConfig,
			has: goodsHas,
			loading: goodsLoading,
		},
		{
			name: '定数包',
			type: 'package_bulk',
			columns: columns(DetailColumns.bulkColumns, 'package_bulk'),
			list: bulkList,
			pageConfig: bulkConfig,
			has: bulkHas,
			loading: bulkLoading,
		},
		// {
		//   name: '手术套包',
		//   type: 'package_surgical',
		//   columns: columns(DetailColumns.surgicalColumns, 'package_surgical'),
		//   list: surgicalList,
		//   pageConfig: surgicalConfig,
		//   has: surgicalHas,
		//   loading: surgicalLoading,
		// },
	];

	useEffect(() => {
		if (isOpen) {
			getDetailInfo();
			getDetailList('goods', {}, true);
			getDetailList('package_bulk', {}, true);
			getDetailList('package_surgical', {}, true);
		}
	}, [isOpen]);

	return (
		<Modal
			width='80%'
			destroyOnClose
			maskClosable={false}
			visible={isOpen}
			title='中心库盘库详情'
			onCancel={() => setIsOpen(false)}
			footer={
				detail.status !== 'finished' && permissions.includes('edit_stock_taking_order')
					? [
							<Button onClick={() => setIsOpen(false)}>取消</Button>,
							<Button
								type='primary'
								loading={submitLoading}
								onClick={handleSubmit}>
								完成盘库
							</Button>,
					  ]
					: null
			}>
			<div className='modelInfo'>
				<div className='left'>
					<Descriptions
						column={{ xs: 1, sm: 2, lg: 3 }}
						size='small'>
						<Descriptions.Item label='盘库单号'>{detail.code}</Descriptions.Item>
						<Descriptions.Item label='仓库'>{detail.warehouseName || '-'}</Descriptions.Item>
						<Descriptions.Item label='实盘人'>{detail.operator || '-'}</Descriptions.Item>
						<Descriptions.Item label='复盘人'>{detail.reviewer || '-'}</Descriptions.Item>
						<Descriptions.Item label='监盘人'>{detail.watcher || '-'}</Descriptions.Item>
						<Descriptions.Item label='创建时间'>
							{detail.timeCreated
								? moment(new Date(detail.timeCreated)).format('YYYY/MM/DD HH:mm:ss')
								: '-'}
						</Descriptions.Item>
						<Descriptions.Item label='结束时间'>
							{detail.timeEnd
								? moment(new Date(detail.timeEnd)).format('YYYY/MM/DD HH:mm:ss')
								: '-'}
						</Descriptions.Item>
					</Descriptions>
				</div>
				<div className='right'>
					<Statistic
						title='当前状态'
						value={stockTakingStatusTextMap[detail.status] || '-'}
					/>
				</div>
			</div>
			{tabs.map((item) => {
				return (
					item.has && (
						<div className='mb4'>
							<div className='flex flex-between mb1'>
								<h3>{item.name}</h3>
								<div style={{ width: 260 }}>
									<Input.Search
										placeholder={`搜索${fields.goodsCode}`}
										allowClear
										onSearch={(value) => getDetailList(item.type, { materialCode: value })}
									/>
								</div>
							</div>
							<Table
								loading={item.loading}
								columns={item.columns}
								rowKey='id'
								dataSource={item.list}
								scroll={{
									y: (item.list || []).length > 6 ? 300 : undefined,
									x: getScrollX(item.columns),
								}}
								pagination={false}
								size='small'
							/>
							{item.pageConfig.total > 0 && (
								<PaginationBox
									data={{ ...item.pageConfig }}
									pageChange={(pageNum: number, pageSize: number) =>
										getDetailList(item.type, { pageNum, pageSize })
									}
								/>
							)}
						</div>
					)
				);
			})}
			{!goodsHas && !bulkHas && !surgicalHas && (
				<Empty
					className='dateEmpty'
					image={Empty.PRESENTED_IMAGE_SIMPLE}
				/>
			)}

			<EditModal
				isOpen={modalEditVisible}
				setIsOpen={setModalEditVisible}
				getList={getDetailList}
				itemId={itemId}
				itemType={itemType}
				orderId={orderId}
			/>
		</Modal>
	);
};

export default DetailModal;
