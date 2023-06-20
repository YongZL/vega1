import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { Dispatch, useModel } from 'umi';

import Breadcrumb from '@/components/Breadcrumb';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Card, Form } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { connect, useAccess } from 'umi';
// import TableBox from '@/components/TableBox';
// import PaginationBox from '@/components/Pagination';
import ExportFile from '@/components/ExportFile';
// import TagSelect, { Mode } from '@/components/TagSelect';
// import DatePickerMore from '@/components/DatePickerMore';
import ProTable from '@/components/ProTable';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';

import api from '@/constants/api';
// import {
//   searchColItem,
//   searchFormItem4,
//   searchFormItemSingle4,
//   searchColItemSingle,
//   searchFormItem6,
//   searchFormItemSingle6,
// } from '@/constants/formLayout';
// import basicStyles from '@/assets/style/basic.less';
import { queryAllDepartmentList, queryGoodsConsumeList, querySuppliersList } from './service';

// const FormItem = Form.Item;

const UnconsumeHistory: React.FC<{ dispatch: Dispatch }> = ({ dispatch, unconsumeHistory }) => {
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const [systemType] = useState<string | null>(sessionStorage.getItem('systemType'));
	const [activeTab, setActiveTab] = useState('goods');
	const [sortList, setSortList] = useState<Array<any> | undefined>(undefined);
	const { pageNum, pageSize } = unconsumeHistory;
	const [form] = Form.useForm();
	const [totalprice, setTotalprice] = useState();
	const [totalquantity, setTotalquantity] = useState();
	const tableRef = useRef<ProTableAction>();
	const [isExportFile, setIsExportFile] = useState(false);
	useEffect(() => {
		fetchList({ pageNum: 0, pageSize: 50 });
	}, [activeTab]);

	const fetchList = (params = {}) => {
		const searchParams = convertSearchParams();
		let queryParams = {
			pageNum,
			pageSize,
			...searchParams,
			sortList,
			...params,
		};
		let requestUrl;
		if (searchParams.tabType === 'goods') {
			requestUrl = 'unconsumeHistory/queryGoodsConsumeList';
		} else if (searchParams.tabType === 'packageBulk') {
			requestUrl = 'unconsumeHistory/queryPackageBulkConsumeList';
		} else {
			requestUrl = 'unconsumeHistory/querySurgicalConsumeList';
		}
		delete queryParams.tabType;
		dispatch({
			type: requestUrl,
			payload: queryParams,
		});
	};

	// 转化表单数据为后端所需参数格式
	const convertSearchParams = () => {
		const values = form.getFieldsValue();
		let params = {
			...values,
			tabType: values.tabType ? values.tabType[0] : undefined,
			distributorId: values.distributorId ? values.distributorId.join(',') : undefined,
			departmentIds: values.departmentIds ? values.departmentIds.join(',') : undefined,
			start: values.consumeTime ? moment(values.consumeTime[0]).valueOf() : undefined,
			end: values.consumeTime ? moment(values.consumeTime[1]).valueOf() : undefined,
		};
		delete params.consumeTime;
		return params;
	};

	const columns: ProColumns<UserController.UserDatumRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 'XXXS',
			align: 'center',
			render: (text, record, index) => {
				return <span>{index + 1}</span>;
			},
		},
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 180,
		},
		{
			title: '反消耗时间',
			dataIndex: 'unconsumeTime',
			key: 'unconsume_time',
			sorter: true,
			width: 180,
			renderText: (text, record: Record<string, any>) => {
				return record.unconsumeTime ? moment(new Date(text)).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '反消耗人',
			dataIndex: 'unconsumeBy',
			key: 'unconsumeBy',
			width: 180,
		},
		{
			title: '反消耗科室',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 100,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 'XS',
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 180,
			ellipsis: true,
		},
		{
			title: '植/介入物',
			dataIndex: 'isImplantation',
			key: 'isImplantation',
			width: 'XXS',
			hideInTable: systemType === 'Insight_RS',
			renderText: (text) => (text ? '是' : '否'),
		},
		{
			title: fields.goodsProperty,
			dataIndex: 'isHighValue',
			key: 'isHighValue',
			width: 'XXS',
			renderText: (text) => (typeof text === 'boolean' ? (text ? '高值' : '低值') : '-'),
		},
		{
			title: '单价(元)',
			dataIndex: 'procurementPrice',
			key: 'procurementPrice',
			width: 'XXS',
			align: 'right',
			renderText: (text) => {
				return <span>{text ? convertPriceWithDecimal(text) : '-'}</span>;
			},
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 'XXS',
		},
		{
			title: '单位',
			dataIndex: 'minGoodsUnit',
			key: 'minGoodsUnit',
			width: 'XXS',
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 'XXS',
			renderText: (text, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 'XS',
			ellipsis: true,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 'XS',
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 'XS',
			renderText: (text, record: Record<string, any>) => {
				return record.productionDate ? moment(new Date(text)).format('YYYY/MM/DD') : '-';
			},
		},
		{
			title: '灭菌日期',
			dataIndex: 'sterilizationDate',
			key: 'sterilizationDate',
			width: 'XS',
			renderText: (text, record: Record<string, any>) => {
				return record.sterilizationDate ? moment(new Date(text)).format('YYYY/MM/DD') : '-';
			},
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 'XS',
			renderText: (text, record: Record<string, any>) => {
				return record.expirationDate ? moment(new Date(text)).format('YYYY/MM/DD') : '-';
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 180,
			ellipsis: true,
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorName',
			key: 'distributorName',
			width: 180,
			ellipsis: true,
		},
	];
	const roleType = [{ label: fields.baseGoods, value: 'goods' }];
	const statusOption = [
		{ label: '是', value: true },
		{ label: '否', value: false },
	];
	const isHighValues = [
		{ label: '高值', value: true },
		{ label: '低值', value: false },
	];

	const searchColumns: ProFormColumns = [
		{
			title: '类型',
			dataIndex: 'tabType',
			valueType: 'tagSelect',
			fieldProps: {
				options: roleType,
			},
		},
		{
			title: '反消耗时间',
			dataIndex: 'consumeTime',
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
			title: '反消耗科室',
			dataIndex: 'departmentIds',
			valueType: 'apiSelect',
			fieldProps: {
				api: queryAllDepartmentList,
				fieldConfig: {
					label: 'departmentName',
					value: 'departmentId',
				},
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			fieldProps: {
				placeholder: '',
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			fieldProps: {
				placeholder: '',
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			fieldProps: {
				placeholder: '',
			},
		},
		{
			title: '植/介入物',
			dataIndex: 'isImplantation',
			valueType: 'select',
			fieldProps: {
				placeholder: '',
				options: statusOption,
			},
			hideInForm: systemType === 'Insight_RS',
		},
		{
			title: fields.goodsProperty,
			dataIndex: 'isHighValue',
			valueType: 'select',
			fieldProps: {
				placeholder: '',
				options: isHighValues,
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			fieldProps: {
				placeholder: '',
			},
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorId',
			valueType: 'apiSelect',
			fieldProps: {
				api: querySuppliersList,
				params: {
					pageNum: 1,
					ageSize: 10000,
				},
				fieldConfig: {
					label: 'companyName',
					value: 'id',
				},
				filterOption: (input: any, option: any) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
	];

	// const tableColumns =
	//   form.getFieldValue('tabType') && form.getFieldValue('tabType')[0] === 'goods'
	//     ? columns
	//     : form.getFieldValue('tabType') && form.getFieldValue('tabType')[0] === 'packageBulk'
	//       ? bulksColumns
	//       : surgicalColumns;

	// const tableInfoIds = {
	//   goods: '102',
	//   packageBulk: '103',
	//   surgicalBulk: '104',
	// };

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<Card>
				<ProTable
					columns={columns}
					rowKey='id'
					api={queryGoodsConsumeList}
					requestCompleted={(rows) => {
						setIsExportFile(rows.length > 0);
					}}
					setRows={(res: Record<string, any>) => {
						const { totalprice, totalquantity, page } = res.data;
						setTotalprice(totalprice);
						setTotalquantity(totalquantity);
						return page;
					}}
					headerTitle={
						<div className='flex flex-between'>
							<div className='tableTitle'>
								{(totalprice || totalprice == 0 || totalquantity || totalquantity == 0) && (
									<div className='tableTitle'>
										<span className='tableAlert'>
											<ExclamationCircleFilled
												style={{
													color: CONFIG_LESS['@c_starus_await'],
													marginRight: '8px',
													fontSize: '12px',
												}}
											/>
											<span
												className='consumeCount'
												style={{ color: CONFIG_LESS['@c_starus_warning'] }}>
												{fields.baseGoods}消耗总数量：
												<span className='count'>{totalquantity || 0}</span>，{fields.baseGoods}
												消耗总金额：￥{convertPriceWithDecimal(totalprice)}
											</span>
										</span>
									</div>
								)}
							</div>
						</div>
					}
					toolBarRender={() => [
						access.unconsume_history_export && (
							<ExportFile
								data={{
									filters: { ...convertSearchParams() },
									link:
										activeTab == 'goods'
											? api.departmentUnConsume.exportGoods
											: activeTab == 'packageBulk'
											? api.departmentUnConsume.exportPackageBulk
											: api.departmentUnConsume.exportSurgical,
									getForm: convertSearchParams,
								}}
								disabled={!isExportFile}
							/>
						),
					]}
					// tableInfoId={tableInfoIds[activeTab]}
					params={{}}
					tableRef={tableRef}
					// tableInfoId="1"
					dateFormat={{
						//把时间字符串转换成时间戳，并改变参数名字
						consumeTime: {
							startKey: 'start',
							endKey: 'end',
						},
					}}
					searchConfig={{
						columns: searchColumns,
					}}
					loadConfig={{
						request: false,
					}}
				/>
			</Card>
		</div>
	);
};

export default connect(({ unconsumeHistory }) => ({
	unconsumeHistory,
}))(UnconsumeHistory);
