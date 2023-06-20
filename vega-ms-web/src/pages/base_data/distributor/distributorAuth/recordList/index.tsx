import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ProTable';
import { ProTableAction } from '@/components/ProTable/typings';
import { getAuthList, setEnabled } from '@/services/distributorAuthorization';
import { ProColumns } from '@ant-design/pro-table';
import { Card, Divider, Popconfirm, Space, Tooltip } from 'antd';
import moment from 'moment';
import { useRef, useState } from 'react';
import { history, useAccess, useModel } from 'umi';
import GoodList from '../../components/AuthGoodsList';

const DistributorAuthList = ({ match }: Record<string, any>) => {
	const tableRef = useRef<ProTableAction>();
	const [enabledLoading, setEnabledLoading] = useState<boolean>(false);
	const [visible, setVisible] = useState<boolean>(false); // Modal可见性
	const [isDetail, setIsDetail] = useState<boolean>(false); // Modal打开是详情还是只有列表
	const [authId, setAuthId] = useState<number>(); // 选中的授权书ID
	const { fields } = useModel('fieldsMapping');
	const access = useAccess();
	const columns: ProColumns<DistributorAuthorizationController.RecordListRecord>[] = [
		{
			title: `${fields.distributor}名称`,
			width: 200,
			dataIndex: 'authorizingDistributorName',
			key: 'authorizingDistributorName',
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
			renderText: (text: Date) => <span>{text ? moment(text).format('YYYY/MM/DD') : '-'}</span>,
		},
		{
			title: '结束日期',
			width: 120,
			dataIndex: 'authorizationEndTime',
			key: 'authorizationEndTime',
			align: 'left',
			renderText: (text: Date) => <span>{text ? moment(text).format('YYYY/MM/DD') : '-'}</span>,
		},
		{
			title: `关联${fields.baseGoods}数量`,
			width: 140,
			dataIndex: 'goodsId',
			key: 'goodsId',
			renderText: (text: number[], record) => {
				return text ? (
					<Tooltip title={`点击查看授权书中的${fields.baseGoods}`}>
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
			width: 180,
			fixed: 'right',
			render: (text, record) => {
				const { id, distributorId, authorizingDistributorId, authorizingDistributorName } = record;
				const urlParams = `${distributorId}/${authorizingDistributorId}_${authorizingDistributorName}/${id}/${match.params.companyName}`;
				return (
					<div className='operation'>
						<Space
							size={0}
							split={<Divider type='vertical' />}
							wrap={true}>
							{access.edit_distributor_authorization && (
								<a
									onClick={() => {
										history.push(`/base_data/distributor/manage/authorization/edit/${urlParams}`);
									}}>
									编辑
								</a>
							)}
							{access.set_distributor_authorization_enabled && (
								<Popconfirm
									placement='left'
									title={record.isEnabled ? '确定禁用吗？' : '确定启用吗？'}
									onConfirm={onConfirmEnabled(id, record.isEnabled)}
									okButtonProps={{ loading: enabledLoading }}
									disabled={enabledLoading}>
									<span className='handleLink'>{record.isEnabled ? '禁用' : '启用'}</span>
								</Popconfirm>
							)}
						</Space>
					</div>
				);
			},
		},
	];

	// 打开Modal
	const openModal = (isDetail = false) => {
		setVisible(true);
		setIsDetail(isDetail);
	};

	// 关闭Modal
	const closeModal = () => setVisible(false);

	// 确定启用
	const onConfirmEnabled = (id: number, isEnabled: boolean) => async () => {
		setEnabledLoading(true);
		const result = await setEnabled({ id, isEnabled: !isEnabled });
		if (result) tableRef.current?.reload();
		setEnabledLoading(false);
	};

	// 点击「物资名称」或者「基础物资数」
	const handleGoodsNumClick =
		(id: number, isDetail = false) =>
		() => {
			setAuthId(id);
			openModal(isDetail);
		};

	return (
		<div style={{ margin: ' -20px -28px', padding: ' 0 4px 8px' }}>
			<div style={{ background: CONFIG_LESS['@bgc_table'] }}>
				<Breadcrumb
					config={[
						'',
						[``, '/base_data/distributor'],
						[
							``,
							`/base_data/distributor/distributor_authorization/${match.params.distributorId}/${match.params.companyName}`,
						],
						` - ${match.params.inner.split('_')[1]}`,
					]}
				/>
			</div>
			<Card
				bordered={false}
				style={{ marginTop: 2 }}>
				<ProTable<DistributorAuthorizationController.RecordListRecord>
					columns={columns}
					rowKey='id'
					params={{
						distributorId: match.params.distributorId,
						authorizingDistributorId: match.params.inner.split('_')[0],
					}}
					api={getAuthList}
					tableRef={tableRef}
					// customStyle={false}
				/>
			</Card>
			{visible && (
				<GoodList
					visible={visible}
					close={closeModal}
					authId={authId}
					isDetail={isDetail}
					type={'custodian'}
				/>
			)}
		</div>
	);
};

export default DistributorAuthList;
