import Breadcrumb from '@/components/Breadcrumb';
import type { ProColumns } from '@/components/ProTable/typings';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { warehouseType, yesOrNo } from '@/constants/dictionary';
import { useAllSubDepartmentList } from '@/hooks/useDepartmentList';
import { getWarehouseList } from '@/services/warehouse';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form } from 'antd';
import React, { useEffect } from 'react';
import { history, useAccess, useModel } from 'umi';

type WarehouseRecord = WarehouseController.WarehouseRecord;
const TableList: React.FC<{}> = () => {
	const access = useAccess();
	const [form] = Form.useForm();
	const { loading, fieldsMap, getWarehouseField } = useModel('warehouseField');

	useEffect(() => {
		getWarehouseField();
	}, []);

	const jumpPage = (id: number) => {
		history.push({
			pathname: `/base_data/warehouse/edit/${id}`,
			state: { params: form.getFieldsValue() },
		});
	};

	const searchColumns: ProFormColumns = [
		{
			title: '仓库名称',
			dataIndex: 'name',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '所属科室',
			dataIndex: 'departmentIds',
			valueType: 'select',
			fieldProps: {
				showSearch: true,
				options: useAllSubDepartmentList(),
				filterOption: (input: string, option: { label: string }) => {
					return option['data-item'].key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '仓库类型',
			dataIndex: 'level',
			valueType: 'select',
			fieldProps: {
				placeholder: '请选择',
				options: warehouseType,
			},
		},
		{
			title: '是否为虚拟库',
			dataIndex: 'virtual',
			valueType: 'select',
			fieldProps: {
				placeholder: '请选择',
				options: yesOrNo,
			},
		},
	];

	const columns: ProColumns<WarehouseRecord>[] = [
		{
			width: 'XXXS',
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			width: 'XXS',
			title: '仓库名称',
			dataIndex: 'name',
			ellipsis: true,
			renderText: (text, record) => {
				return access.warehouse_view ? (
					<a
						onClick={() => {
							history.push({
								state: { params: form.getFieldsValue() },
								pathname: `/base_data/warehouse/detail/${record.id}`,
							});
						}}>
						{text}
					</a>
				) : (
					text
				);
			},
		},
		{
			width: 'XXS',
			title: '所属科室',
			dataIndex: 'departmentName',
			ellipsis: true,
		},
		{
			width: 'XXS',
			title: '仓库类型',
			dataIndex: 'level',
			render: (text) => {
				return <span>{text === 0 ? '中心仓库' : '二级仓库'}</span>;
			},
		},
		{
			width: 'XXS',
			title: '是否虚拟库',
			dataIndex: 'isVirtual',
			render: (text) => (text ? '是' : '否'),
		},
		{
			width: 'XXS',
			title: '推送组别',
			dataIndex: 'deliveryGroupId',
			render: (text, record) => record.deliveryGroupName || '-',
		},
		{
			width: 'XXS',
			title: '推送优先级别',
			dataIndex: 'priority',
		},
		{
			width: 'S',
			title: 'ePS仓库编号',
			dataIndex: 'epsWarehouseCode',
			hideInTable: WEB_PLATFORM !== 'DS',
		},
		{
			width: 'S',
			title: '平台仓库码',
			dataIndex: 'platformCode',
			hideInTable: WEB_PLATFORM !== 'DS',
		},
	];
	if (access.edit_warehouse) {
		columns.push({
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 'XXXS',
			render: (_, record: { id: number }) => {
				return (
					<span
						className='handleLink'
						onClick={() => jumpPage(record.id)}>
						编辑
					</span>
				);
			},
		});
	}

	// 列表可配置处理
	const finalColumns: ProColumns<WarehouseRecord>[] = [];
	if (!loading) {
		const noConfigKeys = ['index', 'option'];

		let initSort = 9999;
		columns
			.sort((a, b) => {
				const aKey = a.dataIndex || a.key;
				const bKey = b.dataIndex || b.key;
				const aField = fieldsMap[aKey as string] || {};
				const bField = fieldsMap[bKey as string] || {};

				let aSort = aField.listSort || ++initSort;
				let bSort = bField.listSort || ++initSort;

				if (aKey === 'index') {
					aSort = -1;
				} else if (aKey === 'option') {
					aSort = 99999;
				}
				if (bKey === 'index') {
					bSort = -1;
				} else if (bKey === 'option') {
					bSort = 99999;
				}
				return aSort - bSort;
			})
			.forEach((col) => {
				let key = col.dataIndex || col.key;
				const field = fieldsMap[key as string] || {};

				if ((field && field.listShow) || noConfigKeys.includes(key as string)) {
					finalColumns.push({
						...col,
						title: field.displayFieldLabel || col.title,
					});
				}
			});
	}

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<Card>
				<ProTable<WarehouseRecord>
					tableInfoCode='warehouse_list'
					rowKey='id'
					searchConfig={{
						form,
						columns: searchColumns,
					}}
					loadConfig={{
						request: false,
					}}
					columns={finalColumns}
					api={getWarehouseList}
					searchKey={'warehouse'}
					toolBarRender={() => [
						access.add_warehouse && (
							<Button
								icon={<PlusOutlined />}
								type='primary'
								onClick={() => {
									history.push({
										pathname: '/base_data/warehouse/add',
										state: {
											params: { ...form.getFieldsValue() },
										},
									});
								}}
								className='iconButton'>
								新增
							</Button>
						),
					]}
					// tableInfoId="15"
				/>
			</Card>
		</div>
	);
};

export default TableList;
