import type { ProColumns, ProTableAction } from '@/components//ProTable/typings';
import Breadcrumb from '@/components/Breadcrumb';
import Print from '@/components/print';
import Target from '@/components/print/acceptance';
import ProTable from '@/components/ResizableTable';
import { ProFormColumns } from '@/components/SchemaForm';
import { timeType } from '@/constants';
import api from '@/constants/api';
import { ConnectState, GlobalModelState } from '@/models/connect';
import { queryRule } from '@/services/acceptance';
import { getByUserWh } from '@/services/warehouse';
import { getUrlParam } from '@/utils';
import { Badge, Card, Divider, Form } from 'antd';
import moment from 'moment';
import { FC, useEffect, useRef, useState } from 'react';
import { connect, history, useAccess, useModel } from 'umi';
import CheckModal from './cheack';
import DetailModal from './components/Detail';
import ReviewModal from './review';

const PrintTarget = Print(Target);

const approvaStatus = {
	pending: { text: '待验收', color: CONFIG_LESS['@c_starus_await'] },
	receiving: { text: '验收中', color: CONFIG_LESS['@c_starus_await'] },
	partial_pass: { text: '部分通过', color: CONFIG_LESS['@c_starus_underway'] },
	all_pass: { text: '验收通过', color: CONFIG_LESS['@c_starus_done'] },
	all_reject: { text: '验收不通过', color: CONFIG_LESS['@c_starus_warning'] },
	accept_pending: { text: '待验收', color: CONFIG_LESS['@c_starus_await'] },
	accepting: { text: '验收中', color: CONFIG_LESS['@c_starus_await'] },
};

const approvaStatus1 = [
	{ text: '部分通过', value: 'partial_pass', color: CONFIG_LESS['@c_starus_underway'] },
	{ text: '验收通过', value: 'all_pass', color: CONFIG_LESS['@c_starus_done'] },
	{ text: '验收不通过', value: 'all_reject', color: CONFIG_LESS['@c_starus_warning'] },
];

const PickingList: FC<{ global: GlobalModelState }> = ({ global }, props) => {
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const [createModalVisible, handleModalVisible] = useState<boolean>(false);
	const [reviewModalVisible, setReviewModalVisible] = useState<boolean>(false);
	const [goodsRequestId, setGoodsRequestId] = useState<number | undefined>(undefined);
	const [jumpSearch, setJumpSearch] = useState<boolean>(false);
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [handleType, setHandleType] = useState<string>('');
	const [orderId, setOrderId] = useState<number>();
	const [searchForm] = Form.useForm();
	const tableRef = useRef<ProTableAction>();

	// 打开查看弹窗
	const openModal = (id: number) => {
		handleModalVisible(true);
		setGoodsRequestId(id);
	};

	// 打开验收弹窗
	const openReviewModal = (id: number) => {
		setReviewModalVisible(true);
		setGoodsRequestId(id);
	};

	// 关闭弹窗
	const handleCancel = () => {
		handleModalVisible(false);
		setReviewModalVisible(false);
	};

	// 请求列表
	const getFormList = async () => {
		tableRef.current?.reload();
	};

	// 获取url中关键字,判断全局搜索跳转
	const getCode = () => {
		const hash = window.location.search;
		let code = undefined;
		if (hash.indexOf('search_key') > -1) {
			code = global.keywords;
		}
		if (hash.indexOf('search_link') > -1) {
			code = global.linkKeys;
		}
		if (hash.indexOf('status') > -1) {
			code = hash;
		}
		return code;
	};

	// 如果为全局搜索跳转,拆分参数
	const handleOrderCodeChange = (code: string) => {
		if (code) {
			if (code.indexOf('#') > -1) {
				let arr = code.split('#');
				code = arr[0];
				let status = arr[1];
				getFormList();
				searchForm.setFieldsValue({
					statusList: status,
					code,
				});
				setTimeout(() => searchForm.submit(), 200);
			} else if (code.indexOf('?status') > -1) {
				const status: any = getUrlParam(code, 'status');
				searchForm.setFieldsValue({
					status: status.split(','),
				});
				getFormList();
			} else {
				getFormList();
			}
			setJumpSearch(true);
		} else {
			getFormList();
		}
	};

	// 查询参数变化后更新列表
	useEffect(() => {
		// 设置主页跳转状态
		let code: any = getCode();
		if (!jumpSearch) {
			handleOrderCodeChange(code);
		} else {
			getFormList();
		}
	}, []);

	useEffect(() => {
		handleMsgPush();
		let state = history?.location.state as { status: string; code: string };
		if (state?.status || state?.code) {
			searchForm.setFieldsValue({ statusList: state?.status, code: state?.code });
			setTimeout(() => searchForm.submit(), 200);
		}
	}, []);

	useEffect(() => {
		if (window.location.hash) {
			const code: any = getCode();
			handleOrderCodeChange(code);
		}
	}, [window.location.hash]);

	// 消息
	const handleMsgPush = async () => {
		const { params } = props.match || {};
		if (params.id) {
			const { id, readOnly } = params;
			if (readOnly === 'true') {
				openModal(id);
			} else {
				switch (status) {
					case 'pending':
					case 'receiving':
						openReviewModal(id);
						break;
					default:
						openModal(id);
						break;
				}
			}
		}
	};

	const getTabeList = () => {
		getFormList();
	};

	const showDetail = (record: AcceptanceController.ListRecord, type: string) => {
		setModalVisible(true);
		setHandleType(type);
		setOrderId(record.id);
	};

	const searchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'statusList',
			valueType: 'tagSelect',
			fieldProps: {
				options: approvaStatus1,
			},
		},
		{
			title: '验收时间',
			dataIndex: 'timeCreated',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType,
			},
		},
		{
			title: '订单编号',
			dataIndex: 'code',
		},
		{
			title: '供货仓库',
			dataIndex: 'sourceWarehouseId',
			valueType: 'apiSelect',
			fieldProps: {
				api: getByUserWh,
				params: {
					excludeCentralWarehouse: false,
					requestAddCentralWarehouse: true,
				},
				fieldConfig: {
					label: 'name',
					value: 'id',
				},
				filterOption: (input: any, option: any) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '到货仓库',
			dataIndex: 'targetWarehouseId',
			valueType: 'apiSelect',
			fieldProps: {
				api: getByUserWh,
				params: {
					excludeCentralWarehouse: true,
					requestAddCentralWarehouse: true,
				},
				fieldConfig: {
					label: 'name',
					value: 'id',
				},
				filterOption: (input: any, option: any) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '验收人员',
			dataIndex: 'acceptedName',
		},
		{
			title: `${fields.goods}/套包编码`,
			dataIndex: 'goodsCode',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: `${fields.goods}/套包名称`,
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

	const columns: ProColumns<AcceptanceController.ListRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			render: (text, record, index) => <span>{index + 1}</span>,
			width: 'XXXS',
		},
		{
			title: '状态',
			dataIndex: 'status',
			width: 'XXS',
			renderText: (text: string) => (
				<>
					<Badge
						color={approvaStatus[text].color}
						text={approvaStatus[text].text}
					/>
				</>
			),
		},
		{
			title: '订单编号',
			dataIndex: 'orderNumber',
			width: 'XS',
			copyable: true,
		},
		{
			title: '供货仓库',
			dataIndex: 'sourceWarehouseName',
			width: 'S',
		},
		{
			title: '到货仓库',
			dataIndex: 'targetWarehouseName',
			key: 'targetWarehouseName',
			width: 'S',
		},
		{
			title: '验收人员',
			dataIndex: 'acceptedName',
			key: 'acceptedName',
			width: 'XXXS',
		},
		{
			title: '验收时间',
			dataIndex: 'timeAccepted',
			key: 'timeAccepted',
			width: 'XXS',
			sorter: true,
			renderText: (time, record) =>
				record.timeAccepted ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-',
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 'XXS',
			fixed: 'right',
			render: (id, record) => {
				return (
					<div
						className='operation'
						onClick={(e) => e.stopPropagation()}
						style={{ display: 'flex' }}>
						{access.acceptance_order_view ? (
							record.acceptType === 2 ? (
								<span
									className='handleLink'
									onClick={() => openModal(record.id)}>
									查看
								</span>
							) : (
								<a onClick={() => showDetail(record, 'detail')}>查看</a>
							)
						) : null}
						{access.acceptance_order_print && record.acceptType === 2 && (
							<>
								{access.acceptance_order_view && (
									<Divider
										type='vertical'
										className='mt_6'
									/>
								)}
								<PrintTarget
									url={api.acceptance.print}
									params={{ acceptanceOrderId: record.id }}
								/>
							</>
						)}
					</div>
				);
			},
		},
	];

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>

			<Card bordered={false}>
				<ProTable
					tableInfoCode='warehouse_queries_list'
					loadConfig={{
						request: false,
					}}
					columns={columns}
					rowKey={(record) => String(record.id)}
					api={queryRule}
					params={{ pageType: 'query' }}
					dateFormat={{
						//把时间字符串转换成时间戳，并改变参数名字
						timeCreated: {
							startKey: 'inspectorFrom',
							endKey: 'inspectorTo',
						},
					}}
					tableRef={tableRef}
					searchConfig={{
						columns: searchColumns,
						form: searchForm,
					}}
				/>
			</Card>
			{createModalVisible && (
				<CheckModal
					visible={createModalVisible}
					onCancel={handleCancel}
					detail={{ id: goodsRequestId }}
				/>
			)}

			{reviewModalVisible && (
				<ReviewModal
					visible={reviewModalVisible}
					onCancel={handleCancel}
					detail={{ id: goodsRequestId }}
					getTabeList={getTabeList}
				/>
			)}

			{modalVisible && (
				<DetailModal
					isOpen={modalVisible}
					setIsOpen={setModalVisible}
					handleType={handleType}
					orderId={orderId}
					getFormList={getFormList}
				/>
			)}
		</div>
	);
};

export default connect(({ global }: ConnectState) => ({ global }))(PickingList);
