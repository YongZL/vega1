import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import Breadcrumb from '@/components/Breadcrumb';
import { Tips } from '@/components/GetNotification';
import ProTable from '@/components/ResizableTable';
import { enabledEnum } from '@/constants/dictionary';
import { useDistributorList } from '@/hooks/useDistributorList';
import { useUserTypeList } from '@/hooks/useUserTypeList';
import { useStoreRoomList } from '@/hooks/useWarehouseList';
import { queryAllDepartmentList } from '@/services/department';
import { queryOperate, queryRule, queryUpdatePwd } from '@/services/users';
import { notification } from '@/utils/ui';
import { PlusOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Divider, Form, Popconfirm, Tooltip } from 'antd';
import type { FC } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { history, useAccess, useModel } from 'umi';
import DetailModal from '../components/DetailModal';

const List: FC<{}> = ({}) => {
	const tableRef = useRef<ProTableAction>();
	const [form] = Form.useForm();
	const distributorList = useDistributorList();
	const [pasLoading, setPasLoading] = useState<boolean>(false);
	const [isEnabledLoading, setIsEnabledLoading] = useState<boolean>(false);
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const { storeRoomList, getStorageAreas } = useStoreRoomList();
	const { roleType, roleTypeTextMap } = useUserTypeList();

	useEffect(() => {
		if (WEB_PLATFORM === 'DS') {
			getStorageAreas({ isCenterWarehouse: false });
		}
	}, []);

	const enabledOrNo = async (params: { id: number; enable: boolean }) => {
		if (isEnabledLoading) {
			return;
		}
		try {
			setIsEnabledLoading(true);
			const res = await queryOperate(params);
			if (res && res.code === 0) {
				notification.success('操作成功！');
				tableRef.current?.reload();
			}
		} finally {
			setIsEnabledLoading(false);
		}
	};
	// 启用/禁用
	const onConfirmEnabled = (record: Record<string, any>) => () => {
		const params = {
			id: record.id,
			enable: !record.isEnabled,
		};
		enabledOrNo(params);
	};
	const resetPasssWord = async (id: number) => {
		if (pasLoading) {
			return;
		}
		setPasLoading(true);
		try {
			const params = {
				userId: id,
			};
			const res = await queryUpdatePwd(params);
			if (res && res.code == 0) {
				notification.success('操作成功!');
				tableRef.current?.reload();
			}
		} finally {
			setPasLoading(false);
		}
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
			dataIndex: 'isEnabled',
			valueType: 'radioButton',
			initialValue: '',
			valueEnum: enabledEnum,
			fieldProps: {
				className: 'search-radio-button',
			},
		},
		{
			title: '登录账号',
			dataIndex: 'loginPhone',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '所属科室',
			dataIndex: 'departmentIds',
			valueType: 'apiSelect',
			fieldProps: {
				api: queryAllDepartmentList,
				fieldConfig: {
					label: 'departmentName',
					value: 'departmentId',
				},
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '所属库房',
			dataIndex: 'storageAreaId',
			valueType: 'select',
			hideInForm: WEB_PLATFORM !== 'DS',
			fieldProps: {
				options: storeRoomList,
			},
		},
		{
			title: '用户姓名',
			dataIndex: 'name',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorId',
			valueType: 'select',
			fieldProps: {
				showSearch: true,
				options: distributorList,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
	];

	const columns: ProColumns<UsersController.UserListParams>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 'XXXS',
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'isEnabled',
			key: 'isEnabled',
			width: 'XXS',
			renderText: (text: string) => {
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
			title: '登录账号',
			dataIndex: 'loginPhone',
			key: 'loginPhone',
			width: 'S',
			renderText: (text: string, record) => {
				return access.user_view ? (
					<a
						onClick={() => {
							history.push(`user/detail/${record.id}`);
						}}
						className='gotoDetail'>
						{text}
					</a>
				) : (
					text
				);
			},
		},
		{
			title: '用户类型',
			dataIndex: 'type',
			width: 'XXS',
			renderText: (text: string) => <span>{roleTypeTextMap[text]}</span>,
		},
		{
			title: '用户权限',
			dataIndex: 'titleId',
			key: 'titleId',
			width: 'XL',
			ellipsis: true,
			renderText: (text, record) => {
				let roles = '';
				let role = record.roles;
				role.map((el: { name: string }, index: number) => {
					roles = index + 1 === role.length ? `${roles}${el.name}` : `${roles}${el.name}、`;
				});
				return roles;
			},
		},
		{
			title: '所属科室',
			dataIndex: 'departmentName',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '所属库房',
			dataIndex: 'storageAreaNames',
			width: 'L',
			ellipsis: true,
			hideInTable: WEB_PLATFORM !== 'DS',
			render: (text, record) => {
				const list = record.storageAreaNames || [];
				const len = list.length;
				const title = list.map((item, index) => {
					return <div>{`${item}${len === index + 1 ? '' : ';'}`}</div>;
				});
				return len > 0 ? <Tooltip title={title}>{list.join(';')}</Tooltip> : '-';
			},
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorName',
			width: 'S',
			ellipsis: true,
		},
		{
			title: '用户姓名',
			dataIndex: 'name',
			width: 'XS',
			ellipsis: true,
		},
		{
			title: '操作',
			width: 'XXXL',
			dataIndex: 'option',
			fixed: 'right',
			render: (id, record: UsersController.UserListParams) => {
				return record.isSystem ? null : (
					<div className='operation'>
						{access.edit_user && (
							<React.Fragment>
								<a
									onClick={() => {
										history.push({
											pathname: `user/edit/${record.id}`,
											state: {
												params: { ...form.getFieldsValue() },
											},
										});
									}}>
									编辑
								</a>
								{(access.set_user_enabled || access.reset_pwd) && <Divider type='vertical' />}
							</React.Fragment>
						)}
						{access.reset_pwd && !record.loginPwdUpdateTime && (
							<>
								<DetailModal
									trigger={<a>系统密码</a>}
									detail={record}
									modal={modal}
									backPassword=''
									setVisibles={{}}
									visible={false}
								/>
								<Divider type='vertical' />
							</>
						)}
						{access.set_user_enabled && (
							<React.Fragment>
								<Popconfirm
									placement='left'
									title={`确定${record.isEnabled ? '禁用' : '启用'}该用户吗？`}
									onConfirm={onConfirmEnabled(record)}
									okButtonProps={{ loading: isEnabledLoading }}>
									<span className='handleLink'>{record.isEnabled ? '禁用' : '启用'}</span>
								</Popconfirm>
							</React.Fragment>
						)}
						{access.reset_pwd && (
							<>
								<Divider type='vertical' />
								<span
									className='handleLink'
									onClick={() => {
										resetPasssWord(record.id as number);
									}}>
									重置密码
								</span>
							</>
						)}
					</div>
				);
			},
		},
	];

	const modal = {
		onOk: () => {
			tableRef.current?.reload();
		},
		confirmLoading: pasLoading,
	};
	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<Card>
				<ProTable
					columns={columns}
					rowKey='id'
					tableInfoCode='user_list'
					api={queryRule}
					paramsToString={['typeList']}
					tableRef={tableRef}
					headerTitle={<Tips text='*系统密码：新用户登录密码由系统生成，点击系统密码查看' />}
					loadConfig={{
						request: false,
					}}
					searchKey={'permissions_user'} //保存搜索条件
					toolBarRender={() => [
						access.add_user && (
							<a
								onClick={() => {
									history.push({
										pathname: 'user/add',
									});
								}}
								className='gotoDetail'>
								<Button
									icon={<PlusOutlined />}
									type='primary'
									className='iconButton'>
									新增
								</Button>
							</a>
						),
					]}
					searchConfig={{
						form, //这里需要传入form form.getFieldsValue() 才有用
						columns: searchColumns,
					}}
				/>
			</Card>
		</div>
	);
};

export default List;
