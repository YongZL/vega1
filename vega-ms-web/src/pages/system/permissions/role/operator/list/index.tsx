import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ResizableTable';
import { useUserTypeList } from '@/hooks/useUserTypeList';
import { roleUnBindUser } from '@/services/roleUser';
import { getUserListByRoleId } from '@/services/users';
import { notification } from '@/utils/ui';
import { PlusOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Popconfirm } from 'antd';
import React, { useRef } from 'react';
import { connect, history } from 'umi';
import AddModal from './components/AddModal';

const OperatorList: React.FC<{ match: { params: { id: number } } }> = ({ match }) => {
	const tableRef = useRef<ProTableAction>();
	const { params } = match;
	let roleId = Number(params.id);
	const { roleType, roleTypeTextMap } = useUserTypeList();

	// 解绑用户
	const onConfirmDelete = (id: number) => {
		let params = {
			roleId: roleId,
			userIds: [id],
		};
		enabledOrNo(params);
	};

	const enabledOrNo = async (params: { roleId: number; userIds: number[] }) => {
		const res = await roleUnBindUser(params);
		if (res && res.code === 0) {
			notification.success('操作成功！');
			tableRef.current?.reload();
		}
	};

	// 创建用户与组织关联
	const getTableList = () => {
		tableRef.current?.reload();
	};

	const statusOption = {
		['']: { text: '全部', status: '' },
		true: { text: '已启用', status: 'true' },
		false: { text: '已禁用', status: 'false' },
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
			title: '状态',
			dataIndex: 'enabled',
			valueType: 'radioButton',
			initialValue: '',
			valueEnum: statusOption,
			fieldProps: {
				className: 'search-radio-button',
			},
		},
		{
			title: '登录账号',
			dataIndex: 'loginPhone',
			fieldProps: {
				placeholder: '',
			},
		},
		{
			title: '用户姓名',
			dataIndex: 'name',
			fieldProps: {
				placeholder: '',
			},
		},
	];

	const columns: ProColumns<UsersController.ByRoleIdGetUserRecord>[] = [
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
			dataIndex: 'isEnabled',
			render: (text) => {
				return (
					<span>
						<Badge
							color={text ? CONFIG_LESS['@c_starus_await'] : CONFIG_LESS['@c_starus_disabled']}
						/>
						{text ? '已启用' : '已禁用'}
					</span>
				);
			},
		},
		{
			width: 'XXS',
			title: '登录账号',
			dataIndex: 'loginPhone',
			renderText: (text, record) => {
				return (
					<a
						className='gotoDetail'
						onClick={() => {
							history.push(`/system/permissions/role/detail/${record.id}-${roleId}`);
						}}>
						{text}
					</a>
				);
			},
		},
		{
			width: 'XXS',
			title: '类型',
			dataIndex: 'type',
			renderText: (text) => roleTypeTextMap[text],
		},
		{
			width: 'XXS',
			title: '用户姓名',
			dataIndex: 'name',
		},
		{
			width: 'XS',
			title: '操作',
			dataIndex: 'option',
			render: (id, record) => {
				return (
					<div className='operation'>
						<Popconfirm
							placement='left'
							title='确定解绑该用户吗？'
							okText='确定'
							cancelText='取消'
							onConfirm={() => {
								onConfirmDelete(record.id as number);
							}}>
							<span className='handleLink'>解绑</span>
						</Popconfirm>
					</div>
				);
			},
		},
	];

	const addModals = {
		roleId,
		roleTypeTextMap,
		getTableList,
	};

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', ['', '/system/permissions/role'], '']} />
			</div>
			<Card>
				<ProTable
					rowKey='id'
					loadConfig={{
						request: false,
					}}
					tableInfoCode='role_user'
					columns={columns}
					tableRef={tableRef}
					params={{ roleId }}
					// tableInfoId="118"
					api={getUserListByRoleId}
					searchConfig={{
						columns: searchColumns,
					}}
					toolBarRender={() => [
						<AddModal
							{...addModals}
							trigger={
								<Button
									type='primary'
									icon={<PlusOutlined />}>
									添加
								</Button>
							}
						/>,
					]}
				/>
			</Card>
		</div>
	);
};

export default connect((global: Record<string, any>) => ({ global }))(OperatorList);
