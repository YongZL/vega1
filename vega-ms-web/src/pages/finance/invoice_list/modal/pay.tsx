import React, { useState, useEffect } from 'react';
import { submitPrice, convertPriceWithDecimal } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Modal, Button, Form, Row, Col, Input, Select, DatePicker, Upload, message } from 'antd';
import { payType as payTypeOptions } from '@/constants/dictionary';
import { getUrl } from '@/utils/utils';
import { beforeUpload } from '@/utils/file';
import { getDay } from '@/utils';
import { UploadOutlined } from '@ant-design/icons';

import '@ant-design/compatible/assets/index.css';
import { formItemModal6 } from '@/constants/formLayout';
import api from '@/constants/api';
import { orderPay } from '../service';

const FormItem = Form.Item;

export interface UpdateProps {
	setIsOpen: (value: boolean) => void;
	isOpen: boolean;
	getFormList?: () => void;
	clear?: () => void;
	selectList?: any;
	orderInfo?: any;
}

const PayModal: React.FC<UpdateProps> = (props) => {
	const { isOpen, selectList, setIsOpen, getFormList, clear, orderInfo } = props;
	const [loading, setLoading] = useState(false);
	const [invoiceIds, setInvoiceIds] = useState([]);
	const [totalPrice, setTotalPrice] = useState(0);
	const [paymentUrl, setPaymentUrl] = useState([]);

	const [form] = Form.useForm();

	const urlHandleChange = (info: any) => {
		setPaymentUrl(info.fileList);
		if (info.fileList.length <= 0) {
			form.resetFields(['paymentUrl']);
			return;
		}
		if (info.fileList.length > 10) {
			notification.error('最多可上传10个文件');
			return;
		}
		if (info.file.status === 'done') {
			message.success(`${info.file.name}文件上传成功`);
		} else if (info.file.status === 'error') {
			message.error(`${info.file.name} 上传失败`);
		}
	};

	// 关闭弹窗
	const modalCancel = (update: boolean) => {
		setIsOpen(false);
		form.resetFields();
		setPaymentUrl([]);
		if (update) {
			getFormList();
			clear();
		}
	};

	// 提交
	const onSubmit = async () => {
		form.validateFields().then(async (values) => {
			const urlList = paymentUrl.map((item) => {
				return item.response.data.urlName;
			});
			const params = {
				...values,
				invoiceIds,
				paymentUrl: urlList.join(','),
				paymentAmount: submitPrice(values.paymentAmount),
				paymentDate: getDay(values.paymentDate),
			};
			setLoading(true);
			const res = await orderPay(params);
			if (res && res.code === 0) {
				notification.success('操作成功！');
				modalCancel(true);
			}
			setLoading(false);
			return;
		});
	};

	const validate = (rule, value, callback) => {
		let reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)/;
		if (value && !reg.test(value)) {
			callback('请输入正确数值(最多为小数点后两位)');
			return;
		}
		if (value && totalPrice / 10000 != value) {
			callback('请输入正确金额');
			return;
		}
		if (parseFloat(value) && parseFloat(value) > 1000000) {
			callback('最高可输入1000000');
			return;
		}
		callback();
	};

	useEffect(() => {
		if (isOpen) {
			if (selectList.length > 0) {
				let price = 0;
				const ids = selectList.map((item) => {
					price += item.totalAmount;
					return item.id;
				});
				const info = selectList[0];
				form.setFieldsValue({
					title: info.title,
					enterprise: info.enterprise,
				});
				setInvoiceIds(ids);
				setTotalPrice(price);
			} else {
				setInvoiceIds([orderInfo.id]);
				setTotalPrice(orderInfo.totalAmount);
				form.setFieldsValue({
					title: orderInfo.title,
					enterprise: orderInfo.enterprise,
				});
			}
		}
	}, [isOpen]);

	return (
		<Modal
			width='80%'
			destroyOnClose
			maskClosable={false}
			visible={isOpen}
			title='上传转账凭证'
			onCancel={() => modalCancel(false)}
			confirmLoading={loading}
			onOk={onSubmit}>
			<Form
				form={form}
				{...formItemModal6}>
				<Row>
					<Col span={8}>
						<FormItem
							name='title'
							label='付款方'>
							<Input
								placeholder='请输入'
								maxLength={30}
								disabled
							/>
						</FormItem>
					</Col>
					<Col span={8}>
						<FormItem
							name='enterprise'
							label='收款方'>
							<Input
								placeholder='请输入'
								maxLength={30}
								disabled
							/>
						</FormItem>
					</Col>
					<Col span={8}>
						<FormItem
							name='paymentType'
							label='转账方式'
							rules={[{ required: true, message: '请选择' }]}>
							<Select
								optionFilterProp='children'
								placeholder='请选择'
								options={payTypeOptions}
							/>
						</FormItem>
					</Col>
					<Col span={8}>
						<FormItem
							name='paymentAmount'
							label='付款金额'
							extra={`待支付金额为${convertPriceWithDecimal(totalPrice)}元`}
							rules={[{ required: true, message: '请输入' }, { validator: validate }]}>
							<Input
								placeholder='请输入'
								maxLength={30}
								style={{ width: '100%', marginRight: 10 }}
								suffix='元'
							/>
						</FormItem>
					</Col>
					<Col span={8}>
						<FormItem
							name='paymentDate'
							label='转账日期'
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
				</Row>
				<Row>
					<Col span={8}>
						<FormItem
							name='paymentUrl'
							label='转账凭证'
							rules={[{ required: true, message: '请上传' }]}>
							<Upload
								name='file'
								fileList={paymentUrl}
								multiple={true}
								action={`${getUrl()}${api.upload}/upload_file`}
								onChange={urlHandleChange}
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
		</Modal>
	);
};

export default PayModal;
