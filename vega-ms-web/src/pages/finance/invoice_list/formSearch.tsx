import React, { FC, useState, useEffect } from 'react';
import { Button, Col, Input, Row, Form, Radio, DatePicker, Select } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { searchFormItem4, searchColItem } from '@/constants/formLayout';
import {
	makeInvoiceType,
	// invoiceType,
	isReverse as isReverseOptions,
} from '@/constants/dictionary';
import { enterpriseAll } from './service';
const FormItem = Form.Item;

const FormSearch: FC<any> = ({ ...props }) => {
	const [showMore, setShowMore] = useState(true);
	const [enterpriseList, setEnterpriseList] = useState([]);
	const docWidth = document.documentElement.clientWidth;

	const getEnterprise = async () => {
		const res = await enterpriseAll();
		if (res && res.code === 0) {
			setEnterpriseList(res.data);
		}
	};

	useEffect(() => {
		getEnterprise();
	}, []);

	return (
		<>
			<Form
				{...searchFormItem4}
				form={props.form}
				labelAlign='left'
				onFinish={() => props.searchTabeList({ pageNum: 0 })}
				initialValues={{
					invoiceSync: '',
					releaseTypeList: '',
					invoiceCategoryList: '',
					invoiceTypeList: '',
					rejectedType: '',
				}}>
				<div className='searchWrap'>
					<Row className='searchForm'>
						<Col {...searchColItem}>
							<FormItem
								label='开票方式'
								name='releaseTypeList'>
								<Radio.Group>
									<Radio.Button value=''>全部</Radio.Button>
									{makeInvoiceType.map((item) => {
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
						{/* <Col {...searchColItem} className={docWidth < 992 ? showMore ? '' : 'dis-n' : ''}>
              <FormItem label="发票类型" name="invoiceCategoryList">
                <Radio.Group>
                  <Radio.Button value="">全部</Radio.Button>
                  {invoiceType.map(item => {
                    return <Radio.Button value={item.value} key={item.value} className="other">{item.label}</Radio.Button>
                  })}
                </Radio.Group>
              </FormItem>
            </Col> */}
						<Col
							{...searchColItem}
							className={docWidth < 1600 ? (showMore ? '' : 'dis-n') : ''}>
							<FormItem
								label='红冲票'
								name='invoiceTypeList'>
								<Radio.Group>
									<Radio.Button value=''>全部</Radio.Button>
									{isReverseOptions.map((item) => {
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
						{/* {['approve_pending'].includes(props.activeTab) && <Col {...searchColItem} className={showMore ? '' : 'dis-n'}>
              <FormItem name="invoiceSync" label="分类" >
                <Radio.Group>
                  <Radio.Button value="">全部</Radio.Button>
                  <Radio.Button value={true}>货票同行</Radio.Button>
                  <Radio.Button value={false}>销后结算</Radio.Button>
                </Radio.Group>
              </FormItem>
            </Col>} */}
						{['rejected'].includes(props.activeTab) && (
							<Col
								{...searchColItem}
								className={showMore ? '' : 'dis-n'}>
								<FormItem
									name='rejectedType'
									label='驳回类型'>
									<Radio.Group>
										<Radio.Button value=''>全部</Radio.Button>
										<Radio.Button value={false}>审核驳回</Radio.Button>
										<Radio.Button value={true}>验收驳回</Radio.Button>
									</Radio.Group>
								</FormItem>
							</Col>
						)}
						<Col
							{...searchColItem}
							className={showMore ? '' : 'dis-n'}>
							<FormItem
								label='发票号码'
								name='invoiceSerialNumber'>
								<Input
									maxLength={30}
									placeholder='请输入'
								/>
							</FormItem>
						</Col>
						<Col
							{...searchColItem}
							className={showMore ? '' : 'dis-n'}>
							<FormItem
								label='发票代码'
								name='invoiceCode'
								rules={[{ pattern: new RegExp('^[a-zA-Z0-9]*$'), message: '请输入字母或数字' }]}>
								<Input
									maxLength={30}
									placeholder='请输入'
								/>
							</FormItem>
						</Col>
						<Col
							{...searchColItem}
							className={showMore ? '' : 'dis-n'}>
							<FormItem
								label='开票日期'
								name='releaseDate'>
								<DatePicker.RangePicker
									format={['YYYY-MM-DD', 'YYYY/MM/DD']}
									style={{ width: '100%' }}
								/>
							</FormItem>
						</Col>
						<Col
							{...searchColItem}
							className={showMore ? '' : 'dis-n'}>
							<FormItem
								label='上传时间'
								name='uploadDate'>
								<DatePicker.RangePicker
									format={['YYYY-MM-DD', 'YYYY/MM/DD']}
									style={{ width: '100%' }}
								/>
							</FormItem>
						</Col>
						{['check_pending', 'pay_pending', 'finished'].includes(props.activeTab) && (
							<Col
								{...searchColItem}
								className={showMore ? '' : 'dis-n'}>
								<FormItem
									label='审核时间'
									name='approveDate'>
									<DatePicker.RangePicker
										format={['YYYY-MM-DD', 'YYYY/MM/DD']}
										style={{ width: '100%' }}
									/>
								</FormItem>
							</Col>
						)}
						{['pay_pending', 'finished'].includes(props.activeTab) && (
							<Col
								{...searchColItem}
								className={showMore ? '' : 'dis-n'}>
								<FormItem
									label='验收时间'
									name='checkDate'>
									<DatePicker.RangePicker
										format={['YYYY-MM-DD', 'YYYY/MM/DD']}
										style={{ width: '100%' }}
									/>
								</FormItem>
							</Col>
						)}
						{props.activeTab === 'pay_pending' && (
							<Col
								{...searchColItem}
								className={showMore ? '' : 'dis-n'}>
								<FormItem
									label='到期日期'
									name='dueDate'>
									<DatePicker.RangePicker
										format={['YYYY-MM-DD', 'YYYY/MM/DD']}
										style={{ width: '100%' }}
									/>
								</FormItem>
							</Col>
						)}
						{props.activeTab === 'finished' && (
							<Col
								{...searchColItem}
								className={showMore ? '' : 'dis-n'}>
								<FormItem
									label='转账日期'
									name='paymentDate'>
									<DatePicker.RangePicker
										format={['YYYY-MM-DD', 'YYYY/MM/DD']}
										style={{ width: '100%' }}
									/>
								</FormItem>
							</Col>
						)}
						{props.activeTab === 'rejected' && (
							<Col
								{...searchColItem}
								className={showMore ? '' : 'dis-n'}>
								<FormItem
									label='驳回时间'
									name='rejectedDate'>
									<DatePicker.RangePicker
										format={['YYYY-MM-DD', 'YYYY/MM/DD']}
										style={{ width: '100%' }}
									/>
								</FormItem>
							</Col>
						)}
						{['check_pending', 'pay_pending', 'finished'].includes(props.activeTab) && (
							<Col
								{...searchColItem}
								className={showMore ? '' : 'dis-n'}>
								<FormItem
									label='开票企业'
									name='enterprises'>
									<Select
										optionFilterProp='children'
										placeholder='请选择'
										showSearch
										mode='multiple'
										filterOption={(input, option) =>
											option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}>
										{(enterpriseList || []).map((item) => {
											return (
												<Select.Option
													value={item}
													key={item}>
													{item}
												</Select.Option>
											);
										})}
									</Select>
								</FormItem>
							</Col>
						)}
					</Row>
					<div className='searchBtn'>
						<Button
							type='primary'
							htmlType='submit'>
							查询
						</Button>
						<Button onClick={() => props.resetSerach()}>重置</Button>
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
