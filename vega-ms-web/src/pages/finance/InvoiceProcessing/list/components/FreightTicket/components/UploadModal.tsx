import InputUnit from '@/components/InputUnit';
import { ProColumns } from '@/components/ProTable';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { payWayEnum, taxRate } from '@/constants/dictionary';
import { validateProcurementPrice } from '@/pages/base_data/material/goods/add/config';
import { postGenerateReceipt } from '@/services/receipt';
import { getEndTime } from '@/utils';
import { DealDate } from '@/utils/DealDate';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { validateInvoiceAmount } from '@/utils/validator';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Form, Modal, InputNumber, Input } from 'antd';
import moment from 'moment';
import React, { cloneElement, useEffect, useState } from 'react';
import { useModel } from 'umi';
import handleParams from '../../handleParams';

type PropsItem = {
	trigger: JSX.Element;
	disabled?: boolean;
	searchParams: Record<string, any>;
	listData: Record<string, any>;
	getTableList?: () => void;
};

const UploadModal: React.FC<PropsItem> = ({ ...props }) => {
	const { trigger, disabled, getTableList, listData, searchParams } = props;
	const [form] = Form.useForm();
	const [num, setNum] = useState(0);
	const { fields } = useModel('fieldsMapping');
	const [totalPrice, setTotalPrice] = useState(0);
	const [visible, setVisible] = useState(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [submitList, setSubmitList] = useState<ReceiptController.DetailInvoiceSync[]>([]);
	const searchColumns: ProFormColumns = [
		{
			title: '付款方式',
			dataIndex: 'payWay',
			valueType: 'radioButton',
			initialValue: 'clientPayment',
			valueEnum: payWayEnum,
			fieldProps: {
				className: 'search-radio-button',
			},
		},
		{
			title: '发票编号',
			dataIndex: 'invoiceCode',
			fieldProps: {
				maxLength: 30,
				placeholder: `请输入发票编号`,
			},
		},

		{
			title: '发票代码',
			dataIndex: 'invoiceNo',
			formItemProps: {
				rules: [{ pattern: new RegExp('^[a-zA-Z0-9]*$'), message: '请输入字母或数字' }],
			},
			fieldProps: {
				maxLength: 20,
				placeholder: `请输入发票代码`,
			},
		},
		{
			title: '发票日期',
			dataIndex: 'invoicingDate',
			valueType: 'datePicker',
			fieldProps: {
				placeholder: `请选择发票日期`,
				inputReadOnly: true,
				disabledDate: (current: any) => {
					return current && current >= moment(getEndTime()).endOf('day');
				},
			},
		},
		{
			title: '税率',
			dataIndex: 'taxRate',
			valueType: 'select',
			fieldProps: {
				options: taxRate,
				placeholder: `请选择税率`,
			},
		},
		{
			title: '发票金额',
			dataIndex: 'invoiceAmount',
			fieldProps: {
				placeholder: `请输入发票金额`,
				style: { width: '100%', marginRight: 10 },
				suffix: '元',
			},
			formItemProps: {
				rules: [{ validator: validateInvoiceAmount }],
			},
		},
	];

	const columns: ProColumns<ReceiptController.DetailInvoiceSync>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			renderText: (text: string, record, index: number) => <span>{index + 1}</span>,
			width: 70,
		},
		{
			title: fields.goodsCode,
			key: 'materialCode',
			width: 'M',
			dataIndex: 'materialCode',
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			width: 'L',
			ellipsis: true,
		},
		{
			width: 'M',
			title: '规格/型号',
			dataIndex: 'specification',
			ellipsis: true,
			renderText: (text: any, record: Record<string, any>) =>
				formatStrConnect(record, ['specification', 'model']),
		},
		{
			width: 'M',
			title: '待开数量',
			dataIndex: 'num',
			key: 'num',
			ellipsis: true,
		},
		{
			title: '开票数量',
			dataIndex: 'totalNum',
			width: 'L',
			ellipsis: true,
			renderText: (text: number, record: Record<string, any>) => {
				const value = Number(record.num);
				const min = value < 0 ? value : 1;
				const max = value < 0 ? -1 : value;
				return (
					<InputNumber
						min={min}
						max={max}
						key={record.id}
						defaultValue={record.totalNum}
						onChange={(v) => changeNum(record, v || min)}
						parser={(v) => (v ? v.replace(/\.\d+/g, '') : min)}
					/>
				);
			},
		},
		{
			width: 'XS',
			title: '验收数量',
			dataIndex: 'acceptanceNum',
			ellipsis: true,
		},
		{
			title: '验收时间',
			dataIndex: 'acceptanceTime',
			width: 'XXL',
			ellipsis: true,
			renderText: (text: string, record) => (
				<>
					<span>{text ? moment(text).format('YYYY/MM/DD') : ''}</span>
				</>
			),
		},
		{
			width: 'XL',
			title: '计价单位',
			dataIndex: 'minGoodsUnit',
			ellipsis: true,
		},
		{
			width: 'M',
			title: '含税单价(元)',
			dataIndex: 'price',
			renderText: (text: number) => <span>{convertPriceWithDecimal(text)}</span>,
		},
		{
			width: 'M',
			title: '订单编号',
			dataIndex: 'receivingOrderCode',
		},
		{
			width: 'M',
			title: '配送单号',
			dataIndex: 'shippingOrderCode',
		},
		{
			width: 'XXXL',
			title: '配送商业',
			dataIndex: 'distributorName',
			copyable: true,
		},
		{
			width: 'XXXL',
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			copyable: true,
		},
		{
			width: 'XXXL',
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			copyable: true,
		},
		{
			width: 'XXXL',
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			copyable: true,
		},
	];
	//提交
	const handleSubmit = () => {
		form.validateFields().then(async (value) => {
			setLoading(true);
			let params = handleParams(submitList, searchParams, value);
			try {
				let result = await postGenerateReceipt({ ...params, invoiceSync: true });
				if (result?.code == 0) {
					notification.success('上传成功');
					onCancel();
					if (typeof getTableList == 'function') {
						getTableList();
					}
				}
			} finally {
				setLoading(false);
			}
		});
	};

	// 修改数量
	const changeNum = (record: Record<string, any>, value: number | string) => {
		let price = 0;
		let count = 0;
		const newList: any = submitList.map((item: Record<string, any>) => {
			if (record.id && item.id === record.id) {
				item.totalNum = value;
				item.totalAmount = item.price * Number(value);
				price += item.totalAmount;
				count += Number(value);
				return item;
			}
			price += item.totalAmount;
			count += item.totalNum;
			return item;
		});

		setNum(count);
		setTotalPrice(price);
		setSubmitList(newList);
		setTimeout(() => {
			form.validateFields(['totalAmount']);
		}, 500);
	};

	// 关闭弹窗
	const onCancel = () => {
		setVisible(false);
		setSubmitList([]);
		form.resetFields();
	};

	useEffect(() => {
		if (visible) {
			let price = 0;
			let count = 0;
			const newList = listData.map((item: Record<string, any>) => {
				item.totalAmount = item.price * item.num;
				item.totalNum = item.num;
				price += item.totalAmount;
				count += item.num;
				return item;
			});
			setNum(count);
			setTotalPrice(price);
			setSubmitList([...newList]);
		}
	}, [visible]);

	return (
		<div>
			{cloneElement(trigger, {
				onClick: () => {
					if (disabled) {
						return;
					}
					setVisible(true);
				},
			})}
			<Modal
				destroyOnClose
				maskClosable={false}
				forceRender
				visible={visible}
				width={'94%'}
				title='上传发票'
				onCancel={onCancel}
				footer={[
					<Button
						key='submit'
						type='primary'
						loading={loading}
						onClick={handleSubmit}>
						提交
					</Button>,
					<Button onClick={onCancel}>取消</Button>,
				]}>
				<ProTable<ReceiptController.DetailInvoiceSync>
					rowKey='id'
					loadConfig={{
						request: false,
					}}
					pagination={false}
					api={undefined}
					columns={columns}
					searchConfig={{
						form: form,
						submitter: false,
						columns: searchColumns,
					}}
					scroll={{ y: 300 }}
					dataSource={submitList}
					headerTitle={
						<div style={{ display: 'flex', alignItems: 'center' }}>
							<h4 style={{ marginBottom: 0 }}>{fields.goods}明细</h4>
							<div className='flex flex-between'>
								<div className='tableTitle'>
									<span className='tableAlert'>
										<ExclamationCircleFilled
											style={{
												color: CONFIG_LESS['@c_starus_await'],
												marginRight: '8px',
												fontSize: '12px',
											}}
										/>

										<span className='consumeCount'>
											数量： <span className='count tableNotificationTitleNum'>{num || 0}</span>
											，总金额：￥
											<span className='count tableNotificationTitleNum'>
												{convertPriceWithDecimal(totalPrice) || 0}
											</span>
										</span>
									</span>
								</div>
							</div>
						</div>
					}
				/>
			</Modal>
		</div>
	);
};
export default UploadModal;
