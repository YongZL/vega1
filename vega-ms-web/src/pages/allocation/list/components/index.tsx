import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import type { ProFormInstance } from '@ant-design/pro-form';
import type { FC } from 'react';

import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ResizableTable';
import { timeType3 } from '@/constants';
import api from '@/constants/api';
import {
	allocationApplyType,
	allocationApplyTypeValueEnum,
	allocationGoodsType,
	allocationGoodsTypeValueEnum,
	allocationHandleStatusType,
	allocationQueryStatusType,
	allocationStatusTypeValueEnum,
} from '@/constants/dictionary';
import { useGetAreaList } from '@/hooks/allocation';
import {
	closeReallocateOrderById,
	exportFile,
	operationEntryStorageById,
	pageList,
} from '@/services/storageReallocation';
import { downloadByUrl } from '@/utils/file';
import { getUrl } from '@/utils/utils';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Form, message, Popconfirm } from 'antd';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { connect, useAccess, useHistory, useModel } from 'umi';
import DetailModal from './DetailModal';

type ReallocateRecord = StorageReallocateController.ReallocateRecord;

const AllocationList: FC<{ pageType: 'handle' | 'query'; global: Record<string, any> }> = ({
	global,
	pageType,
}) => {
	const { fields } = useModel('fieldsMapping');
	const [permissions] = useState<string[]>(
		JSON.parse(sessionStorage.getItem('permissions') || '[]'),
	);
	const history = useHistory();
	const access = useAccess();
	const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
	const [operationEntryStorageLoadingMap, setOperationEntryStorageLoadingMap] = useState<
		Record<string, boolean>
	>({});
	const [closeReallocateOrderLoadingMap, setCloseReallocateOrderLoadingMap] = useState<
		Record<string, boolean>
	>({});
	const [exportLoadingMap, setExportLoadingMap] = useState<Record<string, boolean>>({});
	const tableRef = useRef<ProTableAction>();
	const formRef = useRef<ProFormInstance>();
	const [form] = Form.useForm();

	const {
		getOptions,
		value: sourceValue,
		setValue: setSourceValue,
		options,
	} = useGetAreaList('source');
	const {
		getOptions: getTargetOptions,
		value: targetValue,
		setValue: setTargetValue,
		options: targetOptions,
		setOptions: setTargetOptions,
	} = useGetAreaList('target');

	useEffect(() => {
		getOptions();
	}, [getOptions]);

	useEffect(() => {
		let state = history?.location.state as { status: string };
		if (state?.status) {
			formRef.current?.setFieldsValue({ status: state?.status });
			setTimeout(() => formRef.current?.submit(), 200);
		}
	}, [history?.location.state]);

	const operationEntryStorage = useCallback(
		async (id: number) => {
			if (operationEntryStorageLoadingMap[id]) {
				return;
			}
			setOperationEntryStorageLoadingMap({ ...operationEntryStorageLoadingMap, [id]: true });
			try {
				const res = await operationEntryStorageById(id);
				if (res.code === 0) {
					message.success('送达入库成功！');
					tableRef.current?.reload();
				}
			} finally {
				setOperationEntryStorageLoadingMap({ ...operationEntryStorageLoadingMap, [id]: false });
			}
		},
		[operationEntryStorageLoadingMap],
	);

	const closeReallocateOrder = useCallback(
		async (id: number) => {
			if (closeReallocateOrderLoadingMap[id]) {
				return;
			}
			setCloseReallocateOrderLoadingMap({ ...closeReallocateOrderLoadingMap, [id]: true });
			try {
				const res = await closeReallocateOrderById(id);
				if (res.code === 0) {
					message.success('结束订单成功！');
					tableRef.current?.reload();
				}
			} finally {
				setCloseReallocateOrderLoadingMap({ ...closeReallocateOrderLoadingMap, [id]: false });
			}
		},
		[closeReallocateOrderLoadingMap],
	);

	const batchExport = useCallback(
		async (exportType: 'batch' | 'normal', ids?: number[]) => {
			const loadingMap = {};
			const idList = exportType === 'normal' ? (ids as number[]) : selectedRowKeys;
			idList.forEach((id) => {
				loadingMap[id] = true;
			});
			setExportLoadingMap({ ...exportLoadingMap, ...loadingMap });
			try {
				const res = await exportFile({ ids: idList });
				if (res.code === 0) {
					message.success(`${exportType === 'batch' ? '批量' : ''}导出成功！`);
					downloadByUrl({
						url: `${getUrl()}${api.common.download}?filename=${res.data}`,
						target: '_self',
					});
					if (exportType === 'batch') {
						setSelectedRowKeys([]);
					}
				}
			} finally {
				idList.forEach((id) => {
					loadingMap[id] = false;
				});
				setExportLoadingMap({ ...exportLoadingMap, ...loadingMap });
			}
		},
		[selectedRowKeys, exportLoadingMap],
	);
	const searchColumns: ProFormColumns = useMemo(
		() => [
			{
				title: '状态',
				dataIndex: 'status',
				valueType: 'tagSelect',
				fieldProps: {
					options: pageType === 'handle' ? allocationHandleStatusType : allocationQueryStatusType,
				},
			},
			{
				title: '申请时间',
				dataIndex: 'applyTime',
				valueType: 'dateRangeWithTag',
				fieldProps: {
					options: timeType3,
				},
			},
			{
				title: '供货库房',
				dataIndex: 'sourceStorageAreaId',
				valueType: 'select',
				fieldProps: {
					placeholder: '请选择供货库房',
					options,
					onChange: (value: number) => {
						setSourceValue(value);
						if (value) {
							if (!sourceValue || (sourceValue && sourceValue !== value)) {
								getTargetOptions(value);
							}
						}
						formRef.current?.resetFields(['targetStorageAreaId']);
						setTargetValue(undefined);
						setTargetOptions([]);
					},
					filterOption: (input: any, option: any) => {
						return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
					},
				},
			},
			{
				title: '到货库房',
				dataIndex: 'targetStorageAreaId',
				valueType: 'select',
				fieldProps: {
					placeholder: '请选择到货库房',
					options: targetOptions,
					disabled: !sourceValue,
					onClick: () => {
						if (!sourceValue) {
							message.warn('请先选择供货库房！');
						}
					},
					onChange: (value: number) => {
						setTargetValue(value);
					},
					filterOption: (input: any, option: any) => {
						return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
					},
				},
			},
			{
				title: '申请人员',
				dataIndex: 'applicant',
				fieldProps: {
					placeholder: '请输入申请人员',
				},
			},
			{
				title: '调拨单号',
				dataIndex: 'code',
				fieldProps: {
					placeholder: '请输入调拨单号',
				},
			},
			{
				title: `${fields.goods}类型`,
				dataIndex: 'goodsType',
				valueType: 'select',
				fieldProps: {
					placeholder: `请选择${fields.goods}类型`,
					options: allocationGoodsType,
				},
			},
			{
				title: '调拨类型',
				dataIndex: 'type',
				valueType: 'select',
				fieldProps: {
					placeholder: '请选择调拨类型',
					options: allocationApplyType,
				},
			},
			{
				title: `${fields.goods}/套包编码`,
				dataIndex: 'goodsCode',
				fieldProps: {
					placeholder: '请输入',
				},
			},
			{
				title: `${fields.goods}/套包名称`,
				dataIndex: 'goodsName',
				fieldProps: {
					placeholder: '请输入',
				},
			},
			{
				title: '规格/型号',
				dataIndex: 'commonSearch.specificationAndModel',
			},
		],
		[
			pageType,
			sourceValue,
			setSourceValue,
			options,
			getTargetOptions,
			targetValue,
			setTargetValue,
			targetOptions,
			setTargetOptions,
		],
	);

	const columns: ProColumns<ReallocateRecord>[] = useMemo(
		() => [
			{
				dataIndex: 'index',
				title: '序号',
				width: 'XXXS',
				align: 'center',
				renderText: (_text: number, _record, index) => index + 1,
			},
			{
				dataIndex: 'status',
				title: '状态',
				width: 'XXS',
				filters: false,
				valueEnum: allocationStatusTypeValueEnum,
			},
			{
				width: 'L',
				title: '申请日期',
				dataIndex: 'timeCreated',
				renderText: (text: number) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
			},
			{
				dataIndex: 'code',
				title: '调拨单号',
				width: 'L',
				ellipsis: true,
			},
			{
				dataIndex: 'createdByName',
				title: '申请人',
				width: 'L',
			},
			{
				dataIndex: 'outStorageTime',
				title: '出库时间',
				width: 'L',
				renderText: (text: number) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
			},
			{
				dataIndex: 'sourceStorageAreaName',
				title: '供货库房',
				width: 'L',
				ellipsis: true,
			},
			{
				dataIndex: 'inStorageTime',
				title: '入库时间',
				width: 'L',
				renderText: (text: number) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
			},
			{
				dataIndex: 'targetStorageAreaName',
				title: '到货库房',
				width: 'L',
				ellipsis: true,
			},
			{
				dataIndex: 'goodsType',
				title: `${fields.goods}类型`,
				width: 'XS',
				filters: false,
				valueEnum: allocationGoodsTypeValueEnum,
			},
			{
				dataIndex: 'type',
				title: '调拨类型',
				width: 'XS',
				filters: false,
				valueEnum: allocationApplyTypeValueEnum,
			},
			{
				width: pageType === 'handle' ? 260 : 'XS',
				title: '操作',
				dataIndex: 'option',
				valueType: 'option',
				fixed: 'right',
				render: (_text, record) => (
					<div className='operation'>
						{((pageType === 'handle' && access['allocation_handle_detail']) ||
							(pageType === 'query' && access['allocation_query_detail'])) && (
							<DetailModal
								trigger={<a>查看</a>}
								detail={record}
							/>
						)}
						{pageType === 'handle' &&
							record.status === 3 &&
							access['allocation_handle_send_storage'] && (
								<>
									<Divider type='vertical' />
									<Popconfirm
										title='确定送达入库吗？'
										okButtonProps={{
											loading: operationEntryStorageLoadingMap[record.id],
										}}
										disabled={operationEntryStorageLoadingMap[record.id]}
										onConfirm={() => operationEntryStorage(record.id as number)}>
										<a>送达入库</a>
									</Popconfirm>
								</>
							)}
						{pageType === 'handle' &&
							[1, 2, 3].includes(record.status) &&
							access['allocation_handle_order_end'] && (
								<>
									<Divider type='vertical' />
									<Popconfirm
										title='确定结束订单吗？'
										disabled={closeReallocateOrderLoadingMap[record.id]}
										onConfirm={() => closeReallocateOrder(record.id as number)}
										okButtonProps={{
											loading: closeReallocateOrderLoadingMap[record.id],
										}}>
										<a>结束订单</a>
									</Popconfirm>
								</>
							)}
						{((pageType === 'handle' && access['allocation_handle_export']) ||
							(pageType === 'query' && access['allocation_query_export'])) && (
							<>
								<Divider type='vertical' />
								<a onClick={() => batchExport('normal', [record.id])}>导出</a>
							</>
						)}
					</div>
				),
			},
		],
		[pageType, permissions, closeReallocateOrderLoadingMap],
	);

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<ProTable<ReallocateRecord>
				tableInfoCode={pageType === 'handle' ? 'allocation_handle_list' : 'allocation_query_list'}
				loadConfig={{
					request: false,
				}}
				rowKey='id'
				searchConfig={{
					columns: searchColumns,
					formRef,
					form,
				}}
				searchKey={pageType === 'handle' ? 'allocation_handle' : 'allocation_query'}
				dateFormat={{
					applyTime: {
						startKey: 'startTime',
						endKey: 'endTime',
					},
				}}
				params={{
					pageType,
				}}
				onReset={() => {
					setSourceValue(undefined);
					setTargetValue(undefined);
					setTargetOptions([]);
				}}
				tableRef={tableRef}
				api={pageList}
				columns={columns}
				toolBarRender={() => [
					((pageType === 'handle' && access['allocation_handle_export']) ||
						(pageType === 'query' && access['allocation_query_export'])) && (
						<Button
							type='primary'
							disabled={!selectedRowKeys.length}
							loading={Reflect.ownKeys(exportLoadingMap).some(
								(key) => exportLoadingMap[key as string],
							)}
							onClick={() => batchExport('batch')}
							style={{ width: 100 }}>
							批量导出
						</Button>
					),
					pageType === 'handle' && access['allocation_handle_apply'] && (
						<Button
							icon={<PlusOutlined style={{ marginLeft: -4 }} />}
							type='primary'
							onClick={() => {
								let applyTime = form.getFieldsValue().applyTime;
								if (applyTime && typeof applyTime[0] !== 'string') {
									applyTime = applyTime.map((item: any) => item._d);
								}
								history.push({
									pathname: '/allocation/handle/add',
									state: { params: { ...form.getFieldsValue(), applyTime } },
								});
							}}
							className='iconButton'>
							发起申请
						</Button>
					),
				]}
				rowSelection={
					(pageType === 'handle' && access['allocation_handle_export']) ||
					(pageType === 'query' && access['allocation_query_export'])
						? {
								selectedRowKeys,
								onChange: (selectedRowKeys: React.Key[]) => {
									setSelectedRowKeys([...selectedRowKeys] as number[]);
								},
						  }
						: false
				}
				tableAlertOptionRender={<a onClick={() => setSelectedRowKeys([])}>取消选择</a>}
			/>
		</div>
	);
};

export default connect(({ global }: { global: Record<string, any> }) => {
	global;
})(AllocationList);
