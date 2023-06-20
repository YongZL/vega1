import InputUnit from '@/components/InputUnit';
import ScanInput from '@/components/ScanInput/ScanInput';
import { Button, Form, Input, Modal, Radio } from 'antd';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';

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

type PropsType = {
	visible: boolean;
	isSingle: boolean;
	setVisible: React.Dispatch<React.SetStateAction<boolean>>;
	submits: (params: Record<string, any>) => void;
	goodsInfo: Partial<ReceivingOrderController.DetailGoodsList>;
	isOther: boolean;
	checkDelivery: (params: ReceivingOrderController.ScanCodePassData) => Promise<string>;
	receivingOrderId: number;
};

const FormItem = Form.Item;
const SureReviewModal = ({
	visible,
	isSingle,
	setVisible,
	submits,
	goodsInfo,
	isOther,
	checkDelivery,
	receivingOrderId,
}: PropsType) => {
	const { fields } = useModel('fieldsMapping');
	const [form] = Form.useForm();
	const [auditType, setAuditType] = useState('Y');
	const [minNum, setMinNum] = useState(0);
	const [scanValue, setScanValue] = useState<string>('');
	const [msg, setMsg] = useState('');
	const handleCancel = () => {
		setVisible(false);
		setMsg('');
	};

	useEffect(() => {
		if (visible) {
			form.resetFields();
			setAuditType('Y');
			setMinNum(0);
		}
	}, [visible]);

	const onFinish = async (values: Record<string, any>) => {
		if (goodsInfo.barcodeControlled && auditType === 'Y') {
			const msg = await checkDelivery({
				code: values.udiCode,
				receivingOrderId,
				receivingOrderItemId: goodsInfo.shippingOrderItemId!,
				quantity: 1,
				passedQuantity: goodsInfo?.quantityInMin || 1,
			});
			setMsg(msg);
			if (!msg) {
				handleCancel();
			}
		} else {
			let params = {
				...goodsInfo,
				...values,
			};
			submits(params);
		}
	};

	const handleOk = () => form.submit();

	const auditTypeChange = (e: Record<string, any>) => setAuditType(e.target.value);

	const updateMinNum = (val: string | number) => {
		if (!val) {
			setMinNum(0);
			return;
		}
		const num = Number(val) * (goodsInfo.unitNum || 0);
		setMinNum(num);
	};
	const scanChange = (value: string) => {
		setScanValue(value);
		form.setFieldsValue({ udiCode: value });
	};
	return (
		<Modal
			visible={visible}
			title='验收结果'
			onCancel={handleCancel}
			maskClosable={false}
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
					auditType: 'Y',
				}}>
				<FormItem
					label='验收结果'
					rules={[
						{
							required: true,
							message: '请选择审核结果',
						},
					]}
					name='auditType'>
					<Radio.Group onChange={(value) => auditTypeChange(value)}>
						<Radio value='Y'>通过</Radio>
						<Radio value='N'>不通过</Radio>
						{isSingle && !isOther && !goodsInfo.barcodeControlled && (
							<Radio value='P'>部分通过</Radio>
						)}
					</Radio.Group>
				</FormItem>
				{auditType === 'Y' && goodsInfo.barcodeControlled && (
					<>
						<div
							style={{
								color: msg ? CONFIG_LESS['@c_starus_warning'] : CONFIG_LESS['@c_starus_await'],
								fontWeight: 600,
								marginBottom: 8,
							}}>
							{msg ||
								(goodsInfo.diCode ? '' : `该${fields.goods}尚未绑定DI，请扫描UDI验收并绑定DI`)}
						</div>
						<FormItem
							rules={[
								{
									required: true,
									message: `请扫描${fields.goods}UDI`,
								},
							]}
							name='udiCode'>
							<ScanInput
								placeholder={`请扫描${fields.goods}UDI`}
								style={{ width: '100%' }}
								value={scanValue}
								onChange={scanChange}
							/>
						</FormItem>
						<span style={{ marginTop: 18 }}>配送单UDI：{goodsInfo.udiCode}</span>
					</>
				)}
				{auditType === 'P' && (
					<FormItem
						label='通过数量'
						rules={[
							{
								required: true,
								message: '请输入通过数量',
							},
						]}
						name='passedQuantity'>
						<InputUnit
							unit={goodsInfo.minUnitName || ''}
							min={1}
							max={goodsInfo.quantityInMin || 0}
							style={{ width: '100px' }}
							onChange={(val: string | number) => updateMinNum(val)}
						/>
					</FormItem>
				)}
				{(auditType === 'N' || auditType === 'P') && (
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

export default SureReviewModal;
