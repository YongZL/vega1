import type { FC } from 'react';

import ExportFile from '@/components/ExportFile';
import Print from '@/components/print';
import TableBox from '@/components/TableBox';
import { convertPriceWithDecimal } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button, Cascader, Col, Form, Modal, Row, Select, Statistic } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Target from './print';

import api from '@/constants/api';
import { searchColItem, searchFormItem6 } from '@/constants/formLayout';
import { getAllGoods95 as getType95 } from '@/services/std95GoodsCategory';
import { useModel } from 'umi';
import { deanStatisticDepartmentDetail, getType12, getType18 } from '../service';

const FormItem = Form.Item;
const select = {
	all: '全院',
	operating_room: '手术科室',
	'non-surgical_department': '非手术科室',
	administration: '行政科室',
	Medical_technology: '医技科室',
};

const CheckModal: FC<{}> = ({ timeFrom, timeTo, detailid, visible, onCancel, selected }) => {
	const [loading, setLoading] = useState<boolean>(false);
	const { fields } = useModel('fieldsMapping');
	const [statementEntity, setstatementEntity] = useState();
	const [searchParams, setSearchParams] = useState({});
	const [treeData, setTreeData] = useState([]);
	const [list, setList] = useState([]);
	const [statementList, setStatementList] = useState({});
	const [selectedGoods, setSelectedGoods] = useState([]);
	const [title, setTitle] = useState('');

	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const PrintTarget = Print(Target);
	const { departmentName, departmentId } = detailid;
	const { departmentType } = selected;

	const [form] = Form.useForm();

	useEffect(() => {
		queryList();
	}, [timeFrom, timeTo, detailid.departmentId]);

	const goodsColumns = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			render: (text, redord, index) => <span>{index + 1}</span>,
			width: 60,
		},
		{
			title: '版本',
			dataIndex: 'categoryType',
			key: 'categoryType',
			width: 150,
			render: (text) => {
				return text === 2 ? '18版' : '12版';
			},
		},
		{
			title: `${fields.baseGoods}分类`,
			dataIndex: 'subCatalogName',
			key: 'subCatalogName',
			width: 180,
			align: 'left',
			render: (text, value) => {
				return text
					? (value.classCode ? value.classCode + '/' : '') + value.subCatalogCode + text
					: '-';
			},
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 150,
			align: 'left',
			ellipsis: true,
		},
		{
			title: '结算金额(元)',
			dataIndex: 'sumPrice',
			key: 'sumPrice',
			width: 180,
			align: 'right',
			render: (text) => {
				return text ? convertPriceWithDecimal(text) : '-';
			},
		},
		{
			title: '结算同比',
			dataIndex: 'yearOnYear',
			key: 'yearOnYear',
			width: 180,
			align: 'left',
			render: (text, record) => {
				return record.yearOnYear ? convertPriceWithDecimal(record.yearOnYear * 10000) + '%' : '-';
			},
		},
		{
			title: '结算环比',
			dataIndex: 'monthOnMonth',
			key: 'monthOnMonth',
			width: 180,
			align: 'left',
			render: (text, record) => {
				return record.monthOnMonth
					? convertPriceWithDecimal(record.monthOnMonth * 10000) + '%'
					: '-';
			},
		},
	];

	const custodianChange = (value: any) => {
		setSearchParams({ ...getSearchData() });
		setSelectedGoods([]);
		setTreeData([]);

		form.setFieldsValue({
			classification: [],
		});
		getGoodsCategory(value);
	};

	const onSelected = (value: any, option: any) => {
		setSelectedGoods(value);
		setSearchParams({ ...getSearchData() });
		setTitle(option[0].label + '/' + option[1].label);
	};

	const inquire = (value: any) => {};

	const queryList = () => {
		const parms = {
			timeFrom,
			timeTo,
			departmentId: detailid.departmentId,
		};
		getFormList(parms);
	};

	// 重置
	const reSetFormSearch = () => {
		form.resetFields();
		setstatementEntity('');
		setList([]);
		setSearchParams({});
		setTreeData([]);
		queryList();
		setSelectedGoods([]);
		setTitle('');
	};
	const getSearchData = () => {
		let timearray = form.getFieldsValue('item').item;
		if (timearray) {
			timearray = timearray.split('|');
		}

		const classification = selectedGoods || [];
		const categoryType = form.getFieldsValue('categoryType').categoryType;

		let classification1 = [];
		if (classification && classification.length) {
			classification1 = classification[1].split('-');
		}
		const params = {
			classCode: classification && classification[0],
			subCatalogCode: classification && classification1[0],
			timeFrom: timeFrom || undefined,
			timeTo: timeTo || undefined,
			departmentId: departmentId,
			categoryType: categoryType == '12' ? '1' : categoryType == '18' ? '2' : '',
			departmentType,
		};
		return params;
	};

	const getFormList = async (param: any) => {
		setList([]);
		const search = getSearchData();
		if (!search) return;
		const params = {
			...search,
			...param,
			departmentId: detailid.departmentId,
			departmentType,
		};
		setSearchParams(params);
		setLoading(true);
		params.categoryType =
			params.categoryType == '12' ? '1' : params.categoryType == '18' ? '2' : '';
		const res = await deanStatisticDepartmentDetail(params);
		if (res && res.code === 0) {
			setList(res.data);
			setstatementEntity(res.data);
			setStatementList(res.data);
			setLoading(false);
		}
		setLoading(false);
	};

	const countTotal = (arr: any[], keyName: any) => {
		let total = 0;
		total = arr.reduce((total, currentValue, currentIndex, arr) => {
			return currentValue[keyName] ? total + currentValue[keyName] : total;
		}, 0);
		return total;
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
					const oNew = {
						label: type == '95' ? o.name : o.code,
						key: o.id,
						value: o.children ? o.id : o.code,
						level: o.level,
						children: getCascaderData(o.children, type),
					};
					if (!oNew.children || oNew.level === 2) delete oNew.children;
					return oNew;
			  })
			: undefined;
	};

	const printTip = () => {
		if (!searchParams.timeFrom || !searchParams.timeTo) {
			notification.error('结算周期不能为空');
			return false;
		}
	};
	const selector = select[selected.departmentType];
	const isExist = form.getFieldsValue('categoryType').categoryType;

	return (
		<div>
			<Modal
				visible={visible}
				width={'80%'}
				maskClosable={false}
				title='报表详情'
				onCancel={onCancel}
				footer={false}>
				<div>
					<Form
						form={form}
						onFinish={getFormList}
						labelAlign='left'
						{...searchFormItem6}>
						<div
							className='searchWrap'
							style={{ display: 'flex', flexDirection: 'row' }}>
							<Row className='searchForm'>
								<Col {...searchColItem}>
									<FormItem
										name='warehouseIds'
										label='科室类型'>
										{select[selected.departmentType]}
									</FormItem>
								</Col>
								<Col {...searchColItem}>
									<FormItem
										name='storageAreaIds'
										label='科室名称'>
										{departmentName}
									</FormItem>
								</Col>
								<Col {...searchColItem}>
									<FormItem
										name='storageLocBarcode'
										label='结算周期'>
										{moment(timeFrom).format('YYYY/MM/DD') +
											'~' +
											moment(timeTo).format('YYYY/MM/DD')}
									</FormItem>
								</Col>
								<Col
									{...searchColItem}
									style={{ marginTop: '1%' }}>
									<FormItem
										label='版本'
										name='categoryType'
										{...searchFormItem6}>
										<Select
											allowClear
											onClear={() => form.resetFields()}
											placeholder='请选择'
											onChange={custodianChange}>
											<Select.Option value='12'>12版</Select.Option>
											<Select.Option value='18'>18版</Select.Option>
										</Select>
									</FormItem>
								</Col>

								<Col
									{...searchColItem}
									style={{ marginTop: '1%' }}>
									<FormItem
										name='classification'
										label={`${fields.baseGoods}分类`}>
										<Cascader
											title={title}
											onChange={onSelected}
											value={selectedGoods}
											showSearch
											getPopupContainer={(node) => node.parentNode}
											placeholder={!isExist ? '请先选择版本' : `请选择${fields.baseGoods}分类`}
											options={treeData}
											disabled={!isExist}
											style={{ width: '100%' }}
										/>
									</FormItem>
								</Col>
								<Col
									{...searchColItem}
									style={{ marginTop: '1%' }}>
									<div>
										<Button
											type='primary'
											htmlType='submit'
											onClick={inquire}>
											查询
										</Button>
										<Button
											style={{ marginLeft: '20px' }}
											onClick={reSetFormSearch}>
											重置
										</Button>
									</div>
								</Col>
							</Row>
							<div style={{ display: 'flex', flexDirection: 'column' }}>
								<div className='searchBtn'>
									<div
										style={{
											display: 'flex',
											width: '51%',
											justifyContent: 'flex-end',
											marginTop: '2%',
											marginRight: '5%',
										}}>
										<Statistic
											title='结算总金额(元)'
											value={'￥' + convertPriceWithDecimal(countTotal(list, 'sumPrice'))}
										/>
									</div>
								</div>
							</div>
						</div>
					</Form>
					<div style={{ marginTop: '-1%' }}>
						<TableBox
							loading={loading}
							size='middle'
							pagination={false}
							columns={goodsColumns}
							dataSource={list}
							scroll={{ x: '100%', y: 300 }}
							tableInfoId='281'
							toolBarRender={() => [
								permissions.includes('dean2_detail_print') && (
									<>
										{timeFrom && timeTo ? (
											<PrintTarget
												url={api.medical_supplies_report.deanStatisticDetail}
												params={{ ...searchParams, ...getSearchData(), ...selectedGoods }}
												parameters={{
													selector,
													departmentName,
													...getSearchData(),
													...selectedGoods,
												}}
												printType={true}
											/>
										) : (
											<Button
												type='primary'
												className='btnOperator'
												onClick={() => printTip()}>
												打印
											</Button>
										)}
									</>
								),
								permissions.includes('dean2_detail_export') && (
									<ExportFile
										data={{
											filters: { ...getSearchData() },
											link: api.medical_supplies_report.deanStatisticDetailExport,
											getForm: getSearchData,
										}}
									/>
								),
							]}
						/>
					</div>
				</div>
			</Modal>
		</div>
	);
};
export default CheckModal;
