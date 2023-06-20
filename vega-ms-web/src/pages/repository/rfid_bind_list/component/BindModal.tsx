import ScanInput from '@/components/ScanInput/ScanInput';
import { bindingRfid } from '@/services/rfidStock';
import { accessNameMap, transformSBCtoDBC } from '@/utils';
import { Button, Form, Input, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';

type PropsType = {
	visible: boolean;
	handleCancel: () => void;
	handleOk: () => void;
};
const BindModal = (props: PropsType) => {
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();
	const { visible } = props;
	const accessName = accessNameMap(); // 权限名称

	const formItemLayout = {
		labelCol: {
			xs: { span: 24 },
			sm: { span: 6 },
		},
		wrapperCol: {
			xs: { span: 24 },
			sm: { span: 12 },
		},
	};

	// 键盘事件
	const eventKeypress = (event: any) => {
		// 光标移至下一个
		if (event.keyCode === 13) {
			const formEPC = event.target.form;
			const index = formEPC ? Array.prototype.indexOf.call(formEPC, event.target) : null;
			if (index === null) {
				return;
			}
			if (formEPC.elements[index + 1] && formEPC.elements[index + 1].localName === 'input') {
				formEPC.elements[index + 1].focus();
			}
			if (!formEPC.elements[index + 1]) {
				formEPC.elements[index].blur();
				handleSubmit(event);
			}
			event.preventDefault();
		}
	};

	useEffect(() => {
		// 监听事件与移除
		window.addEventListener('keypress', eventKeypress, false);
		return () => {
			window.removeEventListener('keypress', eventKeypress, false);
		};
	}, []);

	const unbindRfidList = async (values: RfidStockController.BindingRfidData) => {
		try {
			const res = await bindingRfid({ ...values });
			if (res && res.code === 0) {
				props.handleOk();
			}
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		form.resetFields();
		props.handleCancel();
	};

	const handleSubmit = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
		e.preventDefault();
		form.validateFields().then((values) => {
			setLoading(true);
			console.log(values);
			unbindRfidList(transformSBCtoDBC(values));
		});
	};

	return (
		<div id='modalSubmit'>
			<Modal
				title={accessName['rfid_bind']}
				visible={visible}
				onOk={handleSubmit}
				onCancel={handleCancel}
				maskClosable={false}
				destroyOnClose={true}
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
						确定
					</Button>,
				]}>
				<Form
					form={form}
					{...formItemLayout}
					onFinish={handleSubmit}>
					<Form.Item
						label='RFID'
						name='epc'
						rules={[{ required: true, message: '请输入RFID' }]}>
						<Input
							placeholder='请输入'
							autoFocus
							maxLength={30}
						/>
					</Form.Item>
					<Form.Item
						label={`${fields.goods}条码/UDI`}
						name='operatorBarcode'
						rules={[{ required: true, message: `请输入或者扫描${fields.goods}条码/UDI` }]}>
						<ScanInput placeholder='点击此处扫码' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default BindModal;
