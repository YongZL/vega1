import { ProTableAction } from '@/components/ProTable';
import ProTable from '@/components/ResizableTable';

import { ProFormColumns } from '@/components/SchemaForm/typings';
import { getPageList } from '@/services/distributorAuthorization';
import { PlusOutlined } from '@ant-design/icons';
import { ProColumns } from '@ant-design/pro-table';
import { Button, Divider, Space, Tooltip } from 'antd';
import moment from 'moment';
import { useRef, useState } from 'react';
import { history, useAccess, useModel } from 'umi';
import GoodList from '../../components/AuthGoodsList';

const DistributorList = ({
	id,
	passive,
	companyName,
}: DistributorAuthorizationController.ListProps) => {
	const tableRef = useRef<ProTableAction>();
	const [visible, setVisible] = useState(false); // Modal可见性
	const [isDetail, setIsDetail] = useState(false); // Modal打开是详情还是只有列表
	const [authId, setAuthId] = useState<number[]>(); // 选中的授权书
	const { fields } = useModel('fieldsMapping');
	const access = useAccess();
	const searchColumns: ProFormColumns = [
		{
			title: `${fields.distributor}名称`,
			dataIndex: 'authorizingDistributorName',
			fieldProps: {
				placeholder: `请输入${fields.distributor}名称`,
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

	const columns: ProColumns<DistributorAuthorizationController.ListRecord>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 80,
			align: 'center',
			renderText: (text: number, record, index) => index + 1,
		},
		{
			title: `${fields.distributor}名称`,
			width: 200,
			dataIndex: passive ? 'distributorName' : 'authorizingDistributorName',
			key: passive ? 'distributorName' : 'authorizingDistributorName',
			ellipsis: true,
			render: (text, record) => <span>{record.custodiaId == 1 ? '-' : text}</span>,
		},
		{
			title: '开始日期',
			width: 100,
			dataIndex: 'authorizationBeginTime',
			key: 'authorizationBeginTime',
			renderText: (text: number) => <span>{text ? moment(text).format('YYYY/MM/DD') : '-'}</span>,
		},
		{
			title: '结束日期',
			width: 100,
			dataIndex: 'authorizationEndTime',
			key: 'authorizationEndTime',
			renderText: (text: number) => <span>{text ? moment(text).format('YYYY/MM/DD') : '-'}</span>,
		},
		{
			title: `关联${fields.baseGoods}数量`,
			width: 110,
			dataIndex: 'amount',
			key: 'amount',
			render: (text, record) => {
				return text ? (
					<Tooltip title={`点击查看授权书中的${fields.baseGoods}`}>
						<span
							className='handleLink'
							onClick={handleGoodsNumClick(record.goodsId)}>
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
				const { distributorId, authorizingDistributorId, authorizingDistributorName } = record;
				const url = `${distributorId}/${companyName}/${authorizingDistributorId}_${authorizingDistributorName}`;
				return (
					<div className='operation'>
						<Space
							size={0}
							split={<Divider type='vertical' />}
							wrap={true}>
							{access.add_distributor_authorization && (
								<a
									onClick={() => {
										history.push(`/base_data/distributor/manage/authorization/add/${url}`);
									}}>
									新增
								</a>
							)}
							{access.distributor_authorization_view && (
								<a
									onClick={() => {
										history.push(`/base_data/distributor/manage/authorization/auth_list/${url}`);
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

	if (passive) columns.pop();

	// 打开Modal
	const openModal = (isDetail = false) => {
		setVisible(true);
		setIsDetail(isDetail);
	};

	// 关闭Modal
	const closeModal = () => setVisible(false);

	// 点击「物资名称」或者「基础物资数」
	const handleGoodsNumClick =
		(id: number[], isDetail = false) =>
		() => {
			setAuthId(id);
			openModal(isDetail);
		};

	return (
		<>
			<ProTable<DistributorAuthorizationController.ListRecord>
				headerTitle={passive ? `${fields.distributor}被授权列表` : `${fields.distributor}授权列表`}
				columns={columns}
				tableInfoCode={
					passive ? 'distributor_authorization_list_right' : 'distributor_authorization_list_left'
				}
				rowKey='id'
				params={passive ? { authorizingDistributorId: id } : { distributorId: id }}
				api={getPageList}
				tableRef={tableRef}
				toolBarRender={() =>
					!passive
						? [
								access.add_distributor_authorization && (
									<Button
										icon={<PlusOutlined style={{ marginLeft: -4 }} />}
										type='primary'
										onClick={() => {
											history.push(
												`/base_data/distributor/manage/authorization/add/${id}/${companyName}/false`,
											);
										}}
										className='iconButton'>
										新增授权
									</Button>
								),
						  ]
						: []
				}
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
					type={'custodian_all'}
				/>
			)}
		</>
	);
};

export default DistributorList;
