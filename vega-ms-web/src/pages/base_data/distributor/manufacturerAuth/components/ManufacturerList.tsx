import { ProTableAction } from '@/components/ProTable';
import ProTable from '@/components/ResizableTable';

import { ProFormColumns } from '@/components/SchemaForm/typings';
import { getPageList } from '@/services/manufacturerAuthorizations';
import { PlusOutlined } from '@ant-design/icons';
import { ProColumns } from '@ant-design/pro-table';
import { Button, Divider, Space, Tooltip } from 'antd';
import moment from 'moment';
import { useRef, useState } from 'react';
import { connect, history, useAccess, useModel } from 'umi';
import GoodList from '../../components/AuthGoodsList';

const ManufacturerList = ({ id, companyName }: ManufacturerAuthorizationsController.ListProps) => {
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const [visible, setVisible] = useState(false); // Modal可见性
	const [isDetail, setIsDetail] = useState(false); // Modal打开是详情还是只有列表
	const [authId, setAuthId] = useState<number[]>(); // 选中的授权书ID
	const access = useAccess();
	const searchColumns: ProFormColumns = [
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			fieldProps: {
				placeholder: '请输入生产厂家',
			},
		},
		{
			title: '产品注册证号',
			dataIndex: 'goodsRegistration',
			fieldProps: {
				placeholder: '请输入产品注册证号',
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'goodsMaterialCode',
			fieldProps: {
				placeholder: `请输入${fields.goodsCode}`,
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			fieldProps: {
				placeholder: `请输入${fields.goodsName}`,
			},
		},
	];

	const columns: ProColumns<ManufacturerAuthorizationsController.ListRecord>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 80,
			align: 'center',
			renderText: (text: number, record, index: number) => index + 1,
		},
		{
			title: '生产厂家名称',
			width: 200,
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			ellipsis: true,
			render: (text, record) => <span>{record.custodiaId == 1 ? '-' : text}</span>,
		},
		{
			title: '开始日期',
			width: 100,
			dataIndex: 'authorizationBeginTime',
			key: 'authorizationBeginTime',
			renderText: (text: Date) => <span>{text ? moment(text).format('YYYY/MM/DD') : '-'}</span>,
		},
		{
			title: '结束日期',
			width: 100,
			dataIndex: 'authorizationEndTime',
			key: 'authorizationEndTime',
			renderText: (text: Date) => <span>{text ? moment(text).format('YYYY/MM/DD') : '-'}</span>,
		},
		{
			title: `关联${fields.baseGoods}数量`,
			width: 100,
			dataIndex: 'amount',
			key: 'amount',
			render: (text, record) => {
				return text ? (
					<Tooltip title={`点击查看授权书中的${fields.baseGoods}`}>
						<span
							className='handleLink'
							onClick={() => handleGoodsNumClick(record.goodsId)}>
							{text}
						</span>
					</Tooltip>
				) : (
					0
				);
			},
		},
		{
			title: '更新日期',
			width: 100,
			dataIndex: 'lastModified',
			key: 'lastModified',
			renderText: (text: Date) => <span>{text ? moment(text).format('YYYY/MM/DD') : '-'}</span>,
		},
		{
			title: '操作',
			width: 134,
			dataIndex: 'option',
			key: 'option',
			render: (text, record) => {
				const { distributorId, manufacturerId, manufacturerName } = record;
				const urlParams = `${distributorId}/${manufacturerId}_${manufacturerName}/${companyName}`;
				return (
					<div className='operation'>
						<Space
							size={0}
							split={<Divider type='vertical' />}
							wrap={true}>
							{access.add_manufacturer_authorization && (
								<a
									onClick={() => {
										history.push(
											`/base_data/distributor/manufacturer_authorization/add/${urlParams}`,
										);
									}}>
									新增
								</a>
							)}
							{access.manufacturer_authorization_view && (
								<a
									onClick={() => {
										history.push(
											`/base_data/distributor/manufacturer_authorization/auth_list/${urlParams}`,
										);
									}}>
									授权记录
								</a>
							)}
						</Space>
					</div>
				);
			},
		},
	];

	// 点击「物资名称」或者「基础物资数」
	const handleGoodsNumClick = (id: number[], isDetail = false) => {
		setAuthId(id);
		openModal(isDetail);
	};

	// 打开Modal
	const openModal = (isDetail = false) => {
		setVisible(true);
		setIsDetail(isDetail);
	};

	// 关闭Modal
	const closeModal = () => setVisible(false);

	return (
		<>
			<ProTable<ManufacturerAuthorizationsController.ListRecord>
				headerTitle='厂家授权列表'
				columns={columns}
				tableInfoCode='manufacturer_authorization_list_left'
				rowKey='id'
				params={{ distributorId: id }}
				api={getPageList}
				tableRef={tableRef}
				toolBarRender={() => [
					access.add_manufacturer_authorization && (
						<Button
							icon={<PlusOutlined style={{ marginLeft: -4 }} />}
							type='primary'
							onClick={() => {
								history.push(
									`/base_data/distributor/manufacturer_authorization/add/${id}/false/${companyName}`,
								);
							}}
							className='iconButton'>
							新增授权
						</Button>
					),
				]}
				searchConfig={{
					columns: searchColumns,
				}}
				// customStyle={false}
			/>
			{visible && (
				<GoodList
					visible={visible}
					close={closeModal}
					authId={authId}
					isDetail={isDetail}
					type={'manufacturer_all'}
				/>
			)}
		</>
	);
};

export default connect(({ global }: Record<string, any>) => ({ global }))(ManufacturerList);
