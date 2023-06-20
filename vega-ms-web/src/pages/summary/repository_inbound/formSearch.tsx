import TagSelect from '@/components/TagSelect';
import { useDepartmentList } from '@/hooks/useDepartmentList';
import { useDistributorList } from '@/hooks/useDistributorList';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Radio, Row, Select } from 'antd';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';

import { antiEpidemicType } from '@/constants/dictionary';
import {
	// searchColItemSingle,
	searchColItem,
	searchFormItem4,
	searchFormItemSingle4,
} from '@/constants/formLayout';
import { useModel } from 'umi';

const FormItem = Form.Item;
const searchColItemSingle = {
	xs: 24,
	sm: 24,
	md: 24,
	lg: 24,
	xl: 20,
};

const FormSearch: FC<{}> = (props) => {
	const { form } = props;
	const { fields } = useModel('fieldsMapping');
	const distributorOption = useDistributorList();
	const [refresh, setRefresh] = useState(false);
	const [expand, setExpand] = useState(true);
	const departmentList = useDepartmentList();
	const newDictionary = JSON.parse(sessionStorage.getItem('newDictionary') || '{}');

	useEffect(() => {
		refresh && setTimeout(() => setRefresh(false));
	}, [refresh]);
	// 查询
	const onFinish = (filters) => {
		props.searchTabeList({ pageNum: 0 });
	};
	const resetSerach = () => {
		form.resetFields();
		props.reSetFormSearch();
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
						<Row style={{ width: '100%' }}>
							<Col {...searchColItemSingle}>
								<FormItem
									name='materialCategoryList'
									label={fields.goodsType}
									{...searchFormItemSingle4}>
									<TagSelect expandable>
										{(newDictionary.material_category || []).map((item) => {
											return (
												<TagSelect.Option
													key={item.value}
													value={item.value}>
													{item.name}
												</TagSelect.Option>
											);
										})}
									</TagSelect>
								</FormItem>
							</Col>
						</Row>
						<Row
							className={expand ? '' : 'dis-n'}
							style={{ width: '100%' }}>
							<Col {...searchColItem}>
								<FormItem
									label={fields.antiEpidemic}
									name='antiEpidemic'
									{...searchFormItem4}>
									<Radio.Group>
										<Radio.Button value=''>全部</Radio.Button>
										{antiEpidemicType.map((item) => {
											return (
												<Radio.Button
													value={item.value}
													key={item.value}>
													{item.label}
												</Radio.Button>
											);
										})}
									</Radio.Group>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label='日期范围'
									name='time'>
									<DatePicker.RangePicker
										style={{ width: '100%' }}
										format={['YYYY-MM-DD', 'YYYY/MM/DD']}
									/>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label='科室'
									name='deptId'>
									<Select
										allowClear
										showSearch
										optionFilterProp='children'
										filterOption={(input, option) =>
											option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										placeholder='请选择科室'>
										{departmentList.map((item) => (
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
									label={fields.distributor}
									name='distributorId'>
									<Select
										allowClear
										showSearch
										optionFilterProp='children'
										filterOption={(input, option) =>
											option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										placeholder={`请选择${fields.distributor}`}>
										{distributorOption.map((item) => (
											<Select.Option value={item.value}>{item.label}</Select.Option>
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
