import Breadcrumb from '@/components/Breadcrumb';
import ProTable, { ProTableAction } from '@/components/ProTable';
import { getAuthList, setEnabled } from '@/services/manufacturerAuthorizations';
import { ProColumns } from '@ant-design/pro-table';
import { Card, Divider, Popconfirm, Space, Tooltip } from 'antd';
import moment from 'moment';
import { useRef, useState } from 'react';
import { history, useAccess, useModel } from 'umi';
import GoodList from '../../components/AuthGoodsList';

const ManufacturerAuthList = ({ match }: Record<string, any>) => {
	const tableRef = useRef<ProTableAction>();
	const [enabledLoading, setEnabledLoading] = useState<boolean>(false);
	const [visible, setVisible] = useState<boolean>(false); // Modal可见性
	const [isDetail, setIsDetail] = useState<boolean>(false); // Modal打开是详情还是只有列表
	const [authId, setAuthId] = useState<number>(); // 选中的授权书ID
	const { fields } = useModel('fieldsMapping');
	const access = useAccess();
	// 打开Modal
	const openModal = (isDetail = false) => {
		setVisible(true);
		setIsDetail(isDetail);
	};

	// 确定启用
	const onConfirmEnabled = (id: number, type: boolean) => async () => {
		setEnabledLoading(true);
		const result = type ? await setEnabled(2, { id }) : await setEnabled(1, { id });
		if (result) tableRef.current?.reload();
		setEnabledLoading(false);
	};

	// 点击「商品名称」或者「商品数」
	const handleGoodsNumClick =
		(id: number, isDetail = false) =>
		() => {
			setAuthId(id);
			openModal(isDetail);
		};

	const columns: ProColumns<ManufacturerAuthorizationsController.RecordListRecord>[] = [
		{
			title: '生产厂家名称',
			width: 200,
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			render: (text, record) => {
				return record.custodiaId == 1 ? (
					'_'
				) : (
					<span
						className='handleLink'
						onClick={handleGoodsNumClick(record.id, true)}>
						{text}
					</span>
				);
			},
		},
		{
			title: '开始日期',
			width: 150,
			dataIndex: 'authorizationBeginTime',
			key: 'authorizationBeginTime',
			ellipsis: true,
			render: (text, record) => {
				return (
					<span>
						{record.authorizationBeginTime
							? moment(record.authorizationBeginTime).format('YYYY/MM/DD')
							: '-'}
					</span>
				);
			},
		},
		{
			title: '结束日期',
			width: 120,
			dataIndex: 'authorizationEndTime',
			key: 'authorizationEndTime',
			align: 'left',
			render: (text, record) => {
				return (
					<span>
						{record.authorizationEndTime
							? moment(record.authorizationEndTime).format('YYYY/MM/DD')
							: '-'}
					</span>
				);
			},
		},
		{
			title: '关联商品数量',
			width: 120,
			dataIndex: 'goodsId',
			key: 'goodsId',
			renderText: (text: number[], record) => {
				return text ? (
					<Tooltip title='点击查看授权书中的商品'>
						<span
							className='handleLink'
							onClick={handleGoodsNumClick(record.id)}>
							{text.length}
						</span>
					</Tooltip>
				) : (
					0
				);
			},
		},
		{
			title: '更新日期',
			width: 150,
			dataIndex: 'timeModified',
			key: 'timeModified',
			renderText: (text: Date) => <span>{text ? moment(text).format('YYYY/MM/DD') : '-'}</span>,
		},
		{
			title: '状态',
			width: 80,
			dataIndex: 'isEnabled',
			key: 'isEnabled',
			renderText: (text: boolean) => <span>{text ? '已启用' : '已禁用'}</span>,
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 150,
			fixed: 'right',
			render: (text, record) => {
				const { id, isEnabled, distributorId, manufacturerId, manufacturerName } = record;
				const urlParams = `${distributorId}/${manufacturerId}_${manufacturerName}/${id}/${match.params.companyName}`;
				return (
					<div className='operation'>
						<Space
							size={0}
							split={<Divider type='vertical' />}
							wrap={true}>
							{access.edit_manufacturer_authorization && (
								<a
									onClick={() => {
										history.push(
											`/base_data/distributor/manufacturer_authorization/edit/${urlParams}`,
										);
									}}>
									编辑
								</a>
							)}
							{access.set_manufacturer_authorization_enabled && (
								<Popconfirm
									placement='left'
									title={isEnabled ? '确定禁用吗？' : '确定启用吗？'}
									onConfirm={onConfirmEnabled(id, isEnabled)}
									okButtonProps={{ loading: enabledLoading }}
									disabled={enabledLoading}>
									<span className='handleLink'>{isEnabled ? '禁用' : '启用'}</span>
								</Popconfirm>
							)}
						</Space>
					</div>
				);
			},
		},
	];

	return (
		<div className='detail-page'>
			<div className='detail-breadcrumb'>
				<Breadcrumb
					config={[
						'',
						[``, '/base_data/distributor'],
						[
							``,
							`/base_data/distributor/manufacturer_authorization/${match.params.distributorId}/${match.params.companyName}`,
						],
						` - ${match.params.inner.split('_')[1]}`,
					]}
				/>
			</div>
			<Card
				bordered={false}
				className='card-mt2'>
				<ProTable<ManufacturerAuthorizationsController.RecordListRecord>
					columns={columns}
					rowKey='id'
					params={{
						distributorId: match.params.distributorId,
						manufacturerId: match.params.inner.split('_')[0],
					}}
					api={getAuthList}
					tableRef={tableRef}
					// customStyle={false}
				/>
			</Card>

			{visible && (
				<GoodList
					visible={visible}
					close={() => setVisible(false)}
					authId={authId}
					isDetail={isDetail}
					type={'manufacturer'}
				/>
			)}
		</div>
	);
};

export default ManufacturerAuthList;
