import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ResizableTable';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { timeType2 } from '@/constants';
import { enabledEnum } from '@/constants/dictionary';
import { useUserTypeList } from '@/hooks/useUserTypeList';
import { getRoleList, operate } from '@/services/role';
import { notification } from '@/utils/ui';
import { PlusOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Divider, Form, Popconfirm } from 'antd';
import moment from 'moment';
import React, { useRef } from 'react';
import { connect, history, useAccess } from 'umi';
import AddModal from './components/AddModal';

const RoleList: React.FC<{}> = () => {
	const access = useAccess();
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const { roleType, roleTypeTextMap } = useUserTypeList();

	// 启用/禁用
	const onConfirmEnabled = (record: RoleController.RoleRecord) => () => {
		const params = {
			id: record.id,
			type: record.enabled ? 2 : 1,
		};
		enabledOrNo(params);
	};

	const enabledOrNo = async (params: RoleController.EnableParams) => {
		let res = await operate(params);
		if (res && res.code === 0) {
			notification.success('操作成功！');
			getTableList();
		}
	};

	const getTableList = () => {
		tableRef.current?.reload();
	};

	const searchColumns: ProFormColumns = [
		{
			title: '类型',
			dataIndex: 'typeList',
			valueType: 'tagSelect',
			fieldProps: {
				options: roleType,
			},
		},
		{
			title: '创建时间',
			dataIndex: 'timeCreated',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType2,
			},
		},
		{
			title: '状态',
			dataIndex: 'status',
			valueType: 'radioButton',
			initialValue: '',
			valueEnum: enabledEnum,
			fieldProps: {
				className: 'search-radio-button',
			},
		},
		{
			title: '用户权限',
			dataIndex: 'name',
			fieldProps: {
				placeholder: '请输入',
			},
		},
	];

	const columns: ProColumns<RoleController.RoleRecord>[] = [
		{
			width: 'XXXS',
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			render: (text, redord, index) => <span>{index + 1}</span>,
		},
		{
			width: 'XXXS',
			title: '状态',
			dataIndex: 'enabled',
			render: (text) => {
				return (
					<>
						<Badge
							color={text ? CONFIG_LESS['@c_starus_await'] : CONFIG_LESS['@c_starus_disabled']}
						/>
						{text ? '已启用' : '已禁用'}
					</>
				);
			},
		},
		{
			width: 'XXS',
			title: '用户权限',
			dataIndex: 'name',
			ellipsis: true,
		},
		{
			width: 'XS',
			title: '类型',
			dataIndex: 'type',
			renderText: (text) => roleTypeTextMap[text],
		},
		{
			width: 'XS',
			title: '创建时间',
			dataIndex: 'timeCreated',
			renderText: (text, record) => {
				return record.timeCreated ? moment(new Date(text)).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			width: 'XS',
			title: '操作',
			dataIndex: 'option',
			fixed: 'right',
			render: (_, record) => {
				const { enabled, type, id } = record;
				let timeCreated = form.getFieldsValue().timeCreated;
				if (timeCreated && typeof timeCreated[0] !== 'string') {
					timeCreated = timeCreated.map((item: { _d: number }) => item._d);
				}
				const editData = {
					id,
					pageType: true,
					roleType,
					getTableList,
				};
				return (
					<div className='operation'>
						{enabled && access.edit_role && (
							<>
								<AddModal
									trigger={<a>编辑</a>}
									{...editData}
								/>
								{(access.role_user || access.set_role_enabled) && <Divider type='vertical' />}
							</>
						)}
						{access.role_user && (
							<React.Fragment>
								<a
									onClick={() => {
										history.push({
											pathname: `role/user/operator/${id}`,
											state: {
												params: { ...form.getFieldsValue(), timeCreated },
											},
										});
									}}>
									用户管理
								</a>
								{access.set_role_enabled && <Divider type='vertical' />}
							</React.Fragment>
						)}
						{access.set_role_enabled && (
							<Popconfirm
								placement='left'
								onConfirm={onConfirmEnabled(record)}
								title={`确定${enabled ? '禁用' : '启用'}该角色吗？`}>
								<span className='handleLink'>{enabled ? '禁用' : '启用'}</span>
							</Popconfirm>
						)}
					</div>
				);
			},
		},
	];

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<Card>
				<ProTable
					tableInfoCode='role_list'
					// tableInfoId="1"
					rowKey='id'
					api={getRoleList}
					columns={columns}
					tableRef={tableRef}
					loadConfig={{
						request: false,
					}}
					dateFormat={{
						timeCreated: {
							startKey: 'start',
							endKey: 'end',
						},
					}}
					searchConfig={{
						form,
						columns: searchColumns,
					}}
					searchKey={'permissions_role'}
					toolBarRender={() => [
						access.add_role && (
							<AddModal
								{...{ getTableList }}
								roleType={roleType}
								trigger={
									<Button
										type='primary'
										icon={<PlusOutlined />}
										className='iconButton'>
										新增
									</Button>
								}
							/>
						),
					]}
				/>
			</Card>
		</div>
	);
};

export default connect(({ global }: Record<string, any>) => ({ global }))(RoleList);
