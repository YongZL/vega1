import { ProColumns } from '@ant-design/pro-table/lib/typing';

import ProTable from '@/components/ProTable';
import { accessNameMap, transformSBCtoDBC } from '@/utils';
import { notification } from '@/utils/ui';
import { Button, Col, DatePicker, Form, Input, Modal, Row } from 'antd';
import moment from 'moment';
import { useState } from 'react';
import { connect, useAccess, useModel } from 'umi';
import { formatStrConnect } from '@/utils/format';

const FormItem = Form.Item;
const SurgicalOrderModal = ({
	dispatch,
	purchaseOrder,
	loading,
	...props
}: PurchaseOrderNewController.OrderDetailsProps) => {
	const access = useAccess();
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const { singlePurchaseOrderInfo, visible, setModalVisible, getList } = props;
	const {
		surgicalInfo: { orderItems, request },
	} = purchaseOrder;
	const accessName = accessNameMap(); // 权限名称

	const shipModalSubmit = (e: Event) => {
		e.preventDefault();
		setSubmitLoading(true);
		form
			.validateFields()
			.then((values) => {
				values.expectedDeliveryDate = values.expectedDeliveryDate.valueOf();
				let params = values;
				params.orderId = singlePurchaseOrderInfo.id;
				dispatch({
					type: 'purchaseOrder/makeShippingOrder',
					payload: transformSBCtoDBC(params),
					callback: (res: Record<string, any>) => {
						if (res && res.code === 0) {
							notification.success('操作成功');
							setModalVisible(false);
							form.resetFields();
							getList();
						}
						setSubmitLoading(false);
					},
				});
			})
			.catch(() => setSubmitLoading(false));
	};

	const columnsShipModal: ProColumns<ShippingOrderController.ShippingGoods>[] = [
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 180,
			ellipsis: true,
		},
		{
			title: 'DI',
			dataIndex: 'diCode',
			key: 'diCode',
			width: 120,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '包装规格',
			dataIndex: 'unitNum',
			key: 'unitNum',
			width: 80,
			render: (text, record) => {
				return <span>{text + record.minGoodsUnitName + '/' + record.purchaseGoodsUnitName}</span>;
			},
		},
		{
			title: '配送数量',
			dataIndex: 'goodsRemainQuantityInMin+minGoodsUnitName',
			key: 'goodsRemainQuantityInMin+minGoodsUnitName',
			width: 80,
			render: (text, record) => {
				return <span>{record.goodsRemainQuantityInMin + record.minGoodsUnitName}</span>;
			},
		},
		{
			title: '产品注册证',
			dataIndex: 'registrationNum',
			key: 'registrationNum',
			width: 160,
			ellipsis: true,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
	];

	return (
		<Modal
			visible={visible}
			title={accessName['handled_add_shipping_order']}
			maskClosable={false}
			onCancel={() => setModalVisible(false)}
			onOk={(e: any) => shipModalSubmit(e)}
			destroyOnClose={true}
			className='ant-detail-modal shippingModal'
			footer={
				access['add_shipping_order']
					? [
							<Button
								key='submit'
								type='primary'
								onClick={(e: any) => shipModalSubmit(e)}
								className='modalSubmit'
								loading={submitLoading}>
								提交
							</Button>,
					  ]
					: null
			}>
			<Row>
				<Col span={6}>
					科室：<span>{request.departmentName}</span>
				</Col>
				<Col span={6}>
					仓库：<span>{request.warehouseName}</span>
				</Col>
				<Col span={6}>
					手术时间：
					<span>
						{request.surgicalDate ? moment(request.surgicalDate).format('YYYY/MM/DD HH:mm') : ''}
					</span>
				</Col>
				<Col span={6}>
					主治医生：<span>{request.doctorName}</span>
				</Col>
			</Row>
			<Form
				form={form}
				className='modelInfoInline detailsBorderAndMargin'>
				<Row style={{ marginTop: '16px' }}>
					<Col
						lg={6}
						md={8}
						xs={12}>
						<FormItem
							label='配送人员'
							name='deliveryUserName'
							// rules={[{ required: true, message: '请输入' }]}
						>
							<Input
								placeholder='请输入配送人员'
								style={{ width: '80%' }}
								maxLength={20}
							/>
						</FormItem>
					</Col>
					<Col
						lg={6}
						md={8}
						xs={12}>
						<FormItem
							label='联系电话'
							name='deliveryUserPhone'
							// rules={[{ required: true, message: '请输入' }]}
						>
							<Input
								placeholder='请输入配送人员联系电话'
								style={{ width: '80%' }}
								maxLength={15}
							/>
						</FormItem>
					</Col>
					<Col
						lg={6}
						md={8}
						xs={12}>
						<FormItem
							label='配送时间'
							name='expectedDeliveryDate'
							rules={[{ required: true, message: '请输入' }]}>
							<DatePicker
								format={['YYYY-MM-DD', 'YYYY/MM/DD']}
								style={{ width: '80%' }}
								disabledDate={(current) => current.valueOf() < Date.now() - 24 * 60 * 60 * 1000}
							/>
						</FormItem>
					</Col>
					<Col
						lg={6}
						md={8}
						xs={12}>
						<FormItem
							label='快递单号'
							name='expressNo'>
							<Input
								placeholder='请输入快递单号'
								style={{ width: '80%' }}
								maxLength={20}
							/>
						</FormItem>
					</Col>
				</Row>
			</Form>

			<ProTable
				dataSource={orderItems}
				columns={columnsShipModal}
				rowKey={(record) => record.goodsId + record.model + record.specification}
				pagination={false}
				scroll={{ y: 300 }}
				loading={loading}
			/>
		</Modal>
	);
};

export default connect(
	({
		purchaseOrder,
		loading,
	}: {
		purchaseOrder: PurchaseOrderNewController.OrderDataType;
		loading: { effects: { [key: string]: boolean } };
	}) => ({
		purchaseOrder,
		loading: loading.effects['purchaseOrder/getSurgicalInfo'],
	}),
)(SurgicalOrderModal);
