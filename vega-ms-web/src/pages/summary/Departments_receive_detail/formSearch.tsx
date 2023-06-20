import type { FC } from 'react';

import React, { useState, useEffect } from 'react';
import { Button, Col, Row, Select, Form, DatePicker } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { notification } from '@/utils/ui';
import moment from 'moment';

import { searchFormItem4, searchFormItem6, searchColItem } from '@/constants/formLayout';
import { getDepartmentList } from './service';

export const searchColItemSingle = { xs: 24, sm: 24, md: 24, lg: 24, xl: 20 };

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const FormSearch: FC<any> = ({ ...props }) => {
	const { form, setSearchParams } = props;
	const [expand, setExpand] = useState(true);
	const [departmentList, setDepartmentList] = useState([]);

	//获取部门列表
	const statementlist = () => {
		if (form.getFieldsValue('item').item == undefined) {
			notification.error('请先选择消耗日期');
			return;
		}
		const tatementlist = form.getFieldsValue('item').item;
		const getDepartmentLists = async () => {
			const res = await getDepartmentList({
				timeFrom: moment(
					new Date(new Date(new Date(tatementlist[0]).toLocaleDateString()).getTime()),
				).valueOf(),
				timeTo: moment(
					new Date(
						new Date(new Date(tatementlist[1]).toLocaleDateString()).getTime() +
							24 * 60 * 60 * 1000 -
							1,
					),
				).valueOf(),
			});
			if (res && res.code === 0) {
				setDepartmentList(res.data);
			}
		};
		getDepartmentLists();
	};

	// 查询
	const onFinish = (filters) => {
		props.searchTabeList({ pageNum: 0 });
	};
	const resetSerach = () => {
		form.resetFields();
		props.setList([]);
		props.setTotal(0);
		setDepartmentList([]);
		setSearchParams();
	};

	return (
		<>
			<Form
				{...searchFormItem4}
				form={form}
				labelAlign='left'
				onFinish={onFinish}
				initialValues={{
					time: [
						moment(new Date(new Date(new Date().toLocaleDateString()).getTime())).valueOf(),
						moment(
							new Date(
								new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1,
							),
						).valueOf(),
					],
				}}>
				<div className='searchWrap'>
					<Row className='searchForm'>
						<Row
							className={expand ? '' : 'dis-n'}
							style={{ width: '100%' }}>
							<Col {...searchColItem}>
								<FormItem
									name='item'
									label='消耗日期'
									{...searchFormItem6}
									rules={[{ required: true, message: '请选择消耗日期' }]}>
									<RangePicker format='YYYY/MM/DD' />
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label='科室名称'
									name='departmentId'
									rules={[{ required: true, message: '请选择科室名称' }]}>
									<Select
										showSearch
										allowClear
										optionFilterProp='children'
										onFocus={statementlist}
										filterOption={(input, option) =>
											option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										placeholder='请选择科室'>
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
