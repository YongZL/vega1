import type { ChangeEvent, FC } from 'react';

import React, { useState } from 'react';
import { Modal, Button, Input, Form, Row, Col } from 'antd';

import { updatePwd } from '@/services/users';

const FormItem = Form.Item;

const formLayout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 },
};

interface IProps {
	visible: boolean;
	handleFinish: () => void;
	handleCancel: () => void;
	congigData: Record<string, any>;
	oldPassword: Partial<LoginWebController.LoginParams>;
}

const ResetPassword: FC<IProps> = ({
	visible,
	handleFinish,
	handleCancel,
	congigData,
	oldPassword,
}) => {
	const [form] = Form.useForm();
	const [confirmDirty, setConfirmDirty] = useState(false);
	const [showPassswordTip, setShowPassswordTip] = useState(false);
	const [isUpper, setIsUpper] = useState(false);
	const [isLower, setIsLower] = useState(false);
	const [isNum, setIsNum] = useState(false);
	const [isTeShu, setSsTeShu] = useState(false);
	const [errorMessage, setErrorMessage] = useState('提示:当前密码不足8位,且以下规则不足3条');
	const [isAllRight, setIsAllRight] = useState(false);
	const [loading, setLoading] = useState(false);

	const submit = async (values: UsersController.updatePwdParams) => {
		try {
			setLoading(true);
			const res = await updatePwd({
				...values,
				oldPassword: oldPassword.loginPassword as string,
			});
			if (res && res.code === 0) {
				handleFinish();
			}
		} finally {
			setLoading(false);
		}
	};
	const handleSubmit = () => {
		form
			.validateFields()
			.then((values) => {
				submit(values);
			})
			.catch((error) => {
				if (error.errorFields && error.errorFields.length === 0) {
					submit(error.values);
				}
			});
	};

	const handleConfirmBlur = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setConfirmDirty(confirmDirty || !!value);
	};
	const checkPassword = (_rule: any, value: string) => {
		if (value && value !== form.getFieldValue('newPassword')) {
			return Promise.reject('两次密码输入不一致');
		} else {
			return Promise.resolve();
		}
	};
	const simpleConfirm = (_rule: any, value: string) => {
		if (value) {
			form.validateFields(['confirmPwd'], { force: true });
		}
		if (value.length < 6) {
			return Promise.reject('密码长度不小于6位');
		} else {
			return Promise.resolve();
		}
	};
	const inputOnBlur = () => {
		setShowPassswordTip(false);
	};

	const inputOnFocus = () => {
		setShowPassswordTip(true);
	};

	const checkConfirm = (_rule: any, value: string) => {
		if (value) {
			form.validateFields(['confirmPwd'], { force: true });
		}
		const regUpper = /[A-Z]/;
		const regLower = /[a-z]/;
		const regNum = /[0-9]/;
		const regTeShu = new RegExp(
			"[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？+-]",
		);
		let complex = 0;
		if (regLower.test(value)) {
			++complex;
			setIsLower(true);
		} else {
			setIsLower(false);
		}
		if (regUpper.test(value)) {
			++complex;
			setIsUpper(true);
		} else {
			setIsUpper(false);
		}
		if (regNum.test(value)) {
			++complex;
			setIsNum(true);
		} else {
			setIsNum(false);
		}
		if (regTeShu.test(value)) {
			++complex;
			setSsTeShu(true);
		} else {
			setSsTeShu(false);
		}
		if (complex < 3 && value.length < 8) {
			setErrorMessage('提示:当前密码不足8位,且以下规则不足3条');
		} else if (complex < 3 && value.length > 16) {
			setErrorMessage('提示:当前密码超16位,且以下规则不足3条');
		} else if (complex < 3) {
			setErrorMessage('提示:以下规则不足3条');
		}
		if (complex < 3 || value.length < 8 || value.length > 16) {
			setIsAllRight(false);
			return Promise.reject();
		} else {
			setIsAllRight(true);
			return Promise.resolve();
		}
	};

	return (
		<Modal
			visible={visible}
			title='重置密码'
			onOk={handleSubmit}
			maskClosable={false}
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
					onClick={handleSubmit}>
					确认
				</Button>,
			]}>
			<Form
				{...formLayout}
				form={form}>
				<Row>
					<Col span={24}>
						<p style={{ textAlign: 'center' }}>为确保您的账户安全，请重置密码！</p>
						{/* <FormItem  label="旧密码" name='oldPassword' rules={[{ required: true, message: '请输入' }]}>
              <Input.Password  maxLength={18} placeholder="请输入旧密码" />
            </FormItem> */}
						{congigData['password_complexity'] == 1 && showPassswordTip && (
							<div className='showPassword-wrap'>
								<div className='showPassword-main'>
									<div className='top-tip'>
										<p>密码长度8-16位,且须满足以下规则中的3条</p>
										{isAllRight ? (
											<p className='success'>提示:当前密码可用</p>
										) : (
											<p className='error'>{errorMessage}</p>
										)}
									</div>
									<div className='bot-tip'>
										<p className={isUpper ? 'checked' : ''}>√ 包含大写字母</p>
										<p className={isLower ? 'checked' : ''}>√ 包含小写字母</p>
										<p className={isNum ? 'checked' : ''}>√ 包含数字</p>
										<p className={isTeShu ? 'checked' : ''}>√ 包含特殊符号</p>
									</div>
								</div>
							</div>
						)}
						<FormItem
							label='新密码'
							name='newPassword'
							rules={[
								{ required: true, message: '请输入' },
								{
									validator: congigData['password_complexity'] == 1 ? checkConfirm : simpleConfirm,
								},
							]}>
							<Input.Password
								maxLength={16}
								placeholder='请输入新密码'
								onBlur={inputOnBlur}
								onFocus={inputOnFocus}
							/>
						</FormItem>
						<FormItem
							label='确认密码'
							name='confirmPwd'
							rules={[{ required: true, message: '请输入' }, { validator: checkPassword }]}>
							<Input.Password
								onBlur={handleConfirmBlur}
								placeholder='请再次确认密码'
								maxLength={16}
							/>
						</FormItem>
					</Col>
				</Row>
			</Form>
		</Modal>
	);
};

export default ResetPassword;
