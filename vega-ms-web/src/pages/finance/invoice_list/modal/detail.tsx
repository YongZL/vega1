import DownloadWithLabel from '@/components/DownloadWithLabel';
import TableBox from '@/components/TableBox';
import { getStatus } from '@/utils/dataUtil';
import { getDownloadName } from '@/utils/file';
import { convertPriceWithDecimal } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button, Descriptions, Divider, Form, Input, Modal, Radio, Statistic } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

import { invoiceTypeTextMap, makeInvoiceTypeTextMap } from '@/constants/dictionary';
import '@ant-design/compatible/assets/index.css';
import { useModel } from 'umi';
import { billColumns, salesColumns } from '../columns';
import { getDetail, orderApprove, orderCheck } from '../service';

const FormItem = Form.Item;
const handleTitle = {
	detail: '查看详情',
	approve_pending: '发票审核',
	check_pending: '发票验收',
};

export interface UpdateProps {
	setIsOpen: (value: boolean) => void;
	isOpen: boolean;
	handleType?: string;
	orderInfo?: string;
	getFormList?: () => void;
}

const DetailModal: React.FC<UpdateProps> = (props) => {
	const { fields } = useModel('fieldsMapping');
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const newDictionary = JSON.parse(sessionStorage.getItem('newDictionary') || '{}');
	const [list, setList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [detail, setDetail] = useState({});
	const [columns, setColumns] = useState([]);
	const [formAgree, setFormAgree] = useState('');

	const [form] = Form.useForm();

	const { isOpen, handleType, orderInfo, setIsOpen, getFormList } = props;

	const getDetailInfo = async () => {
		setLoading(true);
		const res = await getDetail({ invoiceId: orderInfo.id });
		if (res && res.code === 0) {
			const data = res.data;
			setList(data.detailList);
			setDetail(data.invoice);
			const newColumns = data.invoice.invoiceSync
				? billColumns(data.invoice.invoiceType)
				: salesColumns(data.invoice.invoiceType);
			setColumns(newColumns);
		}
		setLoading(false);
	};

	// 关闭弹窗
	const modalCancel = (update: boolean) => {
		form.resetFields();
		setDetail({});
		setList([]);
		setIsOpen(false);
		if (update) {
			getFormList({});
		}
	};

	// 提交
	const returnSubmit = async () => {
		form.validateFields().then(async (values) => {
			// 审核
			if (handleType === 'approve_pending') {
				const params = {
					invoiceId: detail.id,
					success: values.success === 'N' ? false : true,
					reason: values.reason,
				};
				setLoading(true);
				const res = await orderApprove(params);
				if (res && res.code === 0) {
					notification.success('操作成功！');
					modalCancel(true);
				}
				setLoading(false);
				return;
			}

			// 验收
			if (handleType === 'check_pending') {
				const params = {
					invoiceId: detail.id,
					success: values.success === 'N' ? false : true,
					reason: values.reason,
				};
				setLoading(true);
				const res = await orderCheck(params);
				if (res && res.code === 0) {
					notification.success('操作成功！');
					modalCancel(true);
				}
				setLoading(false);
				return;
			}
		});
	};

	useEffect(() => {
		if (isOpen) {
			getDetailInfo();
			form.setFieldsValue({ success: 'Y' });
			setFormAgree('Y');
		}
	}, [isOpen]);

	return (
		<Modal
			width='80%'
			destroyOnClose
			maskClosable={false}
			visible={isOpen}
			title={<>{handleTitle[handleType]}</>}
			onCancel={() => setIsOpen(false)}
			footer={
				(handleType === 'approve_pending' && permissions.includes('invoice_approve')) ||
				(handleType === 'check_pending' && permissions.includes('invoice_check'))
					? [
							<Button
								type='primary'
								onClick={returnSubmit}
								loading={loading}>
								提交
							</Button>,
					  ]
					: false
			}>
			<div className='modelInfo'>
				<div className='left'>
					<Descriptions
						column={{ xs: 1, sm: 2, lg: 3 }}
						size='small'>
						<Descriptions.Item label='付款方'>{detail.title || '-'}</Descriptions.Item>
						<Descriptions.Item label='发票号码'>{detail.serialNumber || '-'}</Descriptions.Item>
						<Descriptions.Item label='发票代码'>{detail.serialCode || '-'}</Descriptions.Item>
						{/* <Descriptions.Item label="分类">{detail.invoiceSync ? '货票同行' : '销后结算'}</Descriptions.Item> */}
						<Descriptions.Item label='开票方式'>
							{makeInvoiceTypeTextMap[detail.releaseType] || '-'}
						</Descriptions.Item>
						<Descriptions.Item label='发票类型'>
							{invoiceTypeTextMap[detail.category] || '-'}
						</Descriptions.Item>
						<Descriptions.Item label='税率'>
							{detail.taxRate
								? getStatus(newDictionary.invoice_tax_rate_type, detail.taxRate).name
								: '-'}
						</Descriptions.Item>
						<Descriptions.Item label='开票日期'>
							{detail.releaseDate ? moment(detail.releaseDate).format('YYYY/MM/DD') : '-'}
						</Descriptions.Item>
						<Descriptions.Item label='关联发票'>
							{detail.sourceInvoiceNumber || '-'}
						</Descriptions.Item>
						<Descriptions.Item label='发票附件'>
							{detail.invoiceUrl ? (
								<DownloadWithLabel
									label={getDownloadName(detail.invoiceUrl).substring(
										getDownloadName(detail.invoiceUrl).length - 15,
									)}
									url={detail.invoiceUrl}
								/>
							) : (
								'-'
							)}
						</Descriptions.Item>
						<Descriptions.Item label='发票清单'>
							{detail.invoiceDetailUrl
								? (detail.invoiceDetailUrl.split(',') || []).map((item, index) => {
										return (
											<DownloadWithLabel
												label={getDownloadName(item)}
												url={item}
												key={index}
											/>
										);
								  })
								: '-'}
						</Descriptions.Item>
					</Descriptions>
				</div>
				<div className='right'>
					<Statistic
						title='含税金额'
						value={detail.totalAmount ? '￥' + convertPriceWithDecimal(detail.totalAmount) : '-'}
						valueStyle={{
							color: detail.invoiceType === 'reverse' ? CONFIG_LESS['@c_starus_warning'] : '',
						}}
					/>
				</div>
			</div>
			<Divider />
			<TableBox
				headerTitle={<h3>{fields.baseGoods}明细</h3>}
				loading={loading}
				columns={columns}
				rowKey='shippingOrderItemId'
				dataSource={list}
				options={{ density: false, fullScreen: false, setting: false }}
				scroll={{ x: '100%', y: 300 }}
				pagination={false}
				tableInfoId='179'
				size='small'
			/>
			<Form form={form}>
				{['approve_pending', 'check_pending'].includes(handleType) && (
					<>
						<Divider />
						<h3 className='mt2 mb1'>
							{handleType === 'approve_pending' ? '审核结果' : '验收结果'}
						</h3>
						<FormItem
							name='success'
							rules={[{ required: true, message: '请选择' }]}>
							<Radio.Group onChange={(e) => setFormAgree(e.target.value)}>
								<Radio
									value='Y'
									style={{ display: 'block', marginBottom: '10px' }}>
									通过
								</Radio>
								<Radio
									value='N'
									style={{ display: 'block' }}>
									不通过
								</Radio>
							</Radio.Group>
						</FormItem>
						{formAgree === 'N' && (
							<FormItem
								name='reason'
								rules={[{ required: true, message: '请输入不通过原因' }]}
								style={{ marginLeft: '22px' }}>
								<Input.TextArea
									style={{ maxWidth: '500px' }}
									rows={3}
									placeholder='请输入不通过原因'
									maxLength={100}
								/>
							</FormItem>
						)}
					</>
				)}
			</Form>
		</Modal>
	);
};

export default DetailModal;
