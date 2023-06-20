import Breadcrumb from '@/components/Breadcrumb';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { timeType2 } from '@/constants';
import { approvaStatus, warehousingApply } from '@/constants/dictionary';
import { getDetail, remove, withdraw } from '@/services/goodsRequest';
import { getByUserWh } from '@/services/warehouse';
import { getApplyList } from '@/services/warehouseRequest';
import { accessNameMap, getUrlParam } from '@/utils';
import { notification } from '@/utils/ui';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Form } from 'antd';
import moment from 'moment';
import React, { RefObject, useEffect, useRef, useState } from 'react';
import { connect, history, useAccess, useModel } from 'umi';
import Allocation from './components/Allocation';
import Apply from './components/Apply';

type PropsItem = {
	global: Record<string, any>;
	match: {
		params: {
			id: number;
			readOnly: string;
			messageType: string;
		};
	};
};
type WarehouseRequestRecord = WarehouseRequestController.WarehouseRequestRecord;

const TableList: React.FC<PropsItem> = ({ global, ...props }) => {
	const applyRef = useRef<{ click: () => void }>();
	const access = useAccess();
	const [form] = Form.useForm();
	const [searchForm] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const [applyData, setApplyData] = useState({
		title: '',
		modalType: '',
		apply_detail: {},
		modalVisible: () => {
			handleModalVisible(false);
		},
	});
	const { fields } = useModel('fieldsMapping');
	const [createModalVisible, handleModalVisible] = useState<boolean>(false);
	//  获取url中关键字,判断全局搜索跳转
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
	const accessNameMaplist: Record<string, any> = accessNameMap();
	const handleMsgPush = async () => {
		// 普通请领消息推送
		const { params } = props?.match;
		if (params.id) {
			const { id, readOnly, messageType } = params;
			const res = await getDetail({ goodsRequestId: id });
			if (res && res?.code === 0) {
				const detail = res.data;
				const { status } = detail as { status?: string };
				if (readOnly === 'true') {
					openModal({ id }, '入库申请详情', 'view');
				} else {
					switch (status) {
						case 'approval_pending':
							openModal({ id }, '入库申请审核', 'audit');
							break;
						case 'approval_review_pending':
							if (messageType === 'goods_request_commit') {
								// 从审核界面进入的不能进行复核
								openModal({ id }, '入库申请详情', 'view');
							} else {
								openModal({ id }, '入库申请复核', 'review');
							}
							break;
						default:
							openModal({ id }, '入库申请详情', 'view');
							break;
					}
				}
			}
		}
	};

	//  如果为全局搜索跳转,拆分参数
	const handleOrderCodeChange = (code: string) => {
		if (code) {
			if (code.indexOf('#') > -1) {
				const arr = code.split('#');
				code = arr[0];
				const status = arr[1];
				searchForm.setFieldsValue({
					statusList: status,
					code,
				});
			} else if (code.indexOf('?status') > -1) {
				const status = getUrlParam(code, 'status') as string;
				searchForm.setFieldsValue({
					statuses: status?.split(','),
				});
			} else {
				searchForm.setFieldsValue({
					code,
				});
			}
			setTimeout(() => searchForm.submit(), 200);
		}
	};

	useEffect(() => {
		let state = history?.location.state as { status: string; code: string };
		if (state?.status || state?.code) {
			searchForm.setFieldsValue({ statusList: state?.status, code: state?.code });
			setTimeout(() => searchForm.submit(), 200);
		}
	}, [history?.location.state]);

	useEffect(() => {
		if (window.location.hash) {
			const code = getCode();
			handleOrderCodeChange(code);
		}
	}, [window.location.hash]);
	useEffect(() => {
		handleMsgPush();
	}, []);
	const onAdd = (record: WarehouseRequestRecord) => {
		history.push(
			`warehousing_apply/edit/${record.id}/${record.targetWarehouseId}/${record.sourceWarehouseId}`,
		);
	};

	const searchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'statusList',
			valueType: 'tagSelect',
			fieldProps: {
				options: warehousingApply,
			},
		},
		{
			title: '申请时间',
			dataIndex: 'companyName',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType2,
			},
		},
		{
			title: '申请人员',
			dataIndex: 'createdName',
		},
		{
			title: '申请单号',
			dataIndex: 'code',
		},
		{
			title: '供货仓库',
			dataIndex: 'sourceWarehouseId',
			valueType: 'apiSelect',
			fieldProps: {
				api: getByUserWh,
				fieldConfig: {
					label: 'name',
					value: 'id',
				},
				params: {
					excludeCentralWarehouse: false,
					requestAddCentralWarehouse: true,
				},
				filterOption: (input, option: { label: string }) => {
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
				fieldConfig: {
					label: 'name',
					value: 'id',
				},
				params: {
					excludeCentralWarehouse: true,
					requestAddCentralWarehouse: true,
				},
				filterOption: (input, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
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

	//  打开 查看/审核/复核 弹窗
	const openModal = (record: Record<string, any>, title: string, type: string) => {
		handleModalVisible(true);
		setApplyData({
			...applyData,
			title,
			modalType: type,
			apply_detail: record,
		});
		applyRef.current?.click();
	};

	// 删除
	const removeRequest = async (id: number) => {
		const res = await remove({ goodsRequestId: id });
		if (res && res.code === 0) {
			notification.success('操作成功');
			tableRef.current?.reload();
		}
	};

	// 撤回
	const rejectRequest = async (goodsRequestId: number) => {
		const res = await withdraw({ goodsRequestId });
		if (res && res.code === 0) {
			notification.success('操作成功');
			tableRef.current?.reload();
		}
	};

	const columns: ProColumns<WarehouseRequestRecord>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 'XXXS',
			align: 'center',
			render: (_text, _record, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'status',
			width: 'XXS',
			filters: false,
			valueEnum: approvaStatus,
		},
		{
			title: '申请时间',
			dataIndex: 'timeCreated',
			key: 'timeCreated',
			width: 'XS',
			ellipsis: true,
			render: (_text, record) => {
				return (
					<span>
						{record.timeCreated ? moment(record.timeCreated).format('YYYY/MM/DD HH:mm:ss') : ''}
					</span>
				);
			},
		},
		{
			title: '申请单号',
			dataIndex: 'code',
			key: 'code',
			width: 'S',
		},
		{
			title: '申请人员',
			dataIndex: 'createdName',
			key: 'createdName',
			width: 'XXS',
		},
		{
			title: '供货仓库',
			dataIndex: 'sourceWarehouseName',
			key: 'sourceWarehouseName',
			width: 'S',
		},
		{
			title: '到货仓库',
			dataIndex: 'targetWarehouseName',
			key: 'targetWarehouseName',
			width: 'S',
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			fixed: 'right',
			width: 'XS',
			render: (_, record) => {
				const { type, status, id, containedDepartment } = record;
				return type === 'goodsRequest' ? (
					<div className='operation'>
						{access.warehouse_request_view ? (
							<Apply
								{...{
									title: accessNameMaplist.warehouse_request_view,
									modalType: 'view',
									apply_detail: record,
								}}
								trigger={<a type='primary'>查看</a>}
							/>
						) : null}
						{access.warehouse_request_edit && ['withdraw'].includes(status) && (
							<>
								<Divider type='vertical' />
								<span
									className='handleLink'
									onClick={() => {
										onAdd(record);
									}}>
									编辑
								</span>
							</>
						)}
						{access.warehouse_request_remove && ['withdraw'].includes(status) && (
							<>
								<Divider type='vertical' />
								<span
									className='handleLink'
									onClick={() => removeRequest(id)}>
									删除
								</span>
							</>
						)}
						{access.warehouse_request_withdraw && status === 'approval_pending' && (
							<>
								<Divider type='vertical' />
								<span
									className='handleLink'
									onClick={() => rejectRequest(id)}>
									撤回
								</span>
							</>
						)}
						{access.warehouse_request_approval && status === 'approval_pending' && (
							<>
								<Divider type='vertical' />
								<Apply
									{...{
										title: '入库申请审核',
										modalType: 'audit',
										apply_detail: record,
										getTableList: () => {
											tableRef.current?.reload();
										},
									}}
									trigger={<a type='primary'>审核</a>}
								/>
							</>
						)}
						{access.warehouse_request_approval_review && status === 'approval_review_pending' && (
							<>
								<Divider type='vertical' />
								<Apply
									{...{
										title: '入库申请复核',
										modalType: 'review',
										apply_detail: record,
										getTableList: () => {
											tableRef.current?.reload();
										},
									}}
									trigger={<a type='primary'>复核</a>}
								/>
							</>
						)}
					</div>
				) : (
					<div className='operation'>
						{access.warehouse_request_view && (
							<Allocation
								{...{
									title: '调拨单详情',
									modalType: 'detail',
									Allocation_detail: record,
								}}
								trigger={<a type='primary'>查看</a>}
							/>
						)}
						{/* containedDepartment 标识是否为接收科室的人 */}
						{status === 'approve_pending' &&
							access.warehouse_request_approval &&
							containedDepartment && (
								<>
									<Divider type='vertical' />
									<Allocation
										{...{
											title: '调拨单审核',
											modalType: 'approve',
											Allocation_detail: record,
											getTableList: () => {
												tableRef.current?.reload();
											},
										}}
										trigger={<a type='primary'>审核</a>}
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
			<Card>
				<ProTable<WarehouseRequestRecord>
					tableInfoCode='warehouse_request_apply_list'
					columns={columns}
					rowKey='id'
					loadConfig={{
						request: false,
					}}
					api={getApplyList}
					tableRef={tableRef}
					dateFormat={{
						companyName: {
							startKey: 'timeFrom',
							endKey: 'timeTo',
						},
					}}
					// tableInfoId="8"
					searchConfig={{
						form: searchForm,
						columns: searchColumns,
					}}
					searchKey={'warehousing_apply'}
					toolBarRender={() => {
						let timeCreated = searchForm.getFieldsValue().timeCreated;
						if (timeCreated && typeof timeCreated[0] !== 'string') {
							timeCreated = timeCreated.map((item: any) => item._d);
						}
						return [
							access.warehouse_request_add_apply && (
								<Button
									icon={<PlusOutlined style={{ marginLeft: -4 }} />}
									type='primary'
									onClick={() => {
										history.push({
											pathname: '/department/warehousing_apply/add',
											state: { params: {} },
										});
									}}
									className='iconButton'>
									发起申请
								</Button>
							),
						];
					}}
				/>
			</Card>
			{createModalVisible && (
				<Apply
					trigger={
						<a
							type='primary'
							ref={applyRef as RefObject<HTMLAnchorElement>}></a>
					}
					{...applyData}
				/>
			)}
		</div>
	);
};
export default connect(({ global }: Record<string, any>) => ({ global }))(TableList);
