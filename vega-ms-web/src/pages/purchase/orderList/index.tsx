import type { ProColumns, ProTableAction } from '@/components//ProTable/typings';
import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { timeType } from '@/constants';
import {
	orderQueryStatus,
	orderQueryStatusValueEnum,
	orderStatus,
	orderStatusValueEnum,
} from '@/constants/dictionary';
import { useDistributorList } from '@/hooks/useDistributorList';
import { getOrderList, orderExportUrl, queryDetailById } from '@/services/purchaseOrdernew';
import { getUrlParam } from '@/utils';
import { notification } from '@/utils/ui';
import { Divider, Form, Popconfirm, Space } from 'antd';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { connect, history, useAccess, useModel } from 'umi';
import DetailModal from './components/DetailModal';
import MakingShippingModal from './components/MakingShippingModal';
import SurgicalOrderModal from './components/SurgicalOrderModal';

const PurchaseOrder = ({
	global,
	match,
	dispatch,
	purchaseOrder,
	pageType,
	activeKey,
}: PurchaseOrderNewController.OrderProps) => {
	const [form] = Form.useForm();
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const distributorList = useDistributorList();
	const [status, setStatus] = useState<string[]>([]);
	const [orderCode, setOrderCode] = useState<string>('');
	const [modalType, setModalType] = useState<string>('');
	const [jumpSearch, setJumpSearch] = useState<boolean>(false);
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [shipModalVisible, setShipModalVisible] = useState<boolean>(false);
	const [finishedLoading, setFinishedLoading] = useState<boolean>(false);
	const [surgicalModalVisible, setSurgicalModalVisible] = useState<boolean>(false);
	const [currentRecord, setCurrentRecord] = useState<
		Partial<PurchaseOrderNewController.ListRecord>
	>({});
	const [isExportFile, setIsExportFile] = useState(false);
	const isHandlePage = pageType === 'handle' ? true : false;

	// 拆分全局搜索参数
	const handleOrderCodeChange = (code?: string) => {
		if (code) {
			if (code.indexOf('#') > -1) {
				const arr: string[] = code.split('#');
				const [orderCode, status] = arr;
				setStatus([status]);
				setOrderCode(orderCode);
			} else if (code.indexOf('?status') > -1) {
				let status: any = getUrlParam(code, 'status');
				if (status.indexOf('custodian') > -1) {
					status = status.replace('_custodian', '');
				}
				setStatus(status.split(','));
			} else {
				setOrderCode(orderCode);
			}
			fetchOrderList();
			setJumpSearch(true);
		}
	};

	// 获取全局搜索参数
	const getCode = () => {
		const hash = window.location.search;
		let code = undefined;
		if (hash.indexOf('search_key') > -1) code = global.keywords;
		if (hash.indexOf('search_link') > -1) code = global.linkKeys;
		if (hash.indexOf('status') > -1) code = hash;
		return code;
	};

	// 订单消息
	const handleMsgPush = async () => {
		const { params } = match;
		if (params.id) {
			const { id, readOnly } = params;
			const res = await queryDetailById({ id });
			if (res && res.code === 0) {
				const detail = res.data;
				const { status } = detail;
				if (status === 'receive_pending' && readOnly !== 'true') {
					getPurchaseOrderDetails(detail, 'edit');
				} else {
					getPurchaseOrderDetails(detail, 'detail');
				}
			}
		}
	};

	useEffect(() => {
		if (purchaseOrder) {
			purchaseOrder.purchaseOrderList = [];
			purchaseOrder.total = 0;
		}
		// 设置主页跳转状态
		const code = getCode();
		if (!jumpSearch) {
			handleOrderCodeChange(code);
		} else {
			tableRef.current?.reload();
		}
		handleMsgPush();
	}, []);
	useEffect(() => {
		const state = history?.location.state as { status: string; key: string; code: string };
		if (state?.status) {
			if (state?.key) {
				if (state.key === activeKey) {
					form.setFieldsValue({ statusList: state?.status, orderCode: state?.code });
					setTimeout(() => form.submit(), 200);
				}
			} else {
				form.setFieldsValue({ statusList: state?.status, orderCode: state?.code });
				setTimeout(() => form.submit(), 200);
			}
		}
	}, [history?.location.state]);
	useEffect(() => {
		if (window.location.hash) {
			const code = getCode();
			handleOrderCodeChange(code);
		}
	}, [window.location.hash]);

	// 查看订单详情，打开modal 获取订单详情
	const getPurchaseOrderDetails = (
		record: PurchaseOrderNewController.ListRecord,
		modalType: string,
		e?: Event,
	) => {
		if (e) e.stopPropagation();
		setModalVisible(true);
		setModalType(modalType);
		setCurrentRecord(record);
		dispatch({
			type: 'purchaseOrder/queryOrderDetails',
			payload: { orderId: record.id, type: true },
		});
	};

	const searchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'statusList',
			valueType: 'tagSelect',
			initialValue: status.length ? status : undefined,
			fieldProps: {
				options: isHandlePage ? orderStatus : orderQueryStatus,
			},
		},
		{
			title: '提交时间',
			dataIndex: 'createdTime',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType,
			},
		},
		{
			title: '订单编号',
			dataIndex: 'orderCode',
			initialValue: orderCode || undefined,
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorIds',
			valueType: 'select',
			fieldProps: {
				showSearch: true,
				options: distributorList,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
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

	const columns: ProColumns<PurchaseOrderNewController.ListRecord>[] = [
		{
			width: 'XXXS',
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			renderText: (text: number, record, index: number) => index + 1,
		},
		{
			width: 'XXXS',
			title: '状态',
			dataIndex: 'status',
			filters: false,
			valueEnum: isHandlePage ? orderStatusValueEnum : orderQueryStatusValueEnum,
		},
		{
			width: 'XS',
			title: '订单编号',
			dataIndex: 'orderCode',
			copyable: true,
			ellipsis: true,
		},
		{
			width: 'XS',
			title: fields.distributor,
			ellipsis: true,
			dataIndex: 'distributorName',
		},
		{
			width: 'XS',
			sorter: true,
			title: '提交时间',
			key: 'o.time_created',
			dataIndex: 'timeCreated',
			renderText: (text: number) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
		},
		{
			width: 'XS',
			title: '提交人员',
			dataIndex: 'createdName',
			ellipsis: true,
		},
		{
			width: 'XS',
			title: '库房',
			dataIndex: 'storageAreaName',
			ellipsis: true,
		},
		{
			width: 'L',
			title: '操作',
			fixed: 'right',
			dataIndex: 'operation',
			renderText: (text: string, record: PurchaseOrderNewController.ListRecord) => {
				console.log(global.config);

				const { status, made, remainFlag, surgicalPackageRequestItemId } = record;
				const add_surgical =
					status === 'received' && surgicalPackageRequestItemId && access['add_shipping_order'];
				return (
					<div
						className='operation'
						onClick={(e) => e.stopPropagation()}>
						<Space
							size={0}
							split={<Divider type='vertical' />}
							wrap={true}>
							{((isHandlePage && access['handled_purchase_order_view']) ||
								(!isHandlePage && access['query_purchase_order_view'])) && (
								<span
									className='handleLink'
									onClick={() => getPurchaseOrderDetails(record, 'detail')}>
									查看
								</span>
							)}
							{sessionStorage.getItem('hospital_id') === '103' && WEB_PLATFORM === 'MS'
								? !(
										global.config.is_online &&
										global.config.is_online === 'true' &&
										record.invoiceSync &&
										record.type === 'online_order'
								  ) &&
								  record.status === 'receive_pending' &&
								  record.parentId &&
								  access['handled_distributor_accept_order'] && (
										<span
											className='handleLink'
											onClick={() => getPurchaseOrderDetails(record, 'edit')}>
											接收
										</span>
								  )
								: isHandlePage &&
								  status === 'receive_pending' &&
								  access['handled_distributor_accept_order'] && (
										<span
											className='handleLink'
											onClick={() => getPurchaseOrderDetails(record, 'edit')}>
											接收
										</span>
								  )}
							{/* remainFlag 是否剩余可制作基础物资数量 */}
							{((access['handled_distributor_make'] &&
								!made &&
								isHandlePage &&
								remainFlag &&
								!surgicalPackageRequestItemId &&
								['received', 'delivering'].includes(status)) ||
								add_surgical) && (
								<span
									className='handleLink'
									onClick={() => getShippingData(record, 'edit')}>
									制作配送单
								</span>
							)}
							{isHandlePage &&
								access['handled_distributor_finish_order'] &&
								['received', 'delivering'].includes(status) && (
									<Popconfirm
										title='结束订单将不能再制作配送单，是否确认结束？'
										onConfirm={() => handleFinished(record.id)}
										disabled={finishedLoading}
										okButtonProps={{ loading: finishedLoading }}
										placement='left'>
										<span className='handleLink'>结束订单</span>
									</Popconfirm>
								)}
						</Space>
					</div>
				);
			},
		},
	];

	// 查询订单列表
	const fetchOrderList = async () => tableRef.current?.reload();

	// 获取搜索参数
	const getSearchParams: any = () => tableRef.current?.getParams();

	// 打开配送单详情，获取配送单信息
	const getShippingData = (
		record: PurchaseOrderNewController.ListRecord,
		modalType: string,
		e?: Event,
	) => {
		const { id } = record;
		if (e) e.stopPropagation();
		setModalType(modalType);
		setCurrentRecord(record);
		if (record.surgicalPackageRequestItemId) {
			setSurgicalModalVisible(true);
			dispatch({
				type: 'purchaseOrder/getSurgicalInfo',
				payload: { id },
			});
		} else {
			setShipModalVisible(true);
			dispatch({
				type: 'purchaseOrder/queryShippingData',
				payload: { purchaseOrderId: id },
			});
		}
	};

	const handleFinished = (id: number) => {
		setFinishedLoading(true);
		dispatch({
			type: 'purchaseOrder/finishOrder',
			payload: { orderId: id },
			callback: (res: { code: number }) => {
				if (res && res.code === 0) {
					notification.success('操作成功！');
					tableRef.current?.reload();
				}
				setFinishedLoading(false);
			},
		});
	};

	return (
		<>
			<ProTable<PurchaseOrderNewController.ListRecord>
				columns={columns}
				tableInfoCode={isHandlePage ? 'handled_purchase_order_list' : 'query_purchase_order_list'}
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				loadConfig={{
					request: false,
				}}
				dateFormat={{
					createdTime: {
						endKey: 'createdTo',
						startKey: 'createdFrom',
					},
				}}
				api={getOrderList}
				requestCompleted={(rows) => {
					setIsExportFile(rows.length > 0);
				}}
				rowKey={(record) => String(record.id)}
				params={{
					pageType: isHandlePage ? 'handle' : 'query',
				}}
				beforeSearch={(value: Record<string, any>) => {
					const { statusList } = value;
					const params = {
						...value,
						statusList: statusList ? statusList.toString() : undefined,
					};
					return params;
				}}
				tableRef={tableRef}
				searchKey={isHandlePage ? 'handled_purchase_order' : 'purchase_order'}
				toolBarRender={() => [
					((isHandlePage && access['handled_export_order']) ||
						(!isHandlePage && access['query_export_order'])) && (
						<ExportFile
							data={{
								filters: {
									parent: true,
									pageType: isHandlePage ? 'handle' : 'query',
									...getSearchParams(),
								},
								link: orderExportUrl,
								getForm: getSearchParams,
							}}
							disabled={!isExportFile}
						/>
					),
				]}
			/>
			{/* 详情modal */}
			{modalVisible && (
				<DetailModal
					modalType={modalType}
					visible={modalVisible}
					getList={fetchOrderList}
					setModalVisible={setModalVisible}
					onCancel={() => setModalVisible(false)}
					singlePurchaseOrderInfo={currentRecord}
				/>
			)}
			{/* 详情modal */}
			{shipModalVisible && (
				<MakingShippingModal
					actionType='add'
					visible={shipModalVisible}
					getList={fetchOrderList}
					setModalVisible={setShipModalVisible}
					singlePurchaseOrderInfo={currentRecord}
				/>
			)}
			{/* 详情modal */}
			{surgicalModalVisible && (
				<SurgicalOrderModal
					getList={fetchOrderList}
					visible={surgicalModalVisible}
					setModalVisible={setSurgicalModalVisible}
					singlePurchaseOrderInfo={currentRecord}
				/>
			)}
		</>
	);
};

export default connect(
	({
		loading,
		purchaseOrder,
		global,
	}: {
		global: any;
		purchaseOrder: PurchaseOrderNewController.OrderDataType;
		loading: { effects: { [key: string]: boolean } };
	}) => ({
		purchaseOrder,
		global,
		submitting: loading.effects['purchaseOrder/addpurchaseOrder'],
		loading: loading.effects['purchaseOrder/queryPurchaseOrderList'],
	}),
)(PurchaseOrder);
