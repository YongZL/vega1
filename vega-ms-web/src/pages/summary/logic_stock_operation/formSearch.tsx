import DatePickerMore from '@/components/DatePickerMore';
import { logicStockOperationType } from '@/constants/dictionary';
import {
	searchColItem,
	searchColItemSingle,
	searchFormItem4,
	searchFormItemSingle4,
} from '@/constants/formLayout';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Select } from 'antd';
import { FC, useEffect, useState } from 'react';
import { useModel } from 'umi';
import { getDepartmentList, getWarehousesByDepartment } from './service';

const FormItem = Form.Item;
const FormSearch: FC<{}> = (props) => {
	const { form } = props;
	const { fields } = useModel('fieldsMapping');
	const [refresh, setRefresh] = useState(false);
	const [expand, setExpand] = useState(true);
	const [departmentList, setDepartmentList] = useState([]);
	const [warehousesList, setWarehousesList] = useState([]);
	// 首次获取科室
	useEffect(() => {
		const getDepartmentLists = async () => {
			let res = await getDepartmentList();
			if (res && res.code === 0) {
				setDepartmentList(res.data);
			}
		};
		getDepartmentLists();
	}, []);
	// 获取仓库
	const getWarehousesLists = async (departmentIds) => {
		let res = await getWarehousesByDepartment({ departmentIds });
		if (res && res.code === 0) {
			setWarehousesList(res.data);
		}
	};
	// 科室改变重新请求仓库
	function onChange(value) {
		if (value) {
			getWarehousesLists(value);
		}
		form.setFieldsValue({ warehouseId: null });
	}
	useEffect(() => {
		refresh && setTimeout(() => setRefresh(false));
	}, [refresh]);
	// 查询
	const onFinish = (filters) => {
		// let creatValues = {
		//   departmentIds: filters.departmentIds || undefined,
		//   warehouseIds: filters.warehouseId || undefined,
		//   createdFrom:
		//     filters.submitTime && filters.submitTime.length && filters.submitTime[0]
		//       ? getDay(filters.submitTime[0])
		//       : undefined,
		//   createdTo:
		//     filters.submitTime && filters.submitTime.length && filters.submitTime[1]
		//       ? getDay(filters.submitTime[1], 'end')
		//       : undefined,
		//   materialCode: filters.materialCode || undefined,
		//   goodsName: filters.goodsName || undefined,
		//   type: filters.type || undefined,
		//   handleResult: filters.succeeded,
		// };
		props.searchTabeList({ pageNum: 0 });
	};
	const resetSerach = () => {
		form.resetFields();
		props.reSetFormSearch();
	};
	return (
		<>
			<Form
				{...searchFormItem4}
				form={form}
				labelAlign='left'
				onFinish={onFinish}>
				<div className='searchWrap'>
					<Row className='searchForm'>
						<Row style={{ width: '100%' }}>
							<Col {...searchColItemSingle}>
								<FormItem
									label='创建时间'
									name='submitTime'
									{...searchFormItemSingle4}>
									<DatePickerMore
										format={['YYYY-MM-DD', 'YYYY/MM/DD']}
										type='M'
									/>
								</FormItem>
							</Col>
						</Row>
						<Row
							className={expand ? '' : 'dis-n'}
							style={{ width: '100%' }}>
							<Col {...searchColItem}>
								<FormItem
									label='同步结果'
									name='succeeded'>
									<Select
										allowClear
										placeholder='请选择同步结果'>
										<Select.Option value={true}>成功</Select.Option>
										<Select.Option value={false}>失败</Select.Option>
									</Select>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label='科室'
									name='departmentIds'>
									<Select
										allowClear
										showSearch
										optionFilterProp='children'
										onChange={onChange}
										filterOption={(input, option) =>
											option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										placeholder='请选择科室'>
										{departmentList.map((item) => (
											<Select.Option value={item.departmentId}>{item.departmentName}</Select.Option>
										))}
									</Select>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label='仓库'
									name='warehouseId'>
									<Select
										allowClear
										showSearch
										optionFilterProp='children'
										filterOption={(input, option) =>
											option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										placeholder='请选择仓库'>
										{warehousesList.map((item) => (
											<Select.Option value={item.id}>{item.name}</Select.Option>
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
							<Col {...searchColItem}>
								<FormItem
									label='类型'
									name='type'>
									<Select
										allowClear
										showSearch
										optionFilterProp='children'
										filterOption={(input, option) =>
											option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										placeholder='请选择类型'
										options={logicStockOperationType}
									/>
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
						<Button onClick={resetSerach}>重置</Button>
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
