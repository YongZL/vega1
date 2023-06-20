import { Button, Form, Input, Modal, Radio, RadioChangeEvent } from 'antd';
import { FC, useEffect, useState } from 'react';
const FormItem = Form.Item;
const formItemLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 5 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 16 },
	},
};
const SureApproveModal: FC<{
	visible: boolean;
	handleCancel: () => void;
	info: {
		code?: string | undefined;
		deliveryOrderId?: number | undefined;
		goodsRequestId?: number | undefined;
	};
	submit:
		| ((params: DeliveryOrderController.QueryCheckData) => Promise<void>)
		| ((value: DeliveryOrderController.QueryBatchCheckData) => Promise<void>);
}> = ({ visible, handleCancel, submit, info }) => {
	const [form] = Form.useForm();
	const [auditType, setAuditType] = useState('pass');

	const onFinish = (values: { reason?: string; status?: string }) => {
		const params = {
			...info,
			...values,
		};
		submit(params);
	};

	useEffect(() => {
		if (visible) {
			form.resetFields();
			setAuditType('pass');
		}
	}, [visible]);

	const auditTypeChange = (e: RadioChangeEvent) => setAuditType(e.target.value);

	const handleOk = () => form.submit();

	return (
		<Modal
			visible={visible}
			title='复核结果'
			onOk={handleOk}
			onCancel={handleCancel}
			footer={[
				<Button
					key='back'
					onClick={handleCancel}>
					取消
				</Button>,
				<Button
					key='submit'
					type='primary'
					onClick={handleOk}>
					确定
				</Button>,
			]}>
			<Form
				form={form}
				labelAlign='left'
				{...formItemLayout}
				onFinish={onFinish}
				initialValues={{
					status: 'pass',
				}}>
				<FormItem
					label='复核结果'
					rules={[
						{
							required: true,
							message: '请选择审核结果',
						},
					]}
					name='status'>
					<Radio.Group onChange={(value) => auditTypeChange(value)}>
						<Radio value='pass'>通过</Radio>
						<Radio value='reject'>不通过</Radio>
					</Radio.Group>
				</FormItem>
				{auditType === 'reject' && (
					<FormItem
						label='原因'
						rules={[
							{
								required: true,
								message: '请输入不通过的原因',
							},
						]}
						name='reason'>
						<Input.TextArea
							style={{ maxWidth: '500px' }}
							rows={2}
							placeholder='请输入不通过的原因'
							maxLength={50}
						/>
					</FormItem>
				)}
			</Form>
		</Modal>
	);
};

export default SureApproveModal;
