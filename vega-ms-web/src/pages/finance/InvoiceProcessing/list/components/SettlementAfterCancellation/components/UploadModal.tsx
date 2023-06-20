import SchemaForm from '@/components/SchemaForm';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { payWayEnum, taxRate } from '@/constants/dictionary';
import { postGenerateReceipt } from '@/services/receipt';
import { notification } from '@/utils/ui';
import { Form, Modal } from 'antd';
import { cloneElement, useState, useEffect } from 'react';
import handleParams from '../../../components/handleParams';
import { convertPriceWithDecimal } from '@/utils/format';
import { validateProcurementPrice } from '@/pages/base_data/material/goods/add/config';
import moment from 'moment';
import { getEndTime } from '@/utils';
import { validateInvoiceAmount } from '@/utils/validator';
type PropsItem = {
	trigger: JSX.Element;
	disabled?: boolean;
	sumPrice: number;
	searchParams: Record<string, any>;
	listData: Record<string, any>[];
	getTableList?: () => void;
};

const UploadModal: React.FC<PropsItem> = ({ ...props }) => {
	const { trigger, disabled, getTableList, listData, sumPrice, searchParams } = props;
	const [form] = Form.useForm();
	const [visible, setVisible] = useState(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [newsumPrice, setNewsumPrice] = useState<number | string>(sumPrice);
	useEffect(() => {
		setNewsumPrice(sumPrice);
		if (visible) {
			form.setFieldsValue({ sumPrice: newsumPrice ? convertPriceWithDecimal(newsumPrice) : '-' });
		}
	}, [sumPrice, visible]);
	const registerColumn: ProFormColumns = [
		{
			title: '总金额(元)',
			dataIndex: 'sumPrice',
			valueType: 'aText',
			fieldProps: {
				placeholder: '请输入总金额',
			},
		},
		{
			title: '发票编号',
			dataIndex: 'invoiceCode',
			fieldProps: {
				maxLength: 30,
				placeholder: '请输入发票编号',
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
		{
			title: '付款方式',
			dataIndex: 'payWay',
			valueType: 'radioButton',
			initialValue: 'clientPayment',
			valueEnum: payWayEnum,
			fieldProps: {
				className: 'search-radio-button',
			},
			formItemProps: {
				rules: [
					{
						required: true,
						message: `请选择付款方式`,
					},
				],
			},
		},
	];

	const handleCancel = () => {
		form.resetFields();
		setVisible(false);
	};

	const postData = () => {
		form.validateFields().then(async (value) => {
			setLoading(true);
			let params = handleParams(listData, searchParams, value);
			try {
				let result = await postGenerateReceipt(params);
				if (result?.code == 0) {
					form.resetFields();
					notification.success('上传成功');
					handleCancel();
					if (typeof getTableList == 'function') {
						getTableList();
					}
				}
			} finally {
				setLoading(false);
			}
		});
	};

	return (
		<>
			{cloneElement(trigger, {
				onClick: () => {
					setNewsumPrice(sumPrice);
					if (disabled) {
						return;
					}
					setVisible(true);
				},
			})}
			<Modal
				confirmLoading={loading}
				visible={visible}
				width={400}
				title='上传发票'
				onOk={postData}
				destroyOnClose
				okText='确认操作'
				maskClosable={false}
				onCancel={handleCancel}>
				<div style={{ marginBottom: 20 }}>本次将生成{Math.ceil(listData.length / 8)}张收料单</div>
				<SchemaForm
					span={24}
					form={form}
					submitter={{
						render: () => false,
					}}
					layoutType='Form'
					layout='horizontal'
					columns={registerColumn}
				/>
			</Modal>
		</>
	);
};
export default UploadModal;
