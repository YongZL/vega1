import type { ProTableAction } from '@/components//ProTable/typings';
import type { ProFormColumns } from '@/components//SchemaForm/typings';

import Breadcrumb from '@/components/Breadcrumb';
import { Tips } from '@/components/GetNotification';
import ProTable from '@/components/ProTable';
import { notification } from '@/utils/ui';
import { Card, Divider, Popconfirm } from 'antd';
import React, { useRef } from 'react';
import { history, useModel } from 'umi';

import { enabledStatus, enabledStatusValueEnum, surgicalPackageType } from '@/constants/dictionary';
import { disabled, enabled, getList } from './service';

const TableList: React.FC = () => {
	const { fields } = useModel('fieldsMapping');
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const tableRef = useRef<ProTableAction>();

	// 启用/禁用
	const updateEnabled = async (status: boolean, id: string) => {
		let res;
		if (status) {
			res = await disabled(id);
		} else {
			res = await enabled(id);
		}
		if (res && res.code === 0) {
			notification.success('操作成功！');
			tableRef.current?.reload();
		}
	};

	let columns = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 80,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'isEnabled',
			key: 'isEnabled',
			width: 120,
			filters: false,
			valueEnum: enabledStatusValueEnum,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 150,
		},
		{
			title: '套包名称',
			dataIndex: 'name',
			key: 'name',
			width: 200,
			ellipsis: true,
			render: (text, record) => {
				return permissions.includes('package_surgical_view') ? (
					<a
						onClick={() => {
							history.push(`/base_data/surgical/detail/${record.id}`);
						}}>
						{text}
					</a>
				) : (
					<span>{text}</span>
				);
			},
		},
		{
			title: '类别',
			dataIndex: 'categoryName',
			key: 'categoryName',
			width: 150,
		},
		{
			title: '是否定制类',
			dataIndex: 'stockingUp',
			key: 'stockingUp',
			width: 120,
			render: (text) => {
				return text ? '否' : '是';
			},
		},
	];
	if (
		permissions.includes('edit_package_surgical') ||
		permissions.includes('set_package_surgical_enabled')
	) {
		columns.push({
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 56,
			ellipsis: false,
			render: (_, record) => {
				return (
					<div className='operation'>
						{permissions.includes('edit_package_surgical') && !record.isEnabled && (
							<React.Fragment>
								<a
									onClick={() => {
										history.push(`/base_data/surgical/edit/${record.id}`);
									}}>
									编辑
								</a>
								{permissions.includes('set_package_surgical_enabled') && (
									<Divider type='vertical' />
								)}
							</React.Fragment>
						)}

						{permissions.includes('set_package_surgical_enabled') && (
							<Popconfirm
								placement='left'
								title={`确定${record.isEnabled ? '禁用' : '启用'}该套包吗？`}
								onConfirm={() => {
									updateEnabled(record.isEnabled, record.id);
								}}>
								<span className='handleLink'>{record.isEnabled ? '禁用' : '启用'}</span>
							</Popconfirm>
						)}
					</div>
				);
			},
		});
	}

	const searchColumns: ProFormColumns[] = [
		{
			title: '状态',
			dataIndex: 'isEnabled',
			valueType: 'tagSelect',
			fieldProps: {
				multiple: false,
				options: enabledStatus,
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			title: '套包名称',
			dataIndex: 'name',
		},
		{
			title: '类别',
			dataIndex: 'category',
			valueType: 'select',
			fieldProps: {
				options: surgicalPackageType,
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
					columns={columns}
					api={getList}
					params={{ status: status !== undefined ? [status].toString : undefined }}
					tableRef={tableRef}
					searchKey={'surgical'}
					headerTitle={<Tips />}
					// tableInfoId="2"
					searchConfig={{
						columns: searchColumns,
					}}
				/>
			</Card>
		</div>
	);
};

export default TableList;
