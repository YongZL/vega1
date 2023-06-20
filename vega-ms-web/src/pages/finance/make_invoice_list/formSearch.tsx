import DatePickerMore from '@/components/DatePickerMore';
import { getDay } from '@/utils';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row } from 'antd';
import { FC, useEffect, useState } from 'react';

import {
	searchColItem,
	searchColItemSingle,
	searchFormItem4,
	searchFormItem6,
	searchFormItemSingle4,
} from '@/constants/formLayout';
import { useModel } from 'umi';

const FormItem = Form.Item;

const FormSearch: FC<any> = ({ ...props }) => {
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const [refresh, setRefresh] = useState(false);
	const [showMore, setShowMore] = useState(true);

	useEffect(() => {
		refresh && setTimeout(() => setRefresh(false));
	}, [refresh]);

	// 查询
	const onFinish = (filters: any) => {
		let creatValues = {
			...filters,
			periodName: filters.periodName ? filters.periodName.format('YYYY年MM月') : undefined,
			timeAcceptanceFrom:
				filters.timeAcceptance && filters.timeAcceptance[0]
					? getDay(filters.timeAcceptance[0])
					: undefined,
			timeAcceptanceTo:
				filters.timeAcceptance && filters.timeAcceptance[1]
					? getDay(filters.timeAcceptance[1], 'end')
					: undefined,
		};
		delete creatValues.timeAcceptance;
		props.searchTabeList({ ...creatValues, pageNum: 0 });
	};
	const resetSerach = () => {
		form.resetFields();
		setRefresh(true);
		form.submit();
		props.isFirst;
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
							{props.activeTab === 'sales' && (
								<Col {...searchColItemSingle}>
									<FormItem
										name='periodName'
										label='结算周期'
										{...searchFormItemSingle4}>
										<DatePickerMore
											format={['YYYY-MM-DD', 'YYYY/MM/DD']}
											type='M'
											picker='month'
											single={true}
											checkList={[
												{ text: '本月', key: 'currentMonth' },
												{ text: '上个月', key: 'lastMonth' },
											]}
										/>
									</FormItem>
								</Col>
							)}
							<Col
								{...searchColItemSingle}
								className={props.activeTab === 'sales' ? (showMore ? '' : 'dis-n') : ''}>
								<FormItem
									name='timeAcceptance'
									label='验收日期'
									{...searchFormItemSingle4}>
									<DatePickerMore
										format={['YYYY-MM-DD', 'YYYY/MM/DD']}
										type='M'
										isToday={true}
									/>
								</FormItem>
							</Col>
						</Row>
						<Row
							className={showMore ? '' : 'dis-n'}
							style={{ width: '100%' }}>
							<Col {...searchColItem}>
								<FormItem
									name='orderCode'
									label='订单号'>
									<Input
										maxLength={30}
										placeholder='请输入'
									/>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label='配送单号'
									name='shippingOrderCode'>
									<Input
										maxLength={30}
										placeholder='请输入'
									/>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label={fields.goodsCode}
									name='materialCode'>
									<Input
										maxLength={30}
										placeholder='请输入'
									/>
								</FormItem>
							</Col>
							{props.activeTab === 'sales' && (
								<Col {...searchColItem}>
									<FormItem
										label='结算单号'
										name='statementNo'>
										<Input
											maxLength={30}
											placeholder='请输入'
										/>
									</FormItem>
								</Col>
							)}
							<Col {...searchColItem}>
								<FormItem
									label={fields.goodsName}
									name='goodsName'>
									<Input
										maxLength={30}
										placeholder='请输入'
									/>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label='批号/序列号'
									name='lotNum'
									{...searchFormItem6}>
									<Input
										maxLength={30}
										placeholder='请输入'
									/>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label={fields.distributor}
									name='custodianName'>
									<Input
										maxLength={30}
										placeholder='请输入'
									/>
								</FormItem>
							</Col>
							<Col {...searchColItem}>
								<FormItem
									label='生产厂家'
									name='manufacturerName'>
									<Input
										maxLength={30}
										placeholder='请输入'
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
								setShowMore(!showMore);
							}}>
							{showMore ? (
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
