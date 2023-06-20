import TagSelect from '@/components/TagSelect';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, Row, Select } from 'antd';
import { FC, useEffect, useState } from 'react';

import { hisStatus } from '@/constants/dictionary';
import {
	searchColItem,
	searchColItemSingle,
	searchFormItem4,
	searchFormItem6,
	searchFormItemSingle4,
} from '@/constants/formLayout';
import { useModel } from 'umi';
import { getCustodiansByUser, getDepartmentList } from './service';

const FormItem = Form.Item;

const FormSearch: FC<{}> = (props) => {
	const { form } = props;
	const [refresh, setRefresh] = useState(false);
	const [expand, setExpand] = useState(true);
	const [departmentList, setDepartmentList] = useState([]);
	const [warehousesList, setWarehousesList] = useState([]);
	const { fields } = useModel('fieldsMapping');

	useEffect(() => {
		// 获取仓库
		const getWarehousesLists = async () => {
			const res = await getCustodiansByUser();
			if (res && res.code === 0) {
				setWarehousesList(res.data);
			}
		};
		// 首次获取科室
		const getDepartmentLists = async () => {
			const res = await getDepartmentList();
			if (res && res.code === 0) {
				setDepartmentList(res.data);
			}
		};
		getDepartmentLists();
		getWarehousesLists();
	}, []);

	useEffect(() => {
		refresh && setTimeout(() => setRefresh(false));
	}, [refresh]);

	// 查询
	const onFinish = () => {
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
									label='状态'
									name='status'
									{...searchFormItemSingle4}
									labelAlign='left'>
									<TagSelect expandable>
										{hisStatus.map((item) => {
											return (
												<TagSelect.Option
													key={item.value}
													value={item.value}>
													{item.label}
												</TagSelect.Option>
											);
										})}
									</TagSelect>
								</FormItem>
							</Col>
						</Row>
						<Row className={expand ? '' : 'dis-n'}>
							<Col {...searchColItem}>
								<FormItem
									label='收费序号'
									name='adviceNo'>
									<Input
										maxLength={30}
										placeholder='请输入收费序号'
									/>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label={fields.goodsName}
									name='materialName'>
									<Input
										maxLength={30}
										placeholder={`请输入${fields.goodsName}`}
									/>
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
									label={`${fields.goods}条码`}
									name='operatorBarcode'>
									<Input
										maxLength={30}
										placeholder={`请输入${fields.goods}条码`}
									/>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label={`一级${fields.distributor}`}
									name='custodianName'
									{...searchFormItem6}>
									<Select
										allowClear
										showSearch
										optionFilterProp='children'
										filterOption={(input, option) =>
											option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										placeholder={`请选择一级${fields.distributor}`}>
										{warehousesList.map((item) => (
											<Select.Option
												value={item.id}
												key={item.id}>
												{item.companyName}
											</Select.Option>
										))}
									</Select>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label='病人编号'
									name='patientNo'>
									<Input
										maxLength={30}
										placeholder='请输入病人编号'
									/>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label='住院号'
									name='hospitalizationNum'>
									<Input
										maxLength={30}
										placeholder='请输入住院号'
									/>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label='SPD科室名'
									name='spdDepartmentName'
									{...searchFormItem6}>
									<Select
										allowClear
										showSearch
										optionFilterProp='children'
										filterOption={(input, option) =>
											option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										placeholder='请选择SPD科室名'>
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
									name='timeConsumed'
									label='消耗时间'>
									<DatePicker.RangePicker
										format={['YYYY-MM-DD', 'YYYY/MM/DD']}
										style={{ width: '100%' }}
									/>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									name='timeCharged'
									label='收费时间'>
									<DatePicker.RangePicker
										format={['YYYY-MM-DD', 'YYYY/MM/DD']}
										style={{ width: '100%' }}
									/>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									name='timeUncharged'
									label='退费时间'>
									<DatePicker.RangePicker
										format={['YYYY-MM-DD', 'YYYY/MM/DD']}
										style={{ width: '100%' }}
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
