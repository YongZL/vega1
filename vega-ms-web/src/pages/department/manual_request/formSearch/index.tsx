import type { ForwardRefExoticComponent } from 'react';
import React, { useEffect, useState } from 'react';
import { Button, Col, Input, Row, Select, Form, DatePicker } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import TagSelect from '@/components/TagSelect';
import DatePickerMore from '@/components/DatePickerMore';
import moment from 'moment';
import { history } from 'umi';
import { getDay } from '@/utils';

import { getDepartmentList, getWarehousesByDepartment } from '../list/service';
import {
	searchFormItemSingle4,
	searchFormItem4,
	searchColItemSingle,
	searchColItem,
} from '@/constants/formLayout';
import { goodsRequestStatusValue } from '@/constants/dictionary';

const FormItem = Form.Item;

const FormSearch: ForwardRefExoticComponent<{}> = React.forwardRef((props, ref) => {
	const { form } = props;
	// const [form] = Form.useForm();
	const [refresh, setRefresh] = useState(false);
	const [expand, setExpand] = useState(true);
	const [departmentList, setDepartmentList] = useState([]);
	const [warehousesList, setWarehousesList] = useState([]);
	const manual_request =
		(sessionStorage.getItem('manual_request') &&
			JSON.parse(sessionStorage.getItem('manual_request') || '')) ||
		[];

	// 获取仓库
	const getWarehousesLists = async (departmentIds) => {
		const res = await getWarehousesByDepartment({ departmentIds });
		if (res && res.code === 0) {
			setWarehousesList(res.data);
		}
	};

	//编辑等操作回显
	useEffect(() => {
		if (history.location && history.location.state && JSON.stringify(manual_request) !== '{}') {
			const { time, fhTime, spTime, code, departmentIds, status, warehouseId } = manual_request;

			if (time && time.length) {
				form.setFieldsValue({
					submitTime: [moment(time[0]), moment(time[1])],
				});
			}
			if (fhTime && fhTime.length) {
				form.setFieldsValue({
					approvalReviewTime: [moment(fhTime[0]), moment(fhTime[1])],
				});
			}
			if (spTime && spTime.length) {
				form.setFieldsValue({
					approvalTime: [moment(spTime[0]), moment(spTime[1])],
				});
			}
			if (code) {
				form.setFieldsValue({
					code,
				});
			}
			if (departmentIds) {
				form.setFieldsValue({
					departmentIds,
				});
			}
			if (status) {
				form.setFieldsValue({
					statuses: status,
				});
			}
			if (warehouseId) {
				getWarehousesLists(departmentIds);
				form.setFieldsValue({
					warehouseId,
				});
			}
			const obj = {
				submitFrom: time && time.length && time[0],
				submitTo: time && time.length && time[1],
				approvedFrom: spTime && spTime.length && spTime[0],
				approvedTo: spTime && spTime.length && spTime[1],
				approvalReviewFrom: fhTime && fhTime.length && fhTime[0],
				approvalReviewTo: fhTime && fhTime.length && fhTime[1],
				...form.getFieldsValue(),
			};
			obj.statuses = status && status.length ? status.join(',') : undefined;
			delete obj.submitTime;
			delete obj.approvalTime;
			delete obj.approvalReviewTime;
			props.searchTabeList({ ...obj, pageNum: 0, pageSize: 50 });
			sessionStorage.removeItem('manual_request');
		}
	}, []);

	// 首次获取科室
	useEffect(() => {
		const getDepartmentLists = async () => {
			const res = await getDepartmentList();
			if (res && res.code === 0) {
				setDepartmentList(res.data);
				console.log('resss', res.data);
			}
		};
		getDepartmentLists();
	}, []);

	// 科室改变重新请求仓库
	function onChange(value) {
		// const department =  value.split('|')
		// if (department.length) {
		getWarehousesLists(value);
		// }

		form.setFieldsValue({ warehouseId: null });
	}
	useEffect(() => {
		refresh && setTimeout(() => setRefresh(false));
	}, [refresh]);
	//查询
	const onFinish = (filters) => {
		const creatValues = {
			code: filters.code || undefined,
			statuses:
				filters.statuses && filters.statuses.length ? filters.statuses.join(',') : undefined,
			departmentIds: filters.departmentIds || undefined,
			warehouseId: filters.warehouseId || undefined,
			submitFrom:
				filters.submitTime && filters.submitTime.length && filters.submitTime[0]
					? getDay(filters.submitTime[0])
					: undefined,
			submitTo:
				filters.submitTime && filters.submitTime.length && filters.submitTime[1]
					? getDay(filters.submitTime[1], 'end')
					: undefined,
			approvedFrom:
				filters.approvalTime && filters.approvalTime.length && filters.approvalTime[0]
					? getDay(filters.approvalTime[0])
					: undefined,
			approvedTo:
				filters.approvalTime && filters.approvalTime.length && filters.approvalTime[1]
					? getDay(filters.approvalTime[1], 'end')
					: undefined,
			approvalReviewFrom:
				filters.approvalReviewTime && filters.approvalReviewTime[0]
					? getDay(filters.approvalReviewTime[0])
					: undefined,
			approvalReviewTo:
				filters.approvalReviewTime && filters.approvalReviewTime[1]
					? getDay(filters.approvalReviewTime[1], 'end')
					: undefined,
		};
		props.searchTabeList({ ...creatValues, pageNum: 0, pageSize: 50 });
		props.isFirst();
	};
	const resetSerach = () => {
		form.resetFields();
		props.reSetFormSearch({ pageNum: 0, pageSize: 50 });
	};

	return (
		<>
			<Form
				{...searchFormItem4}
				form={form}
				labelAlign='left'
				onFinish={onFinish}
				ref={ref}>
				<div className='searchWrap'>
					<Row className='searchForm'>
						<Row style={{ width: '100%' }}>
							<Col {...searchColItemSingle}>
								<FormItem
									name='statuses'
									label='状态'
									{...searchFormItemSingle4}
									labelAlign='left'>
									<TagSelect>
										{goodsRequestStatusValue.map((item) => {
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
							<Row style={{ width: '100%' }}>
								<Col {...searchColItemSingle}>
									<FormItem
										label='请领时间'
										name='submitTime'
										{...searchFormItemSingle4}>
										<DatePickerMore
											format={['YYYY-MM-DD', 'YYYY/MM/DD']}
											type='M'
											isToday={true}
										/>
									</FormItem>
								</Col>
							</Row>
							<Col {...searchColItem}>
								<FormItem
									label='请领科室'
									name='departmentIds'>
									<Select
										showSearch
										allowClear
										optionFilterProp='children'
										onChange={onChange}
										filterOption={(input, option) => {
											return option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
										}}
										placeholder='请选择请领科室'>
										{departmentList.map((item) => {
											return (
												<Select.Option
													value={item.departmentId}
													key={(item.nameAcronym || '') + '' + item.departmentName}>
													{item.departmentName}
												</Select.Option>
											);
										})}
									</Select>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label='请领仓库'
									name='warehouseId'>
									<Select
										showSearch
										allowClear
										optionFilterProp='children'
										filterOption={(input, option) =>
											option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										placeholder='请选择请领仓库'>
										{warehousesList.map((item) => (
											<Select.Option
												value={item.id}
												key={(item.nameAcronym || '') + '' + item.name}>
												{item.name}
											</Select.Option>
										))}
									</Select>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label='请领单号'
									name='code'>
									<Input
										maxLength={30}
										placeholder='请输入请领单号'
									/>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label='审核时间'
									name='approvalTime'>
									<DatePicker.RangePicker
										format={['YYYY-MM-DD', 'YYYY/MM/DD']}
										style={{ width: '100%' }}
									/>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label='复核时间'
									name='approvalReviewTime'>
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
});

export default FormSearch;
