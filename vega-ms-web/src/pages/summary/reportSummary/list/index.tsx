import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ResizableTable';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { useDistributorList } from '@/hooks/useDistributorList';
import { findDepartmentAndWarehouse } from '@/services/department';
import { pageList } from '@/services/newGoodsTypes';
import { reportExport, reportTotalData } from '@/services/summaryReport';
import { queryRule } from '@/services/users';
import { getDay, getEndTime, getStartTime } from '@/utils';
import { convertPriceWithDecimal } from '@/utils/format';
import { Form } from 'antd';
import moment from 'moment';
import { useRef, useState } from 'react';
import { useAccess, useModel } from 'umi';
type RowsItem = SummaryReportController.RowsItem;
const ReportSummary = () => {
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const distributorOption = useDistributorList();
	const summaryStock = useRef<Record<string, any>>({});
	const [isDisable, setDisabled] = useState<boolean>(true);
	const [startTime, setStartTime] = useState<Date>(getStartTime());
	const [endTime, setEndTime] = useState<Date>(getEndTime());
	const newDictionary = JSON.parse(sessionStorage.getItem('newDictionary') || '{}');
	const [isExportFile, setIsExportFile] = useState(false);
	const searchTableColumns: ProColumns<RowsItem>[] = [
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
				placeholder: '请输入',
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
			valueType: 'apiSelect',
			dataIndex: 'deliveryId',
			fieldProps: {
				showSearch: true,
				options: distributorOption,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		// {
		//   title: '发票编号',
		//   dataIndex: 'invoiceCode',
		// },
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
			title: '操作人员',
			dataIndex: 'operatorId',
			valueType: 'apiSelect',
			fieldProps: {
				showSearch: true,
				api: queryRule,
				fieldConfig: {
					value: 'id',
					label: 'name',
					key: 'name',
				},
				params: {
					pageNum: 0,
					pageSize: 300,
				},
				filterOption: (input, option) => {
					return option?.key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '物流信息',
			dataIndex: 'logisticsInfo',
			valueType: 'select',
			fieldProps: {
				mode: 'multiple',
				showArrow: true,
				placeholder: '请选择',
				options: [
					{ label: '每日库存', value: '每日库存' },
					{ label: '采购入库', value: '采购入库' },
					{ label: '采购退货', value: '采购退货' },
					{ label: '调拨入库', value: '调拨入库' },
					{ label: '调拨出库', value: '调拨出库' },
					{ label: '盘盈/盘亏', value: '盘盈/盘亏' },
					{ label: '终端消耗', value: '终端消耗' },
					{ label: '终端退货/撤销', value: '终端退货' },
				],
			},
		},
		{
			title: '排序类别',
			dataIndex: 'sortType',
			valueType: 'select',
			fieldProps: {
				placeholder: '请选择',
				options: [
					{ label: '物流日期', value: 'operate_time' },
					{ label: '科室/仓库', value: 'department_id' },
					{ label: fields.distributor, value: 'delivery_id' },
					// { label: '发票编号', value: 'invoice_code' },
				],
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
			title: '排序',
			dataIndex: 'sort',
			valueType: 'radioButton',
			initialValue: 'ASC',
			valueEnum: {
				ASC: { text: '正序', status: 'ASC' },
				DESC: { text: '反序', status: 'DESC' },
			},
			fieldProps: {
				className: 'search-radio-button',
			},
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
	const conversionDate = (time: number | undefined) => {
		return time ? moment(time).format('YYYY-MM-DD/HH:mm:ss') : '';
	};

	//处理价格
	const dealPrice = (value: number | string | undefined) => {
		return value ? convertPriceWithDecimal(value) : '';
	};

	const columns: ProColumns<RowsItem>[] = [
		{
			title: '',
			dataIndex: 'index',
			key: 'index',
			width: 'XXXS',
			ellipsis: true,
			render: (value, record, index) => index + 1,
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
			title: '采购入库数量',
			dataIndex: 'purchaseCount',
			width: 'L',
		},
		{
			title: '采购入库金额',
			dataIndex: 'purchasePrice',
			width: 'L',
			render: (value, record) => dealPrice(record.purchasePrice),
		},
		{
			title: '采购入库时间',
			dataIndex: 'purchaseTime',
			width: 'XXXL',
			render: (value, record) => conversionDate(record.purchaseTime),
		},
		{
			title: '采购退货数量',
			dataIndex: 'purchaseRefundCount',
			width: 'L',
		},
		{
			title: '采购退货金额',
			dataIndex: 'purchaseRefundPrice',
			width: 'L',
			render: (value, record) => dealPrice(record.purchaseRefundPrice),
		},
		{
			title: '采购退货时间',
			dataIndex: 'purchaseRefundTime',
			width: 'XXXL',
			ellipsis: true,
			render: (value, record) => conversionDate(record.purchaseRefundTime),
		},
		{
			title: '调拨入库数量',
			dataIndex: 'transferInCount',
			width: 'L',
		},
		{
			title: '调拨入库金额',
			dataIndex: 'transferInPrice',
			width: 'L',
			render: (value, record) => dealPrice(record.transferInPrice),
		},
		{
			title: '调拨入库时间',
			dataIndex: 'transferInTime',
			width: 'XXXL',
			ellipsis: true,
			render: (value, record) => conversionDate(record.transferInTime),
		},
		{
			title: '调拨出库数量',
			dataIndex: 'transferOutCount',
			width: 'L',
		},
		{
			title: '调拨出库金额',
			dataIndex: 'transferOutPrice',
			width: 'XXL',
			render: (value, record) => dealPrice(record.transferOutPrice),
		},
		{
			title: '调拨出库时间',
			dataIndex: 'transferOutTime',
			width: 'XXXL',
			ellipsis: true,
			render: (value, record) => conversionDate(record.transferOutTime),
		},
		{
			title: '盘盈/盘亏数量',
			dataIndex: 'takingCount',
			width: 'L',
		},
		{
			title: '盘盈/盘亏金额',
			dataIndex: 'takingPrice',
			width: 'L',
			render: (value, record) => dealPrice(record.takingPrice),
		},
		{
			title: '盘盈/盘亏时间',
			dataIndex: 'takingTime',
			width: 'XXXL',
			ellipsis: true,
			render: (value, record) => conversionDate(record.takingTime),
		},
		{
			title: '终端消耗数量',
			dataIndex: 'consumeCount',
			width: 'L',
		},
		{
			title: '终端消耗金额',
			dataIndex: 'consumePrice',
			width: 'L',
			render: (value, record) => dealPrice(record.consumePrice),
		},
		{
			title: '终端消耗时间',
			dataIndex: 'consumeTime',
			width: 'XXXL',
			ellipsis: true,
			render: (value, record) => conversionDate(record.consumeTime),
		},
		{
			title: '终端退货/撤销数量',
			dataIndex: 'returnGoodsCount',
			width: 'L',
		},
		{
			title: '终端退货/撤销金额',
			dataIndex: 'returnGoodsPrice',
			width: 'L',
			render: (value, record) => dealPrice(record.returnGoodsPrice),
		},
		{
			title: '终端退货/撤销原因',
			dataIndex: 'returnGoodsReason',
			width: 'XXL',
			ellipsis: true,
		},
		{
			title: '终端退货/撤销时间',
			dataIndex: 'returnGoodsTime',
			width: 'XXXL',
			ellipsis: true,
			render: (value, record) => conversionDate(record.returnGoodsTime),
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
		// {
		//   title: '发票编号',
		//   dataIndex: 'invoiceCode',
		//   width: 'XXXL',
		//   ellipsis: true,
		// },
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
		{
			title: '备注',
			dataIndex: 'remark',
			width: 'XXXL',
			ellipsis: true,
		},
	];

	const handleQuantity = (name: string) => {
		return summaryStock.current[name] || '0';
	};

	const handlePrice = (name: string) => {
		return convertPriceWithDecimal(summaryStock.current[name] || 0);
	};

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<div className='page-content'>
				<ProTable<RowsItem>
					requestCompleted={(rows) => {
						setIsExportFile(rows.length > 0);
					}}
					tableInfoCode='report_summary'
					columns={columns}
					api={reportTotalData}
					loadConfig={{
						request: false,
					}}
					searchConfig={{
						form,
						columns: searchColumn,
					}}
					setRows={(res: Record<string, any>) => {
						if (isDisable) {
							setDisabled(false);
						}
						let result = res.data.extendedAttr;
						summaryStock.current = result ? result[0] : {};
						return res.data;
					}}
					beforeOnReset={() => {
						setStartTime(getStartTime());
						setEndTime(getEndTime());
					}}
					tableRef={tableRef}
					rowKey={(record, index) => index as number}
					toolBarRender={() => [
						<div>
							{access.report_summary_export && (
								<ExportFile
									className='ml2'
									// disabled={isDisable}
									data={{
										link: reportExport,
										filters: {
											...tableRef.current?.getParams(),
										},
									}}
									disabled={!isExportFile}
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
							logisticsInfo: values.logisticsInfo ? values.logisticsInfo.toString() : undefined,
						};
					}}
					indexKey='index'
					renderSummary={(data, pager) => {
						return {
							consumeCount: handleQuantity('consumeCount'), //终端消耗数量
							consumePrice: handlePrice('consumePrice'), //终端消耗金额
							purchaseCount: handleQuantity('purchaseCount'), //采购入库数量
							purchasePrice: handlePrice('purchasePrice'), //采购入库金额
							purchaseRefundCount: handleQuantity('purchaseRefundCount'), //采购退货数量
							purchaseRefundPrice: handlePrice('purchaseRefundPrice'), //采购退货金额
							returnGoodsCount: handleQuantity('returnGoodsCount'), //终端退货/撤销数量
							returnGoodsPrice: handlePrice('returnGoodsPrice'), //终端退货/撤销金额
							stockCount: handleQuantity('stockCount'), //库存数量
							stockPrice: handlePrice('stockPrice'), //库存金额
							takingCount: handleQuantity('takingCount'), //盘盈/盘亏数量
							takingPrice: handlePrice('takingPrice'), //盘盈/盘亏金额
							transferInCount: handleQuantity('transferInCount'), //调拨入库数量
							transferInPrice: handlePrice('transferInPrice'), //调拨入库金额
							transferOutCount: handleQuantity('transferOutCount'), //调拨出库数量
							transferOutPrice: handlePrice('transferOutPrice'), //调拨出库金额
							goodsName: `共计(${pager.totalCount || 0})`,
						};
					}}
				/>
			</div>
		</div>
	);
};

export default ReportSummary;
