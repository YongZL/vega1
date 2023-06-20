import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ResizableTable';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import {
	pickingPendingSource,
	pickingPendingSourceTextMap,
	pickingPendingStatus,
	pickingPendingStatusAllValueEnum,
} from '@/constants/dictionary';
import { queryDepartmentList } from '@/services/department';
import { getStorageAreaList, pickExport, queryCancel, queryRule } from '@/services/pickPending';
import { getWarehouseListByIds } from '@/services/warehouse';
import { Button, Form, Popconfirm, Spin } from 'antd';
import moment from 'moment';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { history, useAccess, useModel } from 'umi';
import type { PickingListType } from '../data';
import { formatStrConnect } from '@/utils/format';

const PickingList: React.FC<PickingListType> = ({
	openModal,
	selectedItemList,
	setSelectedItemList,
	selectedIDList,
	currentIndex,
	setCurrentIndex,
	setIsBatchPickOpen,
	type,
	setType,
	isBatchPickUpModal,
	comRef,
	style,
	totalNumber,
	handleSelectItem,
	handleSelectAll,
	handleRowEvent,
	tagsData,
	activeKey,
	loading,
}) => {
	const tableRef = useRef<ProTableAction>();
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const [warehouseData, setWarehouseData] = useState<{ label: string; value: number }[]>([]);
	const [storageAreaList, setStorageAreaList] = useState<{ label: string; value: number }[]>([]);
	const [isCancels, setIsCancels] = useState<boolean>(false);
	const access = useAccess();
	const [isExportFile, setIsExportFile] = useState(false);
	const getWareHouseData = async (id: string) => {
		if (!id) {
			setWarehouseData([]);
			return;
		}
		let res = await getWarehouseListByIds({ departmentIds: id });
		if (res && res.code == 0) {
			setWarehouseData(
				res.data.map((item) => {
					return { label: item.name, value: item.id };
				}),
			);
		}
	};
	//获取库房
	const getStorageAreaLists = async (type: 'goods' | 'package_ordinary') => {
		const res = await getStorageAreaList({ type });
		if (res.code === 0) {
			const result = res.data.map((item: { id: number; name: string }) => {
				const { id, name } = item;
				return {
					value: id,
					label: name,
				};
			});
			setStorageAreaList(result);
		}
	};
	useEffect(() => {
		getStorageAreaLists('goods');
	}, []);
	useEffect(() => {
		const state = history?.location.state as { status: string; key: string };
		if (state?.status) {
			if (state?.key) {
				if (state.key === activeKey) {
					form.setFieldsValue({ statusList: state?.status });
					setTimeout(() => form.submit(), 200);
				}
			} else {
				form.setFieldsValue({ statusList: state?.status });
				setTimeout(() => form.submit(), 200);
			}
		}
	}, [history?.location.state]);
	const getFormList = () => {
		tableRef.current?.reload();
	};
	//取消
	const handleCancels = (id: number) => async () => {
		setIsCancels(true);
		try {
			const result = await queryCancel({ id });
			if (result) {
				const newList = selectedItemList[currentIndex].filter(
					(item: { id: number }) => item.id !== id,
				);
				setSelectedItemList((pre) => ({ ...pre, [currentIndex]: newList }));
				getFormList();
			}
		} finally {
			setIsCancels(false);
		}
	};
	//打开一键生成配货单页面
	const onPickOrderBatchClick = () => {
		setIsBatchPickOpen(true);
	};
	// 表格行是否可选择的配置项
	const rowSelection = {
		selectedRowKeys: selectedIDList[currentIndex],
		onSelect: handleSelectItem,
		onSelectAll: handleSelectAll,
		getCheckboxProps: (record: PickPendingController.QueryRuleRecord) => ({
			disabled: record.status === 'canceled',
		}),
	};
	const columns: ProColumns<PickPendingController.QueryRuleRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 70,
			renderText: (_text, _record, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'status',
			width: 'XXS',
			filters: false,
			valueEnum: pickingPendingStatusAllValueEnum,
		},
		{
			title: '推送科室',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 'M',
			hideInSearch: true,
			ellipsis: true,
			sorter: true,
		},
		{
			title: '推送仓库',
			dataIndex: 'warehouseName',
			width: 'M',
			ellipsis: true,
		},
		{
			title: '库房',
			dataIndex: 'storageAreaName',
			width: 'M',
			ellipsis: true,
		},
		{
			title: '货位编号',
			dataIndex: 'storageLocBarcode',
			width: 'S',
			ellipsis: true,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			width: 'XL',
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			width: 'L',
			ellipsis: true,
			renderText: (text: string, record) =>
				Number(record.stock) === 0 ? (
					<span style={{ color: CONFIG_LESS['@c_EF394F'] }}>{text}</span>
				) : (
					text
				),
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 'L',
			renderText: (text: string, record) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '配货数量  ',
			dataIndex: 'quantity',
			width: 'XS',
			renderText: (text, record) => text + record.unit,
		},
		{
			title: '可用库存',
			dataIndex: 'stock',
			width: 100,
			ellipsis: true,
			renderText: (text) =>
				Number(text) === 0 ? <span style={{ color: CONFIG_LESS['@c_EF394F'] }}>{text}</span> : text,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '采购类型',
			dataIndex: 'source',
			width: 'XS',
			renderText: (text) => pickingPendingSourceTextMap[text],
		},
		{
			title: '提交时间',
			dataIndex: 'timeCreated',
			key: 'pick.time_created',
			width: 'XL',
			hideInSearch: true,
			sorter: true,
			renderText: (time, record) =>
				record.timeCreated ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-',
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 'XXXS',
			fixed: 'right',
			render: (_text, record) => {
				return (
					<div
						className='operation'
						onClick={(e) => {
							e.stopPropagation();
						}}>
						{access['cancel_pick_pending'] && record.status !== 'canceled' && (
							<Popconfirm
								placement='topLeft'
								title='确定取消？'
								onConfirm={handleCancels(record.id)}
								disabled={isCancels}>
								<span className='handleLink'>取消</span>
							</Popconfirm>
						)}
					</div>
				);
			},
		},
	];
	useEffect(() => {
		form.setFieldsValue({ type });
	}, [type]);
	const searchColumns: ProFormColumns = [
		{
			title: '类型',
			dataIndex: 'type',
			valueType: 'tagSelect',
			fieldProps: {
				multiple: false,
				options: tagsData,
				defaultValue: ['goods'],
				onChange: async (value: 'goods' | 'package_ordinary') => {
					console.log('valuevaluevalue', value);

					setType(value);
					setCurrentIndex(value == 'goods' ? '1' : '3');
				},
			},
		},
		{
			title: '提交时间',
			dataIndex: 'timeCreated',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: [
					{
						label: '近三天',
						type: 'day',
						count: -3,
					},
					{
						label: '最近一周',
						type: 'day',
						count: -7,
					},
					{
						label: '近一个月',
						type: 'month',
						count: -1,
					},
				],
			},
		},
		{
			title: '状态',
			dataIndex: 'status',
			valueType: 'select',
			fieldProps: {
				placeholder: '',
				options: pickingPendingStatus,
			},
			initialValue: 'generate_pick_order_pending',
		},
		{
			title: '推送科室',
			dataIndex: 'departmentIds',
			valueType: 'apiSelect',
			fieldProps: {
				api: queryDepartmentList,
				fieldConfig: {
					label: 'departmentName',
					value: 'departmentId',
				},
				onChange: (value: string) => {
					form.resetFields(['warehouseIds']);
					getWareHouseData(value);
				},
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '推送仓库',
			dataIndex: 'warehouseIds',
			valueType: 'select',
			fieldProps: {
				options: warehouseData,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '规格/型号',
			dataIndex: 'commonSearch.specificationAndModel',
		},
		{
			title: '采购类型',
			dataIndex: 'source',
			valueType: 'select',
			fieldProps: {
				options: pickingPendingSource,
			},
		},
		{
			title: '库房',
			dataIndex: 'storageAreaId',
			valueType: 'select',
			fieldProps: {
				placeholder: '请选择',
				options: storageAreaList,
				showSearch: true,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
		},
	];

	// 暴露方法
	useImperativeHandle(comRef, () => ({
		getFormList: () => {
			return getFormList();
		},
	}));

	return (
		<div style={style}>
			<ProTable<PickPendingController.QueryRuleRecord>
				rowKey='id'
				tableInfoCode='pick_pending_goods_list'
				api={queryRule}
				loadConfig={{
					request: false,
				}}
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				onRow={handleRowEvent}
				rowSelection={rowSelection}
				dateFormat={{
					timeCreated: {
						startKey: 'start',
						endKey: 'end',
					},
				}}
				requestCompleted={(rows) => {
					setIsExportFile(rows.length > 0);
				}}
				beforeSearch={(params) => ({ ...params, type: 'goods' })}
				columns={columns}
				tableRef={tableRef}
				toolBarRender={() => [
					access['add_pick_order'] && (
						<>
							<Spin spinning={!isBatchPickUpModal}>
								<Button
									type='primary'
									onClick={onPickOrderBatchClick}
									style={{ width: 114, padding: 0 }}>
									一键生成配货单
								</Button>
							</Spin>
							<Button
								type='primary'
								disabled={totalNumber === 0}
								id='target'
								onClick={openModal}
								style={{ width: loading ? 120 : 100 }}
								loading={loading}>
								生成配货单
							</Button>
						</>
					),
					access['pick_up_readyExport'] && (
						<>
							{
								<ExportFile
									data={{
										filters: { ...tableRef.current?.getParams() },
										link: pickExport,
										getForm: tableRef.current?.getParams,
									}}
									disabled={!isExportFile}
								/>
							}
						</>
					),
				]}
				tableAlertOptionRender={
					<a onClick={() => setSelectedItemList({ '1': [], '3': [] })}>取消选择</a>
				}
			/>
		</div>
	);
};

export default PickingList;
