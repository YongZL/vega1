import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ResizableTable';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { getDay, getEndTime, getStartTime } from '@/utils';
import { convertPriceWithDecimal } from '@/utils/format';
import { Form } from 'antd';
import moment from 'moment';
import { useRef, useState } from 'react';
import { useAccess, useModel } from 'umi';

import { useDistributorList } from '@/hooks/useDistributorList';
import { findDepartmentAndWarehouse } from '@/services/department';
import { pageList } from '@/services/newGoodsTypes';
import { reportTotalData, stockReportExport } from '@/services/summaryReport';

type RowsItem = SummaryReportController.RowsItem;

const StockQuery = () => {
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const distributorOption = useDistributorList();
	const summaryStock = useRef<Record<string, any>>({});
	// const [isDisable, setDisabled] = useState<boolean>(true);
	const [startTime, setStartTime] = useState<Date>(getStartTime());
	const [endTime, setEndTime] = useState<Date>(getEndTime());
	const newDictionary = JSON.parse(sessionStorage.getItem('newDictionary') || '{}');
	const [isExportFile, setIsExportFile] = useState(false);
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

	const searchColumn: ProFormColumns = [
		{
			title: `${fields.goodsCode}/名称`,
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
				allowClear: false,
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
				allowClear: false,
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
			title: fields.goodsType,
			dataIndex: 'reagentType',
			valueType: 'select',
			fieldProps: {
				showArrow: true,
				mode: 'multiple',
				placeholder: '请选择',
				fieldNames: {
					label: 'name',
					value: 'value',
				},
				options: newDictionary.material_category || [],
			},
		},
		{
			title: '规格',
			dataIndex: 'specification',
		},
		{
			title: fields.distributor,
			valueType: 'select',
			dataIndex: 'deliveryId',
			fieldProps: {
				showSearch: true,
				options: distributorOption,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '科室/仓库',
			valueType: 'apiSelect',
			dataIndex: 'warehouseIds',
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
			title: '生产厂家',
			dataIndex: 'businessName',
		},
		{
			title: '检索字段',
			dataIndex: 'searchField',
		},
		{
			dataIndex: 'remarks',
			valueType: 'remarks',
			fieldProps: {
				remarks: ['*共计库存数量/金额=“最后查询日”库存数量/金额合计'],
			},
		},
	];

	//将时间戳转换成日期
	const conversionDate = (time: number) => {
		return time ? moment(time).format('YYYY-MM-DD/HH:mm:ss') : '';
	};

	//处理价格
	const dealPrice = (value: number) => {
		return value ? convertPriceWithDecimal(value) : '';
	};

	const columns: ProColumns<RowsItem>[] = [
		{
			title: '',
			dataIndex: 'index',
			key: 'index',
			width: 'XXXS',
			ellipsis: true,
			render: (text, record, index) => `${index + 1}`,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			width: 'XXXL',
			ellipsis: true,
		},
		{
			title: '简称',
			dataIndex: 'commonName',
			width: 'XL',
			ellipsis: true,
		},
		{
			title: '品牌名称',
			dataIndex: 'brand',
			width: 'XL',
			ellipsis: true,
		},
		{
			title: '规格',
			dataIndex: 'specification',
			width: 'XL',
			ellipsis: true,
		},
		{
			title: '单位',
			dataIndex: 'unitName',
			width: 'XXS',
			ellipsis: true,
		},
		{
			title: '单价',
			dataIndex: 'price',
			width: 'XL',
			render: (value, record) => dealPrice(record.price),
		},
		{
			title: '库存数量',
			dataIndex: 'stockCount',
			width: 'L',
			render: (value) => {
				return value ? value : '';
			},
		},
		{
			title: '库存金额',
			dataIndex: 'stockPrice',
			width: 'L',
			render: (value, record) => dealPrice(record.stockPrice),
		},
		{
			title: '库存显示时间',
			dataIndex: 'stockTime',
			width: 'XXXL',
			ellipsis: true,
			render: (value, record) => conversionDate(record.stockTime),
		},
		{
			title: '一级科室/仓库',
			dataIndex: 'levelOneWarehouse',
			width: 'XXL',
			ellipsis: true,
		},
		{
			title: '二级科室/仓库',
			dataIndex: 'levelTwoWarehouse',
			width: 'XXL',
			ellipsis: true,
		},
		{
			title: '三级科室/仓库',
			dataIndex: 'levelThreeWarehouse',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '操作人员',
			dataIndex: 'operatorName',
			width: 'S',
			ellipsis: true,
		},
		{
			title: fields.distributor,
			dataIndex: 'deliveryName',
			width: 'XXXL',
			ellipsis: true,
		},
		{
			title: '生产厂家',
			dataIndex: 'businessName',
			width: 'XXXL',
			ellipsis: true,
		},
		{
			title: '批号',
			dataIndex: 'lotNum',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '效期',
			dataIndex: 'expirationDate',
			width: 'M',
			ellipsis: true,
			render: (value, record) => {
				let expirationDate = record.expirationDate;
				return expirationDate ? moment(Number(expirationDate)).format('YYYY-MM-DD') : '';
			},
		},
		{
			title: fields.goodsType,
			dataIndex: 'materialCategory',
			width: 'S',
			ellipsis: true,
		},
	];

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<div className='page-content'>
				<ProTable<RowsItem>
					tableInfoCode='stock_query'
					columns={columns}
					api={reportTotalData}
					loadConfig={{
						request: false,
					}}
					searchConfig={{
						form,
						columns: searchColumn,
					}}
					beforeOnReset={() => {
						setStartTime(getStartTime());
						setEndTime(getEndTime());
					}}
					requestCompleted={(rows) => {
						// if (isDisable) {
						//   setDisabled(false);
						// }
						setIsExportFile(rows.length > 0);
					}}
					headerTitle='库存查询列表'
					tableRef={tableRef}
					rowKey={(record, index) => index as number}
					toolBarRender={() => [
						<div>
							{access.stock_query_export && (
								<ExportFile
									className='ml2'
									disabled={!isExportFile}
									// disabled={isDisable}
									data={{
										link: stockReportExport,
										filters: {
											...tableRef.current?.getParams(),
										},
									}}
								/>
							)}
						</div>,
					]}
					beforeSearch={(values) => {
						return {
							...values,
							startTime: values.startTime ? getDay(values.startTime) : undefined,
							endTime: values.endTime ? getDay(values.endTime, 'end') : undefined,
							warehouseIds: values.warehouseIds ? values.warehouseIds.toString() : undefined,
							reagentType: values.reagentType ? values.reagentType.toString() : undefined,
						};
					}}
					setRows={(res: Record<string, any>) => {
						let result = res.data.extendedAttr;
						summaryStock.current = result ? result[0] : {};
						return res.data;
					}}
					indexKey='index'
					renderSummary={(data, pager) => {
						return {
							stockCount: summaryStock.current.stockCount || '0', //库存数量
							stockPrice: convertPriceWithDecimal(summaryStock.current.stockPrice || 0), //库存金额
							goodsName: `共计(${pager.totalCount || 0})`,
						};
					}}
				/>
			</div>
		</div>
	);
};

export default StockQuery;
