import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import ProTable from '@/components/ResizableTable';
import { yesOrNo } from '@/constants/dictionary';
import { getList } from '@/services/storageAreas';
import { getWarehouseList } from '@/services/warehouse';
import { getStatus } from '@/utils/dataUtil';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form } from 'antd';
import React, { useRef } from 'react';
import { history, useAccess, useModel } from 'umi';

const TableList: React.FC<{}> = () => {
	const { fields } = useModel('fieldsMapping');
	const dictionary = JSON.parse(sessionStorage.getItem('dictionary') || '{}');
	const access = useAccess();
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const jumpPage = (record: number) => {
		history.push({
			pathname: `/base_data/storage/edit/${record}`,
			state: { params: form.getFieldsValue() },
		});
	};
	const searchColumns: ProFormColumns<StorageAreasController.GetListRuleParams> = [
		{
			title: '库房名称',
			dataIndex: 'name',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '所属仓库',
			dataIndex: 'warehouseId',
			valueType: 'apiSelect',
			fieldProps: {
				api: getWarehouseList,
				params: { pageNum: 0, pageSize: 9999 },
				fieldConfig: {
					label: 'name',
					value: 'id',
				},
				filterOption: (input, option: any) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '库房类型',
			dataIndex: 'storageAreaType',
			valueType: 'select',
			fieldProps: {
				placeholder: '请选择',
				options: (() => {
					const arr: Record<string, any>[] = [];
					dictionary.storage_area_type.forEach((item: Record<string, any>) => {
						arr.push({ label: item.text, value: item.value });
					});
					return arr;
				})(),
			},
		},
		{
			title: '支持高值',
			dataIndex: 'highValueSupported',
			valueType: 'select',
			fieldProps: {
				placeholder: '请选择',
				options: yesOrNo,
			},
		},
		{
			title: '支持低值',
			dataIndex: 'lowValueSupported',
			valueType: 'select',
			fieldProps: {
				placeholder: '请选择',
				options: yesOrNo,
			},
		},
	];
	const columns: ProColumns<StorageAreasController.GetListRuleParamsList>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 'XXXS',
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: '库房名称',
			dataIndex: 'name',
			key: 'name',
			width: 'M',
			ellipsis: true,
			renderText: (text: string, record) => {
				return access.storage_area_view ? (
					<a
						onClick={() => {
							history.push({
								pathname: `/base_data/storage/detail/${record.id}`,
								state: { params: form.getFieldsValue() },
							});
						}}>
						{text}
					</a>
				) : (
					<span>{text}</span>
				);
			},
		},
		{
			title: '所属仓库',
			dataIndex: 'warehouseName',
			key: 'warehouseName',
			width: 'M',
			ellipsis: true,
		},
		{
			title: '库房类型',
			dataIndex: 'storageAreaType',
			key: 'storageAreaType',
			width: 'XXS',
			renderText: (text) => (
				<span>{getStatus(dictionary.storage_area_type, text).text || '-'}</span>
			),
		},
		{
			title: `支持高值${fields.goods}`,
			dataIndex: 'highValueSupported',
			key: 'highValueSupported',
			width: 'XXS',
			renderText: (text) => (text ? '是' : '否'),
		},
		{
			title: `支持低值${fields.goods}`,
			dataIndex: 'lowValueSupported',
			key: 'lowValueSupported',
			width: 'XXS',
			renderText: (text) => (text ? '是' : '否'),
		},
		{
			title: '是否收货库房',
			dataIndex: 'receivedGoods',
			key: 'receivedGoods',
			width: 'XXS',
			renderText: (text, record) =>
				record.receivedGoods === null ? '-' : record.receivedGoods ? '是' : '否',
		},
		{
			title: '联系人员',
			dataIndex: 'contact',
			key: 'contact',
			width: 'XXS',
		},
		{
			title: '联系电话',
			dataIndex: 'phone',
			key: 'phone',
			width: 'XS',
		},
	];
	if (access.edit_storage_area) {
		columns.push({
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			fixed: 'right',
			width: 'XS',
			render: (_, record) => {
				return (
					<span
						className='handleLink'
						onClick={() => jumpPage(record.id as number)}>
						编辑
					</span>
				);
			},
		});
	}

	return (
		<ProTable
			tableInfoCode='storage_area_list'
			columns={columns}
			rowKey='id'
			api={getList}
			tableRef={tableRef} //页面更新后控制页面重新发送请求并更新
			searchKey={'storage'}
			beforeSearch={(value: Record<string, any>) => {
				//这个方法里的value就是表单里的值，通过返回可以在这里控制发往后端的值
				const params = {
					pageNum: 0,
					pageSize: 20,
					...value,
				};
				return params;
			}}
			toolBarRender={() => [
				access.add_storage_area && (
					<a
						onClick={() => {
							history.push({
								pathname: '/base_data/storage/add',
								state: {
									params: { ...form.getFieldsValue() },
								},
							});
						}}>
						<Button
							icon={<PlusOutlined />}
							type='primary'
							className='iconButton'>
							新增
						</Button>
					</a>
				),
			]}
			// tableInfoId="16"
			searchConfig={{
				form,
				columns: searchColumns,
			}}
			loadConfig={{
				request: false,
			}}
		/>
	);
};

export default TableList;
