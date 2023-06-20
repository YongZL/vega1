import DatePickerMore from '@/components/DatePickerMore';
import TagSelect from '@/components/TagSelect';
import { useDistributorList } from '@/hooks/useDistributorList';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Select } from 'antd';
import { FC, useEffect, useState } from 'react';
// import { getDay } from '@/utils';

import { orderStatus } from '@/constants/dictionary';
import {
	searchColItem,
	searchColItemSingle,
	searchFormItem4,
	searchFormItemSingle4,
} from '@/constants/formLayout';
import { useModel } from 'umi';

const FormItem = Form.Item;

const FormSearch: FC<{}> = (props) => {
	const { form } = props;
	const { fields } = useModel('fieldsMapping');
	const distributorOption = useDistributorList();
	const [refresh, setRefresh] = useState(false);
	const [expand, setExpand] = useState(true);

	useEffect(() => {
		refresh && setTimeout(() => setRefresh(false));
	}, [refresh]);
	// 查询
	const onFinish = (filters) => {
		// let creatValues = {
		//   orderCode: filters.orderCode || undefined,
		//   timeFrom:
		//     filters.timeCreated && filters.timeCreated.length && filters.timeCreated[0]
		//       ? getDay(filters.timeCreated[0])
		//       : undefined,
		//   timeTo:
		//     filters.timeCreated && filters.timeCreated.length && filters.timeCreated[1]
		//       ? getDay(filters.timeCreated[1], 'end')
		//       : undefined,

		//   goodsName: filters.goodsName || undefined,
		//   highValue: filters.highValue || undefined,
		//   materialCode: filters.materialCode || undefined,
		//   status: filters.status && filters.status.length ? filters.status.join(',') : undefined,
		//   custodianId: filters.custodianId || undefined,
		//   supplierId: filters.supplierId || undefined,
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
									label='订单状态'
									name='status'
									{...searchFormItemSingle4}
									labelAlign='left'>
									<TagSelect expandable>
										{orderStatus.map((item) => {
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
										label='创建时间'
										name='timeCreated'
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
									label='订单号'
									name='orderCode'>
									<Input
										maxLength={30}
										placeholder='请输入订单号'
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
							<Col {...searchColItem}>
								<FormItem
									label={fields.goodsProperty}
									name='highValue'>
									<Select
										allowClear
										showSearch
										optionFilterProp='children'
										filterOption={(input, option) =>
											option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										placeholder='请选择类型'>
										<Select.Option value={true}>高值</Select.Option>
										<Select.Option value={false}>低值</Select.Option>
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
