import TableBox from '@/components/TableBox';
import {
	searchColItem,
	searchColItemSingle,
	searchFormItem4,
	searchFormItem6,
	searchFormItemSingle4,
} from '@/constants/formLayout';
import useDebounce from '@/hooks/useDebounce'; // 延迟-- loadash不可用
import useDidMount from '@/hooks/useDidMount';
import { addOrUpdate, getPreferenceByCode } from '@/services/userPreference';
import { dealPackNum } from '@/utils/dataUtil';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import '@ant-design/compatible/assets/index.css';
import { Button, Col, Form, Input, Row, Select, Switch, Tag } from 'antd';
import { FC, useEffect, useState } from 'react';
import { useModel } from 'umi';
import { getWarehousesByUser, queryGoodsList } from '../list/service';
import styles from './index.less';

const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');

const CheckableTag = Tag.CheckableTag;
const FormItem = Form.Item;

let tagsDat = [
	{ name: fields.baseGoods, value: 'goods' },
	// 根据需求取消普通请领时的定数包展示
	// { name: '定数包', value: 'package_bulk' },
	{ name: '医耗套包', value: 'package_ordinary' },
];
const typeName = {
	goods: fields.goodsName,
	package_bulk: '定数包名称 ',
	package_ordinary: '套包编号/名',
};
const FormSearch: FC<{}> = ({
	acquiesceParameter,
	wareHousesList,
	searchTableList,
	type,
	tagChecked,
	onGetQueryData,
	onSelectedData,
	onClearData,
	goodsSelectedList,
}) => {
	const { fields } = useModel('fieldsMapping');
	const [form] = Form.useForm();
	const [parmsValue, setParmsValue] = useState({
		['statuses']: type === 'edit' ? tagChecked : 'goods',
		warehouseId: null,
	});
	const [isChangeTag, seIschangeTag] = useState(false);
	const [check, setCheck] = useState(true);
	const [tableCondition, setTableCondition] = useState({
		// goodsNameAndmaterialCode: '',
		// specification: '',
	});
	const [changeData, setChangeData] = useState([]);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 9999 });
	const [wareHousesLists, setWareHousesList] = useState([]);
	const [selectedList, setSelectedList] = useState([]);

	const [wh, setWH] = useState('');
	const [isShow, setIsShow] = useState(false);
	const [isClickcomfirm, setIsClickcomfirm] = useState(false);
	const [clickEnter, setClickEnter] = useState(0);
	const [list, setList] = useState([]);
	const [rowId, setRowId] = useState('');
	const [tagsData, setTagsData] = useState([]);
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
			title: fields.goodsName,
			dataIndex: 'name',
			width: 150,
			ellipsis: true,
		},
		{
			title: '通用名',
			dataIndex: 'commonName',
			key: 'commonName',
			width: 100,
			ellipsis: true,
		},
		{
			title: '收费编码',
			dataIndex: 'chargeCode',
			key: 'chargeCode',
			width: 150,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			ellipsis: true,
			width: 150,
			render: (text: any, record: Record<string, any>) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 150,
			ellipsis: true,
		},
		{
			title: '收费项',
			dataIndex: 'chargeName',
			key: 'chargeName',
			width: 200,
			ellipsis: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 150,
			align: 'right',
			render: (price) => convertPriceWithDecimal(price),
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '请领单位',
			dataIndex: 'conversionRate',
			width: 120,
			render: (text, record) => {
				return `${text}${record.minGoodsUnit}/${record.conversionUnitName}`;
			},
		},
		{
			title: '大/中包装',
			dataIndex: 'largeBoxNum',
			width: 120,
			render: (text, record) => dealPackNum(text, record.minGoodsNum),
		},
		{
			title: fields.goodsProperty,
			dataIndex: 'isHighValue',
			width: 110,
			render: (text) => (text ? '高值' : '低值'),
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			width: 200,
		},
	];

	useDidMount(() => {
		queryUserHabbit();
	});

	const queryUserHabbit = async () => {
		let obj = {};
		obj.preferenceCode = 'department_ordinaryOperate_add_basicMaterials_operatePageSwitch_button';
		obj.systemId = 1;
		// obj.userId = Number(sessionStorage.getItem('userId')) || '';
		// obj.orgId = 283;
		const res = await getPreferenceByCode(obj);
		if (res && res.code === 0) {
			setCheck(res.data[0].detailInfo === 'true' ? true : false);
		}
		// console.log('ressssss', res);
	};

	// console.log('check', check);

	useEffect(() => {
		onGetQueryData && onGetQueryData(check);
	}, [check]);

	// 仓库列表请求
	useEffect(() => {
		let tabList = JSON.parse(sessionStorage.getItem('dictionary') || '{}').package_config || [];
		tabList.map((value) => {
			if (value.text == '医耗套包') {
				tagsDat = [
					{ name: fields.baseGoods, value: 'goods' },
					// 根据需求取消普通请领时的定数包展示
					// { name: '定数包', value: 'package_bulk' },
					{ name: '医耗套包', value: 'package_ordinary' },
				];
			}
		});
		setTagsData(tagsDat);
		const getWarehouses = async () => {
			let wareHouses = await getWarehousesByUser({ excludeCentralWarehouse: true });
			if (wareHouses.code == 0) {
				setWareHousesList(wareHouses.data);
			}
		};
		getWarehouses();
	}, []);
	// console.log('acquiesceParameter.warehouseId ', wh);
	useEffect(() => {
		isExitsWH();
	}, [wh, acquiesceParameter]);

	const isExitsWH = () => {
		if (wh) {
			form.setFieldsValue({ warehouseId: wh });
			acquiesceParameter.warehouseId = wh;
			setParmsValue({ ...acquiesceParameter });
		} else {
			if (acquiesceParameter.warehouseId) {
				form.setFieldsValue({ warehouseId: acquiesceParameter.warehouseId });
				setParmsValue({ ...acquiesceParameter });
			}
		}
	};
	useEffect(() => {
		if (tagChecked) {
			form.setFieldsValue({ statuses: tagChecked });
			form.submit();
		}
	}, [tagChecked]);
	const resetForm = () => {
		form.resetFields();
		if (type == 'edit' && !isChangeTag) {
			form.setFieldsValue({ statuses: tagChecked });
		}
		form.submit();
	};
	const handleChangeTag = (value, check) => {
		if (check) {
			seIschangeTag(true);
			form.resetFields();
			form.setFieldsValue({ ['statuses']: value, warehouseId: parmsValue.warehouseId });
			setParmsValue({ ...parmsValue, ['statuses']: value, warehouseId: parmsValue.warehouseId });
			form.submit();
		}
	};
	const onFinish = (values) => {
		if (values.statuses) {
			setParmsValue({ ...parmsValue, statuses: values.statuses });
		}
		if (values.warehouseId) {
			setParmsValue({ ...parmsValue, warehouseId: values.warehouseId });
		}
		searchTableList(values);
	};
	// console.log(wareHousesList);

	const onChangeSwitch = async (checked) => {
		// console.log(`switch to ${checked}`);
		checked && form.resetFields();
		setCheck(!checked);
		let obj = {};
		obj.preferenceCode = 'department_ordinaryOperate_add_basicMaterials_operatePageSwitch_button';
		obj.userId = Number(sessionStorage.getItem('userId')) || '';
		obj.preferenceName = `科室库_普通请领_新增_${fields.baseGoods}_请领页面切换_按钮`;
		obj.orgId = 104;
		obj.id = 283;
		obj.systemId = 1;
		obj.detailInfo = !checked;
		await addOrUpdate(obj);
	};

	const selectRowOfClick = (selectedRecord: object) => {
		// setIsShow(false);
		setRowId(selectedRecord.id);
		form.submit();
		const array = selectedList.some((e) => e.id === selectedRecord.id)
			? selectedList.filter((e) => e.id !== selectedRecord.id)
			: [...selectedList, selectedRecord];
		setSelectedList(array);
		console.log('arrrra', array);
		onSelectedData && onSelectedData(array);
	};

	const queryList = async () => {
		if (JSON.stringify(tableCondition) !== '{}') {
			tableCondition.departmentId = wareHousesList.find(
				(item) => item.id == parmsValue.warehouseId,
			).departmentId;

			const res = await queryGoodsList(tableCondition);
			if (res && res.code === 0) {
				// console.log('resss', res);
				setList(res.data.rows || []);
				// if(!res.data.rows.length){
				//  setIsShow(false);
				// }
			}
		}
	};

	const changeCondition = (filed, val) => {
		// console.log('filedfiled', val, filed);
		setChangeData([filed, val]);
		// console.log('valvval',val,  wareHousesList.find((item) => item.id == parmsValue.warehouseId).departmentId);
		// parmsValue.departmentId = wareHousesList.find((item) => item.id == parmsValue.warehouseId).departmentId;
		// setTableCondition({ ...tableCondition, ...pageConfig, ...parmsValue, [filed]: val });
	};

	const debouncedSearchTerm = useDebounce(changeData[1], 1000);

	// console.log('wareHousesList', debouncedSearchTerm, check);

	useEffect(() => {
		if (check && tableCondition) {
			queryList();
		}
	}, [tableCondition]);
	useEffect(() => {
		if (isClickcomfirm || debouncedSearchTerm || clickEnter) {
			// console.log('debouncedSearchTermdebouncedSearchTerm', debouncedSearchTerm, check);

			parmsValue.departmentId = wareHousesList.find(
				(item) => item.id == parmsValue.warehouseId,
			).departmentId;

			setTableCondition({
				...tableCondition,
				...pageConfig,
				...parmsValue,
				[changeData[0]]: changeData[1],
			});
			// console.log('clickccctableConditionchangeData',isShow, tableCondition, changeData);
		}
		setChangeData([]);
	}, [debouncedSearchTerm, clickEnter, isClickcomfirm]);

	const onChangeSpecification = (event, filed) => {
		const { value } = event.target;
		changeCondition(filed, value);
	};
	useEffect(() => {
		if (!check) {
			form.submit();
		}
	}, [check]);
	useEffect(() => {
		if (!isShow) {
			tableCondition.goodsNameAndmaterialCode = '';
			tableCondition.specification = '';
			form.setFieldsValue({
				specification: '',
			});
			// console.log('tableCondition21312312',tableCondition)
			setTableCondition({ ...tableCondition, ...pageConfig, ...parmsValue });
		}
	}, [!isShow]);

	useEffect(() => {
		document.onclick = () => {
			setIsShow(false);
			setIsClickcomfirm(false);
		};
	}, []);

	useEffect(() => {
		if (isClickcomfirm && isShow) {
			form.submit();
		}
	}, [isShow]);

	// console.log('table', isShow,form);

	const onkeydown = (e) => {
		if (e.keyCode === 13) {
			setClickEnter(clickEnter + 1);
			setIsShow(true);
			setIsClickcomfirm(true);
		}
	};

	const setRowClassName = (record, val) => {
		const isActive = selectedList.some((e) => e.id === record.id);

		return isActive ? styles.selected : '';
	};
	const mouseHover = (record) => {};
	useEffect(() => {
		select();
	}, [goodsSelectedList]);
	const select = () => {
		goodsSelectedList.map((e) => {
			setRowClassName(e, _);
		});
		setSelectedList(goodsSelectedList);
	};

	const handleOnKeydown = (e: any) => {
		let event = window.event || e;
		let oneArr = list && list.length > 0 ? list : [];
		let id = '';
		switch (event.keyCode) {
			case 13:
				e.stopPropagation();
				e.preventDefault();
				let selectedVal = oneArr.find((e) => e.id === rowId);
				setIsShow(selectedVal.id && false);
				onSelectedData && onSelectedData(selectedVal);
				break;
			case 38: //上
				if (rowId) {
					for (var i = 0; i < oneArr.length; i++) {
						if (oneArr[i].id === rowId) {
							id = i > 0 ? oneArr[i - 1].id : oneArr[0].id;
							break;
						}
					}
					setRowId(id);
				} else {
					setRowId(oneArr[0].id);
				}

				break;
			case 40: //下
				if (rowId) {
					for (let i = 0; i < oneArr.length; i++) {
						oneArr[i].disblock = false;
						if (oneArr[i].id === rowId) {
							id = i + 1 >= oneArr.length ? oneArr[oneArr.length - 1].id : oneArr[i + 1].id;
							break;
						}
					}
					setRowId(id);
				} else {
					setRowId(oneArr[0].id);
				}

				break;
		}
	};

	const onShow = (e) => {
		e.nativeEvent.stopImmediatePropagation();
		setIsShow(true);
	};
	return (
		<>
			<Form
				{...searchFormItem4}
				initialValues={parmsValue}
				form={form}
				labelAlign='left'
				onFinish={onFinish}>
				<div className='searchWrap'>
					{check ? (
						<Row className='searchForm'>
							<Row style={{ width: '100%' }}>
								<Col {...searchColItemSingle}>
									<FormItem
										label='类型'
										name='statuses'
										{...searchFormItemSingle4}
										labelAlign='left'>
										<div className='tagWrapClass'>
											{tagsData.map((tag) => (
												<CheckableTag
													key={tag.value}
													checked={form.getFieldValue('statuses') == tag.value}
													onChange={(checked) => handleChangeTag(tag.value, checked)}>
													{tag.name}
												</CheckableTag>
											))}
										</div>
									</FormItem>
								</Col>
							</Row>

							<Row style={{ width: '100%' }}>
								{/* <Col {...searchColItem}>
                         <FormItem label="仓库" name="warehouseId" >
                           <Select allowClear defaultValue>
                             {
                               (wareHousesList || []).map((item:any)=>{
                                 return <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>
                               })
                             }

                         </Select>
                         </FormItem>
                   </Col> */}

								<Col {...searchColItem}>
									<FormItem
										label='仓库'
										name='warehouseId'>
										<Select
											style={{ width: '100%' }}
											placeholder='请选择仓库'
											showSearch
											onChange={(value) => setWH(value)}
											getPopupContainer={(node) => node.parentNode}
											// onChange={e => this.handleWareHousesChange(e)}
											filterOption={(input, option) =>
												option.props.custom.toLowerCase().indexOf(input.toLowerCase()) >= 0
											}
											disabled={type === 'edit' ? true : false}>
											{(wareHousesList || []).map((item) => {
												return (
													<Option
														custom={(item.nameAcronym || '') + '' + item.name}
														key={item.id}>
														{item.name}
													</Option>
												);
											})}
										</Select>
									</FormItem>
								</Col>

								{form.getFieldValue('statuses') != 'package_ordinary' && (
									<Col {...searchColItem}>
										<FormItem
											label={`${fields.goodsCode}名称`}
											name='goodsNameAndmaterialCode'
											{...searchFormItem6}>
											{/* <div onKeyDown={handleOnKeydown}> */}
											<Select
												placeholder={tableCondition.goodsNameAndmaterialCode ? '' : '请输入'}
												open={isShow}
												bordered={true}
												showSearch
												onSearch={(val) => changeCondition('goodsNameAndmaterialCode', val)}
												showArrow={false}
												onKeyDown={(e) => onkeydown(e)}
												dropdownClassName={styles.drop}
												dropdownRender={(menu) => (
													<div
														style={{ left: '258px' }}
														onClick={onShow}>
														<TableBox
															rowKey='id'
															style={{
																borderStyle: 'solid',
																borderColor: CONFIG_LESS['@bgc_table'],
															}}
															tableInfoId='37'
															columns={columns}
															filterMultiple={true}
															className='hoverTable'
															// onKeyDown={handleOnKeydown}
															rowClassName={setRowClassName}
															options={{ density: false, fullScreen: false, setting: false }}
															scroll={{ x: '100%', y: 391 }}
															dataSource={list}
															onRow={(record) => ({
																onClick: () => {
																	selectRowOfClick(record);
																},
																onMouseEnter: () => {
																	mouseHover(record);
																},
															})}
														/>
													</div>
												)}>
												<Input.Search></Input.Search>
											</Select>
											{/* </div> */}
										</FormItem>
									</Col>
								)}

								{form.getFieldValue('statuses') !== 'goods' ? (
									<Col {...searchColItem}>
										<FormItem
											label={typeName[`${form.getFieldValue('statuses')}`]}
											name={
												form.getFieldValue('statuses') == 'package_ordinary' ? 'keyword' : 'name'
											}
											{...(form.getFieldValue('statuses') !== 'goods' ? searchFormItem6 : '')}>
											<Input
												maxLength={30}
												placeholder='请输入'
											/>
										</FormItem>
									</Col>
								) : null}
								{form.getFieldValue('statuses') == 'goods' && (
									<>
										<Col {...searchColItem}>
											<FormItem
												name='commonName'
												label='通用名'>
												<Input
													autoComplete='off'
													onKeyDown={(e) => onkeydown(e)}
													maxLength={30}
													placeholder='请输入'
													// onClick
													onChange={(e) => changeCondition('commonName', e.target.value)}
												/>
											</FormItem>
										</Col>
										<Col {...searchColItem}>
											<FormItem
												name='specification'
												label='规格/型号'>
												{/* <div onClick={onShow}> */}
												<Input
													autoComplete='off'
													onKeyDown={(e) => onkeydown(e)}
													maxLength={30}
													placeholder='请输入'
													// onClick
													onChange={(e) => changeCondition('specification', e.target.value)}
												/>
												{/* </div> */}
											</FormItem>
										</Col>
									</>
								)}
							</Row>
						</Row>
					) : (
						<Row className='searchForm'>
							<Row style={{ width: '100%' }}>
								<Col {...searchColItemSingle}>
									<FormItem
										label='类型'
										name='statuses'
										{...searchFormItemSingle4}
										labelAlign='left'>
										<div className='tagWrapClass'>
											{tagsData.map((tag) => (
												<CheckableTag
													key={tag.value}
													checked={form.getFieldValue('statuses') == tag.value}
													onChange={(checked) => handleChangeTag(tag.value, checked)}>
													{tag.name}
												</CheckableTag>
											))}
										</div>
									</FormItem>
								</Col>
							</Row>
							<Row style={{ width: '100%' }}>
								{/* <Col {...searchColItem}>
                  <FormItem label="仓库" name="warehouseId" >
                    <Select allowClear defaultValue>
                      {
                        (wareHousesList || []).map((item:any)=>{
                          return <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>
                        })
                      }

                  </Select>
                  </FormItem>
            </Col> */}

								<Col {...searchColItem}>
									<FormItem
										label='仓库'
										name='warehouseId'>
										<Select
											style={{ width: '100%' }}
											placeholder='请选择仓库'
											showSearch
											onChange={(value) => setWH(value)}
											getPopupContainer={(node) => node.parentNode}
											// onChange={e => this.handleWareHousesChange(e)}
											filterOption={(input, option) =>
												option.props.custom.toLowerCase().indexOf(input.toLowerCase()) >= 0
											}
											disabled={type === 'edit' ? true : false}>
											{(wareHousesList || []).map((item) => {
												return (
													<Option
														custom={(item.nameAcronym || '') + '' + item.name}
														key={item.id}>
														{item.name}
													</Option>
												);
											})}
										</Select>
									</FormItem>
								</Col>

								{form.getFieldValue('statuses') != 'package_ordinary' && (
									<Col {...searchColItem}>
										<FormItem
											label={fields.goodsCode}
											name='materialCode'>
											<Input
												maxLength={30}
												placeholder={`请输入${fields.goodsCode}`}
											/>
										</FormItem>
									</Col>
								)}

								<Col {...searchColItem}>
									<FormItem
										label={typeName[`${form.getFieldValue('statuses')}`]}
										name={form.getFieldValue('statuses') == 'package_ordinary' ? 'keyword' : 'name'}
										{...(form.getFieldValue('statuses') !== 'goods' ? searchFormItem6 : '')}>
										<Input
											maxLength={30}
											placeholder='请输入'
										/>
									</FormItem>
								</Col>
								{form.getFieldValue('statuses') == 'package_bulk' && (
									<Col {...searchColItem}>
										<FormItem
											label={fields.goodsName}
											name='goodsName'>
											<Input
												maxLength={30}
												placeholder={`请输入${fields.goodsName}`}
											/>
										</FormItem>
									</Col>
								)}
								{form.getFieldValue('statuses') == 'goods' && (
									<>
										<Col {...searchColItem}>
											<FormItem
												name='chargeCode'
												label='收费编码'>
												<Input
													maxLength={30}
													placeholder='请输入'
												/>
											</FormItem>
										</Col>
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
										<Col {...searchColItem}>
											<FormItem
												name='commonName'
												label='通用名'
												{...searchFormItem6}>
												<Input
													maxLength={30}
													placeholder='请输入'
												/>
											</FormItem>
										</Col>
									</>
								)}
							</Row>
						</Row>
					)}
					<div
						style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
						{form.getFieldValue('statuses') === 'goods' ? (
							<div className='searchBtn'>
								<Switch
									checked={!check}
									onChange={onChangeSwitch}
								/>
							</div>
						) : null}
						<div></div>
						{!check || form.getFieldValue('statuses') === 'package_ordinary' ? (
							<div className='searchBtn'>
								<Button
									type='primary'
									htmlType='submit'>
									查询
								</Button>
								<Button
									onClick={() => {
										resetForm();
									}}>
									重置
								</Button>
							</div>
						) : null}
					</div>
				</div>
			</Form>
		</>
	);
};

export default FormSearch;
