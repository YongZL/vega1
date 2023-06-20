import { searchColItem, searchFormItem4, searchFormItem6 } from '@/constants/formLayout';
import { Button, Col, Form, Row, Select } from 'antd';
import moment from 'moment';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { gettimelist } from './service';

const FormItem = Form.Item;
const FormSearch: FC<{}> = (props) => {
	const { fields } = useModel('fieldsMapping');
	const [form] = Form.useForm();
	const [expand, setExpand] = useState(true);
	const [time, settime] = useState([]);

	useEffect(() => {
		const getTime = async () => {
			const res = await gettimelist();
			if (res && res.code === 0) {
				settime(res.data);
			}
		};
		getTime();
	}, []);
	// useEffect(() => {
	//   refresh && setTimeout(() => setRefresh(false));
	// }, [refresh]);
	// 查询
	const onFinish = (filters) => {
		let timearray = [];
		if (!filters.item) {
			// notification.warning('请选择结算周期')
			return;
		}
		timearray = filters.item.split('|');
		const creatValues = {
			departmentType: filters.departmentType || undefined,
			timeFrom: Number(timearray[0]),
			timeTo: Number(timearray[1]),
			goodsType: filters.goodsType,
		};
		// props.searchTabeList({ ...creatValues, pageNum: 0, pageSize: 50 });
		props.getFormList({ ...creatValues });
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
						<Row
							className={expand ? '' : 'dis-n'}
							style={{ width: '100%' }}>
							<Col {...searchColItem}>
								<FormItem
									label='科室类型'
									name='departmentType'
									{...searchFormItem6}
									rules={[{ required: true, message: '请选择科室类型' }]}>
									<Select
										allowClear
										placeholder='请选择'>
										<Select.Option value={'all'}>全院</Select.Option>
										<Select.Option value={'operating_room'}>手术科室</Select.Option>
										<Select.Option value={'non-surgical_department'}>非手术科室</Select.Option>
										<Select.Option value={'administration'}>行政科室</Select.Option>
										<Select.Option value={'Medical_technology'}>医技科室</Select.Option>
									</Select>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									name='item'
									label='结算周期'
									{...searchFormItem6}
									rules={[{ required: true, message: '请选择结算周期' }]}>
									<Select
										filterOption={(inputValue, option) => {
											const data = option.children;
											const str = data[0] + data[1] + data[2];
											return str.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
										}}
										allowClear
										showSearch
										placeholder='请选择'>
										{time.map((custodian: any, i: any) => {
											const timeFrom = custodian.timeFrom;
											const timeTo = custodian.timeTo;
											return (
												<Select.Option
													value={timeFrom + '|' + timeTo}
													key={i}>
													{timeFrom ? moment(timeFrom).format('YYYY/MM/DD') : ''}~
													{timeTo ? moment(timeTo).format('YYYY/MM/DD') : ''}
												</Select.Option>
											);
										})}
									</Select>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label={fields.goodsType}
									name='goodsType'
									{...searchFormItem6}
									rules={[{ required: true, message: `请选择${fields.goodsType}` }]}>
									<Select
										allowClear
										placeholder='请选择'>
										<Select.Option value='all'>全部</Select.Option>
										<Select.Option value='Consumable_materials'>消耗材料</Select.Option>
										<Select.Option value='Inspection_materials'>检验材料</Select.Option>
										<Select.Option value='Disinfection_material'>消毒材料</Select.Option>
										<Select.Option value='Other_materials'>其它材料</Select.Option>
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
						{/* <a
              onClick={() => {
                setExpand(!expand);
              }}
            >
              {expand ? (
                <>
                  收起 <UpOutlined />
                </>
              ) : (
                  <>
                    展开 <DownOutlined />
                  </>
                )}
            </a> */}
					</div>
				</div>
			</Form>
		</>
	);
};

export default FormSearch;
