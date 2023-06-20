import { notification } from '@/utils/ui';
import { Modal } from 'antd';
import { cloneElement, useState } from 'react';
import SchemaForm from '@/components/SchemaForm';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { Form } from 'antd';
import { uploadRfidByRange } from '@/services/rfidStock';
interface Props {
	title: string;
	trigger: JSX.Element;
	disabled?: boolean;
	getTableList?: () => void;
}

const RegisterModal: React.FC<Props> = ({ ...props }) => {
	const [form] = Form.useForm();
	const [visible, setVisible] = useState(false);
	const [loading, setLoading] = useState<boolean>(false);
	const { trigger, disabled, title, getTableList } = props;
	const formItemProps = (message: string, type?: boolean) => {
		let reg = type ? /^[0-9A-Za-z]+$/ : /^[0-9]+$/;
		return {
			maxLength: 20,
			labelCol: {
				flex: '120px',
			},
			rules: [
				{
					required: true,
					message: `请输入${message}`,
				},
				{ pattern: new RegExp(reg), message: `请输入正确${message}` },
			],
		};
	};

	const registerColumn: ProFormColumns = [
		{
			title: '前    缀',
			dataIndex: 'prefix',
			fieldProps: {
				placeholder: '请输入前缀',
			},
			formItemProps: formItemProps('前缀', true),
		},
		{
			title: 'RFID条码总长度',
			dataIndex: 'totalLength',
			fieldProps: {
				placeholder: '请输入RFID条码总长度',
			},
			formItemProps: formItemProps('RFID条码总长度'),
		},
		{
			title: '条码起始数值',
			dataIndex: 'lengthStart',
			fieldProps: {
				placeholder: '请输入条码起始数值',
			},
			formItemProps: formItemProps('条码起始数值'),
		},
		{
			title: '条码结束数值',
			dataIndex: 'lengthEnd',
			fieldProps: {
				placeholder: '请输入条码结束数值',
			},
			formItemProps: formItemProps('条码结束数值'),
		},
	];
	const handleCancel = () => {
		form.resetFields();
		setVisible(false);
	};

	const postData = () => {
		form.validateFields().then(async (value) => {
			setLoading(true);
			try {
				let result = await uploadRfidByRange(value);
				if (result?.code == 0) {
					handleCancel();
					form.resetFields();
					notification.success(result?.data);
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
				title={title}
				onOk={postData}
				destroyOnClose
				maskClosable={false}
				onCancel={handleCancel}>
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
				<div style={{ color: CONFIG_LESS['@c_starus_warning'], marginTop: 15, marginBottom: -10 }}>
					* 注册RFID条码包含起始/结束数值本身
				</div>
			</Modal>
		</>
	);
};
export default RegisterModal;
