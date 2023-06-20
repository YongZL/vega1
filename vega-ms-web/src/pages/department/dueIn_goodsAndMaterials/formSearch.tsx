import DatePickerMore from '@/components/DatePickerMore';
import {
	searchColItem,
	searchColItemSingle,
	searchFormItem4,
	searchFormItemSingle4,
} from '@/constants/formLayout';
import { getDay } from '@/utils';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Select, Tag } from 'antd';
import { FC, useEffect, useState } from 'react';
// import { pickingPendingStatus } from '@/constants/dictionary';
import { useModel } from 'umi';
import { getDepartmentList, getWarehousesByDepartment } from './service';

const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');

const CheckableTag = Tag.CheckableTag;
const FormItem = Form.Item;
const tagsDat = [
	{ name: fields.baseGoods, value: 'goods' },
	{ name: '定数包', value: 'package_bulk' },
	// { name: '手术套包', value: 'package_surgical' },
];
const FormSearch: FC<{}> = (props) => {
	const { fields } = useModel('fieldsMapping');
	const { form } = props;
	const [parmsValue, setParmsValue] = useState({
		['type']: 'goods',
		['status']: 'generate_pick_order_pending',
	});
	const [refresh, setRefresh] = useState(false);
	const [expand, setExpand] = useState(true);
	const [departmentList, setDepartmentList] = useState([]);
	const [warehousesList, setWarehousesList] = useState([]);
	const [tagsData, setTagsData] = useState([]);
	// const [defaultValue, setDefaultValue] = useState({})
	// 首次获取科室
	const getDepartmentLists = async (params: any) => {
		let res = await getDepartmentList(params);
		if (res && res.code == 0) {
			setDepartmentList(res.data);
			// form.setFieldsValue({departmentIds: res.data[0].departmentId});
		}
	};
	useEffect(() => {
		let tabList = JSON.parse(sessionStorage.getItem('dictionary') || '{}').package_config || [];
		tabList.map((value) => {
			if (value.text == '医耗套包') {
				tagsDat.push({ name: '医耗套包', value: 'package_ordinary' });
			}
		});
		setTagsData(tagsDat);
		getDepartmentLists({ type: parmsValue.type });
	}, []);
	// 获取仓库
	const getWarehousesLists = async (departmentIds) => {
		let res = await getWarehousesByDepartment({ departmentIds });
		if (res && res.code == 0) {
			setWarehousesList(res.data);
		}
	};
	// 科室改变重新请求仓库
	function onChange(value) {
		form.setFieldsValue({ warehouseIds: null });
		if (value) {
			getWarehousesLists(value);
		}
	}
	useEffect(() => {
		refresh && setTimeout(() => setRefresh(false));
	}, [refresh]);
	// 查询
	const onFinish = (filters) => {
		let creatValues = {
			...filters,
			start:
				filters.timeCreated && filters.timeCreated.length && filters.timeCreated[0]
					? getDay(filters.timeCreated[0])
					: undefined,
			end:
				filters.timeCreated && filters.timeCreated.length && filters.timeCreated[1]
					? getDay(filters.timeCreated[1], 'end')
					: undefined,
		};
		delete creatValues.timeCreated;
		props.searchTabeList({ ...creatValues, pageNum: 0, pageSize: 50 });
	};
	const resetForm = () => {
		form.resetFields();
		props.reSetFormSearch({ type: parmsValue.type, pageNum: 0, pageSize: 50 });
	};
	const handleChangeTag = (value, check) => {
		if (check) {
			form.resetFields();
			getDepartmentLists({ type: value });
			form.setFieldsValue({ ['type']: value });
			setParmsValue({ ...parmsValue, ['type']: value });
			setRefresh(true);
			props.setPageConfig({ pageNum: 0, pageSize: 50 });
			props.setTotal(0);
			let newIndex = value == 'goods' ? '1' : value == 'package_bulk' ? '2' : '3';
			props.setCurrentIndex(newIndex);
			// form.setFieldsValue({departmentIds: departmentList[0].departmentId});
			// form.submit();
			props.setList([]);
		}
	};
	return (
		<>
			<Form
				{...searchFormItem4}
				form={form}
				labelAlign='left'
				initialValues={parmsValue}
				onFinish={onFinish}>
				<div className='searchWrap'>
					<Row className='searchForm'>
						<Row style={{ width: '100%' }}>
							<Col {...searchColItemSingle}>
								<FormItem
									label='类型'
									name='type'
									{...searchFormItemSingle4}
									labelAlign='left'>
									<div className='tagWrapClass'>
										{tagsData.map((tag) => (
											<CheckableTag
												key={tag.value}
												checked={form.getFieldValue('type') == tag.value}
												onChange={(checked) => handleChangeTag(tag.value, checked)}>
												{tag.name}
											</CheckableTag>
										))}
									</div>
								</FormItem>
							</Col>
						</Row>
						<Row className={expand ? '' : 'dis-n'}>
							<Row style={{ width: '100%' }}>
								<Col {...searchColItemSingle}>
									<FormItem
										label='提交时间 '
										name='timeCreated'
										{...searchFormItemSingle4}>
										<DatePickerMore
											format={['YYYY-MM-DD', 'YYYY/MM/DD']}
											type='M'
											isToday={true}
										/>
									</FormItem>
								</Col>
							</Row>
							{/* <Col {...searchColItem}>
                <FormItem label="状态" name="status">
                  <Select
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    placeholder="请选择状态"
                  >
                    {pickingPendingStatus.map((item) => {
                      return (
                        <Select.Option key={item.value} value={item.value}>
                          {item.label}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </FormItem>
              </Col> */}
							<Col {...searchColItem}>
								<FormItem
									label='推送科室'
									name='departmentIds'>
									<Select
										showSearch
										allowClear
										optionFilterProp='children'
										onChange={onChange}
										// onblur={onChange}
										filterOption={(input, option) =>
											option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										placeholder='请选择推送科室'>
										{departmentList.map((item) => (
											<Select.Option
												value={item.departmentId}
												key={item.departmentId}>
												{item.departmentName}
											</Select.Option>
										))}
									</Select>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label='推送仓库'
									name='warehouseIds'>
									<Select
										showSearch
										allowClear
										optionFilterProp='children'
										filterOption={(input, option) =>
											option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										placeholder='请推送选择仓库'>
										{warehousesList.map((item) => (
											<Select.Option
												value={item.id}
												key={item.id}>
												{item.name}
											</Select.Option>
										))}
									</Select>
								</FormItem>
							</Col>
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
							{form.getFieldValue('type') == 'package_bulk' && (
								<Col {...searchColItem}>
									<FormItem
										label='定数包'
										name='packageBulkName'>
										<Input
											maxLength={30}
											placeholder='请输入'
										/>
									</FormItem>
								</Col>
							)}
							<Col {...searchColItem}>
								<FormItem
									label={
										form.getFieldValue('type') == 'package_ordinary'
											? '医耗套包名称'
											: fields.goodsName
									}
									name={
										form.getFieldValue('type') == 'package_ordinary' ? 'ordinaryName' : 'goodsName'
									}>
									<Input
										maxLength={30}
										placeholder='请输入'
									/>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label='来源'
									name='source'>
									<Select
										showSearch
										allowClear
										optionFilterProp='children'
										filterOption={(input, option) =>
											option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										placeholder='请选择来源'>
										<Select.Option
											value='goods_request'
											key='goods_request'>
											普通请领
										</Select.Option>
										<Select.Option
											value='automatic_resupply'
											key='automatic_resupply'>
											自动补货
										</Select.Option>
									</Select>
								</FormItem>
							</Col>
						</Row>
					</Row>
					<div className='searchBtn'>
						<Button
							type='primary'
							htmlType='submit'>
							查询
						</Button>
						<Button onClick={resetForm}>重置</Button>
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
		</>
	);
};
export default FormSearch;
