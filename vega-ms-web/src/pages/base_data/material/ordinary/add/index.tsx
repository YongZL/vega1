import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import InputUnit from '@/components/InputUnit';
import ProTable, { ProColumns } from '@/components/ProTable';
import { ProFormColumns } from '@/components/SchemaForm/typings';
import { consumeWay } from '@/constants/dictionary';
import { searchColItem, searchFormItem4 } from '@/constants/formLayout';
import { getAllManufacturers } from '@/services/manufacturer';
import { pageList } from '@/services/newGoodsTypes';
import { checkSame, getDetail, upOrdinary } from '@/services/ordinary';
import { transformSBCtoDBC, scrollTable } from '@/utils';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button, Card, Col, Form, Input, Radio, Row } from 'antd';
import { cloneDeep } from 'lodash';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import CheckModal from '../cheack';

const FormItem = Form.Item;
const AddList: FC<{}> = (props: Record<string, any>) => {
	const handleType = props.match.params.id ? 'edit' : 'add';
	const { fields } = useModel('fieldsMapping');
	const [createModalVisible, handleModalVisible] = useState<boolean>(false);
	const [manufacturers, setManufacturers] = useState([]);
	const [paramsList, setParamsList] = useState();
	const [same, setSame] = useState<string>('');
	const [ordinaryName, setOrdinaryName] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [selectedList, setSelectedList] = useState([]);
	const [selectedKeys, setSelectedKeys] = useState([]);
	const [form] = Form.useForm();

	// 打开查看弹窗
	const openModal = () => handleModalVisible(true);

	// 关闭弹窗
	const handleCancel = () => handleModalVisible(false);

	// 生产厂家
	const getManufacturersList = async () => {
		const res = await getAllManufacturers();
		if (res && res.code === 0) {
			const data: any = res.data || [];
			setManufacturers(data);
		}
	};

	const getDetailInfo = async () => {
		setLoading(true);
		const res = await getDetail(props.match.params.id);
		if (res && res.code === 0) {
			const { ordinaryDto, stockingUp }: any = res.data || {};
			form.setFieldsValue({
				name: ordinaryDto.name,
				stockingUp: stockingUp,
				description: ordinaryDto.description || ordinaryDto.detailGoodsMessage,
				consumeType: ordinaryDto.consumeType,
			});
			const select = (res.data.ordinaryGoods || []).map((item: Record<string, any>) => ({
				...item,
				name: item.name,
				id: item.id,
			}));
			setSelectedList(select);
		}
		setLoading(false);
	};

	useEffect(() => {
		getManufacturersList();
	}, []);

	useEffect(() => {
		if (handleType === 'edit') {
			getDetailInfo();
		}
	}, [handleType]);

	// 提交
	const listSubmit = () => {
		form
			.validateFields()
			.then(async (values) => {
				if (selectedList.length <= 0) {
					notification.warning(`请选择${fields.baseGoods}`);
					return;
				}
				openModal();
				let params: any = {
					ordinaryName: values.name,
					description: values.description || '',
					consumeType: values.consumeType,
				};
				let paramsUp: any = {
					ordinaryNewName: values.name,
					ordinaryNewDescription: values.description,
					consumeType: values.consumeType,
				};
				setSubmitLoading(true);
				params = transformSBCtoDBC(params);
				paramsUp = transformSBCtoDBC(paramsUp);
				let result: any;
				if (handleType === 'add') {
					params.goods = selectedList.map((item: Record<string, any>) => ({
						num: item.quantity || 1,
						goodsId: item.id,
					}));
					setParamsList(params);
					result = await checkSame(params);
				} else {
					paramsUp.ordinaryId = props.match.params.id;
					result = await upOrdinary(paramsUp);
				}
				setSubmitLoading(false);
				if (result.code === 0) {
					if (handleType === 'add') {
						setSame(result.data.same);
						setOrdinaryName(result.data.ordinaryName);
					} else {
						notification.success('操作成功');
						history.push({ pathname: `/base_data/ordinary`, state: 'ordinary' });
					}
				}
			})
			.catch(() => {
				for (let i = 0; i < selectedList.length; i++) {
					const { quantity } = selectedList[i];
					if (!quantity) {
						scrollTable(Number(i) + 1, 'tableEle');
					}
				}
			});
	};

	const handleChange = (record: any, value: any, key: string) => {
		const submitList: any = selectedList.map((items: Record<string, any>) =>
			record.materialCode && items.materialCode === record.materialCode
				? { ...items, quantity: value }
				: { ...items },
		);
		setSelectedList(submitList);
	};

	// 删除
	const removeItem = (record: any) => {
		let submitList = cloneDeep(selectedList);
		let selectedRowKeys = cloneDeep(selectedKeys);
		selectedRowKeys = selectedRowKeys.filter((item) => item !== record.materialCode);
		submitList = submitList.filter(
			(item: Record<string, any>) => item.materialCode !== record.materialCode,
		);

		setSelectedList(submitList);
		setSelectedKeys(selectedRowKeys);
	};

	// 选择
	const selectRow = (selectData: any, status: boolean) => {
		const select: any = cloneDeep(selectedList);
		if (status) {
			select.push({ ...selectData, quantity: 1 });
		} else {
			select.map((val: Record<string, any>, index: number) => {
				if (val.materialCode === selectData.materialCode) {
					select.splice(index, 1);
				}
			});
		}
		const selectedRowKeys = select.map((item: Record<string, any>) => item.materialCode);
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
			changeRecords.forEach((item: Record<string, any>) => {
				select = select.filter(
					(el: Record<string, any>) => el.operatorBarcode !== item.operatorBarcode,
				);
			});
		}
		let selectedRowKeys: any = [];
		let selectList: any = [];
		for (let i = 0; i < select.length; i++) {
			let result: any = select[i];
			selectedRowKeys.push(result?.materialCode);
			selectList.push({ ...result, quantity: result?.quantity || 1 });
		}
		setSelectedKeys(selectedRowKeys);
		setSelectedList(selectList);
	};

	// 单行点击选中
	const selectRowOfClick = (record: Record<string, any>) => {
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

	const searchColumns: ProFormColumns = [
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			fieldProps: {
				placeholder: `请输入${fields.goodsCode}名称`,
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '收费项',
			dataIndex: 'chargeName',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			fieldProps: {
				placeholder: `请输入`,
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerIds',
			valueType: 'select',
			fieldProps: {
				optionFilterProp: 'children',
				filterOption: (input: string, option: any) =>
					(option?.companyName as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0,
				options: manufacturers || [],
				showSearch: true,
				fieldNames: {
					label: 'companyName',
					value: 'id',
				},
			},
		},
	];

	const columns: ProColumns<NewGoodsTypesController.GoodsRecord>[] = [
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
			renderText: (text: string, record) => formatStrConnect(record, ['specification', 'model']),
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
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 140,
		},
		{
			title: '收费项',
			dataIndex: 'chargeName',
			key: 'chargeName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 150,
			align: 'right',
			renderText: (price: number) => convertPriceWithDecimal(price),
		},
	];

	const submitColumns: ProColumns<NewGoodsTypesController.GoodsRecord>[] = [
		{
			title: '序号',
			width: 80,
			dataIndex: 'number',
			key: 'number',
			align: 'center',
			render: (text, record, index) => index + 1,
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
			dataIndex: 'Specification',
			key: 'Specification',
			ellipsis: true,
			renderText: (text: string, record) => (
				<span>
					{formatStrConnect(record, [
						record.goodsSpecification ? 'goodsSpecification' : 'specification',
						'model',
					])}
				</span>
			),
		},
		{
			title: '生产厂家',
			width: 150,
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			ellipsis: true,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 140,
		},
		{
			title: '收费项',
			dataIndex: 'chargeName',
			key: 'chargeName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 150,
			align: 'right',
			renderText: (price: number) => convertPriceWithDecimal(price),
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 120,
			renderText: (text: number, record) => {
				return handleType === 'add' ? (
					<FormItem
						preserve={false}
						className='mg0'
						rules={[{ required: true }]}
						name={`${record.materialCode}${record.id}`}
						initialValue={Number(text || 1)}>
						<InputUnit
							onChange={(value: any) => handleChange(record, value, 'quantity')}
							unit={record.minGoodsUnit}
							value={Number(text || 1)}
							min={1}
							max={999999}
							style={{ width: '100px' }}
						/>
					</FormItem>
				) : (
					record.quantity
				);
			},
		},
	];
	if (handleType === 'add') {
		submitColumns.push({
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
		});
	}

	const goBack = () => {
		history.push({ pathname: `/base_data/ordinary`, state: 'ordinary' });
	};

	return (
		<div className='main-page'>
			<Breadcrumb
				config={[
					'',
					['', { pathname: '/base_data/ordinary', state: 'ordinary' }],
					['', { pathname: '/base_data/ordinary', state: 'ordinary' }],
					``,
				]}
			/>

			<Form
				form={form}
				{...searchFormItem4}
				labelAlign='left'>
				{/* 新增、基础物资部分 */}
				{handleType === 'add' && (
					<Card bordered={false}>
						<ProTable
							columns={columns}
							rowKey='materialCode'
							api={pageList}
							params={{
								isEnabled: true,
								isBarcodeControlled: false,
							}}
							rowSelection={rowSelection}
							loading={loading}
							onRow={(record: Record<string, any>) => ({
								onClick: () => selectRowOfClick(record),
							})}
							scroll={{ y: 300 }}
							tableAlertOptionRender={
								<a
									onClick={() => {
										setSelectedKeys([]);
										setSelectedList([]);
									}}>
									取消选择
								</a>
							}
							searchConfig={{
								columns: searchColumns,
							}}
						/>
					</Card>
				)}
				{/* 医耗套包内容 */}
				<Card
					bordered={false}
					className='mb6'>
					<h3 style={{ paddingLeft: 6 }}>医耗套包内容</h3>
					<div
						className='searchWrap'
						style={{ paddingLeft: 6 }}>
						<Row className='searchForm'>
							<Col {...searchColItem}>
								<FormItem
									name='name'
									label='套包名称'
									rules={[{ required: true, message: '请输入' }]}>
									<Input
										maxLength={10}
										placeholder='请输入'
									/>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									name='consumeType'
									label='消耗方式'
									rules={[{ required: true, message: '请选择' }]}>
									<Radio.Group style={{ width: '65%' }}>
										{consumeWay.map((item) => {
											return (
												<Radio
													key={item.value}
													value={item.value}>
													{item.label}
												</Radio>
											);
										})}
									</Radio.Group>
								</FormItem>
							</Col>
							<Row style={{ width: '100%' }}>
								<Col {...searchColItem}>
									<FormItem
										name='description'
										label='套包说明'>
										<Input
											maxLength={200}
											placeholder='请输入'
										/>
									</FormItem>
								</Col>
							</Row>
						</Row>
					</div>
					<div id='tableEle'>
						<ProTable
							columns={submitColumns}
							rowKey='materialCode'
							dataSource={selectedList}
							scroll={{ y: 300 }}
							pagination={false}
							size='small'
						/>
					</div>
					{handleType === 'add' && createModalVisible && (
						<CheckModal
							visible={createModalVisible}
							onCancel={handleCancel}
							selectedList={selectedList}
							paramslist={paramsList}
							same={same}
							ordinaryName={ordinaryName}
						/>
					)}
				</Card>

				<FooterToolbar>
					<Button
						onClick={goBack}
						className='returnButton'>
						返回
					</Button>
					<Button
						type='primary'
						loading={submitLoading}
						onClick={listSubmit}
						className='verifyButton'>
						确认操作
					</Button>
				</FooterToolbar>
			</Form>
		</div>
	);
};

export default AddList;
