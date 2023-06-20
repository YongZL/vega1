import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ResizableTable';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import {
	consumeEnum,
	consumeWay,
	enabledEnum,
	enabledStatusValueEnum,
} from '@/constants/dictionary';
import { EnableDisable, ordinaryList } from '@/services/ordinary';
import { notification } from '@/utils/ui';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Popconfirm } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { connect, history, useAccess, useModel } from 'umi';
const TableList = ({ global }: any) => {
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const access = useAccess();
	const [form] = Form.useForm();
	const [isEnabledLoading, setIsEnabledLoading] = useState<boolean>(false);
	const [isExportFile, setIsExportFile] = useState(false);
	const state = history?.location.state as { id: number };
	const searchColumns: ProFormColumns<OrdinaryController.QuerOrdinary> = [
		{
			title: '状态',
			dataIndex: 'menabled',
			valueType: 'radioButton',
			initialValue: '',
			valueEnum: enabledEnum,
			fieldProps: {
				className: 'search-radio-button',
			},
		},
		{
			title: '消耗方式',
			dataIndex: 'consumeType',
			valueType: 'radioButton',
			initialValue: `${['push', 'scanCode']}`,
			valueEnum: consumeEnum,
			fieldProps: {
				className: 'search-radio-button',
			},
		},
		{
			title: '套包编号/名',
			dataIndex: 'keyword',
			fieldProps: {
				maxLength: 30,
				placeholder: '请输入',
			},
		},
		{
			title: `包内${fields.goods}`,
			dataIndex: 'goodsName',
			fieldProps: {
				maxLength: 30,
				placeholder: '请输入',
			},
		},
	];
	const getSearchDate = () => {
		return {
			...tableRef.current?.getParams(),
			menabled:
				form.getFieldValue('menabled') === 'true,false'
					? undefined
					: form.getFieldValue('menabled'),
		};
	};
	// 列表
	const getFormList = () => {
		tableRef.current?.reload();
	};

	// 启用/禁用
	const updateEnabled = async (status: boolean, id: string | object) => {
		let res;
		setIsEnabledLoading(true);
		try {
			if (isEnabledLoading) {
				return;
			}
			if (status) {
				res = await EnableDisable({ ordinaryId: id, status: 'false' });
			} else {
				res = await EnableDisable({ ordinaryId: id, status: 'true' });
			}
			if (res && res.code === 0) {
				notification.success('操作成功！');
				getFormList();
			}
		} finally {
			setIsEnabledLoading(false);
		}
	};

	const getCode = () => {
		// const hash = window.location.search;
		// let id = undefined;
		// if (hash.indexOf('search_link') > -1) {
		//   id = global.linkKeys;
		//   console.log(1231313123, id, hash, global);
		//   form.submit()
		// }
		let state = history?.location.state as { status: string };
		if (state?.status) {
			form.setFieldsValue({ statuses: state?.status });
			setTimeout(() => form.submit(), 200);
		}
	};
	useEffect(() => {
		let state = history?.location.state as { id: number };
		console.log('state', state);

		if (state?.id) {
			setTimeout(() => form.submit(), 200);
		}
	}, []);

	const jumpPage = (record: object | string) => {
		history.push({
			pathname: `/base_data/ordinary/edit/${record}`,
			state: { params: getSearchDate() },
		});
	};

	const columns: ProColumns<OrdinaryController.OrdinaryQuer>[] = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'id',
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			width: 'S',
			title: '状态',
			dataIndex: 'menabled',
			filters: false,
			valueEnum: enabledStatusValueEnum,
		},
		{
			width: 'L',
			title: '医耗套包编号',
			dataIndex: 'ordinaryCode',
		},
		{
			width: 'XXL',
			title: '医耗套包名称',
			dataIndex: 'name',
			ellipsis: true,
			renderText: (text, record) => {
				return access.package_ordinary_view ? (
					<a
						onClick={() => {
							history.push({
								pathname: `/base_data/ordinary/detail/${record.id}`,
								state: { params: getSearchDate() },
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
			width: 'XS',
			title: '消耗方式',
			dataIndex: 'consumeType',
			renderText: (text, record) =>
				record.consumeType &&
				consumeWay.filter((item) => item.value === record.consumeType)[0].label,
		},
		{
			width: 'XXL',
			title: '医耗套包说明',
			dataIndex: 'detailGoodsMessage',
			renderText: (text, record) => (
				<div
					className='detailGoodsMessage'
					title={record.description ? (record.description as string) : (text as string)}>
					{' '}
					{record.description ? record.description : text}{' '}
				</div>
			),
		},
	];
	if (access.edit_package_ordinary || access.set_package_ordinary_enabled) {
		columns.push({
			width: 'S',
			title: '操作',
			dataIndex: 'option',
			ellipsis: false,
			render: (_, record) => {
				return (
					<div className='operation'>
						{access.edit_package_ordinary && !record.menabled && (
							<React.Fragment>
								<span
									className='handleLink'
									onClick={() => jumpPage(record.id as string)}>
									编辑
								</span>
								{access.set_package_ordinary_enabled && <Divider type='vertical' />}
							</React.Fragment>
						)}

						{access.set_package_ordinary_enabled && (
							<Popconfirm
								placement='left'
								title={`确定${record.menabled ? '禁用' : '启用'}该套包吗？`}
								onConfirm={() => {
									updateEnabled(record.menabled as boolean, record.id as string);
								}}
								okButtonProps={{ loading: isEnabledLoading }}>
								<span className='handleLink'>{record.menabled ? '禁用' : '启用'}</span>
							</Popconfirm>
						)}
					</div>
				);
			},
		});
	}

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '', '']} />
			</div>
			<ProTable
				tableInfoCode='package_ordinary_list'
				api={ordinaryList}
				requestCompleted={(rows) => {
					setIsExportFile(rows.length > 0);
				}}
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				rowKey='id'
				// tableInfoId="233"
				loadConfig={{
					request: false,
				}}
				columns={columns}
				beforeSearch={(value: Record<string, any>) => {
					const { consumeType, menabled } = value;
					const params = {
						...value,
						id: state?.id || undefined,
						menabled: menabled && menabled.split(',').length == 1 ? menabled : undefined,
						consumeType: consumeType ? consumeType.toString() : undefined,
					};
					return params;
				}}
				searchKey={'ordinary'}
				toolBarRender={() => [
					access.add_package_ordinary && (
						<a
							onClick={() => {
								history.push({
									pathname: '/base_data/ordinary/add',
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
					access.ordinary_export && (
						<ExportFile
							data={{
								filters: { ...getSearchDate() },
								link: '/api/admin/ordinary/1.0/export',
								getForm: getSearchDate,
							}}
							disabled={!isExportFile}
						/>
					),
				]}
				tableRef={tableRef}
			/>
		</div>
	);
};

export default connect(({ global }: any) => ({ global }))(TableList);
