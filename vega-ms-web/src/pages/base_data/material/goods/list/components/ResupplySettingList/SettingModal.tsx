import type { FC } from 'react';

import React, { useEffect, useState, cloneElement } from 'react';
import { Button, Modal, Form, InputNumber } from 'antd';
import { notification } from '@/utils/ui';

import { setGoodsResupply } from '@/services/resupply';

const FormItem = Form.Item;

const SettingModal: FC<{
	trigger: JSX.Element;
	detail: ResupplyController.GoodsResupplyRecord;
	onFinish: () => void;
}> = ({ trigger, detail, onFinish }) => {
	const [form] = Form.useForm();
	const [visible, setVisible] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		if (visible) {
			form.setFieldsValue({
				upperLimit: detail.upperLimit,
				lowerLimit: detail.lowerLimit,
			});
		}
	}, [visible]);

	//提交
	const submit = async () => {
		form.validateFields().then(async (values: ResupplyController.SetGoodsParams) => {
			if (Number(values.upperLimit) <= Number(values.lowerLimit)) {
				notification.error('上限必须大于下限');
				return;
			}
			setLoading(true);
			try {
				const res = await setGoodsResupply({
					...values,
					goodsId: detail.goodsId as number,
					storageAreaId: WEB_PLATFORM === 'DS' ? (detail?.storageAreaId as number) : undefined,
				});
				if (res && res.code == 0) {
					notification.success('操作成功');
					form.resetFields();
					onFinish();
					setVisible(false);
				}
			} finally {
				setLoading(false);
			}
		});
	};

	const onCancel = () => {
		form.resetFields();
		setVisible(false);
	};

	return (
		<>
			{cloneElement(trigger, {
				onClick: () => {
					setVisible(true);
				},
			})}
			<Modal
				className='modalDetails'
				visible={visible}
				maskClosable={false}
				title='设置'
				destroyOnClose
				onCancel={onCancel}
				footer={
					<Button
						type='primary'
						loading={loading}
						onClick={submit}>
						提交
					</Button>
				}>
				<Form
					form={form}
					initialValues={{
						upperLimit: detail.upperLimit ? parseInt(detail.upperLimit) : undefined,
						lowerLimit: detail.lowerLimit ? parseInt(detail.lowerLimit) : undefined,
					}}>
					<FormItem
						label='上限'
						name='upperLimit'
						rules={[{ required: true, message: '请输入上限' }]}>
						<InputNumber
							min={1}
							max={999999}
							precision={0}
							style={{ width: '50%' }}
						/>
					</FormItem>
					<FormItem
						label='下限'
						name='lowerLimit'
						rules={[{ required: true, message: '请输入下限' }]}>
						<InputNumber
							min={0}
							max={999999}
							precision={0}
							style={{ width: '50%' }}
						/>
					</FormItem>
				</Form>
			</Modal>
		</>
	);
};

export default SettingModal;
