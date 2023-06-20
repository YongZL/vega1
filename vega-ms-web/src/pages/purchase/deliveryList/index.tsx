import Print from '@/components/print';
import Target from '@/components/print/delivery_order';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { timeType } from '@/constants';
import {
	shippingOrderStatus,
	shippingOrderStatus2,
	shippingOrderStatusTextMap,
	shippingOrderStatusValueEnum,
} from '@/constants/dictionary';
import { useDistributorList } from '@/hooks/useDistributorList';
import {
	printShippingOrder,
	printShippingOrderUrl,
	queryDeliveryList,
} from '@/services/shippingOrder';
import { notification } from '@/utils/ui';
import { Badge, Divider, Form, Popconfirm, Space } from 'antd';
import moment from 'moment';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { connect, history, useAccess, useModel } from 'umi';
import DetailModal from './components/DetailModal';
import EditShippingOrder from './components/EditShippingModal';
import TaggingShippingOrder from './components/TaggingShippingModal';

const PrintTarget = Print(Target);
const Delivery: FC<ShippingOrderController.DeliveryProps> = ({
	loading,
	delivery,
	dispatch,
	global,
	...props
}: Record<string, any>) => {
	const { pageType } = props;
	const [form] = Form.useForm();
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const distributorOption = useDistributorList();
	const tableRef = useRef<ProTableAction>();
	const [rebuildLoading, setRebuildLoading] = useState<boolean>(false);
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [shipModalVisible, setShipModalVisible] = useState<boolean>(false);
	const [tagModalVisible, setTagModalVisible] = useState<boolean>(false);
	const [jumpSearch, setJumpSearch] = useState<boolean>(false);
	const [singleDeliveryInfo, setSingleDeliveryInfo] = useState({});
	const [handleType, setHandleType] = useState<string>('view');
	const isStates = (pageType && pageType === 'handle') || props.isstates;

	// 拆分全局搜索参数
	const handleOrderCodeChange = (code: string) => {
		if (!code) return;
		if (code.indexOf('#') > -1) {
			const arr = code.split('#');
			code = arr[0];
			const status = arr[1];
			form.setFieldsValue({
				code,
				status: [status],
			});
		}
		fetchDeliveryList();
		setJumpSearch(true);
	};

	// 获取全局搜索参数
	const getCode = () => {
		const hash = window.location.search;
		let code = undefined;
		if (hash.indexOf('search_key') > -1) {
			code = global.keywords;
		}
		if (hash.indexOf('search_link') > -1) {
			code = global.linkKeys;
		}
		return code;
	};

	useEffect(() => {
		// 设置主页跳转状态
		delivery.list = [];
		let code = getCode();
		jumpSearch ? fetchDeliveryList() : handleOrderCodeChange(code);
		handleMsgPush();

		let state = history?.location.state as { status: string; code: string };
		if (state?.status || state?.code) {
			form.setFieldsValue({ statusList: state?.status, code: state?.code });
			setTimeout(() => form.submit(), 200);
		}
	}, []);

	const handleMsgPush = async () => {
		// 配送单消息推送
		const { params } = props.match;
		if (params.id) {
			const { id } = params;
			const res = await printShippingOrder({ shippingOrderId: id });
			const { summary } = res.data;
			// 验收单，配货单，配送单，盘货单 一定是只读的
			orderDetail(summary, 'view');
		}
	};

	const fetchDeliveryList = () => tableRef.current?.reload();

	const orderDetail = async (record: Record<string, any>, type: string) => {
		if (type === 'view') {
			setModalVisible(true);
			setSingleDeliveryInfo(record);
			setHandleType(type);
			dispatch({
				type: 'delivery/queryDeliveryDetail',
				payload: {
					shippingOrderId: record.id,
				},
			});
		} else if (type === 'edit') {
			setShipModalVisible(true);
			setSingleDeliveryInfo(record);
			const promise1 = dispatch({
				type: 'delivery/queryShippingData',
				payload: {
					purchaseOrderId: record.purchaseOrderId,
				},
			});
			const promise2 = dispatch({
				type: 'delivery/queryShippingGroup',
				payload: {
					shippingOrderId: record.id,
				},
			});
			await Promise.all([promise1, promise2]);
			setHandleType(type);
		} else {
			setTagModalVisible(true);
			setSingleDeliveryInfo(record);
			setHandleType(type);
			dispatch({
				type: 'delivery/queryDeliveryDetail',
				payload: {
					shippingOrderId: record.id,
				},
			});
		}
	};

	const regCode = async (id: number) => {
		setRebuildLoading(true);
		dispatch({
			type: 'delivery/setRegenerateCode',
			payload: id,
			callback: (res: Record<string, any>) => {
				setRebuildLoading(false);
				if (res && res.code === 0) {
					notification.success('操作成功');
					tableRef.current?.reload();
				}
			},
		});
	};

	const searchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'statusList',
			valueType: 'tagSelect',
			fieldProps: {
				options: isStates ? shippingOrderStatus : shippingOrderStatus2,
			},
		},
		{
			title: '制作时间',
			dataIndex: 'timeCreated',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType,
			},
		},
		{
			title: '送达时间',
			dataIndex: 'timeArrived',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType,
			},
		},
		{
			title: '配送单号',
			dataIndex: 'code',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorId',
			valueType: 'select',
			fieldProps: {
				placeholder: '请选择',
				showSearch: true,
				options: distributorOption,
				filterOption: (input: any, option: any) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '订单编号',
			dataIndex: 'purchaseOrderCode',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'goodsCode',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '规格/型号',
			dataIndex: 'commonSearch.specificationAndModel',
		},
	];

	const columns: ProColumns<ShippingOrderController.WithPageListRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 'XXS',
			align: 'center',
			renderText: (text: number, record: any, index: number) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'combinedStatus',
			key: 'combinedStatus',
			width: 'XS',
			renderText: (text: string) => (
				<span>
					<Badge color={(shippingOrderStatusValueEnum[text] || {}).color} />
					{shippingOrderStatusTextMap[text]}
				</span>
			),
		},
		{
			title: '配送单号',
			dataIndex: 'shippingOrderCode',
			key: 'shippingOrderCode',
			width: 'XXXL',
			copyable: true,
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorName',
			key: 'distributorName',
			width: 'XXL',
			ellipsis: true,
		},
		{
			title: '库房',
			dataIndex: 'storageAreaName',
			key: 'storageAreaName',
			width: 'M',
			ellipsis: true,
		},
		{
			title: '预计配送日期',
			dataIndex: 'expectedDeliveryDate',
			key: 'osd.expect_delivery_date',
			width: 'S',
			sorter: true,
			ellipsis: true,
			renderText: (text: number) => (text ? moment(Number(text)).format('YYYY/MM/DD') : '-'),
		},
		{
			title: '制作时间',
			dataIndex: 'timeCreated',
			key: 'osd.time_created',
			width: 'L',
			sorter: true,
			ellipsis: true,
			renderText: (text: number) =>
				text ? moment(Number(text)).format('YYYY/MM/DD HH:mm:ss') : '-',
		},
		{
			title: '送达时间',
			dataIndex: 'actualDeliveryDate',
			width: 'L',
			key: 'osd.actual_delivery_date',
			sorter: true,
			renderText: (text: number) =>
				text ? moment(Number(text)).format('YYYY/MM/DD HH:mm:ss') : '-',
		},
		{
			title: '订单编号',
			dataIndex: 'purchaseOrderCode',
			key: 'purchaseOrderCode',
			width: 'XXXL',
			copyable: true,
		},
		{
			title: '操作',
			dataIndex: 'operation',
			key: 'operation',
			width: isStates ? 260 : 'L',
			fixed: 'right',
			render: (text, record) => {
				return (
					<div
						className='operation'
						style={{ display: 'flex' }}>
						<Space
							size={0}
							split={<Divider type='vertical' />}
							wrap={true}>
							{/* 配送单 */}
							{((isStates && access['handled_shipping_order_view']) ||
								(!isStates && access['query_shipping_order_view'])) && (
								<span
									className='handleLink'
									onClick={() => orderDetail(record, 'view')}>
									查看
								</span>
							)}
							{/* 配送单编辑 */}
							{access['handled_edit_shipping_order'] && record.status === 'delivering' && isStates && (
								<span
									className='handleLink'
									onClick={() => orderDetail(record, 'edit')}>
									编辑
								</span>
							)}
							{/* 配送单重新生成赋码 */}
							{access['handled_add_shipping_order'] &&
								['delivering', 'arrived'].includes(record.combinedStatus) &&
								isStates && (
									<Popconfirm
										placement='left'
										title='确认重新生成？'
										okButtonProps={{ loading: rebuildLoading }}
										disabled={rebuildLoading}
										onConfirm={() => regCode(record.id)}>
										<span className='handleLink'>重新生成</span>
									</Popconfirm>
								)}
							{/* 赋码权限 */}
							{/* {access['handled_shipping_order_coding'] &&
                record.status === 'delivering' &&
                isStates && (
                  <span className="handleLink" onClick={(e) => orderDetail(record, 'tagging')}>
                    赋码
                  </span>
                )} */}
							{/* 打印功能 */}
							{((isStates && access['handled_shipping_order_print']) ||
								(!isStates && access['query_shipping_order_print'])) && (
								<PrintTarget
									url={printShippingOrderUrl}
									params={{ shippingOrderId: record.id }}
								/>
							)}
						</Space>
					</div>
				);
			},
		},
	];

	return (
		<>
			<ProTable<ShippingOrderController.WithPageListRecord>
				columns={columns}
				tableInfoCode={isStates ? 'handled_shipping_order_list' : 'query_shipping_order_list'}
				loadConfig={{
					request: false,
				}}
				rowKey={(record) => String(record.id)}
				api={queryDeliveryList}
				params={{ pageType: isStates ? 'handle' : 'query' }}
				dateFormat={{
					timeCreated: {
						startKey: 'createdFrom',
						endKey: 'createdTo',
					},
					timeArrived: {
						startKey: 'arrivedFrom',
						endKey: 'arrivedTo',
					},
				}}
				searchKey={isStates ? 'purchase_order_handle' : 'purchase_order_query'}
				tableRef={tableRef}
				searchConfig={{
					form,
					columns: searchColumns,
				}}
			/>
			{/* 详情modal */}
			{modalVisible && (
				<DetailModal
					modalVisible={modalVisible}
					setModalVisible={setModalVisible}
					singleDeliveryInfo={singleDeliveryInfo}
					handleType={handleType}
				/>
			)}
			{/* 赋码modal */}
			{tagModalVisible && (
				<TaggingShippingOrder
					modalVisible={tagModalVisible}
					setModalVisible={setTagModalVisible}
					singleDeliveryInfo={singleDeliveryInfo}
				/>
			)}
			{/* 编辑modal */}
			{shipModalVisible && (
				<EditShippingOrder
					visible={shipModalVisible}
					setModalVisible={setShipModalVisible}
					singleDeliveryInfo={singleDeliveryInfo}
					getList={fetchDeliveryList}
					handleType={handleType}
					setHandleType={setHandleType}
				/>
			)}
		</>
	);
};

export default connect(
	({
		loading,
		delivery,
		global,
	}: {
		global: any;
		delivery: ShippingOrderController.DeliveryDataType;
		loading: { effects: { [key: string]: boolean } };
	}) => ({
		delivery,
		global,
		submitting: loading.effects['purchaseOrder/addpurchaseOrder'],
		loading: loading.effects['delivery/queryDeliveryList'],
	}),
)(Delivery);
