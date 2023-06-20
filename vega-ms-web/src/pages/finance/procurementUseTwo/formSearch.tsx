import { searchColItem, searchFormItem4, searchFormItem6 } from '@/constants/formLayout';
import { Button, Col, Form, Row, Select } from 'antd';
import moment from 'moment';
import React, { FC, useEffect, useState } from 'react';
import { gettimelist } from './service';
const FormItem = Form.Item;
const FormSearch: FC<any> = ({ ...props }) => {
	const { form, setSearchParams } = props;
	const [expand, setExpand] = useState(true);
	const [time, settime] = useState([]);

	// 请求列表
	const getTime = async (param: any) => {
		const res = await gettimelist();
		if (res && res.code === 0) {
			settime(res.data);
		}
	};

	useEffect(() => {
		getTime([]);
	}, []);

	// 查询
	const onFinish = (filters) => {
		// props.reset()
		props.searchTabeList();
	};
	const resetSerach = () => {
		form.resetFields();
		props.reset();
	};

	const getSearchData = () => {
		let timearray = form.getFieldsValue('item').item;
		if (timearray) {
			timearray = timearray.split('|');
		}
		let params = {
			timeFrom: (timearray && Number(timearray[0])) || undefined,
			timeTo: (timearray && Number(timearray[1])) || undefined,
		};
		return params;
	};

	const timeChange = (value: any) => {
		setSearchParams({ ...getSearchData() });
	};

	const timeNow = new Date();
	const timeBefore = timeNow.getYear() + 1900 + '/' + (timeNow.getMonth() + 1) + '/01';

	return (
		<>
			<Form
				{...searchFormItem4}
				form={form}
				labelAlign='left'
				onFinish={onFinish}
				initialValues={{ time: [moment(timeBefore, 'YYYY/MM/DD'), moment(timeNow, 'YYYY/MM/DD')] }}>
				<div className='searchWrap'>
					<Row className='searchForm'>
						<Row
							className={expand ? '' : 'dis-n'}
							style={{ width: '100%' }}>
							<Col {...searchColItem}>
								<FormItem
									name='item'
									label='结算周期'
									{...searchFormItem6}
									rules={[{ required: true, message: '选择结算周期' }]}>
									<Select
										filterOption={(inputValue, option) => {
											let data = option.children;
											let str = data[0] + data[1] + data[2];
											return str.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
										}}
										allowClear
										showSearch
										placeholder='请选择结算周期'
										onChange={timeChange}>
										{time.map((custodian: any) => {
											let timeFrom = custodian.timeFrom;
											let timeTo = custodian.timeTo;
											return (
												<Select.Option
													value={timeFrom + '|' + timeTo}
													key={custodian.id}>
													{timeFrom ? moment(timeFrom).format('YYYY/MM/DD') : ''}~
													{timeTo ? moment(timeTo).format('YYYY/MM/DD') : ''}
												</Select.Option>
											);
										})}
									</Select>
								</FormItem>
							</Col>
						</Row>
					</Row>
					<div className='searchBtn'>
						<Button
							type='primary'
							htmlType='submit'>
							{' '}
							查询{' '}
						</Button>
						<Button onClick={resetSerach}>重置</Button>
					</div>
				</div>
			</Form>
		</>
	);
};

export default FormSearch;
