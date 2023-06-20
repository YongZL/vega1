import React, { useState, useEffect } from 'react';
import { notification } from '@/utils/ui';
import { Modal, Form, Input } from 'antd';

import '@ant-design/compatible/assets/index.css';
import { edit } from '../service';

const FormItem = Form.Item;

export interface UpdateProps {
	setIsOpen: (value: boolean) => void;
	isOpen: boolean;
	itemId: string;
	itemType: string;
	orderId: string;
	getList?: () => void;
}

const EditModal: React.FC<UpdateProps> = (props) => {
	const [loading, setLoading] = useState(false);

	const [form] = Form.useForm();

	const { isOpen, setIsOpen, getList, itemId, orderId, itemType } = props;

	// 关闭弹窗
	const modalCancel = (update: boolean) => {
		setIsOpen(false);
		form.resetFields();
		if (update) {
			getList(itemType, {});
		}
	};

	const handleSubmit = () => {
		form.validateFields().then(async (values: any) => {
			setLoading(true);
			const params = {
				items: [{ ...values, id: itemId }],
				stockTakingOrderId: orderId,
			};
			const res = await edit(params);
			if (res && res.code === 0) {
				notification.success('操作成功');
				modalCancel(true);
			}
			setLoading(false);
		});
	};

	useEffect(() => {}, []);

	return (
		<Form form={form}>
			<Modal
				destroyOnClose
				maskClosable={false}
				visible={isOpen}
				title='编辑'
				onCancel={() => modalCancel(false)}
				onOk={handleSubmit}
				confirmLoading={loading}>
				<FormItem
					name='errorReason'
					label='盈亏原因'
					rules={[{ required: true, message: '请选择' }]}>
					<Input.TextArea
						placeholder='请填写'
						rows={3}
						maxLength={100}
					/>
				</FormItem>
				<FormItem
					name='solutions'
					label='解决办法'
					rules={[{ required: true, message: '请选择' }]}>
					<Input.TextArea
						placeholder='请填写'
						rows={3}
						maxLength={100}
					/>
				</FormItem>
			</Modal>
		</Form>
	);
};

export default EditModal;
