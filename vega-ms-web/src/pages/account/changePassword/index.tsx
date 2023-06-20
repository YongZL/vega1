import { updatePwd } from '@/services/users';
import { notification } from '@/utils/ui';
import { Button, Card, Form, Input } from 'antd';
import React, { ChangeEvent, useState } from 'react';
import { connect, history } from 'umi';

const FormItem = Form.Item;
type Rule = Record<string, any>;
const ChangePassword: React.FC<{ global: Record<string, any> }> = ({ global }) => {
	const [form] = Form.useForm();
	const [isUpper, setIsUpper] = useState(false);
	const [isLower, setIsLower] = useState(false);
	const [isNum, setIsNum] = useState(false);
	const [isTeShu, setSsTeShu] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isAllRight, setIsAllRight] = useState(false);
	const [confirmDirty, setConfirmDirty] = useState(false);
	const [showPasswordTip, setShowPasswordTip] = useState(false);
	const [errorMessage, setErrorMessage] = useState('提示:当前密码不足8位,且以下规则不足3条');

	const handleSubmit = () => {
		form
			.validateFields()
			.then(async (values) => {
				try {
					setLoading(true);
					const res = await updatePwd(values);
					if (res && res.code === 0) {
						notification.success('修改成功');
						history.push('/');
					}
				} finally {
					setLoading(false);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const handleConfirmBlur = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setConfirmDirty(confirmDirty || !!value);
	};

	const checkPassword = (_rule: Rule, value: string) => {
		if (value && value !== form.getFieldValue('newPassword')) {
			return Promise.reject('两次密码输入不一致');
		} else {
			return Promise.resolve();
		}
	};
	const simpleConfirm = (_rule: Rule, value: string) => {
		if (value.length < 6) {
			return Promise.reject('密码长度不小于6位');
		} else {
			return Promise.resolve();
		}
	};
	const inputOnBlur = () => {
		if (form.getFieldValue('confirmPwd')) {
			form.validateFields(['confirmPwd']);
		}
		setShowPasswordTip(false);
	};

	const inputOnFocus = () => {
		setShowPasswordTip(true);
	};
	const checkConfirm = (_rule: Rule, value: string) => {
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
		<div style={{ margin: ' -20px -28px', padding: ' 0 4px 8px' }}>
			<div
				style={{
					height: '40px',
					lineHeight: '40px',
					background: CONFIG_LESS['@bgc_table'],
					fontSize: CONFIG_LESS['@font-size-16'],
					marginBottom: '2px',
					paddingLeft: '6px',
				}}>
				修改登录密码
			</div>
			<div className='pageHeaderWrapper'>
				<Card bordered={false}>
					<Form
						form={form}
						style={{ padding: '0 26%' }}>
						<FormItem
							label='旧密码'
							name='oldPassword'
							rules={[{ required: true, message: '请输入' }]}
							labelCol={{ style: { width: 100 } }}>
							<Input.Password
								maxLength={16}
								placeholder='请输入旧密码'
								style={{ width: '90%' }}
							/>
						</FormItem>
						{global.config.password_complexity == 1 && showPasswordTip && (
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
								{ required: true, message: ' ' },
								{
									validator:
										global.config && global.config.password_complexity == 1
											? checkConfirm
											: simpleConfirm,
								},
							]}
							labelCol={{ style: { width: 100 } }}>
							<Input.Password
								maxLength={16}
								placeholder='请输入新密码'
								onBlur={inputOnBlur}
								onFocus={inputOnFocus}
								style={{ width: '90%' }}
							/>
						</FormItem>
						<FormItem
							label='确认密码'
							name='confirmPwd'
							rules={[{ required: true, message: '请再次确认密码' }, { validator: checkPassword }]}
							labelCol={{ style: { width: 100 } }}>
							<Input.Password
								onBlur={handleConfirmBlur}
								placeholder='请再次确认密码'
								style={{ width: '90%' }}
								maxLength={16}
							/>
						</FormItem>
						<Button
							type='primary'
							onClick={handleSubmit}
							loading={loading}
							style={{
								margin: '0 auto',
								display: 'block',
							}}
							className='handleSubmit'>
							{loading ? '正在提交...' : '提交'}
						</Button>
					</Form>
				</Card>
			</div>
		</div>
	);
};

export default connect(({ global }: Record<string, any>) => ({ global }))(ChangePassword);
