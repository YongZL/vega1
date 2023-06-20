import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { yesOrNo } from '@/constants/dictionary';
import { downloadUrl } from '@/services/common';
import { itemDelete, storageGetList, uploadLocationApi } from '@/services/storageCabinets';
import { getWarehouseList } from '@/services/warehouse';
import { beforeUpload } from '@/utils/file';
import { notification } from '@/utils/ui';
import { getUrl } from '@/utils/utils';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Popconfirm, Upload } from 'antd';
import React, { useRef, useState } from 'react';
import { connect, history, useAccess, useModel } from 'umi';

const GoodShelves = () => {
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const access = useAccess();
	const [form] = Form.useForm();
	const [uploading, setUploading] = useState<boolean>(false);

	const onConfirmDelete = async (id: number) => {
		const res = await itemDelete(id + '');
		if (res && res.code === 0) {
			notification.success('删除成功');
			tableRef.current?.reload();
		}
	};

	const toPage = (record: number, page: string) => {
		history.push({
			pathname: `/base_data/storage/goods_shelves/${page}/${record}`,
			state: { params: form.getFieldsValue() },
		});
	};
	const toPageName = (id: number) => {
		form.submit();
		history.push({
			pathname: `/base_data/storage/goods_shelves/detail/${id}`,
			state: { params: form.getFieldsValue() },
		});
	};

	const jumpPage = (record: number, num: number) => {
		form.submit();
		if (num === 2) {
			toPage(record, 'detail');
		} else {
			toPage(record, 'edit');
		}
	};
	const searchColumns: ProFormColumns<StorageCabinetsController.GetListRuleParams> = [
		{
			title: '货架名称',
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
					return option.label.toLowerCase()?.indexOf(input?.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '所属库房',
			dataIndex: 'storageAreaName',
			fieldProps: {
				placeholder: '请输入',
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
		{
			title: '智能柜',
			dataIndex: 'smartCabinet',
			valueType: 'select',
			fieldProps: {
				placeholder: '请选择',
				options: yesOrNo,
			},
		},
	];

	const columns: ProColumns<StorageCabinetsController.GetListRuleParamsList>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 'XXXS',
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: '货架名称',
			dataIndex: 'name',
			key: 'name',
			width: 'M',
			ellipsis: true,
			renderText: (text: string, record) => {
				return access.goods_shelves_detail && record.smartCabinet === false ? (
					<>
						<a
							className='handleLink'
							onClick={(e) => {
								e.preventDefault();
								toPageName(record.id as number);
							}}>
							{text}
						</a>
					</>
				) : (
					<span>{text}</span>
				);
			},
		},
		{
			title: '所属仓库',
			dataIndex: 'warehouseName',
			key: 'warehouseName',
			width: 'XS',
			ellipsis: true,
		},
		{
			title: '所属库房',
			dataIndex: 'storageAreaName',
			width: 'XS',
			ellipsis: true,
		},
		{
			title: `支持高值${fields.goods}`,
			dataIndex: 'highValueSupported',
			width: 'XXS',
			renderText: (text) => (text ? '是' : '否'),
		},
		{
			title: `支持低值${fields.goods}`,
			dataIndex: 'lowValueSupported',
			width: 'XXS',
			renderText: (text) => (text ? '是' : '否'),
		},
		{
			title: '是否智能柜',
			dataIndex: 'smartCabinet',
			width: 'XXS',
			renderText: (text) => (text ? '是' : '否'),
		},
		{
			title: '长(cm)',
			dataIndex: 'length',
			width: 'XXXS',
		},
		{
			title: '宽(cm)',
			dataIndex: 'width',
			width: 'XXXS',
		},
		{
			title: '高(cm)',
			dataIndex: 'height',
			width: 'XXXS',
		},
	];
	if (access.goods_shelves_edit || access.goods_shelves_delete) {
		columns.push({
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 'XS',
			fixed: 'right',
			render: (_, record) => {
				return (
					<div className='operation'>
						{access.goods_shelves_edit && record.smartCabinet === false && (
							<React.Fragment>
								<span
									className='handleLink'
									onClick={() =>
										history.push({
											pathname: `/base_data/storage/goods_shelves/edit/${record.id}`,
											state: {
												params: { ...form.getFieldsValue() },
											},
										})
									}>
									编辑
								</span>
								{access.goods_shelves_delete && <Divider type='vertical' />}
							</React.Fragment>
						)}
						{access.goods_shelves_delete && record.smartCabinet === false && (
							<Popconfirm
								placement='left'
								title='确定删除该货架吗？'
								okText='确定'
								cancelText='取消'
								onConfirm={() => onConfirmDelete(record.id as number)}>
								<span className='handleLink'>删除</span>
							</Popconfirm>
						)}
					</div>
				);
			},
		});
	}

	// 下载模板
	const downloadTemp = () => {
		window.open(`${getUrl()}${downloadUrl}?filename=货位导入模板.xlsx`);
	};

	// 货位导入上传
	const handleChange = (info: Record<string, any>) => {
		setUploading(true);
		if (info.file.status === 'done') {
			if (info.file?.response?.code === 1) {
				notification.error(`${info.file?.response?.msg}`);
				setUploading(false);
			} else {
				notification.success(`货位导入成功`);
				setUploading(false);
			}
		} else if (info.file.status === 'error') {
			notification.error(`货位导入失败`);
			setUploading(false);
		}
	};

	return (
		<ProTable
			columns={columns}
			rowKey='id'
			api={storageGetList}
			tableRef={tableRef} //页面更新后控制页面重新发送请求并更新
			tableInfoCode='goods_shelves_list'
			searchKey={'goods_shelves'}
			toolBarRender={() => [
				access.upload_location && (
					<a onClick={downloadTemp}>
						<Button type='primary'>货位导入模板下载</Button>
					</a>
				),
				access.upload_location && (
					<Upload
						name='file'
						maxCount={1}
						showUploadList={false}
						action={`${getUrl()}${uploadLocationApi}`}
						onChange={handleChange}
						beforeUpload={beforeUpload}
						withCredentials={true}
						listType='text'
						headers={{ 'X-AUTH-TOKEN': sessionStorage.getItem('x_auth_token') || '' }}>
						<Button
							loading={uploading}
							type='primary'>
							货位导入上传
						</Button>
					</Upload>
				),
				access.goods_shelves_add && (
					<a
						onClick={() => {
							history.push({
								pathname: '/base_data/storage/goods_shelves/add',
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
			// tableInfoId="17"
			searchConfig={{
				form,
				columns: searchColumns,
			}}
		/>
	);
};

export default connect((global: Record<string, any>) => ({ global }))(GoodShelves);
