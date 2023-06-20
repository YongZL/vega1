import { setCustodianPeriod } from '@/services/custodian';
import { setAccountPeriod } from '@/services/distributor';
import { accessNameMap } from '@/utils';
import { notification } from '@/utils/ui';
import { Button, Form, Input, Modal } from 'antd';
import { useEffect, useState } from 'react';

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

const FormItem = Form.Item;
const PeriodModal = ({
	visible = true,
	handleCancel,
	info,
	upDataTableList,
	type,
	isBatch,
	handleSetAccountPeriodBatch,
}: DistributorController.SureApproveModalProps) => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const accessName = accessNameMap(); // 权限名称

	useEffect(() => {
		if (visible && !isBatch) {
			form.setFieldsValue({ accountPeriod: info.accountPeriod });
		} else {
			form.setFieldsValue({ accountPeriod: '30' });
		}
	}, [visible, isBatch]);

	const handleOk = () => form.submit();

	const postPeriod = async ({ accountPeriod }: { accountPeriod: number }) => {
		setLoading(true);
		let res;
		if (type === 'distributor') {
			if (isBatch) {
				await handleSetAccountPeriodBatch(accountPeriod);
			} else {
				res = await setAccountPeriod({ accountPeriod, distributorId: info.id });
			}
		} else if (type === 'custodian') {
			res = await setCustodianPeriod({ accountPeriod, custodianId: info.id });
		}
		if (res && res.code == 0) {
			notification.success('操作成功！');
			handleCancel();
			upDataTableList();
		}
		setLoading(false);
	};

	const validateNum = (rule: any, value: string, callback: (value?: string) => void) => {
		let reg = /(^[1-9]([0-9]+)?$)/;
		if (value && !reg.test(value)) {
			callback('请输入正确数值');
			return;
		}
		callback();
	};

	return (
		<Modal
			destroyOnClose
			maskClosable={false}
			visible={visible}
			title={accessName['set_distributor_account_period']}
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
					loading={loading}
					onClick={handleOk}>
					确定
				</Button>,
			]}>
			<Form
				form={form}
				{...formItemLayout}
				onFinish={postPeriod}>
				<FormItem
					label='账期'
					rules={[{ required: true, message: '请输入账期' }, { validator: validateNum }]}
					name='accountPeriod'
					extra='默认账期为30天'>
					<Input
						placeholder='请输入'
						suffix='天'
						maxLength={6}
					/>
				</FormItem>
			</Form>
		</Modal>
	);
};

export default PeriodModal;
