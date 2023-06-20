import React, { FC, useEffect } from 'react';
import { Button, Form, Row, Col, Input, Select, DatePicker, Upload } from 'antd';
import { getUrl } from '@/utils/utils';
import { beforeUpload } from '@/utils/file';
import { convertPriceWithDecimal } from '@/utils/format';
import { UploadOutlined } from '@ant-design/icons';

import { makeInvoiceType, invoiceType } from '@/constants/dictionary';
import { formItem2 } from '@/constants/formLayout';
import api from '@/constants/api';

const FormItem = Form.Item;

const InvoiceInfo: FC<{}> = ({
	form,
	initialValues = {},
	totalPrice,
	invoice,
	invoiceDetail,
	urlHandleChange,
	urlDetailHandleChange,
	handleType,
}) => {
	const hospitalName = sessionStorage.getItem('hospital_name');
	const newDictionary = JSON.parse(sessionStorage.getItem('newDictionary') || '{}');

	useEffect(() => {
		if (JSON.stringify(initialValues) != '{}') {
			form.setFieldsValue(initialValues);
		} else {
			form.setFieldsValue({ title: hospitalName });
		}
	}, [initialValues]);

	const validate = (rule, value, callback) => {
		const reg1 = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)/;
		const reg2 = /(^-[1-9]([0-9]+)?(\.[0-9]{1,2})?$)/;
		const reg = totalPrice >= 0 ? reg1 : reg2;
		if (value && !reg.test(value)) {
			callback('请输入正确数值(最多为小数点后两位)');
			return;
		}
		if (value && totalPrice / 10000 != value) {
			callback('请输入正确金额');
			return;
		}
		callback();
	};

	return (
		<Form
			form={form}
			{...formItem2}>
			<Row>
				<Col span={8}>
					<FormItem
						name='title'
						label='付款方'
						rules={[{ required: true, message: '请输入' }]}>
						<Input
							placeholder='请输入'
							maxLength={30}
							disabled
						/>
					</FormItem>
				</Col>
				<Col span={8}>
					<FormItem
						name='serialNumber'
						label='发票号码'
						rules={[{ required: true, message: '请输入' }]}>
						<Input
							placeholder='请输入'
							maxLength={30}
						/>
					</FormItem>
				</Col>
				<Col span={8}>
					<FormItem
						name='serialCode'
						label='发票代码'
						rules={[
							{ required: true, message: '请输入' },
							{ pattern: new RegExp('^[a-zA-Z0-9]*$'), message: '请输入字母或数字' },
						]}>
						<Input
							placeholder='请输入'
							maxLength={30}
						/>
					</FormItem>
				</Col>
				<Col span={8}>
					<FormItem
						name='releaseType'
						label='开票方式'
						rules={[{ required: true, message: '请选择' }]}>
						<Select
							optionFilterProp='children'
							placeholder='请选择'
							disabled={['edit', 'link'].includes(handleType)}>
							{makeInvoiceType.map((item) => (
								<Select.Option
									value={item.value}
									key={item.value}>
									{item.label}
								</Select.Option>
							))}
						</Select>
					</FormItem>
				</Col>
				<Col span={8}>
					<FormItem
						name='category'
						label='发票类型'
						rules={[{ required: true, message: '请选择' }]}>
						<Select
							optionFilterProp='children'
							placeholder='请选择'
							disabled={['edit', 'link'].includes(handleType)}
							options={invoiceType}
						/>
					</FormItem>
				</Col>
				<Col span={8}>
					<FormItem
						name='releaseDate'
						label='开票日期'
						rules={[{ required: true, message: '请选择' }]}>
						<DatePicker
							placeholder='请选择'
							format={['YYYY-MM-DD', 'YYYY/MM/DD']}
							style={{ width: '100%' }}
							disabledDate={(current) => {
								return current.valueOf() > Date.now();
							}}
						/>
					</FormItem>
				</Col>
				<Col span={8}>
					<FormItem
						name='taxRate'
						label='税率'
						rules={[{ required: true, message: '请选择' }]}>
						<Select
							optionFilterProp='children'
							placeholder='请选择'
							disabled={['edit', 'link'].includes(handleType)}>
							{(newDictionary.invoice_tax_rate_type || []).map((item) => (
								<Select.Option
									value={item.value}
									key={item.value}>
									{item.name}
								</Select.Option>
							))}
						</Select>
					</FormItem>
				</Col>
				<Col span={8}>
					<FormItem
						name='totalAmount'
						label='含税金额'
						validateTrigger={['onBlur', 'onChange', 'onFocus']}
						extra={
							<>
								当前含税金额为
								<span className={totalPrice < 0 ? 'cl_FF110B' : ''}>
									{convertPriceWithDecimal(totalPrice)}
								</span>
								元
							</>
						}
						rules={[{ required: true, message: '请输入' }, { validator: validate }]}>
						<Input
							placeholder='请输入'
							maxLength={30}
						/>
					</FormItem>
				</Col>
				{handleType === 'link' && (
					<Col span={8}>
						<FormItem
							name='sourceInvoiceNumber'
							label='关联发票'>
							{form.getFieldValue('sourceInvoiceNumber') || '-'}
						</FormItem>
					</Col>
				)}
			</Row>
			<Row>
				<Col span={8}>
					<FormItem
						name='invoiceUrl'
						label='发票'
						rules={[{ required: true, message: '请上传' }]}>
						<Upload
							name='file'
							fileList={invoice}
							action={`${getUrl()}${api.upload}/upload_file`}
							onChange={(info) => urlHandleChange(info, 'invoiceUrl')}
							beforeUpload={beforeUpload}
							withCredentials={true}
							listType='text'
							headers={{ 'X-AUTH-TOKEN': sessionStorage.getItem('x_auth_token') || '' }}>
							<Button>
								上传附件 <UploadOutlined />
							</Button>
						</Upload>
					</FormItem>
				</Col>
				<Col span={8}>
					<FormItem
						name='invoiceDetailUrl'
						label='发票清单'>
						<Upload
							name='file'
							fileList={invoiceDetail}
							multiple={true}
							action={`${getUrl()}${api.upload}/upload_file`}
							onChange={urlDetailHandleChange}
							beforeUpload={beforeUpload}
							withCredentials={true}
							listType='text'
							headers={{ 'X-AUTH-TOKEN': sessionStorage.getItem('x_auth_token') || '' }}>
							<Button>
								上传附件 <UploadOutlined />
							</Button>
						</Upload>
					</FormItem>
				</Col>
			</Row>
		</Form>
	);
};
export default InvoiceInfo;
