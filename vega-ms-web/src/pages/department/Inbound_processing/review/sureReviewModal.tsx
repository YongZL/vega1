import { queracceptancemh } from '@/services/acceptance';
import { Button, Form, Input, Modal, Radio, RadioChangeEvent, Select } from 'antd';
import { FC, useEffect, useState } from 'react';

const FormItem = Form.Item;
const formItemLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 6 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 16 },
	},
};
interface Props {
	visible?: boolean;
	handleCancel?: () => void;
	submit: (params: AcceptanceController.AcceptanceResult) => void;
	info?: any;
	loading: boolean;
}

const SureApproveModal: FC<Props> = ({ visible, handleCancel, submit, info, loading }) => {
	const [form] = Form.useForm();
	const [auditType, setAuditType] = useState('pass');
	const [acceptance, setAcceptance] = useState<AcceptanceController.Acceptor[]>([
		{
			departmentId: '',
			departmentName: '',
			userId: sessionStorage.getItem('userId') || undefined,
			userName: sessionStorage.getItem('useName') || undefined,
		},
	]);

	const onFinish = (values: AcceptanceController.AcceptanceResult) => {
		let acceptance = values.acceptance;
		if (acceptance) {
			values.acceptance = acceptance.split('/')[0];
		}
		let params: AcceptanceController.AcceptanceResult = {
			...info,
			...values,
		};
		submit(params);
	};

	useEffect(() => {
		if (visible) {
			form.resetFields();
			setAuditType('Y');
		}
	}, [visible]);

	useEffect(() => {
		setAcceptance([
			{
				departmentId: '',
				departmentName: '',
				userId: sessionStorage.getItem('userId') || undefined,
				userName: sessionStorage.getItem('useName') || undefined,
			},
		]);
	}, []);

	const ayditTypeChange = (e: RadioChangeEvent) => {
		setAuditType(e.target.value);
	};
	const handleOk = () => {
		form.submit();
	};
	const queryqueryacceptance = async (userName: string) => {
		if (!userName) return;
		let params = { userName };
		let res = await queracceptancemh(params);
		setAcceptance(res.data);
	};

	return (
		<Modal
			visible={visible}
			title='验收结果'
			onOk={handleOk}
			maskClosable={false}
			onCancel={handleCancel}
			footer={[
				<Button
					key='back'
					onClick={handleCancel}>
					取消
				</Button>,
				<Button
					loading={loading}
					key='submit'
					type='primary'
					onClick={handleOk}>
					确定
				</Button>,
			]}>
			<Form
				labelAlign='left'
				form={form}
				{...formItemLayout}
				onFinish={onFinish}
				initialValues={{
					auditType: 'Y',
				}}>
				<FormItem
					label='验收结果'
					rules={[
						{
							required: true,
							message: '请选择验收结果',
						},
					]}
					name='auditType'>
					<Radio.Group
						onChange={(value) => {
							ayditTypeChange(value);
						}}>
						<Radio value='Y'>通过</Radio>
						<Radio value='N'>不通过</Radio>
					</Radio.Group>
				</FormItem>
				<FormItem
					label='验收人'
					rules={[
						{
							required: true,
							message: '请输入验收人',
						},
					]}
					name='acceptance'
					initialValue={sessionStorage.getItem('userId') + '/'}>
					{/* <Input onChange={queryqueryacceptance} maxLength={30} placeholder="请输入验收人" /> */}
					<Select
						showSearch
						allowClear
						// open={false}
						showArrow={false}
						optionFilterProp='children'
						onSearch={queryqueryacceptance}
						// onSelect={queryinputvalue}
						notFoundContent={null}
						// onBlur={myonBlur}
					>
						{acceptance.map((item) => {
							let id = `${item.userId}/${item.departmentId}`;
							return (
								<Select.Option
									value={id}
									key={id}>
									{item.userName} {item.departmentName ? `（${item.departmentName}）` : ''}
								</Select.Option>
							);
						})}
					</Select>
				</FormItem>

				{auditType === 'N' && (
					<>
						<FormItem
							label='需要补货'
							rules={[
								{
									required: true,
									message: '请选择验收结果',
								},
							]}
							name='needToReplenish'>
							<Radio.Group>
								<Radio value={true}>是</Radio>
								<Radio value={false}>否</Radio>
							</Radio.Group>
						</FormItem>
						<FormItem
							label='原因'
							rules={[
								{
									required: true,
									message: '请输入不通过的原因',
								},
							]}
							name='acceptanceConclusion'>
							<Input.TextArea
								style={{ maxWidth: '500px' }}
								rows={2}
								placeholder='请输入不通过的原因'
								maxLength={50}
							/>
						</FormItem>
					</>
				)}
			</Form>
		</Modal>
	);
};
export default SureApproveModal;
