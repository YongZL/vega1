import ExportFile from '@/components/ExportFile';
import { Tips } from '@/components/GetNotification';
import Print from '@/components/print';
import Target from '@/components/print/push';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { timeType } from '@/constants';
import {
	deliveryStatusDone,
	deliveryStatusPending,
	deliveryStatusValueEnum,
	receivingReportStatusValueEnum,
} from '@/constants/dictionary';
import type { ConnectState } from '@/models/connect';
import type { GlobalModelState } from '@/models/global';
import {
	editDeliveryOrderPrintStatus,
	exportDeliveryOrder,
	printDeliveryOrder,
	queryRule,
} from '@/services/deliveryOrder';
import { queryDepartmentList } from '@/services/department';
import { getUrlParam } from '@/utils';
import { Divider, Form, TablePaginationConfig } from 'antd';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { connect, history, useAccess, useModel } from 'umi';
import CheckModal from './components/Cheack';
import ReviewModal from './components/Review';

const PrintTarget = Print(Target);
const PickingList: React.FC<{ global: GlobalModelState; pageType: string; activeKey: string }> = ({
	global,
	...props
}) => {
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const { fields } = useModel('fieldsMapping');
	const [createModalVisible, handleModalVisible] = useState<boolean>(false);
	const [reviewModalVisible, setReviewModalVisible] = useState<boolean>(false);
	const [timeParams, setTimeParams] = useState({});
	const [goodsRequestId, setGoodsRequestId] = useState<DeliveryOrderController.QueryRuleRecord>({});
	const [jumpSearch, setJumpSearch] = useState(false);
	const access = useAccess();
	const [isExportFile, setIsExportFile] = useState(false);
	const { pageType, activeKey } = props;
	// 打开查看弹窗
	const openModal = (record: DeliveryOrderController.QueryRuleRecord) => {
		handleModalVisible(true);
		setGoodsRequestId(record);
	};
	const openReviewModal = (record: DeliveryOrderController.QueryRuleRecord) => {
		setReviewModalVisible(true);
		setGoodsRequestId(record);
	};
	// 关闭弹窗
	const handleCancel = () => {
		handleModalVisible(false);
		setReviewModalVisible(false);
	};
	const getTableList = () => {
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
	const handleOrderCodeChange = (code: string | undefined) => {
		if (code) {
			let status: string;
			if (code.indexOf('#') > -1) {
				let arr = code.split('#');
				code = arr[0];
				status = arr[1];
				form.setFieldsValue({
					status,
					code,
				});
			} else if (code.indexOf('status') > -1) {
				status = getUrlParam(code, 'status') || '';
				form.setFieldsValue({
					status: status.split(','),
				});
			} else {
				form.setFieldsValue({
					code,
				});
			}
		}
		setTimeout(() => form.submit(), 200);
	};
	useEffect(() => {
		const state = history?.location.state as { status: string; key: string; code: string };
		if (state?.status) {
			if (state?.key) {
				if (state.key === activeKey) {
					form.setFieldsValue({ status: state?.status, code: state?.code });
					setTimeout(() => form.submit(), 200);
				}
			} else {
				form.setFieldsValue({ status: state?.status, code: state?.code });
				setTimeout(() => form.submit(), 200);
			}
		}
	}, [history?.location.state]);

	// 查询参数变化后更新列表
	useEffect(() => {
		// 设置主页跳转状态
		const code = getCode();
		const state = history?.location.state as { key: string };
		if (state && state.key === activeKey && code && !jumpSearch) {
			handleOrderCodeChange(code);
			setJumpSearch(true);
		}
	}, [timeParams]);

	useEffect(() => {
		const state = history?.location.state as { key: string };
		if (state && state.key === activeKey && window.location.hash) {
			const code = getCode();
			handleOrderCodeChange(code);
		}
	}, [window.location.hash]);

	// 排序
	const handleChangeTable = (
		_pagination: TablePaginationConfig,
		_filters: Record<string, FilterValue | null>,
		sorter:
			| SorterResult<DeliveryOrderController.QueryRuleRecord>
			| SorterResult<DeliveryOrderController.QueryRuleRecord>[],
	) => {
		const { order, columnKey } = sorter as SorterResult<DeliveryOrderController.QueryRuleRecord>;
		const params = {
			sortList: order == null ? undefined : [{ desc: order === 'descend', sortName: columnKey }],
		};
		setTimeParams({ ...params });
	};

	const columns: ProColumns<DeliveryOrderController.QueryRuleRecord>[] = [
		{
			title: '序号',
			key: 'index',
			align: 'center',
			dataIndex: 'index',
			renderText: (_text, _redord, index) => index + 1,
			width: 'XXXS',
		},
		{
			title: '状态',
			dataIndex: 'status',
			width: 'XS',
			filters: false,
			valueEnum: deliveryStatusValueEnum,
		},
		{
			title: '推送单号',
			dataIndex: 'code',
			key: 'code',
			width: 'XL',
			copyable: true,
		},
		{
			title: '推送科室',
			dataIndex: 'departmentName',
			width: 'M',
			ellipsis: true,
		},
		{
			title: '推送仓库',
			dataIndex: 'warehouseName',
			key: 'warehouseName',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '配货单号',
			dataIndex: 'pickOrderCode',
			width: 'XL',
			copyable: true,
		},
		{
			title: '生成时间',
			dataIndex: 'timeCreated',
			key: 'o.time_created',
			width: 'L',
			hideInSearch: true,
			sorter: true,
			ellipsis: true,
			renderText: (time, record) =>
				record.timeCreated ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-',
		},
		{
			title: '推送人员',
			dataIndex: 'pusherName',
			key: 'pusherName',
			width: 'XS',
			ellipsis: true,
		},
		{
			title: '验收状态',
			dataIndex: 'acceptanceOrderStatus',
			key: 'acceptanceOrderStatus',
			width: 'XS',
			filters: false,
			valueEnum: receivingReportStatusValueEnum,
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			fixed: 'right',
			width: 'M',
			render: (_text, record) => {
				return (
					<div
						className='operation'
						onClick={(e) => e.stopPropagation()}
						style={{ display: 'flex' }}>
						{(pageType === 'handle'
							? access['delivery_order_view']
							: access['push_goods_view']) && (
							<span
								className='handleLink'
								onClick={() => openModal(record)}>
								查看
							</span>
						)}
						{record.status == 'check_pending' && access['delivery_order_check'] && (
							<>
								{access['delivery_order_view'] && (
									<Divider
										type='vertical'
										className='mt_6'
									/>
								)}
								<span
									className='handleLink'
									onClick={() => openReviewModal(record)}>
									复核
								</span>
							</>
						)}
						{/* 打印功能 */}
						{access['push_goods_print'] &&
							(record.status == 'partial_pass' ||
								record.status == 'all_pass' ||
								record.status == 'check_pending') && (
								<>
									{(access['delivery_order_view'] || access['delivery_order_check']) && (
										<Divider
											type='vertical'
											className='mt_6'
										/>
									)}
									<PrintTarget
										url={printDeliveryOrder}
										params={{ deliveryId: record.id }}
										data={{ requestByName: record.requestByName, requestTime: record.requestTime }}
										printState={record.printStatus}
										callbackFunction={async () => {
											let res = await editDeliveryOrderPrintStatus(record.id as number);
											if (res.code === 0) {
												tableRef.current?.reload();
											}
										}}
									/>
								</>
							)}
					</div>
				);
			},
		},
	];

	const checkModals = {
		visible: createModalVisible,
		onCancel: handleCancel,
		detail: goodsRequestId,
	};
	const reviewModals = {
		visible: reviewModalVisible,
		onCancel: handleCancel,
		detail: goodsRequestId,
		getTableList: getTableList,
	};

	const searchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'status',
			valueType: 'tagSelect',
			fieldProps: {
				multiple: pageType === 'handle' ? false : true,
				options: pageType === 'handle' ? deliveryStatusPending : deliveryStatusDone,
			},
		},
		{
			title: '生成时间',
			dataIndex: 'timeCreated',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType,
			},
		},
		{
			title: '推送科室',
			dataIndex: 'departmentIds',
			valueType: 'apiSelect',
			fieldProps: {
				api: queryDepartmentList,
				fieldConfig: {
					label: 'departmentName',
					value: 'departmentId',
				},
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '推送单号',
			dataIndex: 'code',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '配货单号',
			dataIndex: 'pickOrderCode',
			fieldProps: {
				placeholder: '请输入',
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

	return (
		<>
			<ProTable<DeliveryOrderController.QueryRuleRecord>
				rowKey='id'
				tableInfoCode='push_goods_list'
				api={queryRule}
				columns={columns}
				loadConfig={{
					request: false,
				}}
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				onChange={handleChangeTable}
				dateFormat={{
					timeCreated: {
						startKey: 'start',
						endKey: 'end',
					},
				}}
				beforeSearch={(value: Record<string, any>) => {
					const { status } = value;
					const params = {
						...value,
						pageType,
						status: status ? status.toString() : undefined,
					};
					return params;
				}}
				tableRef={tableRef}
				requestCompleted={(rows) => {
					setIsExportFile(rows.length > 0);
				}}
				headerTitle={
					<Tips
						headerTitle=''
						text='*复核通过后推送至科室'
					/>
				}
				toolBarRender={() => [
					access['delivery_order_export'] && (
						<ExportFile
							data={{
								filters: { ...tableRef.current?.getParams(), pageType },
								link: exportDeliveryOrder,
								getForm: tableRef.current?.getParams,
							}}
							disabled={!isExportFile}
						/>
					),
				]}
			/>
			<CheckModal {...checkModals} />
			<ReviewModal {...reviewModals} />
		</>
	);
};

export default connect(({ global }: ConnectState) => ({ global }))(PickingList);
