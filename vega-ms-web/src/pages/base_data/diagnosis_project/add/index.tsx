import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import InputUnit from '@/components/InputUnit';
import PaginationBox from '@/components/Pagination';
import TableBox from '@/components/TableBox';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Row, Select } from 'antd';
import { cloneDeep } from 'lodash';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import { colItem4, searchColItem, searchFormItem4 } from '@/constants/formLayout';
import { getDetail, getGoodsList, projectAdd, projectEdit } from '../list/service';

const FormItem = Form.Item;

const formItem4 = {
	labelCol: {
		xs: { span: 6 },
		sm: { span: 7 },
		md: { span: 5 },
		lg: { span: 6 },
		xl: { span: 4 },
		xxl: { span: 5 },
	},
	wrapperCol: {
		xs: { span: 18 },
		sm: { span: 17 },
		md: { span: 18 },
		lg: { span: 17 },
		xl: { span: 19 },
		xxl: { span: 18 },
	},
};

const AddList: FC<{}> = (props) => {
	const { fields } = useModel('fieldsMapping');
	const handleType = props.match.params.id ? 'edit' : 'add';
	const dictionary = JSON.parse(sessionStorage.getItem('dictionary') || '{}');
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

	const getSearchDate = () => {
		const formDate = form.getFieldsValue([
			'materialCode',
			'goodsName',
			'registrationNum',
			'manufacturerName',
		]);
		return formDate;
	};

	useEffect(() => {
		if (history.location.state) {
			sessionStorage.setItem('diagnosis_project', JSON.stringify(history.location.state.params));
		}
	}, []);
	const getDetailInfo = async () => {
		setLoading(true);
		const res = await getDetail(props.match.params.id);
		if (res && res.code === 0) {
			const data = res.data;
			form.setFieldsValue({
				name: data.name,
				type: data.type ? String(data.type) : undefined,
				remark: data.remark,
			});
			const select = data.detail.map((item) => ({
				...item,
				name: item.goodsName,
				id: item.goodsId,
			}));
			const keys = select.map((item) => item.materialCode);
			setSelectedList(select);
			setSelectedKeys(keys);
		}
		setLoading(false);
	};

	// 基础物资列表
	const getSearchList = async (param = {}) => {
		const params = {
			isCombined: false,
			isBarcodeControlled: false,
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
		form
			.validateFields(['name', 'type', 'remark'])
			.then(async (values) => {
				if (selectedList.length <= 0) {
					notification.warning(`请选择${fields.baseGoods}`);
					return;
				}
				const newselectedItemList = selectedList.map((item) => ({
					quantity: item.quantity || 1,
					goodsId: item.id,
				}));
				setSubmitLoading(true);
				values.detail = newselectedItemList;
				let result;
				if (handleType === 'add') {
					result = await projectAdd(values);
				} else {
					values.id = props.match.params.id;
					result = await projectEdit(values);
				}
				setSubmitLoading(false);
				if (result.code === 0) {
					history.push({ pathname: `/base_data/diagnosis_project`, state: 'diagnosis_project' });
				}
			})
			.catch((error) => {
				console.log(error);
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
		const select = cloneDeep(selectedList);
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
			render: (text: any, record: Record<string, any>) => {
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
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
	];

	const submitColumns = [
		{
			title: '序号',
			width: 80,
			align: 'center',
			dataIndex: 'number',
			key: 'number',
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
			dataIndex: 'specification',
			key: 'specification',
			width: 150,
			ellipsis: true,
			render: (text: any, record: Record<string, any>) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
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
				return <span>{text ? convertPriceWithDecimal(text) : '-'}</span>;
			},
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 120,
			render: (text, record) => {
				return (
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
				);
			},
		},
		{
			title: '操作',
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
		},
	];

	const goBack = () => {
		history.push({ pathname: '/base_data/diagnosis_project', state: 'diagnosis_project' });
	};

	return (
		<>
			<Breadcrumb
				config={[
					'',
					['', { pathname: '/base_data/diagnosis_project', state: 'diagnosis_project' }],
					'',
				]}
			/>
			<Form
				form={form}
				{...searchFormItem4}
				labelAlign='left'>
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
						search={false}
						pagination={false}
						rowSelection={rowSelection}
						columns={columns}
						dataSource={list}
						rowKey='materialCode'
						tableAlertRender={false}
						tableInfoId='136'
						scroll={{
							x: '100%',
							y: 200,
						}}
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

				<Card
					bordered={false}
					className='mt2 mb6'>
					<h3 className='mb1'>项目内容</h3>
					<div className='searchWrap'>
						<Row className='searchForm'>
							<Col {...colItem4}>
								<FormItem
									name='name'
									label='项目名称'
									className='mg1'
									{...formItem4}
									rules={[{ required: true, message: '请输入' }]}>
									<Input
										placeholder='请输入'
										maxLength={30}
									/>
								</FormItem>
							</Col>
							<Col {...colItem4}>
								<FormItem
									name='type'
									label='类别'
									className='mg1'
									{...formItem4}>
									<Select
										optionFilterProp='children'
										allowClear
										placeholder='请选择'>
										{(dictionary.diagnosis_project_type || []).map((item) => {
											return (
												<Select.Option
													value={item.value}
													key={item.value}>
													{item.text}
												</Select.Option>
											);
										})}
									</Select>
								</FormItem>
							</Col>
							<Col {...colItem4}>
								<FormItem
									name='remark'
									label='备注'
									className='mg1'
									{...formItem4}>
									<Input
										placeholder='请输入'
										maxLength={100}
									/>
								</FormItem>
							</Col>
						</Row>
					</div>

					<TableBox
						search={false}
						pagination={false}
						rowSelection={rowSelection}
						columns={submitColumns}
						dataSource={selectedList}
						rowKey='materialCode'
						tableAlertRender={false}
						tableInfoId='137'
						scroll={{
							x: '100%',
							y: 200,
						}}
					/>
				</Card>

				<FooterToolbar>
					<Button onClick={goBack}>返回</Button>
					<Button
						type='primary'
						loading={submitLoading}
						onClick={listSubmit}>
						确认操作
					</Button>
				</FooterToolbar>
			</Form>
		</>
	);
};

export default AddList;
