import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ResizableTable';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import {
	stockDealTakingStatus,
	stockQueryTakingStatus,
	stockTakingStatusValueEnum,
} from '@/constants/dictionary';
import {
	getStockList,
	getStorageAreaList,
	stopStockTakingOrder,
} from '@/services/stockTakingOrder';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Form, Popconfirm } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { connect, history, useAccess } from 'umi';
import AddModal from '../../add';
import DetailAndHandleModal from './DetailAndHandleModal';
import { notification } from '@/utils/ui';
const TableList: React.FC<{
	pageType: 'handle' | 'query';
	global: Record<string, any>;
	props: { match: { params: { id?: string } } };
}> = ({ pageType, global, props }) => {
	const access = useAccess();
	const [jumpSearch, setJumpSearch] = useState<boolean>(false);
	const [detailAndHandleVisible, setDetailAndHandleVisible] = useState<boolean>(false);
	const [record, setRecord] = useState<StockTakingOrderController.GetDetailRuleParams>({});
	const [modalType, setModalType] = useState<'handle' | 'detail'>('detail');
	const tableRef = useRef<ProTableAction>();
	const [form] = Form.useForm();

	// 排序
	// 拆分全局搜索参数
	const handleOrderCodeChange = (code: string) => {
		if (code) {
			if (code.indexOf('#') > -1) {
				let arr = code.split('#');
				code = arr[0];
				let status = arr[1];
				form.setFieldsValue({
					code,
					status: [status],
				});
			}
			setJumpSearch(true);
		}
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
	// // 消息
	// const handleMsgPush = async () => {
	//   if (props.match.params.id) {
	//     showDetail(props.match.params);
	//   }
	// };

	useEffect(() => {
		// 设置主页跳转状态
		let code = getCode();
		if (!jumpSearch) {
			handleOrderCodeChange(code);
		}
		// handleMsgPush();
	}, []);
	useEffect(() => {
		const state = history?.location.state as { status: string };
		if (state?.status) {
			form.setFieldsValue({ status: state?.status });
			setTimeout(() => form.submit(), 200);
		}
	}, [history?.location.state]);

	// 详情弹窗
	const showDetail = (
		record: StockTakingOrderController.GetDetailRuleParams,
		type: 'handle' | 'detail',
	) => {
		setDetailAndHandleVisible(true);
		setRecord(record);
		setModalType(type);
	};

	const handleAbolish = async (id: number) => {
		const res = await stopStockTakingOrder(id);
		if (res.code === 0) {
			notification.success('操作成功！');
			tableRef.current?.reload();
		}
	};

	let columns: ProColumns<StockTakingOrderController.GetDetailRuleParams>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 80,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'status',
			key: 'status',
			width: 110,
			filters: false,
			valueEnum: stockTakingStatusValueEnum,
		},
		{
			title: '盘库单号',
			dataIndex: 'code',
			key: 'code',
			width: 220,
			copyable: true,
		},
		{
			title: '盘点仓库',
			dataIndex: 'storageAreaName',
			key: 'storageAreaId',
			width: 150,
			ellipsis: true,
		},
		{
			title: '创建人员',
			dataIndex: 'createdByName',
			key: 'createdByName',
			width: 120,
		},
		{
			title: '创建时间',
			dataIndex: 'timeCreated',
			key: 'time_created',
			width: 180,
			sorter: true,
			render: (time, record) => {
				return record.timeCreated ? moment(record.timeCreated).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '确认人员',
			dataIndex: 'operator',
			key: 'operator',
			width: 120,
		},
		{
			title: '确认时间',
			dataIndex: 'timeEnd',
			key: 'time_end',
			width: 180,
			sorter: true,
			render: (time, record) => {
				return record.timeEnd ? moment(record.timeEnd).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 200,
			fixed: 'right',
			render: (text, record) => {
				return (
					<div className='operation'>
						{(pageType === 'handle'
							? access.stock_taking_order_view
							: access.stock_taking_order_detail) && (
							<>
								<span
									className='handleLink'
									onClick={() => showDetail(record, 'detail')}>
									查看
								</span>
								<Divider type='vertical' />
							</>
						)}
						{pageType === 'handle' && access.stock_taking_order_handle && (
							<>
								<span
									className='handleLink'
									onClick={() => {
										showDetail(record, 'handle');
									}}>
									盘点处理
								</span>
								<Divider type='vertical' />
							</>
						)}
						{access.stop_stock_taking_order && pageType === 'handle' && (
							<Popconfirm
								placement='left'
								title='确定废除盘库吗？'
								okText='确定'
								cancelText='取消'
								onCancel={(e) => {
									e?.stopPropagation();
								}}
								// @ts-ignore
								onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => e?.stopPropagation()}
								onConfirm={(e) => {
									e?.stopPropagation();
									handleAbolish(record.id!);
								}}>
								<a>废除盘库</a>
							</Popconfirm>
						)}
					</div>
				);
			},
		},
	];

	const searchColumns: ProFormColumns<StockTakingOrderController.GetListRuleParams> = [
		{
			title: '状态',
			dataIndex: 'status',
			valueType: 'tagSelect',
			fieldProps: {
				options: pageType === 'handle' ? stockDealTakingStatus : stockQueryTakingStatus,
			},
		},
		{
			title: '创建时间',
			dataIndex: 'timeCreated',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				placeholder: ['开始时间起点', '结束时间终点'],
				options: [
					{
						label: '当天',
						type: 'day',
						count: 0,
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
			title: '确认时间',
			dataIndex: 'confirmTime',
			valueType: 'dateRangeWithTag',
			hideInForm: pageType === 'handle',
			fieldProps: {
				placeholder: ['开始时间起点', '结束时间终点'],
				options: [
					{
						label: '当天',
						type: 'day',
						count: 0,
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
			title: '盘点仓库',
			dataIndex: 'storageAreaId',
			valueType: 'apiSelect',
			fieldProps: {
				api: getStorageAreaList,
				params: {
					pageType,
				},
				pagination: false,
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
			title: '盘库单号',
			dataIndex: 'code',
		},
		{
			title: '创建人员',
			dataIndex: 'creator',
		},
		{
			title: '确认人员',
			dataIndex: 'operator',
			hideInForm: pageType === 'handle',
		},
	];

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<Card>
				<ProTable<StockTakingOrderController.GetDetailRuleParams>
					tableInfoCode={pageType === 'handle' ? 'stock_count_deal' : 'stock_count_query'}
					loadConfig={{
						request: false,
					}}
					columns={columns}
					api={getStockList}
					paramsToString={['typeList']}
					dateFormat={{
						timeCreated: {
							startKey: 'createdFrom',
							endKey: 'createdTo',
						},
						confirmTime: {
							startKey: 'confirmFrom',
							endKey: 'confirmTo',
						},
					}}
					params={{ pageType }}
					tableRef={tableRef}
					searchConfig={{
						form,
						columns: searchColumns,
					}}
					toolBarRender={() => [
						access.add_stock_taking_order && pageType === 'handle' && (
							<AddModal
								trigger={
									<Button
										icon={<PlusOutlined style={{ marginLeft: -4 }} />}
										type='primary'
										className='iconButton'>
										发起盘库
									</Button>
								}
								tableRef={tableRef}
							/>
						),
					]}
				/>
			</Card>
			{detailAndHandleVisible && (
				<DetailAndHandleModal
					visible={detailAndHandleVisible}
					onCancel={() => {
						setDetailAndHandleVisible(false);
					}}
					tableRef={tableRef}
					modalType={modalType}
					pageType={pageType}
					record={record}
				/>
			)}
		</div>
	);
};

export default connect((global: Record<string, any>) => ({ global }))(TableList);
