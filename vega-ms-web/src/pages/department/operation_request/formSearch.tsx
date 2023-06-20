import DatePickerMore from '@/components/DatePickerMore';
import TagSelect from '@/components/TagSelect';
import {
	searchColItem,
	searchColItemSingle,
	searchFormItem4,
	searchFormItemSingle4,
} from '@/constants/formLayout';
import { getDay } from '@/utils';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, Row, Select } from 'antd';
import React, { ForwardRefExoticComponent, useEffect, useState } from 'react';
import { getDepartmentList } from './service';

const FormItem = Form.Item;
const surgicalPackageRequestStatus = [
	{ text: '待请领', value: 'surgical_request_pending', color: CONFIG_LESS['@c_starus_underway'] },
	{ text: '待审核', value: 'approval_pending', color: CONFIG_LESS['@c_starus_underway'] },
	{ text: '审核通过', value: 'approval_review_success', color: CONFIG_LESS['@c_starus_done'] },
	{ text: '审核不通过', value: 'approval_review_failure', color: CONFIG_LESS['@c_starus_warning'] },
];

const FormSearch: ForwardRefExoticComponent<{}> = React.forwardRef((props, ref) => {
	const [form] = Form.useForm();
	const [refresh, setRefresh] = useState(false);
	const [expand, setExpand] = useState(true);
	const [departmentList, setDepartmentList] = useState([]);
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
	useEffect(() => {
		refresh && setTimeout(() => setRefresh(false));
	}, [refresh]);
	// 查询
	const onFinish = (filters) => {
		let creatValues = {
			departmentIds: filters.departmentIds || undefined,
			code: filters.code || undefined,
			statuses: filters.status && filters.status.length ? filters.status.join(',') : undefined,
			// 病号
			patientNo: filters.patientNo || undefined,
			createdFrom:
				filters.timeCreated && filters.timeCreated.length && filters.timeCreated[0]
					? getDay(filters.timeCreated[0])
					: undefined,
			// timeCreated
			createdTo:
				filters.timeCreated && filters.timeCreated.length && filters.timeCreated[1]
					? getDay(filters.timeCreated[1], 'end')
					: undefined,
			approvalReviewFrom:
				filters.approvalReviewTime && filters.approvalReviewTime[0]
					? getDay(filters.approvalReviewTime[0])
					: undefined,
			// 审核时间
			approvalReviewTo:
				filters.approvalReviewTime && filters.approvalReviewTime[1]
					? getDay(filters.approvalReviewTime[1], 'end')
					: undefined,

			// 请领时间
			submitFrom:
				filters.requestTime && filters.requestTime.length && filters.requestTime[0]
					? getDay(filters.requestTime[0])
					: undefined,
			submitTo:
				filters.requestTime && filters.requestTime.length && filters.requestTime[1]
					? getDay(filters.requestTime[1], 'end')
					: undefined,
		};
		props.searchTabeList({ ...creatValues, pageNum: 0, pageSize: 50 });
	};
	const resetSerach = () => {
		form.resetFields();
		props.reSetFormSearch({ pageNum: 0, pageSize: 50 });
	};

	return (
		<Form
			{...searchFormItem4}
			form={form}
			labelAlign='left'
			form={form}
			onValuesChange={(vaule) => {
				console.log(vaule);
			}}
			onFinish={onFinish}
			ref={ref}>
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
									{surgicalPackageRequestStatus.map((item) => {
										return (
											<TagSelect.Option
												key={item.value}
												value={item.value}>
												{item.text}
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
									name='requestTime'
									{...searchFormItemSingle4}>
									<DatePickerMore
										format={['YYYY-MM-DD', 'YYYY/MM/DD']}
										type='M'
									/>
								</FormItem>
							</Col>
						</Row>
						<Col {...searchColItem}>
							<FormItem
								label='审核时间'
								name='approvalReviewTime'>
								<DatePicker.RangePicker
									format={['YYYY-MM-DD', 'YYYY/MM/DD']}
									style={{ width: '100%' }}
								/>
							</FormItem>
						</Col>
						<Col {...searchColItem}>
							<FormItem
								label='创建时间'
								name='timeCreated'>
								<DatePicker.RangePicker
									format={['YYYY-MM-DD', 'YYYY/MM/DD']}
									style={{ width: '100%' }}
								/>
							</FormItem>
						</Col>
						<Col {...searchColItem}>
							<FormItem
								label='科室'
								name='departmentIds'>
								<Select
									showSearch
									allowClear
									optionFilterProp='children'
									filterOption={(input, option) =>
										option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
									}
									placeholder='请选择科室'>
									{departmentList.map((item) => (
										<Select.Option
											key={item.departmentId}
											value={item.departmentId}>
											{item.departmentName}
										</Select.Option>
									))}
								</Select>
							</FormItem>
						</Col>

						<Col {...searchColItem}>
							<FormItem
								label='病号'
								name='patientNo'>
								<Input
									maxLength={30}
									placeholder='请输入病号'
								/>
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
	);
});

export default FormSearch;
