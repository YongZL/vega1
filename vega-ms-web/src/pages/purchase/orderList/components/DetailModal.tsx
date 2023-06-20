import { DescriptionsItemProps } from '@/components/Descriptions/typings';
import { ProColumns } from '@/components/ProTable/typings';

import Descriptions from '@/components/Descriptions';
import ProTable from '@/components/ProTable';
import { orderStatusTextMap } from '@/constants/dictionary';
import { accessNameMap } from '@/utils';
import {
	convertPriceWithDecimal,
	formatPackageQuantity,
	formatUnitNum,
	formatStrConnect,
} from '@/utils/format';
import { Badge, Button, Col, Form, Input, Modal, Radio, Row, Select, Statistic } from 'antd';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { connect, useModel } from 'umi';
import { dealPackNum } from '@/utils/dataUtil';

interface distributorItem {
	id: number;
	companyName: string;
}
const FormItem = Form.Item;
const OrderDetails = ({
	loading,
	purchaseOrder,
	dispatch,
	...props
}: PurchaseOrderNewController.OrderDetailsProps) => {
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const [auditType, setAuditType] = useState('recevied');
	const dataSource = useRef<Record<string, any>>([]);
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const accessName = accessNameMap(); // 权限名称

	const { modalType, visible, onCancel, getList, setModalVisible, singlePurchaseOrderInfo } = props;
	const { surgicalPackageRequestItemId, status, parentId } = singlePurchaseOrderInfo;
	const { purchaseOrderDetails } = purchaseOrder;

	useEffect(() => {
		dataSource.current = purchaseOrderDetails;
	}, [purchaseOrderDetails]);
	const distributorChange = (distributorItemId: number, id: number) => {
		const data = dataSource.current.map((item: PurchaseOrderNewController.DetailItem) => {
			return item.id === id ? { ...item, distributorItemId } : { ...item };
		});
		dataSource.current = data;
	};

	const distributorRender = (text: [distributorItem], id: number, index: number) => {
		const isSatisfy = text.length > 1; //isSatisfy 为false 就设置select 有默认值
		const defaultValue = isSatisfy ? undefined : text[0].id;
		if (!isSatisfy) {
			dataSource.current[index] = { ...dataSource.current[index], distributorItemId: defaultValue };
		}
		return (
			<FormItem
				rules={[
					{
						required: true,
						message: `请选择${fields.distributor}`,
					},
				]}
				name={'distributorName' + index + id + text}
				style={{ marginBottom: '0px' }}
				initialValue={defaultValue}>
				<Select
					placeholder={`请选择${fields.distributor}`}
					style={{ width: '100%' }}
					onChange={(value: number) => distributorChange(value, id)}
					allowClear={isSatisfy}>
					{text.map((item) => {
						const { id, companyName } = item;
						return (
							<Select.Option
								value={id}
								key={id}>
								{companyName}
							</Select.Option>
						);
					})}
				</Select>
			</FormItem>
		);
	};

	const getQuantity = (record: Record<string, any>) => {
		return record.subtotalQuantity || record.minGoodsUnitNum * record.goodsQuantity;
	};
	const columnsModal: ProColumns<PurchaseOrderNewController.DetailItem>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			renderText: (text: number, record, index: number) => index + 1,
		},
		{
			width: 'S',
			title: '是否加急',
			dataIndex: 'isUrgent',
			ellipsis: true,
			renderText: (text: boolean) => (
				<span>
					{text ? (
						<Badge
							color={CONFIG_LESS['@c_starus_warning']}
							status='warning'
							text='加急'
						/>
					) : (
						'-'
					)}
				</span>
			),
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 120,
		},
		{
			title: 'DI',
			dataIndex: 'diCode',
			key: 'diCode',
			width: 150,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 150,
			ellipsis: true,
		},
		{
			title: fields.distributor,
			key: 'distributorBeans',
			dataIndex: 'distributorBeans',
			width: 200,
			ellipsis: true,
			renderText: (text: [distributorItem], record, index: number) => {
				const { distributorBeans } = record;
				return (
					<>{distributorBeans && text.length ? distributorRender(text, record.id, index) : '-'}</>
				);
			},
		},
		{
			title: '通用名称',
			dataIndex: 'commonName',
			key: 'commonName',
			width: 130,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			renderText: (text: string, record: Record<string, any>) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '大/中包装',
			dataIndex: 'minGoodsUnitNum',
			key: 'minGoodsUnitNum',
			width: 100,
			renderText: (text: string, record) => {
				const { largeBoxNum } = record;
				return dealPackNum(largeBoxNum, text);
			},
		},
		{
			title: '大/中/散',
			dataIndex: 'goodsQuantity',
			key: 'goodsQuantity',
			width: 100,
			render: (text, record) => (
				<span>
					{getQuantity(record)
						? formatPackageQuantity({
								goods: {
									...record,
									quantity: getQuantity(record),
								},
								mediumKey: 'minGoodsUnitNum',
						  })
						: '0/0/0'}
				</span>
			),
		},
		{
			title: '小计数量',
			dataIndex: 'minGoodsUnitNum',
			key: 'minGoodsUnitNum',
			width: 120,
			renderText: (text: number, record) => getQuantity(record) + record.minGoodsUnitName,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 150,
			align: 'right',
			renderText: (text: number) => convertPriceWithDecimal(text),
		},
		{
			title: '小计(元)',
			dataIndex: 'rowPrice',
			key: 'rowPrice',
			width: 150,
			align: 'right',
			renderText: (text: number) => convertPriceWithDecimal(text),
		},
		{
			title: '未配送数量',
			hideInTable: !parentId,
			dataIndex: 'goodsRemainQuantityInMin',
			key: 'goodsRemainQuantityInMin',
			width: 120,
			renderText: (text: string, record) => {
				const { goodsQuantity, unit, minGoodsUnitName, goodsRemainQuantityInMin } = record;
				return goodsRemainQuantityInMin == null ? goodsQuantity + unit : text + minGoodsUnitName;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
	];

	const clearData = () => {
		dispatch({
			type: 'purchaseOrder/updatePurchaseOrderDetails',
			payload: { purchaseOrderDetails: [] },
		});
		dataSource.current = [];
	};

	const modalSubmit = () => {
		setSubmitLoading(true);
		let params: Record<string, any> = {};
		params.purchaseOrderId = singlePurchaseOrderInfo.id;
		params.items = {};
		form
			.validateFields()
			.then((values) => {
				params.reason = values['info.reason'];
				params.status = values['info.auditType'];
				dataSource.current.forEach((item: Record<string, any>) => {
					params.items[item.id] = item.distributorItemId;
				});
				dispatch({
					type: 'purchaseOrder/custodianAcceptOrder',
					payload: { ...params, type: true },
					callback: (response: { code: number }) => {
						if (response && response.code === 0) {
							setModalVisible(false);
							clearData();
							getList();
							form.resetFields();
						}
						setSubmitLoading(false);
					},
				});
			})
			.catch(() => setSubmitLoading(false));
	};

	// 获取总金额
	const getPrice = (data: Record<string, any>) => {
		const price = data.reduce(function (pre: number, cur: { rowPrice: number }) {
			return pre + (cur.rowPrice || 0);
		}, 0);
		return price ? '￥' + convertPriceWithDecimal(price) : '-';
	};

	const options: DescriptionsItemProps[] = [
		{
			label: '订单编号',
			dataIndex: 'orderCode',
		},
		{
			label: '订单类型',
			dataIndex: 'surgicalPackageRequestItemId',
			render: (text: number) => (surgicalPackageRequestItemId ? '手术订单' : '普通订单'),
		},
		{
			label: '期望到货时间',
			dataIndex: 'expectedTime',
			render: (text) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
		},
		{
			label: '库房',
			dataIndex: 'storageAreaName',
		},
		{
			label: '库房地址',
			dataIndex: 'storageAreaAddress',
		},
		{
			show: status === 'refused',
			label: '拒绝原因',
			dataIndex: 'reason',
		},
	];

	const radioStyle = { display: 'block', marginBottom: '10px' };

	return (
		<Modal
			visible={visible}
			maskClosable={false}
			destroyOnClose={true}
			className='ant-detail-modal'
			title={`${
				modalType === 'edit'
					? accessName['handled_distributor_accept_order']
					: accessName['handled_purchase_order_view']
			}`}
			onCancel={(e) => {
				onCancel(e);
				setAuditType('received');
				form.resetFields();
				clearData();
			}}
			onOk={modalSubmit}
			footer={
				modalType === 'edit' && purchaseOrderDetails && purchaseOrderDetails.length
					? [
							<Button
								key='submit'
								type='primary'
								onClick={modalSubmit}
								className='modalSubmit'
								loading={submitLoading}>
								提交
							</Button>,
					  ]
					: null
			}>
			<Row className='detailsBorderAndMargin four'>
				<Col className='left'>
					<Descriptions
						options={options}
						data={singlePurchaseOrderInfo || {}}
						optionEmptyText='-'
						defaultColumn={3}
						minColumn={2}
					/>
				</Col>
				<Col className='right'>
					<Statistic
						title='总金额'
						value={getPrice(purchaseOrderDetails)}
					/>
					<Statistic
						title='订单状态'
						value={orderStatusTextMap[status] || ''}
					/>
				</Col>
			</Row>

			<Form
				form={form}
				initialValues={{ 'info.auditType': 'received' }}>
				<ProTable
					columns={columnsModal}
					rowKey='id'
					dataSource={purchaseOrderDetails}
					loading={loading}
					scroll={{ y: 300 }}
					options={{ density: false, fullScreen: false, setting: false }}
					size='small'
				/>
				<div style={{ marginTop: '20px' }}>
					{modalType === 'edit' && (
						<span>
							<h3 className='mt2 mb1'>接收结果</h3>
							<FormItem
								rules={[
									{
										required: true,
										message: '请选择接收结果',
									},
								]}
								style={{ marginBottom: '0px' }}
								name='info.auditType'>
								<Radio.Group onChange={(e) => setAuditType(e.target.value)}>
									<Radio
										value='received'
										style={radioStyle}>
										接收
									</Radio>
									<Radio
										value='refused'
										style={radioStyle}>
										拒绝
									</Radio>
								</Radio.Group>
							</FormItem>
							{auditType === 'refused' && (
								<FormItem
									style={{ marginLeft: '22px' }}
									rules={[
										{
											required: true,
											message: '请输入不通过的原因',
										},
									]}
									name='info.reason'>
									<Input.TextArea
										rows={2}
										maxLength={50}
										style={{ maxWidth: '500px' }}
										placeholder='请输入不通过的原因'
									/>
								</FormItem>
							)}
						</span>
					)}
				</div>
			</Form>
		</Modal>
	);
};

export default connect(
	({
		loading,
		purchaseOrder,
	}: {
		purchaseOrder: PurchaseOrderNewController.OrderDataType;
		loading: { effects: { [key: string]: boolean } };
	}) => ({
		purchaseOrder,
		loading: loading.effects['purchaseOrder/queryOrderDetails'],
	}),
)(OrderDetails);
