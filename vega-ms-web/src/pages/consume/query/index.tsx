import type { ProColumns, ProTableAction } from '@/components/ProTable';
import type { ProFormColumns } from '@/components/SchemaForm';

import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ResizableTable';
import { getDay, getEndTime, getStartTime, removeRowAttr, setRowAttr } from '@/utils';
import { summary } from '@/utils/dataUtil';
import { convertPriceWithDecimal } from '@/utils/format';
import { Button } from 'antd';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import EditModal from './components/EditModal';

import { findDepartmentAndWarehouse } from '@/services/department';
import { pageList } from '@/services/newGoodsTypes';
import {
	findDistributorInfo,
	findOperatorInfo,
	queryConsumeList,
} from '@/services/scanCountReport';
import { useModel } from 'umi';

const ConsumeQuery = () => {
	const [startTime, setStartTime] = useState<Date>(getStartTime());
	const [endTime, setEndTime] = useState<Date>(getEndTime());
	const [selectRowData, setSelectRowData] = useState<Record<string, any>>();
	const tableElRef = useRef<Element>();
	const tableRef = useRef<ProTableAction>();
	const { fields } = useModel('fieldsMapping');

	// 列表行点击
	const onRowClick = (record: any, index: number) => {
		setRowAttr({
			tableEl: tableElRef.current as Element,
			index,
		});
		if (record.operationType === '消耗') {
			setSelectRowData(record);
		} else {
			setSelectRowData(undefined);
		}
	};

	const onFinish = () => {
		removeRowAttr(tableElRef.current as Element);
		setSelectRowData(undefined);
		tableRef.current?.reload();
	};

	useEffect(() => {
		setTimeout(() => {
			tableRef.current?.submit();
		}, 200);
	}, []);

	const searchTableColumns: ProColumns<Record<string, any>>[] = [
		{
			title: '',
			dataIndex: 'index',
			key: 'index',
			width: 60,
			render: (text, record, index) => `${index + 1}`,
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			ellipsis: true,
		},
		{
			title: '规格',
			dataIndex: 'specification',
			width: '18%',
			ellipsis: true,
		},
		{
			title: '单位',
			dataIndex: 'minGoodsUnit',
			width: 60,
			ellipsis: true,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			ellipsis: true,
		},
	];

	const searchColumns: ProFormColumns = [
		{
			title: `${fields.goods}号/名`,
			valueType: 'selectTable',
			dataIndex: 'goodsId',
			fieldProps: {
				api: pageList,
				searchKey: 'goodsName',
				labelKey: 'name',
				valueKey: 'id',
				filterData: (res: ResponseList<NewGoodsTypesController.GoodsRecord[]>) => {
					return res.data.rows;
				},
				params: {
					pageNum: 0,
					pageSize: 100,
				},
				tableProps: {
					rowKey: 'id',
					columns: searchTableColumns,
				},
			},
		},
		{
			title: '起始日期',
			valueType: 'datePicker',
			dataIndex: 'startTime',
			fieldProps: {
				inputReadOnly: true,
				onChange: (value: Date) => {
					setStartTime(value || '');
				},
				disabledDate: (current) => {
					return current && current >= moment(endTime).endOf('day');
				},
			},
			initialValue: moment(getStartTime()),
		},
		{
			title: '截止日期',
			valueType: 'datePicker',
			dataIndex: 'endTime',
			fieldProps: {
				inputReadOnly: true,
				onChange: (value: Date) => {
					setEndTime(value || '');
				},
				disabledDate: (current) => {
					return current && current <= moment(startTime).startOf('day');
				},
			},
			initialValue: moment(getEndTime()),
		},
		{
			title: '科室/仓库',
			valueType: 'apiSelect',
			dataIndex: 'warehouseId',
			fieldProps: {
				showSearch: true,
				mode: 'multiple',
				showArrow: true,
				/* @ts-ignore */
				fieldConfig: {
					value: 'warehouseId',
					label: 'warehouseName',
					key: 'warehouseName',
				},
				api: findDepartmentAndWarehouse,
				filterOption: (input, option) => {
					return option?.key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '操作人员',
			valueType: 'apiSelect',
			dataIndex: 'createdBy',
			fieldProps: {
				showSearch: true,
				api: findOperatorInfo,
				fieldConfig: {
					value: 'orgId',
					label: 'orgName',
					key: 'orgName',
				},
				filterOption: (input, option) => {
					return option?.key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '操作类别',
			valueType: 'select',
			dataIndex: 'operationType',
			fieldProps: {
				options: [
					{ key: 'consume', value: 'consume', label: '消耗' },
					{ key: 'return', value: 'return', label: '退货' },
					{ key: 'revoke', value: 'revoke', label: '撤销' },
				],
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'businessName',
		},
		{
			title: fields.distributor,
			valueType: 'apiSelect',
			dataIndex: 'distributorId',
			fieldProps: {
				showSearch: true,
				api: findDistributorInfo,
				fieldConfig: {
					label: 'orgName',
					value: 'orgId',
					key: (record: Record<string, any>) => record.orgName + record.nameAcronym,
				},
				filterOption: (input, option) => {
					return option?.key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '检索字段',
			dataIndex: 'searchField',
		},
	];

	const columns: ProColumns<Record<string, any>>[] = [
		{
			title: '',
			dataIndex: 'index',
			key: 'index',
			width: 60,
			ellipsis: true,
			render: (text, record, index) => {
				return record.index ? record.index : `${index + 1}`;
			},
		},
		{
			title: '操作类别',
			dataIndex: 'operationType',
			width: 130,
			ellipsis: true,
		},
		{
			title: '操作时间',
			dataIndex: 'operationTime',
			width: 215,
			renderText: (text: number) => {
				return text ? moment(text).format('YYYY-MM-DD/HH:mm:ss') : '';
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'goodsMaterialCode',
			width: 180,
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			width: 336,
			ellipsis: true,
		},
		{
			title: `${fields.goods}条码`,
			dataIndex: 'goodsBarcode',
			width: 250,
			ellipsis: true,
		},
		{
			title: '扫描/人工分拆次数',
			dataIndex: 'quantity',
			width: 200,
			ellipsis: true,
			render: (text, record) => {
				let scanQuantity = record.quantity || 0;
				let splitQuantity = record.splitQuantity || 0;
				return scanQuantity + splitQuantity || '-';
			},
		},
		{
			title: '单次容量',
			dataIndex: 'scanCapacity',
			width: 180,
			ellipsis: true,
			render: (text, record) => {
				let capacityUnit = record.unitMl || '',
					scanCapacity = record.scanCapacity || '';
				return scanCapacity && scanCapacity + capacityUnit;
			},
		},
		{
			title: '剩余容量',
			dataIndex: 'returnRemainingCapacity',
			width: 180,
			ellipsis: true,
			render: (text, record) => {
				let capacityUnit = record.unitMl || '',
					remainingCapacity = record.returnRemainingCapacity;
				return (remainingCapacity || remainingCapacity == 0) && remainingCapacity + capacityUnit;
			},
		},
		{
			title: '规格',
			dataIndex: 'specification',
			width: 180,
			ellipsis: true,
		},
		{
			title: '单位',
			dataIndex: 'unit',
			width: 100,
			ellipsis: true,
		},
		{
			title: '容量/单位',
			dataIndex: 'capacityUnit',
			width: 180,
			ellipsis: true,
		},
		{
			title: '批号',
			dataIndex: 'lotNum',
			width: 180,
			ellipsis: true,
		},
		{
			title: '效期',
			dataIndex: 'expirationDate',
			width: 130,
			renderText: (text, record) => {
				const { expirationDate, validPeriod } = record;
				return expirationDate ? (
					<span style={{ color: validPeriod ? CONFIG_LESS['@c_starus_warning'] : '' }}>
						{moment(expirationDate).format('YYYY-MM-DD')}
					</span>
				) : (
					'-'
				);
			},
		},
		{
			title: '设备名称',
			dataIndex: 'equipmentNames',
			width: 180,
			ellipsis: true,
		},
		{
			title: '设备编号',
			dataIndex: 'equipmentCodes',
			width: 180,
			ellipsis: true,
		},
		{
			title: '设备条码',
			dataIndex: 'equipmentmaterialCodes',
			width: 180,
			ellipsis: true,
		},
		{
			title: '科室/仓库',
			dataIndex: 'warehouseName',
			width: 180,
			ellipsis: true,
		},
		{
			title: '操作人员',
			dataIndex: 'createdName',
			width: 120,
			ellipsis: true,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 336,
			ellipsis: true,
		},
		{
			title: '退货/撤销数量',
			dataIndex: 'retNum',
			width: 150,
			ellipsis: true,
		},
		{
			title: '退货/撤销容量',
			dataIndex: 'retCapacity',
			width: 150,
			ellipsis: true,
			render: (text, record) => {
				const { unitMl, retCapacity } = record;
				let unitMls = retCapacity ? unitMl || '' : '',
					retCapacitys = retCapacity || '';
				return retCapacitys + unitMls;
			},
		},
		{
			title: '退货/撤销原因',
			dataIndex: 'reason',
			width: 200,
			ellipsis: true,
		},
		{
			title: '备注',
			dataIndex: 'remark',
			width: 440,
			ellipsis: true,
		},
		{
			title: '单价',
			dataIndex: 'unitPrice',
			width: 180,
			renderText: (text?: string | number) => {
				return text ? convertPriceWithDecimal(text) : '';
			},
		},
		{
			title: '金额',
			dataIndex: 'amount',
			width: 180,
			renderText: (text?: string | number) => {
				return text ? convertPriceWithDecimal(text) : '';
			},
		},
	];

	useEffect(() => {
		tableElRef.current = document.querySelector('.consume-query-table') as Element;
	}, []);

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<div className='page-content'>
				<ProTable
					rowKey='id'
					tableInfoCode='consumeQuery'
					api={queryConsumeList}
					columns={columns}
					tableClassName='consume-query-table'
					searchConfig={{
						columns: searchColumns,
					}}
					tableRef={tableRef}
					loadConfig={{
						request: false,
					}}
					beforeOnReset={() => {
						setStartTime(getStartTime());
						setEndTime(getEndTime());
					}}
					toolBarRender={() => [
						<EditModal
							detail={selectRowData}
							onFinish={onFinish}
							key='edit'
							trigger={
								<Button
									type='primary'
									style={{ marginLeft: 10 }}
									disabled={!selectRowData}>
									退货/撤销编辑
								</Button>
							}
						/>,
					]}
					beforeSearch={(values) => {
						return {
							...values,
							startTime: values.startTime ? getDay(values.startTime) : undefined,
							endTime: values.endTime ? getDay(values.endTime, 'end') : undefined,
							warehouseId: values.warehouseId ? values.warehouseId.toString() : undefined,
						};
					}}
					onRow={(record: any, index?: number) => ({
						onClick: () => {
							if (index === (tableRef.current?.getDataSource() || []).length) {
								setSelectRowData(undefined);
								return;
							}
							onRowClick(record, index as number);
						},
					})}
					indexKey='index'
					renderSummary={(data, pager) => {
						return {
							amount: convertPriceWithDecimal(summary(data, 'amount')),
							operationType: `共计(${pager.totalCount || 0})`,
							id: -1,
						};
					}}
				/>
			</div>
		</div>
	);
};

export default ConsumeQuery;
