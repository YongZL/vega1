import SchemaForm from '@/components/SchemaForm';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { taxRate } from '@/constants/dictionary';
import { updateInvoiceCode } from '@/services/receivingOrder';
import { notification } from '@/utils/ui';
import { Form, Modal } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { validateInvoiceAmount } from '@/utils/validator';
import { getEndTime } from '@/utils';

type PropsItem = {
	detailInfo: any;
	closeModal: () => void;
	reloadList: () => void;
};

const UploadInvoice: React.FC<PropsItem> = ({ detailInfo, closeModal, reloadList }) => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		if (detailInfo) {
			form.setFieldsValue({
				...detailInfo,
				invoicingDate: detailInfo.invoicingDate ? moment(detailInfo.invoicingDate) : null,
				invoiceAmount: detailInfo.invoiceAmount ? detailInfo.invoiceAmount / 10000 : null,
			});
		}
	}, [detailInfo]);

	// 修改发票编号
	const submitUpload = () => {
		form.validateFields().then(async (value) => {
			setLoading(true);
			try {
				const { invoiceAmount, invoicingDate } = value || {};
				const res = await updateInvoiceCode({
					receivingOrderId: detailInfo.receivingId,
					...value,
					invoicingDate: invoicingDate ? moment(invoicingDate).valueOf() : null,
					invoiceAmount: invoiceAmount * 10000,
				});
				if (res && res.code === 0) {
					notification.success('修改成功');
					closeModal();
					reloadList();
				}
			} finally {
				setLoading(false);
			}
		});
	};

	const rule = (message: string) => {
		return {
			rules: [
				{
					required: true,
					message: message,
				},
			],
		};
	};

	const columns: ProFormColumns = [
		{
			title: '发票编号',
			dataIndex: 'invoiceCode',
			fieldProps: {
				maxLength: 30,
				placeholder: '请输入发票编号',
			},
			formItemProps: {
				...rule('请输入发票编号'),
			},
		},
		{
			title: '发票代码',
			dataIndex: 'invoiceNo',
			fieldProps: {
				maxLength: 20,
				placeholder: '请输入发票代码',
			},
			formItemProps: {
				rules: [{ pattern: new RegExp('^[a-zA-Z0-9]*$'), message: '请输入字母或数字' }],
			},
		},
		{
			title: '开票日期',
			dataIndex: 'invoicingDate',
			valueType: 'datePicker',
			fieldProps: {
				require: true,
				placeholder: '请选择开票日期',
				// disabledDate: (current: Record<string, any>) => current.valueOf() >= Date.now(),
				disabledDate: (current: Record<string, any>) => {
					return current && current >= moment(getEndTime()).endOf('day');
				},
			},
			formItemProps: {
				...rule('请选择开票日期'),
			},
		},
		{
			title: '税率',
			dataIndex: 'taxRate',
			valueType: 'select',
			fieldProps: {
				placeholder: '请选择税率',
				options: taxRate,
			},
		},
		{
			title: '发票金额',
			dataIndex: 'invoiceAmount',
			fieldProps: {
				placeholder: `请输入发票金额`,
				suffix: '元',
			},
			formItemProps: {
				rules: [{ validator: validateInvoiceAmount }],
			},
		},
	];

	return (
		<Modal
			confirmLoading={loading}
			visible={true}
			width={420}
			title='发票上传'
			onOk={submitUpload}
			destroyOnClose
			okText='确认'
			maskClosable={false}
			onCancel={closeModal}>
			<SchemaForm
				labelWidth={78}
				span={24}
				form={form}
				submitter={{
					render: () => false,
				}}
				layoutType='Form'
				layout='horizontal'
				columns={columns}
			/>
		</Modal>
	);
};

export default UploadInvoice;
