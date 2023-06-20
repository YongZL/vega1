import Breadcrumb from '@/components/Breadcrumb';
import DatePickerMore from '@/components/DatePickerMore';
import ExportFile from '@/components/ExportFile';
import PaginationBox from '@/components/Pagination';
import TableBox from '@/components/TableBox';
import { useDepartmentList } from '@/hooks/useDepartmentList';
import { calColumnsWidth } from '@/utils';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, Cascader, Col, Form, Input, Row, Select } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';
import { connect, useAccess, useModel } from 'umi';
import DetailModal from './Detail/index';

import { isHightValue, isHightValueTextMap, yesOrNo, yesOrNoTextMap } from '@/constants/dictionary';
import {
	searchColItem,
	searchColItemSingle,
	searchFormItem4,
	searchFormItemSingle4,
} from '@/constants/formLayout';
import { getAllGoods12 as getType12, getAllGoods18 as getType18 } from '@/services/category';
import { getAllGoods95 as getType95 } from '@/services/std95GoodsCategory';

import basicStyles from '@/assets/style/basic.less';
import api from '@/constants/api';

export enum DetailType {
	/**
	 * 科室消耗
	 */
	internal = 'internal',
	/**
	 * 外部消耗
	 */
	external = 'external',
	/**
	 * 分摊消耗
	 */
	shared = 'shared',
	/**
	 * 所有消耗
	 */
	all = 'all',
}

const CostCentral: FC<any> = ({ costCentral, global, loading, dispatch }) => {
	const systemType = sessionStorage.getItem('systemType');
	const access = useAccess();
	const [singleCostInfo, setSingleCostInfo] = useState({});
	const [type, setType] = useState(undefined);
	const [modalVisible, setModalVisible] = useState(false);
	const [isConsumableMaterial, setIsConsumableMaterial] = useState(undefined);
	const [expand, setExpand] = useState(true);
	const [treeData, setTreeData] = useState([]);
	const [form] = Form.useForm();
	const { list, pageNum, pageSize, total } = costCentral;
	const departmentList = useDepartmentList();
	const { fields } = useModel('fieldsMapping');

	// 转化表单数据为后端所需参数格式
	const convertSearchParams = () => {
		const values = form.getFieldsValue();
		const params = {
			...values,
			departmentIds: values.departmentIds ? values.departmentIds.join(',') : undefined,
			periodName: values.periodName ? values.periodName.format('YYYY年MM月') : undefined,
			implantation: values.implantation || undefined,
			highValue: values.highValue,
			medicalEquipment: values.medicalEquipment,
			category: values.categoryType ? 'std20' + values.categoryType : undefined,
			classification:
				values.categoryType && values.category && values.category[0]
					? values.category[0]
					: undefined,
			firstClass:
				values.categoryType && values.category && values.category[1]
					? values.category[1].split('-')[0]
					: undefined,
			lastClass:
				values.categoryType && values.category && values.category[2]
					? values.category[2]
					: values.category
					? values.category[values.category.length - 1]
					: undefined,
		};
		return params;
	};

	const fetchList = (params = {}) => {
		const searchParams = convertSearchParams();
		dispatch({
			type: 'costCentral/queryCostCentralList',
			payload: {
				pageNum,
				pageSize,
				...searchParams,
				...params,
			},
		});
	};

	// form查询
	const onFinishSearch = () => {
		fetchList({ pageNum: 0, pageSize: 50 });
	};
	// form重置
	const onResetSerach = () => {
		form.resetFields();
		setIsConsumableMaterial(undefined);
		fetchList({ pageNum: 0, pageSize: 50, sortList: undefined });
	};

	// 查看详情
	const getDetail = (record, type) => {
		setSingleCostInfo(record);
		setType(type);
		setModalVisible(true);
	};

	const reseetCategoryList = (val: string) => {
		form.setFieldsValue({
			category: [],
		});
		getGoodsCategory(val);
	};

	// 获取基础物资分类列表
	const getGoodsCategory = async (type: string) => {
		let res = '';
		switch (type) {
			case '12':
				res = await getType12();
				break;
			case '18':
				res = await getType18();
				break;
			case '95':
				res = await getType95();
				break;
			default:
				break;
		}
		if (res && res.code === 0) {
			const data = getCascaderData(res.data, type);
			setTreeData(data);
		}
	};

	const getCascaderData = (data, type) => {
		return data && data.length
			? data.map((o) => {
					var oNew = {
						label: type == '95' ? o.name : o.code,
						key: o.id,
						value: o.children ? o.id : o.code,
						children: getCascaderData(o.children, type),
					};
					if (!oNew.children) delete oNew.children;
					return oNew;
			  })
			: undefined;
	};

	useEffect(() => {
		fetchList();
	}, []);

	const columns = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			render: (text, redord, index) => <span>{index + 1}</span>,
			width: 80,
		},
		{
			title: '结算周期',
			dataIndex: 'settlementPeriod',
			key: 'vfcs.time_to',
			sorter: true,
			width: 200,
			render: (text, record) => {
				return (
					<span>
						{moment(record.timeFrom).format('YYYY/MM/DD')}～
						{moment(record.timeTo).format('YYYY/MM/DD')}
					</span>
				);
			},
		},
		{
			title: '科室',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 120,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 130,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 160,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			render: (text: any, record: any) => {
				let info = `${record.specification || ''} ${
					(record.specification && record.model && '/') || ''
				} ${record.model || ''}`;
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 160,
		},
		{
			title: '条码管控',
			dataIndex: 'barcodeControlled',
			key: 'barcodeControlled',
			width: 80,
			render: (text, record) => {
				return <span>{text ? '是' : '否'}</span>;
			},
		},
		{
			title: fields.goodsProperty,
			dataIndex: 'highValue',
			key: 'highValue',
			width: 80,
			renderText: (text) => {
				return <span>{isHightValueTextMap[text] || '-'}</span>;
			},
		},
		...(systemType !== 'Insight_RS'
			? [
					{
						title: '植/介入物',
						dataIndex: 'implantation',
						key: 'implantation',
						width: 100,
						render: (text) => {
							return <span>{yesOrNoTextMap[text]}</span>;
						},
					},
			  ]
			: []),
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 140,
			align: 'right',
			render: (text) => {
				return <span>{convertPriceWithDecimal(text)}</span>;
			},
		},
		{
			title: '科室消耗数量',
			dataIndex: 'internalConsumedQuantity',
			key: 'internalConsumedQuantity',
			width: 120,
			render: (text, record) => {
				if (!text) {
					return <span>0</span>;
				}
				return (
					<span
						className='handleLink'
						onClick={() => getDetail(record, DetailType.internal)}>
						{text}
					</span>
				);
			},
		},
		{
			title: '外部消耗数量',
			dataIndex: 'externalConsumedQuantity',
			key: 'externalConsumedQuantity',
			width: 120,
			render: (text, record) => {
				if (!text) {
					return <span>0</span>;
				}
				return (
					<span
						className='handleLink'
						onClick={() => getDetail(record, DetailType.external)}>
						{text}
					</span>
				);
			},
		},
		{
			title: '分摊消耗数量',
			dataIndex: 'sharedConsumedQuantity',
			key: 'sharedConsumedQuantity',
			width: 120,
			render: (text, record) => {
				if (!text) {
					return <span>0</span>;
				}
				return (
					<span
						className='handleLink'
						onClick={() => getDetail(record, DetailType.shared)}>
						{text}
					</span>
				);
			},
		},
		{
			title: '成本(元)',
			dataIndex: 'Cost',
			key: 'Cost',
			width: 150,
			align: 'right',
			render: (text, record) => {
				return (
					<span>
						{convertPriceWithDecimal(
							record.price *
								(record.internalConsumedQuantity +
									record.externalConsumedQuantity +
									record.sharedConsumedQuantity),
						)}
					</span>
				);
			},
		},
		{
			title: '医疗器械',
			dataIndex: 'medicalEquipment',
			key: 'medicalEquipment',
			width: 80,
			render: (text, record) => {
				return <span>{yesOrNoTextMap[text]}</span>;
			},
		},
		{
			title: '级别',
			dataIndex: 'classification',
			key: 'classification',
			width: 120,
		},
		{
			title: '大类',
			dataIndex: 'subCatelogName',
			key: 'subCatelogName',
			width: 120,
			render: (text, record) => {
				let subCatelogName = record.subCatelogName;
				return record.medicalEquipment ? record.subCatelogCode + subCatelogName : subCatelogName;
			},
		},
		{
			title: '末级分类',
			dataIndex: 'serialNumber',
			key: 'serialNumber',
			width: 80,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 160,
			ellipsis: true,
		},
		{
			title: `一级${fields.distributor}`,
			dataIndex: 'custodianName',
			key: 'custodianName',
			width: 160,
			ellipsis: true,
			render: (text, record) => {
				return <span>{record.custodianId == 1 ? '-' : text}</span>;
			},
		},
		{
			title: '操作',
			dataIndex: 'operator',
			key: 'operator',
			width: 88,
			render: (text, record) => {
				return (
					<div className='operation'>
						<span
							className='handleLink'
							onClick={() => getDetail(record, DetailType.all)}>
							查看明细
						</span>
					</div>
				);
			},
		},
	];

	return (
		<div>
			<Breadcrumb config={['', '']} />
			<Card>
				<Form
					form={form}
					onFinish={onFinishSearch}>
					<div className='searchWrap'>
						<Row className='searchForm'>
							<Row style={{ width: '100%' }}>
								<Col {...searchColItemSingle}>
									<FormItem
										name='periodName'
										label='结算周期'
										labelAlign='left'
										{...searchFormItemSingle4}>
										<DatePickerMore
											format={['YYYY-MM-DD', 'YYYY/MM/DD']}
											type='M'
											picker='month'
											single={true}
											checkList={[
												{ text: '本月', key: 'currentMonth' },
												{ text: '上个月', key: 'lastMonth' },
											]}
										/>
									</FormItem>
								</Col>
								<div className={expand ? basicStyles['boxWidth100'] : basicStyles['dis-n']}>
									<Row style={{ width: '100%' }}>
										<Col {...searchColItem}>
											<FormItem
												name='departmentId'
												label='科室'
												labelAlign='left'
												{...searchFormItem4}>
												<Select
													filterOption={(inputValue, option) =>
														option.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
													}
													allowClear
													placeholder='请选择'
													showSearch>
													{departmentList.map((department: any) => {
														return (
															<Select.Option
																value={department.id}
																key={department.id}>
																{department.name}
															</Select.Option>
														);
													})}
												</Select>
											</FormItem>
										</Col>
										<Col {...searchColItem}>
											<FormItem
												name='materialCode'
												label={fields.goodsCode}
												labelAlign='left'
												{...searchFormItem4}>
												<Input
													maxLength={30}
													placeholder='请输入'
												/>
											</FormItem>
										</Col>
										<Col {...searchColItem}>
											<FormItem
												name='goodsName'
												label={fields.goodsName}
												labelAlign='left'
												{...searchFormItem4}>
												<Input
													maxLength={30}
													placeholder='请输入'
												/>
											</FormItem>
										</Col>
										<Col {...searchColItem}>
											<FormItem
												label='条码管控'
												name='barcodeControlled'
												{...searchFormItem4}
												labelAlign='left'>
												<Select
													allowClear
													showSearch
													optionFilterProp='children'
													filterOption={(input, option) =>
														option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
													}
													placeholder='请选择是否条码管控'
													options={yesOrNo}
												/>
											</FormItem>
										</Col>
										<Col {...searchColItem}>
											<FormItem
												label={fields.goodsProperty}
												name='highValue'
												{...searchFormItem4}
												labelAlign='left'>
												<Select
													allowClear
													showSearch
													optionFilterProp='children'
													filterOption={(input, option) =>
														option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
													}
													placeholder={`请选择${fields.goodsProperty}`}
													options={isHightValue}
												/>
											</FormItem>
										</Col>
										{systemType !== 'Insight_RS' && (
											<Col {...searchColItem}>
												<FormItem
													label='植/介入物'
													name='implantation'
													{...searchFormItem4}
													labelAlign='left'>
													<Select
														allowClear
														showSearch
														optionFilterProp='children'
														filterOption={(input, option) =>
															option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
														}
														placeholder='请选择'
														options={yesOrNo}
													/>
												</FormItem>
											</Col>
										)}
										<Col {...searchColItem}>
											<FormItem
												label='医疗器械'
												name='medicalEquipment'
												{...searchFormItem4}
												labelAlign='left'>
												<Select
													allowClear
													showSearch
													optionFilterProp='children'
													filterOption={(input, option) =>
														option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
													}
													placeholder='请选择是否医疗器械'
													onChange={(value) => {
														setIsConsumableMaterial(value);
														reseetCategoryList(value === 'true' ? '12' : '95');
													}}>
													<Select.Option
														value={'true'}
														key={'true'}>
														是
													</Select.Option>
													<Select.Option
														value={'false'}
														key={'false'}>
														否
													</Select.Option>
												</Select>
											</FormItem>
										</Col>
										{isConsumableMaterial ? (
											<Col {...searchColItem}>
												<FormItem
													label={`${fields.baseGoods}分类`}
													{...searchFormItem4}
													labelAlign='left'>
													<Input.Group
														compact
														style={{ width: '100%', display: 'flex' }}>
														{isConsumableMaterial === 'true' && (
															<FormItem name='categoryType'>
																<Select
																	style={{ width: '78px' }}
																	onChange={(val) => reseetCategoryList(val)}
																	allowClear>
																	<Select.Option value='12'>12版</Select.Option>
																	<Select.Option value='18'>18版</Select.Option>
																</Select>
															</FormItem>
														)}
														<FormItem
															name='category'
															style={
																isConsumableMaterial === 'true' ? { flex: 1 } : { width: '100%' }
															}>
															<Cascader
																showSearch
																getPopupContainer={(node) => node.parentNode}
																placeholder={`请选择${fields.baseGoods}分类`}
																options={treeData}
																style={{ width: '100%' }}
															/>
														</FormItem>
													</Input.Group>
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
						access.cost_central_export && (
							<ExportFile
								data={{
									filters: {
										...convertSearchParams(),
									},
									link: api.cost_central.export,
									getForm: convertSearchParams,
								}}
							/>
						),
					]}
					tableInfoId='72'
					options={{
						reload: () => fetchList({}),
					}}
					rowKey='index'
					dataSource={list}
					columns={calColumnsWidth(columns, false)}
					rowSelection={false}
					scroll={{
						x: '100%',
						y: global.scrollY - 61,
					}}
					onChange={async (pagination, filter, sorter) => {
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
						fetchList({ sortList: sortParams });
					}}
					loading={loading}
				/>
				{total ? (
					<PaginationBox
						data={{ total, pageNum, pageSize }}
						pageChange={(cur: number, size: number) => fetchList({ pageNum: cur, pageSize: size })}
					/>
				) : null}
				<DetailModal
					modalVisible={modalVisible}
					setModalVisible={setModalVisible}
					singleCostInfo={singleCostInfo}
					setType={setType}
					type={type}
				/>
			</Card>
		</div>
	);
};

export default connect(
	({
		loading,
		costCentral,
		global,
	}: {
		global: any;
		costCentral: any;
		loading: { effects: { [key: string]: boolean } };
	}) => ({
		costCentral,
		global,
		loading: loading.effects['costCentral/queryCostCentralList'],
	}),
)(CostCentral);
