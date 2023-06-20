import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import ScanInput from '@/components/ScanInput';
import { useDepartmentList } from '@/hooks/useDepartmentList';
import { useWarehouseList } from '@/hooks/useWarehouseList';
import { getScrollX, transformSBCtoDBC } from '@/utils';
import { formatToGS1, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button, Card, Col, Empty, Form, Input, Row, Select, Table } from 'antd';
import { cloneDeep } from 'lodash';
import { FC, useEffect, useState } from 'react';
import { history, useModel } from 'umi';

import { goodsItemStatusTextMap } from '@/constants/dictionary';
import { searchColItem, searchFormItem4 } from '@/constants/formLayout';
import style from '../list/index.less';
import { getWarehouseListByIds, submitCode, submitDate } from './service';

const FormItem = Form.Item;

const list = {
	put_on_shelf: 'put_on_shelf',
	put_off_shelf: 'put_off_shelf',
};

const AddList: FC<{}> = () => {
	const { fields } = useModel('fieldsMapping');
	const [goodsList, setGoodsList] = useState([]);
	const [bulkList, setBulkList] = useState([]);
	const [surgicalList, setSurgicalList] = useState([]);
	const [targetWarehouseList, setTargetWarehouseList] = useState([]);

	const [loading, setLoading] = useState<boolean>(false);
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [scanValue, setScanValue] = useState('');

	const [form] = Form.useForm();

	const sourceWarehouseList = useWarehouseList({
		excludeCentralWarehouse: true,
		excludeVirtualWarehouse: true,
	});
	const departmentList = useDepartmentList();

	useEffect(() => {
		if (sourceWarehouseList.length > 0) {
			form.setFieldsValue({
				sourceWarehouseId: sourceWarehouseList[0].id,
			});
		}
	}, [sourceWarehouseList]);

	const getWarehouseList = async (id: string) => {
		form.setFieldsValue({
			targetWarehouseId: undefined,
		});
		const res = await getWarehouseListByIds({ departmentIds: id });
		if (res && res.code === 0) {
			setTargetWarehouseList(res.data);
		}
	};

	// 提交
	const listSubmit = async () => {
		form.validateFields().then(async (value) => {
			const allList = goodsList.concat(bulkList).concat(surgicalList);
			if (allList.length <= 0) {
				notification.warning(`请扫码添加${fields.goods}`);
				return;
			}
			if (value.sourceWarehouseId === value.targetWarehouseId) {
				notification.error('发起仓库和目标仓库不可一致，请确认！');
				return;
			}
			let details = [];
			goodsList.forEach((item) => {
				details.push({
					goodsItemId: item.id,
					remarks: item.remarks,
				});
			});
			bulkList.forEach((item) => {
				details.push({
					packageBulkItemId: item.id,
					remarks: item.remarks,
				});
			});
			surgicalList.forEach((item) => {
				details.push({
					surgicalPkgBulkItemId: item.id,
					remarks: item.remarks,
				});
			});
			setSubmitLoading(true);
			const params = {
				details,
				sourceWarehouseId: value.sourceWarehouseId,
				targetWarehouseId: value.targetWarehouseId,
			};
			const res = await submitDate(params);
			if (res && res.code === 0) {
				notification.success('操作成功');
				history.push(`/department/reallocation`);
			}
			setSubmitLoading(false);
		});
	};

	const handleChange = (record: any, value: any, key: string, type: string) => {
		let list = type === 'goods' ? goodsList : type === 'bulk' ? bulkList : surgicalList;
		const submitList = list.map((item) => {
			if (item.operatorBarcode === record.operatorBarcode) {
				item[key] = value;
				return item;
			}
			return item;
		});
		type === 'goods'
			? setGoodsList(submitList)
			: type === 'bulk'
			? setBulkList(submitList)
			: setSurgicalList(submitList);
	};

	// 查询输入条码的物资
	const scanSubmit = async (val: string) => {
		const warehouseId = form.getFieldValue('sourceWarehouseId');
		if (!warehouseId) {
			notification.warning('请先选择来源仓库');
			return;
		}
		const operatorBarcode = transformSBCtoDBC(val);
		const gs1Code =
			operatorBarcode.indexOf('_') > -1 ? operatorBarcode : formatToGS1(operatorBarcode);
		setLoading(true);
		const res = await submitCode({
			operatorBarcode: gs1Code,
			warehouseId,
		});
		if (res && res.code === 0) {
			if (!list[res.data.status]) {
				const statusN = goodsItemStatusTextMap[res.data.status];
				notification.error(`该${fields.goods}状态为${statusN}，不可调拨`);
				setLoading(false);
				return;
			}
			if (operatorBarcode.startsWith('ID')) {
				if (!goodsList.find((item) => item.id === res.data.id)) {
					let list = cloneDeep(goodsList);
					list.push(res.data);
					setGoodsList(list);
					setScanValue('');
				} else {
					notification.error(`该${fields.baseGoods}已添加`);
				}
			}
			if (operatorBarcode.startsWith('PB')) {
				if (!bulkList.find((item) => item.id === res.data.id)) {
					let list = cloneDeep(bulkList);
					list.push(res.data);
					setBulkList(list);
					setScanValue('');
				} else {
					notification.error('该定数包已添加');
				}
			}
			if (operatorBarcode.startsWith('PS')) {
				if (!surgicalList.find((item) => item.id === res.data.id)) {
					let list = cloneDeep(surgicalList);
					list.push(res.data);
					setSurgicalList(list);
					setScanValue('');
				} else {
					notification.error('该手术套包已添加');
				}
			}
		}
		setLoading(false);
	};

	// 扫码
	const scanChange = (value: string) => {
		setScanValue(value);
	};

	// 删除
	const onConfirmDelete = (record: any, type: string) => {
		switch (type) {
			case 'goods':
				const list = goodsList.filter((item) => item.operatorBarcode !== record.operatorBarcode);
				setGoodsList(list);
				break;
			case 'bulk':
				const bulks = bulkList.filter((item) => item.operatorBarcode !== record.operatorBarcode);
				setBulkList(bulks);
				break;
			case 'surgical':
				const surgicals = surgicalList.filter(
					(item) => item.operatorBarcode !== record.operatorBarcode,
				);
				setSurgicalList(surgicals);
				break;
			default:
				break;
		}
	};

	const goodsColumns = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render(text, record, index) {
				return <span>{index + 1}</span>;
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 150,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 200,
			ellipsis: true,
		},
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 150,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			render: (text: any, record: any) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 200,
			ellipsis: true,
		},
		{
			title: '调拨数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
			render: () => {
				return <span>1</span>;
			},
		},
		{
			title: '调拨事由',
			dataIndex: 'remarks',
			key: 'remarks',
			width: 200,
			render: (text, record) => {
				return (
					<FormItem
						style={{ margin: 0, height: '40px' }}
						name={`remarks${record.operatorBarcode}`}
						rules={[{ required: true, message: ' ' }]}>
						<Input
							maxLength={100}
							onChange={(e) => handleChange(record, e.target.value, 'remarks', 'goods')}
						/>
					</FormItem>
				);
			},
		},
		{
			title: '操作',
			dataIndex: 'operator',
			key: 'operator',
			fixed: 'right',
			width: 62,
			render: (text, record) => {
				return (
					<span
						className='handleDanger'
						onClick={() => onConfirmDelete(record, 'goods')}>
						删除
					</span>
				);
			},
		},
	];
	const bulkColumns = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render(text, record, index) {
				return <span>{index + 1}</span>;
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 100,
		},
		{
			title: '定数包名称',
			dataIndex: 'name',
			key: 'name',
			width: 100,
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 100,
			ellipsis: true,
		},
		{
			title: '调拨数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
			render: () => {
				return <span>1</span>;
			},
		},
		{
			title: '调拨事由',
			dataIndex: 'remarks',
			key: 'remarks',
			width: 200,
			render: (text, record) => {
				return (
					<FormItem
						style={{ margin: 0, height: '40px' }}
						name={`remarks${record.operatorBarcode}`}
						rules={[{ required: true, message: ' ' }]}>
						<Input
							maxLength={100}
							onChange={(e) => handleChange(record, e.target.value, 'remarks', 'bulk')}
						/>
					</FormItem>
				);
			},
		},
		{
			title: '操作',
			dataIndex: 'operator',
			key: 'operator',
			width: 62,
			fixed: 'right',
			render: (text, record) => {
				return (
					<span
						className='handleDanger'
						onClick={() => onConfirmDelete(record, 'bulk')}>
						删除
					</span>
				);
			},
		},
	];
	const surgicalColumns = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render(text, record, index) {
				return <span>{index + 1}</span>;
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 100,
		},
		{
			title: '套包名称',
			dataIndex: 'name',
			key: 'name',
			width: 200,
			ellipsis: true,
		},
		{
			title: '类别',
			dataIndex: 'category',
			key: 'category',
			width: 100,
		},
		{
			title: '调拨数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
			render: () => {
				return <span>1</span>;
			},
		},
		{
			title: '调拨事由',
			dataIndex: 'remarks',
			key: 'remarks',
			width: 200,
			render: (text, record) => {
				return (
					<FormItem
						style={{ margin: 0, height: '40px' }}
						name={`remarks${record.operatorBarcode}`}
						rules={[{ required: true, message: ' ' }]}>
						<Input
							maxLength={100}
							onChange={(e) => handleChange(record, e.target.value, 'remarks', 'surgical')}
						/>
					</FormItem>
				);
			},
		},
		{
			title: '操作',
			dataIndex: 'operator',
			key: 'operator',
			width: 62,
			fixed: 'right',
			render: (text, record) => {
				return (
					<span
						className='handleDanger'
						onClick={() => onConfirmDelete(record, 'surgical')}>
						删除
					</span>
				);
			},
		},
	];

	const tabs = [
		{
			name: fields.baseGoods,
			type: 'goods',
			columns: goodsColumns, // 固定列处理
			data: goodsList,
		},
		{
			name: '定数包',
			type: 'package_bulk',
			columns: bulkColumns,
			data: bulkList,
		},
		// {
		//   name: '手术套包',
		//   type: 'package_surgical',
		//   columns: surgicalColumns,
		//   data: surgicalList,
		// },
	];

	return (
		<div className={style.reallocationAddWrap}>
			<Breadcrumb config={['', ['', '/department/reallocation'], '']} />
			<Form
				form={form}
				{...searchFormItem4}
				labelAlign='left'>
				<Card
					bordered={false}
					className='mb6'>
					<div className='searchWrap'>
						<Row className='searchForm'>
							<Col {...searchColItem}>
								<FormItem
									name='sourceWarehouseId'
									label='发起仓库'
									rules={[{ required: true, message: '请选择' }]}>
									<Select
										showSearch
										optionFilterProp='children'
										placeholder='请选择'
										filterOption={(input, option) =>
											option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}>
										{sourceWarehouseList.map((item) => {
											return <Select.Option value={item.id}>{item.name}</Select.Option>;
										})}
									</Select>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									name='targetDepartmentId'
									label='目标科室'
									rules={[{ required: true, message: '请选择' }]}>
									<Select
										showSearch
										optionFilterProp='children'
										placeholder='请选择'
										filterOption={(input, option) =>
											option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										onChange={getWarehouseList}>
										{departmentList.map((item) => {
											return <Select.Option value={item.id}>{item.name}</Select.Option>;
										})}
									</Select>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									name='targetWarehouseId'
									label='目标仓库'
									rules={[{ required: true, message: '请选择' }]}>
									<Select
										showSearch
										optionFilterProp='children'
										placeholder='请选择'
										filterOption={(input, option) =>
											option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}>
										{targetWarehouseList.map((item) => {
											return <Select.Option value={item.id}>{item.name}</Select.Option>;
										})}
									</Select>
								</FormItem>
							</Col>
						</Row>
						<div className='searchBtn'>
							<ScanInput
								value={scanValue}
								onSubmit={scanSubmit}
								onPressEnter={scanSubmit}
								onChange={scanChange}
								autoFocus={true}
								placeholder='点击此处扫码'
							/>
						</div>
					</div>
					{tabs.map((item) => {
						return (
							item.data.length > 0 && (
								<div key={item.type}>
									<h3>{item.name}</h3>
									<Table
										loading={loading}
										columns={item.columns}
										rowKey='operatorBarcode'
										dataSource={item.data}
										scroll={{ y: 300, x: getScrollX(item.columns) }}
										pagination={false}
										size='small'
									/>
								</div>
							)
						);
					})}

					{goodsList.length <= 0 && bulkList.length <= 0 && surgicalList.length <= 0 && (
						<Empty
							className='dateEmpty'
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description={`请扫描${fields.goods}`}
						/>
					)}
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
		</div>
	);
};

export default AddList;
