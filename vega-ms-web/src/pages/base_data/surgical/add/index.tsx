import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import InputUnit from '@/components/InputUnit';
import PaginationBox from '@/components/Pagination';
import TableBox from '@/components/TableBox';
import { transformSBCtoDBC } from '@/utils';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Radio, Row, Select } from 'antd';
import { cloneDeep } from 'lodash';
import { FC, useEffect, useState } from 'react';
import { history, useModel } from 'umi';

import { surgicalPackageType } from '@/constants/dictionary';
import { colItem2, searchColItem, searchFormItem4 } from '@/constants/formLayout';
import { getDetail, getGoodsList, itemAdd, itemEdit } from '../list/service';

const FormItem = Form.Item;

const RadioGroup = Radio.Group;

const AddList: FC<{}> = (props) => {
	const handleType = props.match.params.handleType;
	const docWidth = document.documentElement.clientWidth;
	const [list, setList] = useState([]);
	const [total, setTotal] = useState(0);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const [loading, setLoading] = useState<boolean>(false);
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [showMore, setShowMore] = useState<boolean>(true);

	const [selectedList, setSelectedList] = useState([]);
	const [selectedKeys, setSelectedKeys] = useState([]);

	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');

	const getSearchDate = () => {
		const formDate = form.getFieldsValue([
			'materialCode',
			'goodsName',
			'registrationNum',
			'manufacturerName',
		]);
		return formDate;
	};

	const getDetailInfo = async () => {
		setLoading(true);
		const res = await getDetail(props.match.params.id);
		if (res && res.code === 0) {
			form.setFieldsValue({
				name: res.data.name,
				category: res.data.category ? String(res.data.category) : undefined,
				stockingUp: res.data.stockingUp,
				description: res.data.description,
			});
			const select = res.data.page.rows.map((item) => ({
				...item,
				name: item.goodsName,
				id: item.goodsId,
			}));
			setSelectedList(select);
		}
		setLoading(false);
	};

	// 基础物资列表
	const getSearchList = async (param = {}) => {
		const params = {
			isEnabled: true,
			...pageConfig,
			...getSearchDate(),
			...param,
		};
		setLoading(true);
		const res = await getGoodsList(params);
		if (res && res.code === 0) {
			setList(res.data.rows);
			setTotal(res.data.totalCount);
			setPageConfig({ pageNum: res.data.pageNum, pageSize: res.data.pageSize });
		}
		setLoading(false);
	};

	// 重置
	const resetSerach = () => {
		form.resetFields(['goodsName', 'materialCode', 'registrationNum', 'manufacturerName']);
		getSearchList({ pageNum: 0 });
	};

	useEffect(() => {
		getSearchList();
	}, []);

	useEffect(() => {
		if (handleType === 'edit') {
			getDetailInfo();
		}
	}, [handleType]);

	// 提交
	const listSubmit = () => {
		form.validateFields(['name', 'category', 'stockingUp', 'description']).then(async (values) => {
			if (selectedList.length <= 0) {
				notification.warning(`请选择${fields.baseGoods}`);
				return;
			}
			let params = {
				name: values.name,
				description: values.description,
				category: values.category,
				chargeNum: values.chargeNum,
				stockingUp: values.stockingUp,
			};
			setSubmitLoading(true);
			params = transformSBCtoDBC(params);
			let result;
			if (handleType === 'add') {
				params.packageSurgicalGoodsList = selectedList.map((item) => ({
					quantity: item.quantity || 1,
					goodsId: item.id,
				}));
				result = await itemAdd(params);
			} else {
				params.id = props.match.params.id;
				result = await itemEdit(params);
			}
			setSubmitLoading(false);
			if (result.code === 0) {
				notification.success('操作成功');
				history.push(`/base_data/surgical`);
			}
		});
	};

	const handleChange = (record: any, value: any, key: string) => {
		const submitList = selectedList.map((item) => {
			if (record.materialCode && item.materialCode === record.materialCode) {
				item[key] = value;
				return item;
			}
			return item;
		});
		setSelectedList(submitList);
	};

	// 删除
	const removeItem = (record: any) => {
		let submitList = cloneDeep(selectedList);
		let selectedRowKeys = cloneDeep(selectedKeys);
		selectedRowKeys = selectedRowKeys.filter((item) => item !== record.materialCode);
		submitList = submitList.filter((item) => item.materialCode !== record.materialCode);
		setSelectedList(submitList);
		setSelectedKeys(selectedRowKeys);
	};

	// 选择
	const selectRow = (selectData: any, status: boolean) => {
		let select = cloneDeep(selectedList);
		if (status) {
			select.push(selectData);
		} else {
			select.map((val, index) => {
				if (val.materialCode === selectData.materialCode) {
					select.splice(index, 1);
				}
			});
		}
		const selectedRowKeys = select.map((item) => item.materialCode);
		setSelectedKeys(selectedRowKeys);
		setSelectedList(select);
	};

	// 全选
	const onSelectAll = (selected: boolean, selectedRecords: any, changeRecords: any) => {
		let select = cloneDeep(selectedList);
		if (selected) {
			select = select.concat(changeRecords);
			select = select.reduce((item, next) => {
				if (!item.includes(next)) {
					return item.concat(next);
				} else {
					return item;
				}
			}, []);
		} else {
			changeRecords.forEach((item) => {
				select = select.filter((el) => el.operatorBarcode !== item.operatorBarcode);
			});
		}
		const selectedRowKeys = select.map((item) => item.materialCode);
		setSelectedKeys(selectedRowKeys);
		setSelectedList(select);
	};

	// 单行点击选中
	const selectRowOfClick = (record) => {
		const index = selectedKeys.indexOf(record.materialCode);
		if (index >= 0) {
			selectRow(record, false);
		} else {
			selectRow(record, true);
		}
	};

	const rowSelection = {
		selectedRowKeys: selectedKeys,
		onSelect: selectRow,
		onSelectAll: onSelectAll,
	};

	const columns = [
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 140,
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			key: 'name',
			width: 150,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 150,
			ellipsis: true,
			render: (text: any, record: any) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '包装规格',
			width: 120,
			dataIndex: 'minGoodsNum',
			key: 'minGoodsNum',
			render: (minGoodsNum, record) => {
				return <span>{`${minGoodsNum} ${record.minGoodsUnit}/${record.purchaseGoodsUnit}`}</span>;
			},
		},
		{
			title: '注册证号',
			width: 150,
			dataIndex: 'registrationNum',
			key: 'registrationNum',
			ellipsis: true,
			render: (text) => {
				return text || '-';
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
	];

	let submitColumns = [
		{
			title: '序号',
			width: 80,
			dataIndex: 'number',
			key: 'number',
			align: 'center',
			render: (text, record, index) => {
				return <div>{index + 1}</div>;
			},
		},
		{
			title: fields.goodsCode,
			width: 150,
			dataIndex: 'materialCode',
			key: 'materialCode',
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			width: 160,
			dataIndex: 'name',
			key: 'name',
			ellipsis: true,
		},
		{
			title: '规格/型号',
			width: 150,
			dataIndex: 'goodsSpecification',
			key: 'goodsSpecification',
			ellipsis: true,
			render: (text: any, record: Record<string, any>) => {
				return (
					<span>
						{formatStrConnect(record, [
							record.goodsSpecification ? 'goodsSpecification' : 'specification',
							'model',
						])}
					</span>
				);
			},
		},
		{
			title: '生产厂家',
			width: 150,
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			ellipsis: true,
		},
		{
			title: '单价(元)',
			width: 120,
			dataIndex: 'procurementPrice',
			key: 'procurementPrice',
			align: 'right',
			render: (text, record) => {
				return (
					<span>
						{text
							? convertPriceWithDecimal(text)
							: record.goodsPrice
							? convertPriceWithDecimal(record.goodsPrice)
							: '-'}
					</span>
				);
			},
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 120,
			render: (text, record) => {
				return handleType === 'add' ? (
					<InputUnit
						onChange={(value: number) => {
							handleChange(record, value, 'quantity');
						}}
						unit={record.minGoodsUnit}
						value={Number(text || 1)}
						min={1}
						max={999999}
						style={{ width: '100px' }}
					/>
				) : (
					text + record.quantityUnitName
				);
			},
		},
	];
	if (handleType === 'add') {
		submitColumns.push({
			title: '',
			dataIndex: 'key',
			key: 'key',
			width: 80,
			render: (text, record) => {
				return (
					<span
						className='handleDanger'
						onClick={() => removeItem(record)}>
						删除
					</span>
				);
			},
		});
	}

	return (
		<>
			<Breadcrumb config={['', ['', '/base_data/surgical'], ``]} />
			<Form
				form={form}
				{...searchFormItem4}
				labelAlign='left'>
				{handleType === 'add' && (
					<Card bordered={false}>
						<div className='searchWrap'>
							<Row className='searchForm'>
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
								<Col
									{...searchColItem}
									className={docWidth < 992 ? (showMore ? '' : 'dis-n') : ''}>
									<FormItem
										name='materialCode'
										label={fields.goodsCode}>
										<Input
											maxLength={30}
											placeholder='请输入'
										/>
									</FormItem>
								</Col>
								<Col
									{...searchColItem}
									className={docWidth < 1600 ? (showMore ? '' : 'dis-n') : ''}>
									<FormItem
										name='registrationNum'
										label='注册证号'>
										<Input
											maxLength={30}
											placeholder='请输入'
										/>
									</FormItem>
								</Col>
								<Col
									{...searchColItem}
									className={showMore ? '' : 'dis-n'}>
									<FormItem
										name='manufacturerName'
										label='生产厂家'>
										<Input
											maxLength={30}
											placeholder='请输入'
										/>
									</FormItem>
								</Col>
							</Row>
							<div className='searchBtn'>
								<Button
									type='primary'
									onClick={() => getSearchList({ pageNum: 0 })}>
									查询
								</Button>
								<Button onClick={resetSerach}>重置</Button>
								<a onClick={() => setShowMore(!showMore)}>
									{showMore ? (
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

						<TableBox
							columns={columns}
							rowKey='materialCode'
							dataSource={list}
							pagination={false}
							rowSelection={rowSelection}
							loading={loading}
							scroll={{ y: 300 }}
							onRow={(record) => ({
								onClick: () => {
									selectRowOfClick(record);
								},
							})}
							tableInfoId='226'
							scroll={{
								x: '100%',
								y: 300,
							}}
							tableAlertOptionRender={
								<a
									onClick={() => {
										setSelectedKeys([]);
										setSelectedList([]);
									}}>
									取消选择
								</a>
							}
						/>

						{total > 0 && (
							<PaginationBox
								data={{ total, ...pageConfig }}
								pageChange={(pageNum: number, pageSize: number) =>
									getSearchList({ pageNum, pageSize })
								}
							/>
						)}
					</Card>
				)}

				<Card
					bordered={false}
					className='mt2 mb6'>
					<h3 className='mb1'>医耗套包内容</h3>
					<div className='searchWrap'>
						<Row className='searchForm'>
							<Col {...colItem2}>
								<FormItem
									name='name'
									label='套包名称'
									className='mg1'
									rules={[{ required: true, message: '请输入' }]}>
									<Input
										maxLength={30}
										placeholder='请输入'
									/>
								</FormItem>
							</Col>
							<Col {...colItem2}>
								<FormItem
									name='category'
									label='类别'
									className='mg1'>
									<Select
										optionFilterProp='children'
										allowClear
										placeholder='请选择'
										options={surgicalPackageType}
									/>
								</FormItem>
							</Col>
							<Col {...colItem2}>
								<FormItem
									name='stockingUp'
									label='定制类'
									className='mg1'
									extra={`*定制类：如骨科、牙科手术套包，这类套包直接向${fields.distributor}采购并送往科室库`}
									rules={[{ required: true, message: '请选择是否定制类' }]}>
									<RadioGroup
										name='radiogroup'
										disabled={handleType === 'edit'}>
										<Radio value={false}>是</Radio>
										<Radio value={true}>否</Radio>
									</RadioGroup>
								</FormItem>
							</Col>
							<Col {...colItem2}>
								<FormItem
									name='description'
									label='套包说明'
									className='mg1'>
									<Input.TextArea
										placeholder='请输入'
										maxLength={100}
									/>
								</FormItem>
							</Col>
						</Row>
					</div>
					<TableBox
						columns={submitColumns}
						rowKey='materialCode'
						dataSource={selectedList}
						scroll={{ y: 250 }}
						pagination={false}
						size='small'
						tableInfoId='134'
						scroll={{
							x: '100%',
							y: 300,
						}}
					/>
				</Card>

				<FooterToolbar>
					<Button
						onClick={() => {
							history.goBack();
						}}>
						返回
					</Button>
					<Button
						type='primary'
						loading={submitLoading}
						onClick={listSubmit}>
						提交
					</Button>
				</FooterToolbar>
			</Form>
		</>
	);
};

export default AddList;
