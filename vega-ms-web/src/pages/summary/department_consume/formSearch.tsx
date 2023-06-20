import { antiEpidemicType } from '@/constants/dictionary';
import { searchColItem, searchFormItem4, searchFormItem6 } from '@/constants/formLayout';
import { useFinDepartmentList } from '@/hooks/useDepartmentList';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, Radio, Row, Select } from 'antd';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';
import { useModel } from 'umi';

const FormItem = Form.Item;

const FormSearch: FC<{}> = (props) => {
	const { form } = props;
	const { fields } = useModel('fieldsMapping');
	const [refresh, setRefresh] = useState(false);
	const [expand, setExpand] = useState(true);
	const departmentList = useFinDepartmentList({ pageNum: 0, pageSize: 9999 });
	const docWidth = document.documentElement.clientWidth;

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
						<Col {...searchColItem}>
							<FormItem
								label={fields.antiEpidemic}
								name='antiEpidemic'>
								<Radio.Group>
									<Radio.Button value=''>全部</Radio.Button>
									{antiEpidemicType.map((item) => {
										return (
											<Radio.Button
												value={item.value}
												key={`${item.value}`}>
												{item.label}
											</Radio.Button>
										);
									})}
								</Radio.Group>
							</FormItem>
						</Col>
						<Col
							{...searchColItem}
							className={docWidth < 992 ? (expand ? '' : 'dis-n') : ''}>
							<FormItem
								label='日期范围'
								name='time'>
								<DatePicker.RangePicker
									style={{ width: '100%' }}
									format={['YYYY-MM-DD', 'YYYY/MM/DD']}
								/>
							</FormItem>
						</Col>
						<Col
							{...searchColItem}
							className={docWidth < 1600 ? (expand ? '' : 'dis-n') : ''}>
							<FormItem
								label='财务科室编号'
								name='finDeptCode'
								{...searchFormItem6}>
								<Input placeholder='请输入' />
							</FormItem>
						</Col>
						<Col
							{...searchColItem}
							className={expand ? '' : 'dis-n'}>
							<FormItem
								label='财务科室名称'
								name='finDeptId'
								{...searchFormItem6}>
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
