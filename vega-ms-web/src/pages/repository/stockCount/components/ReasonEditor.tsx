import { FC, FunctionComponentElement, cloneElement, useState, useEffect } from 'react';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, FormListFieldData, FormListOperation, Input, Modal, Form, message } from 'antd';
import {
	getStockTakingOrderReasonList,
	deleteStockTakingOrderReason,
	addStockTakingOrderReason,
} from '@/services/stockTakingOrder';
import { notification } from '@/utils/ui';

/**
 * @description 盘亏原因编辑
 */
const ReasonEditor: FC<{ children: FunctionComponentElement<any> }> = (props) => {
	// 初始化数据
	const formInitialValues = {
		reasons: [
			{
				reason: '',
			},
		],
	};

	const [form] = Form.useForm();

	const [visible, setVisible] = useState(false);

	const modalCancel = (bool: boolean) => {
		form.resetFields();
		setVisible(bool);
	};

	// 删除
	const delOption = async (id: number) => {
		const res = await deleteStockTakingOrderReason(id);
		if (res.code === 0) {
			return true;
		} else {
			return false;
		}
	};

	// 列表
	const getList = async () => {
		const res = await getStockTakingOrderReasonList();
		if (res.code === 0) {
			form.setFieldsValue({
				reasons: res.data,
			});
		}
	};

	// 新增
	const confirmOption = () => {
		form.validateFields().then(async (data: { reasons: any[] }) => {
			const reasons = data.reasons.filter((item) => !!item && item.reason);
			if (!reasons.length) {
				notification.error('至少有一个盈亏原因');
				return;
			}
			const params = reasons.map((item) => {
				return {
					id: item.id || null,
					reason: item.reason,
				};
			});
			const res = await addStockTakingOrderReason(params);
			if (res.code === 0) {
				notification.success('操作成功！');
				modalCancel(false);
			}
		});
	};

	useEffect(() => {
		if (visible) {
			getList();
		}
	}, [visible]);

	return (
		<Form
			form={form}
			layout='horizontal'
			initialValues={formInitialValues}
			colon={false}>
			{cloneElement(props.children, {
				onClick: () => {
					setVisible(true);
				},
			})}
			<Modal
				visible={visible}
				width={500}
				centered
				maskClosable={false}
				title='盈亏原因编辑'
				onCancel={() => modalCancel(false)}
				footer={
					<>
						<Button onClick={() => modalCancel(false)}>取消</Button>
						<Button
							type='primary'
							onClick={confirmOption}>
							确认操作
						</Button>
					</>
				}>
				<div style={{ maxHeight: 500, overflow: 'auto' }}>
					<Form.List name='reasons'>
						{(
							fields: FormListFieldData[],
							{ add, remove }: FormListOperation,
							{ errors }: { errors: React.ReactNode[] },
						) => (
							<>
								{fields.map((field, index) => (
									<Form.Item
										key={field.key}
										label={
											index === 0 ? (
												<PlusCircleOutlined
													style={{
														fontSize: CONFIG_LESS['@font-size-28'],
													}}
													onClick={() => add()}
												/>
											) : (
												<MinusCircleOutlined
													style={{
														fontSize: CONFIG_LESS['@font-size-28'],
														color: CONFIG_LESS['@c_hint'],
													}}
													onClick={async () => {
														console.log('form.getFieldsValue()', form.getFieldsValue());
														const reasons = form.getFieldsValue().reasons;
														if (reasons[index] && reasons[index].id) {
															if (await delOption(reasons[index].id)) {
																remove(index);
															}
														} else {
															remove(index);
														}
													}}
												/>
											)
										}>
										<Form.Item
											{...field}
											name={[field.name, 'reason']}
											noStyle>
											<Input placeholder='请输入' />
										</Form.Item>
									</Form.Item>
								))}
							</>
						)}
					</Form.List>
				</div>
			</Modal>
		</Form>
	);
};

export default ReasonEditor;
