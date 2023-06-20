import { searchColItem, searchFormItem4, searchFormItem6 } from '@/constants/formLayout';
import { useCustodianList } from '@/hooks/useCustodianList';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Row, Select } from 'antd';
import moment from 'moment';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { gettimelist } from './service';

export const searchColItemSingle = { xs: 24, sm: 24, md: 24, lg: 24, xl: 20 };

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

const FormSearch: FC<any> = ({ ...props }) => {
	const { fields } = useModel('fieldsMapping');
	const { form, setSearchParams } = props;
	const [expand, setExpand] = useState(true);
	const [time, settime] = useState([]);
	const custodiansList = useCustodianList();
	const [departmentList, setDepartmentList] = useState([]);

	const statementlist = () => {
		const jhlist = JSON.parse(sessionStorage.getItem('newDictionary')).material_category;
		setDepartmentList(jhlist);
	};

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
		props.searchTabeList({ pageNum: 0 });
	};

	// 重置
	const resetSerach = () => {
		form.resetFields();
		props.setList([]);
		props.setTotal(0);
		setSearchParams();
	};

	const getSearchData = () => {
		const departmentId = form.getFieldsValue('departmentId').departmentId;
		const id = form.getFieldsValue('item').item;

		const params = {
			departmentId: departmentId,
			statementId: id,
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
									label='消耗日期'
									{...searchFormItem6}
									rules={[{ required: true, message: '选择消耗日期' }]}>
									<RangePicker format='YYYY/MM/DD' />
								</FormItem>
							</Col>

							<Col {...searchColItem}>
								<FormItem
									label={fields.goodsType}
									name='goodsType'>
									<Select
										showSearch
										allowClear
										optionFilterProp='children'
										onFocus={statementlist}
										onChange={timeChange}
										filterOption={(input, option) =>
											option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										placeholder={`请选择${fields.goodsType}`}>
										<Select.Option value={''}>全部</Select.Option>
										{departmentList.map((item) => (
											<Select.Option
												value={item.value}
												key={item.value}>
												{item.value}
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
