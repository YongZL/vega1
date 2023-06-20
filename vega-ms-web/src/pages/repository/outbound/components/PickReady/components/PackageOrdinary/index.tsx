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
import { useAccess } from 'umi';
import { PickingListType } from '../data';
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
	loading,
}) => {
	const tableRef = useRef<ProTableAction>();
	const [form] = Form.useForm();
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
		getStorageAreaLists('package_ordinary');
	}, []);
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
			width: 'XXS',
			renderText: (_text, _record, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'status',
			width: 'XS',
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
			title: '医耗套包编号',
			dataIndex: 'ordinaryCode',
			width: 'M',
		},
		{
			title: '医耗套包名称',
			dataIndex: 'ordinaryName',
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
			title: '医耗套包说明',
			dataIndex: 'ordinaryDetailGoodsMessage',
			width: 'L',
			render: (_text, record) => (
				<div
					className='detailGoodsMessage'
					title={record.description ? record.description : record.ordinaryDetailGoodsMessage}>
					{record.description ? record.description : record.ordinaryDetailGoodsMessage}
				</div>
			),
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
				defaultValue: ['package_ordinary'],
				onChange: async (value: 'goods' | 'package_ordinary') => {
					setType(value);
					const newIndex = value === 'goods' ? '1' : '3';
					setCurrentIndex(newIndex);
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
			title: '套包编号/名',
			dataIndex: 'keyword',
			fieldProps: {
				placeholder: '请输入',
			},
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
				api={queryRule}
				tableInfoCode='pick_pending_ordinary_list'
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
				beforeSearch={(params) => ({ ...params, type: 'package_ordinary' })}
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
								style={{ width: loading ? 120 : 100, border: 0 }}
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
