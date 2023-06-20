import Print from '@/components/print';
import Target from '@/components/print/pickUp';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import {
	pickingPendingSourceTextMap,
	pickOrderStatusAllValueEnum,
	pickOrderStatusDone,
	pickOrderStatusPending,
} from '@/constants/dictionary';
import type { ConnectState } from '@/models/connect';
import type { GlobalModelState } from '@/models/global';
import { queryDepartmentList } from '@/services/department';
import { printPickOrder, queryCancel, queryRule } from '@/services/pickOrder';
import { getUrlParam } from '@/utils';
import { millisecondToDate } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Divider, Form, Popconfirm, TablePaginationConfig } from 'antd';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { connect, history, useAccess, useModel } from 'umi';
import CheckModal from './Cheack';
const PrintTarget = Print(Target);
const PickingList = ({
	global,
	...props
}: {
	global: GlobalModelState;
	pageType: string;
	activeKey: string;
}) => {
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const [createModalVisible, handleModalVisible] = useState<boolean>(false);
	const [searchParams, setSearchParams] = useState({});
	const [timeParams, setTimeParams] = useState({});
	const [goodsRequestId, setGoodsRequestId] = useState<PickOrderController.QueryRuleRecord>({});
	const [jumpSearch, setJumpSearch] = useState(false);
	const [isCancels, setIsCancels] = useState<boolean>(false);
	const { pageType, activeKey } = props;
	const access = useAccess();
	// 打开查看弹窗
	const openModal = (record: PickOrderController.QueryRuleRecord) => {
		handleModalVisible(true);
		setGoodsRequestId(record);
	};
	// 关闭弹窗
	const handleCancel = () => {
		handleModalVisible(false);
	};
	// 请求列表
	const getFormList = () => {
		tableRef.current?.reload();
	};
	// 全局搜索关键字
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

	const handleOrderCodeChange = (code: string | undefined) => {
		if (code) {
			let status: string;
			if (code.indexOf('#') > -1) {
				let arr = code.split('#');
				code = arr[0];
				status = arr[1];
				form.setFieldsValue({
					code,
					status,
				});
			} else if (code.indexOf('status') > -1) {
				status = getUrlParam(code, 'status') || '';
				form.setFieldsValue({
					status: status.split(','),
				});
				setSearchParams({
					status,
				});
			} else {
				form.setFieldsValue({
					code,
				});
			}
			setJumpSearch(true);
		}
		setTimeout(() => form.submit(), 200);
	};

	useEffect(() => {
		const state = history?.location.state as {
			pickOrderStatus: string;
			status: string;
			pickOrderCode: string;
			code: string;
			key: string;
		};
		if (state?.status) {
			if (state?.key) {
				if (state.key === activeKey) {
					form.setFieldsValue({
						status: state.pickOrderStatus || state.status,
						code: state?.pickOrderCode || state.code,
					});
					setTimeout(() => form.submit(), 200);
				}
			} else {
				form.setFieldsValue({
					status: state.pickOrderStatus || state.status,
					code: state?.pickOrderCode || state.code,
				});
				setTimeout(() => form.submit(), 200);
			}
		}
	}, [history?.location.state]);
	// 查询参数变化后更新列表
	useEffect(() => {
		const code = getCode();
		const state = history?.location.state as { key: string };
		if (state && state.key === activeKey && code && !jumpSearch) {
			handleOrderCodeChange(code);
		}
	}, [searchParams, timeParams]);

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
			| SorterResult<PickOrderController.QueryRuleRecord>
			| SorterResult<PickOrderController.QueryRuleRecord>[],
	) => {
		const { order, columnKey } = sorter as SorterResult<PickOrderController.QueryRuleRecord>;
		const params = {
			sortList: order == null ? undefined : [{ desc: order === 'descend', sortName: columnKey }],
		};
		setTimeParams({ ...params });
	};

	// 删除
	const removeRequest = (id: number) => async () => {
		setIsCancels(true);
		try {
			const res = await queryCancel(id);
			if (res && res.code === 0) {
				notification.success('操作成功');
				getFormList();
			}
		} finally {
			setIsCancels(false);
		}
	};
	const columns: ProColumns<PickOrderController.QueryRuleRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			renderText: (_text, _redord, index) => <span>{index + 1}</span>,
			width: 'XXS',
		},
		{
			title: '状态',
			dataIndex: 'status',
			width: 'XXS',
			filters: false,
			valueEnum: pickOrderStatusAllValueEnum,
		},
		{
			title: '配货单号',
			dataIndex: 'code',
			width: 'XL',
			copyable: true,
		},
		{
			title: '推送科室',
			dataIndex: 'departmentName',
			width: 'L',
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
			title: '采购类型',
			dataIndex: 'source',
			width: 'XS',
			renderText: (text) => pickingPendingSourceTextMap[text],
		},
		{
			title: '库房',
			dataIndex: 'storageAreaName',
			key: 'storageAreaName',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '配货人员',
			dataIndex: 'pickerName',
			width: 'XXS',
			ellipsis: true,
		},
		{
			title: '开始时间',
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
			title: '配货时长',
			dataIndex: 'pickDuration',
			key: 'o.pick_duration',
			width: 'XS',
			hideInSearch: true,
			ellipsis: true,
			sorter: true,
			renderText: (_text, record) =>
				record.pickDuration ? millisecondToDate(record.pickDuration) : '-',
		},
		{
			title: '操作',
			dataIndex: 'option',
			valueType: 'option',
			fixed: 'right',
			width: 'M',
			render: (_text, record) => {
				return (
					<div className='operation flex'>
						{(
							pageType === 'handle' ? access['pick_order_view'] : access['pick_order_query_view']
						) ? (
							<span
								className='handleLink'
								onClick={() => {
									openModal(record);
								}}>
								查看
							</span>
						) : null}

						{access['cancel_pick_order'] &&
							record.status == 'pick_pending' &&
							record.reason == 'delivery' && (
								<>
									<Divider
										type='vertical'
										className='mt_6'
									/>
									<Popconfirm
										placement='left'
										title='确定取消？'
										onConfirm={removeRequest(record.id!)}
										disabled={isCancels}>
										<span className='handleLink'>取消</span>
									</Popconfirm>
								</>
							)}

						{/* 打印功能 */}
						{(pageType === 'handle'
							? access['pick_order_print']
							: access['pick_order_query_print']) && (
							<>
								<Divider
									type='vertical'
									className='mt_6'
								/>
								<PrintTarget
									url={printPickOrder}
									params={{ id: record.id }}
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

	const searchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'status',
			valueType: 'tagSelect',
			fieldProps: {
				options: props.pageType === 'handle' ? pickOrderStatusPending : pickOrderStatusDone,
			},
		},
		{
			title: '开始时间',
			dataIndex: 'timeCreated',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: [
					{
						label: '近三天',
						type: 'day',
						count: -3,
					},
					{
						label: '最近一周',
						type: 'day',
						count: -7,
					},
					{
						label: '近一个月',
						type: 'month',
						count: -1,
					},
				],
			},
		},
		{
			title: '推送科室',
			dataIndex: 'departmentIds',
			valueType: 'apiSelect',
			fieldProps: {
				fieldConfig: {
					label: 'departmentName',
					value: 'departmentId',
				},
				api: queryDepartmentList,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '配货单号',
			dataIndex: 'code',
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
		<div>
			<ProTable<PickOrderController.QueryRuleRecord>
				rowKey='id'
				api={queryRule}
				tableInfoCode='delivery_order_query_list'
				loadConfig={{
					request: false,
				}}
				// tableInfoId="27"
				columns={columns}
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				dateFormat={{
					timeCreated: {
						startKey: 'timeCreatedFrom',
						endKey: 'timeCreatedTo',
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
				onChange={handleChangeTable}
				tableRef={tableRef}
			/>
			<CheckModal {...checkModals} />
		</div>
	);
};
export default connect(({ global }: ConnectState) => ({ global }))(PickingList);
