import Breadcrumb from '@/components/Breadcrumb';
import CascaderSelect from '@/components/CascaderSelect';
import DatePickerMore from '@/components/DatePickerMore';
import ExportFile from '@/components/ExportFile';
import PaginationBox from '@/components/Pagination';
import TableBox from '@/components/TableBox';
import TagSelect, { Mode } from '@/components/TagSelect';
import { useDepartmentList } from '@/hooks/useDepartmentList';
import { calColumnsWidth, getDay, removeColumItemByKey, replaceColumItemByData } from '@/utils';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Row, Select } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { connect, useModel } from 'umi';

import basicStyles from '@/assets/style/basic.less';
import api from '@/constants/api';
import { stockOperationType, stockOperationTypeTextMap } from '@/constants/dictionary';
import {
	searchColItem,
	searchColItemSingle,
	searchFormItem4,
	searchFormItem6,
	searchFormItemSingle4,
} from '@/constants/formLayout';

const FormItem = Form.Item;

const StockOperation = ({ loading, dispatch, stockOperation, global }) => {
	const newDictionary = JSON.parse(sessionStorage.getItem('newDictionary') || '{}');
	const { fields } = useModel('fieldsMapping');
	const [activeTab, setActiveTab] = useState('goods');
	const [sortList, setSortList] = useState<Array<any> | undefined>(undefined);
	const [expand, setExpand] = useState(true);
	const { pageNum, pageSize, total, list } = stockOperation;
	const [form] = Form.useForm();
	const departmentList = useDepartmentList();
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const [sortedInfo, setSortedInfo] = useState({});
	const [sourceList, setSourceList] = useState([]);
	const [targetList, setTargetList] = useState([]);

	useEffect(() => {
		fetchList({ pageNum: 0, pageSize: 50 });
	}, [activeTab]);

	useEffect(() => {
		const list = (departmentList || []).map((department) => {
			return {
				value: String(department.id),
				label: department.name,
				isLeaf: false,
			};
		});
		setSourceList(list);
		setTargetList(list);
	}, [departmentList]);

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
			requestUrl = 'stockOperation/queryGoodsList';
		} else if (searchParams.tabType === 'packageBulk') {
			requestUrl = 'stockOperation/queryPackageBulkList';
		} else {
			requestUrl = 'stockOperation/querySurgicalList';
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
			typeList: values.type ? values.type : undefined,
			departmentIds: values.departmentIds ? values.departmentIds.join(',') : undefined,
			timeOperateStart: values.timeOperate ? getDay(values.timeOperate[0]) : undefined,
			timeOperateEnd: values.timeOperate ? getDay(values.timeOperate[1], 'end') : undefined,
			fromDepartmentIds: values.goodsSource ? values.goodsSource[0] : undefined,
			fromWareHouseIds:
				values.goodsSource && values.goodsSource[1] ? values.goodsSource[1] : undefined,
			targetDepartmentIds: values.goodsTarget ? values.goodsTarget[0] : undefined,
			targetWarehouseIds:
				values.goodsTarget && values.goodsTarget[1] ? values.goodsTarget[1] : undefined,
		};
		delete params.consumeTime;
		delete params.goodsSource;
		delete params.goodsTarget;
		delete params.timeOperate;
		delete params.type;
		return params;
	};

	// form查询
	const onFinishSearch = () => {
		fetchList({ pageNum: 0, pageSize: 50 });
	};
	// form重置
	const onResetSerach = () => {
		form.resetFields();
		form.setFieldsValue({
			tabType: [activeTab],
		});
		setSortList(undefined);
		setSortedInfo({});
		fetchList({ pageNum: 0, pageSize: 50, sortList: {} });
	};

	const columns = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render: (text, record, index) => {
				return <span>{index + 1}</span>;
			},
		},
		{
			title: '操作类型',
			dataIndex: 'type',
			key: 'type',
			width: 120,
			render: (text) => {
				return <span>{stockOperationTypeTextMap[text]}</span>;
			},
		},
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 160,
		},
		{
			title: '科室',
			dataIndex: 'departmentIds',
			key: 'departmentIds',
			width: 200,
			render: (text, record) => {
				return (
					<span>
						{record.fromDepartmentName ? record.fromDepartmentName : '⚪'} →
						{record.targetDepartmentName ? record.targetDepartmentName : '⚪'}
					</span>
				);
			},
		},
		{
			title: '仓库',
			dataIndex: 'wareHouseIds',
			key: 'wareHouseIds',
			width: 200,
			render: (text, record) => {
				return (
					<span>
						{record.fromWareHouseName ? record.fromWareHouseName : '⚪'} →
						{record.targetWarehouseName ? record.targetWarehouseName : '⚪'}
					</span>
				);
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 130,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 150,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 160,
			ellipsis: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 100,
			align: 'right',
			render: (text) => {
				return <span>{text ? convertPriceWithDecimal(text) : '0.00'}</span>;
			},
		},
		{
			title: '数量',
			dataIndex: 'remainQuantity',
			key: 'remainQuantity',
			width: 100,
		},
		{
			title: '单位',
			dataIndex: 'unitName',
			key: 'unitName',
			width: 70,
		},
		{
			title: `入库${fields.baseGoods}金额`,
			dataIndex: 'amount',
			key: 'amount',
			width: 120,
			align: 'right',
			render: (text: number) => {
				return <span>{text ? convertPriceWithDecimal(text) : '0'}</span>;
			},
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			render: (text: any, record: { specification: any; model: any }) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 120,
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 120,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'productionDate' && sortedInfo.order,
			render: (text) => <span>{text ? moment(text).format('YYYY/MM/DD') : '-'}</span>,
		},
		{
			title: '灭菌日期',
			dataIndex: 'sterilizationDate',
			key: 'sterilizationDate',
			width: 120,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'sterilizationDate' && sortedInfo.order,
			render: (text) => <span>{text ? moment(text).format('YYYY/MM/DD') : '-'}</span>,
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 120,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'expirationDate' && sortedInfo.order,
			render: (text) => <span>{text ? moment(text).format('YYYY/MM/DD') : '-'}</span>,
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

		{
			title: '来源科室',
			dataIndex: 'fromDepartmentName',
			key: 'fromDepartmentName',
			width: 120,
			ellipsis: true,
		},
		{
			title: '来源仓库',
			dataIndex: 'fromWareHouseName',
			key: 'fromWareHouseName',
			width: 120,
			ellipsis: true,
		},
		{
			title: '目标科室',
			dataIndex: 'targetDepartmentName',
			key: 'targetDepartmentName',
			width: 120,
			ellipsis: true,
		},
		{
			title: '目标仓库',
			dataIndex: 'targetWarehouseName',
			key: 'targetWarehouseName',
			width: 120,
			ellipsis: true,
		},
		{
			title: '操作时间',
			dataIndex: 'timeOperate',
			key: 'timeOperate',
			width: 160,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'timeOperate' && sortedInfo.order,
			render: (text) => {
				return <span>{text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : ''}</span>;
			},
		},
		{
			title: '操作人',
			dataIndex: 'operatorName',
			key: 'operatorName',
			width: 120,
		},
	];

	const bulksColumns = removeColumItemByKey(
		replaceColumItemByData(columns, 'goodsName', {
			title: '定数包名称',
			dataIndex: 'packageBulkName',
			key: 'packageBulkName',
			width: 150,
			ellipsis: true,
		}),
		[
			'price',
			'remainQuantity',
			'chargeNum',
			'unitName',
			'specification',
			'model',
			'lotNum',
			'productionDate',
			'sterilizationDate',
			'expirationDate',
			'manufacturerName',
			'custodianName',
			'supplierName',
		],
	);
	const surgicalColumns = replaceColumItemByData(bulksColumns, 'packageBulkName', {
		title: '手术套包名称',
		dataIndex: 'surgicalPackageName',
		key: 'surgicalPackageName',
		width: 150,
		ellipsis: true,
	});
	const tableColumns =
		form.getFieldValue('tabType') && form.getFieldValue('tabType')[0] === 'goods'
			? columns
			: form.getFieldValue('tabType') && form.getFieldValue('tabType')[0] === 'packageBulk'
			? bulksColumns
			: surgicalColumns;

	const tableInfoIds = {
		goods: '80',
		packageBulk: '81',
		surgicalBulk: '82',
	};

	return (
		<div>
			<Breadcrumb config={['', '']} />
			<Card>
				<Form
					form={form}
					onFinish={onFinishSearch}
					labelAlign='left'
					{...searchFormItem4}>
					<div className='searchWrap'>
						<Row className='searchForm'>
							<Row style={{ width: '100%' }}>
								<Col {...searchColItemSingle}>
									<FormItem
										name='tabType'
										label='类型'
										initialValue={['goods']}
										{...searchFormItemSingle4}>
										<TagSelect
											hideCheckAll={true}
											mode={Mode.single}
											onChange={(value) => {
												form.resetFields();
												form.setFieldsValue({
													tabType: value,
												});
												setActiveTab(value[0]);
											}}>
											<TagSelect.Option
												key={'goods'}
												value={'goods'}>
												{fields.baseGoods}
											</TagSelect.Option>
											<TagSelect.Option
												key={'packageBulk'}
												value={'packageBulk'}>
												定数包
											</TagSelect.Option>
											{/* <TagSelect.Option key={'surgicalBulk'} value={'surgicalBulk'}>
                        手术套包
                      </TagSelect.Option> */}
										</TagSelect>
									</FormItem>
								</Col>
								<div className={expand ? basicStyles['boxWidth100'] : basicStyles['dis-n']}>
									<Row style={{ width: '100%' }}>
										<Col {...searchColItemSingle}>
											<FormItem
												name='timeOperate'
												label='操作时间'
												{...searchFormItemSingle4}>
												<DatePickerMore
													format={['YYYY-MM-DD', 'YYYY/MM/DD']}
													type='M'
												/>
											</FormItem>
										</Col>
									</Row>
									<Row>
										<Col {...searchColItem}>
											<FormItem
												name='type'
												label='操作类型'>
												<Select
													placeholder='请选择'
													allowClear
													options={stockOperationType}
												/>
											</FormItem>
										</Col>
										<Col {...searchColItem}>
											<FormItem
												name='goodsSource'
												label='来源科室'>
												<CascaderSelect
													options={sourceList}
													loadUrl={api.warehouses.warehouseListbyIds}
													loadParams={'departmentIds'}
													updateOptions={(list) => setSortList(list)}
												/>
											</FormItem>
										</Col>
										<Col {...searchColItem}>
											<FormItem
												name='goodsTarget'
												label='目标科室'>
												<CascaderSelect
													options={targetList}
													loadUrl={api.warehouses.warehouseListbyIds}
													loadParams={'departmentIds'}
													updateOptions={(list) => setTargetList(list)}
												/>
											</FormItem>
										</Col>
										<Col {...searchColItem}>
											<FormItem
												name='operatorBarcode'
												label={`${fields.goods}条码`}>
												<Input
													maxLength={30}
													placeholder='请输入'
												/>
											</FormItem>
										</Col>
										<Col {...searchColItem}>
											<FormItem
												name='materialCode'
												label={fields.goodsCode}>
												<Input
													maxLength={30}
													placeholder='请输入'
												/>
											</FormItem>
										</Col>
										{form.getFieldValue('tabType') &&
										form.getFieldValue('tabType')[0] !== 'goods' ? (
											<Col {...searchColItem}>
												<FormItem
													name={
														form.getFieldValue('tabType')[0] === 'packageBulk'
															? 'packageBulkName'
															: 'surgicalPackageName'
													}
													label={
														form.getFieldValue('tabType')[0] === 'packageBulk'
															? '定数包名称'
															: '套包名称'
													}
													{...(form.getFieldValue('tabType')[0] === 'packageBulk'
														? { ...searchFormItem6 }
														: { ...searchFormItem4 })}>
													<Input
														maxLength={30}
														placeholder='请输入'
													/>
												</FormItem>
											</Col>
										) : null}
										{form.getFieldValue('tabType') &&
										form.getFieldValue('tabType')[0] !== 'surgicalBulk' ? (
											<Col {...searchColItem}>
												<FormItem
													name='goodsName'
													label={fields.goodsName}>
													<Input
														maxLength={30}
														placeholder='请输入'
													/>
												</FormItem>
											</Col>
										) : null}
										{form.getFieldValue('tabType') &&
										form.getFieldValue('tabType')[0] === 'goods' ? (
											<Col {...searchColItem}>
												<FormItem
													name='chargeNum'
													label='本地医保编码'
													{...searchFormItem6}>
													<Input
														maxLength={30}
														placeholder='请输入'
													/>
												</FormItem>
											</Col>
										) : null}
										{form.getFieldValue('tabType') &&
										form.getFieldValue('tabType')[0] === 'goods' ? (
											<Col {...searchColItem}>
												<FormItem
													name='materialCategory'
													label={fields.goodsType}>
													<Select
														placeholder='请选择'
														allowClear>
														{(newDictionary.material_category || []).map((item) => {
															return (
																<Select.Option
																	value={item.value}
																	key={item.value}>
																	{item.name}
																</Select.Option>
															);
														})}
													</Select>
												</FormItem>
											</Col>
										) : null}
									</Row>
								</div>
							</Row>
						</Row>
						<div className='searchBtn'>
							<Button
								type='primary'
								htmlType='submit'>
								查询
							</Button>
							<Button onClick={onResetSerach}>重置</Button>
							<a
								onClick={() => {
									setExpand(!expand);
								}}>
								{expand ? (
									<>
										收起 <UpOutlined />
									</>
								) : (
									<>
										展开 <DownOutlined />
									</>
								)}
							</a>
						</div>
					</div>
				</Form>
				<TableBox
					toolBarRender={() => [
						permissions.includes('stock_operation_export') && (
							<ExportFile
								data={{
									filters: { ...convertSearchParams() },
									link:
										form.getFieldValue('tabType') && form.getFieldValue('tabType')[0] === 'goods'
											? api.stock_operation.goods_export
											: form.getFieldValue('tabType') &&
											  form.getFieldValue('tabType')[0] === 'packageBulk'
											? api.stock_operation.package_bulk_export
											: api.stock_operation.package_surgical_export,
									getForm: convertSearchParams,
								}}
							/>
						),
					]}
					tableInfoId={tableInfoIds[activeTab]}
					options={{
						reload: () => fetchList({}),
					}}
					rowKey='id'
					dataSource={list}
					columns={calColumnsWidth(tableColumns, false)}
					scroll={{
						x: '100%',
						y: global.scrollY,
					}}
					loading={loading}
					onChange={(pagination, filter, sorter) => {
						setSortedInfo(sorter);
						const sortParams = Array.isArray(sorter)
							? sorter.map((item) => {
									return {
										desc: item.order === 'descend',
										sortName: item.columnKey,
									};
							  })
							: sorter.order
							? [
									{
										desc: sorter.order === 'descend',
										sortName: sorter.columnKey,
									},
							  ]
							: undefined;
						setSortList(sortParams);
						fetchList({ sortList: sortParams });
					}}
				/>
				{total ? (
					<PaginationBox
						data={{ total, pageNum, pageSize }}
						pageChange={(cur: number, size: number) => fetchList({ pageNum: cur, pageSize: size })}
					/>
				) : null}
			</Card>
		</div>
	);
};

export default connect(({ loading, stockOperation, global }) => ({
	loading:
		loading.effects['stockOperation/queryGoodsList'] ||
		loading.effects['stockOperation/queryPackageBulkList'] ||
		loading.effects['stockOperation/querySurgicalList'],
	stockOperation,
	global,
}))(StockOperation);
