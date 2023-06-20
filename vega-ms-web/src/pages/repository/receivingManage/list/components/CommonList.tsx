import Breadcrumb from '@/components/Breadcrumb';
import Print from '@/components/print';
import Target from '@/components/print/receiving';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import {
	invoiceStatusEnum,
	receivingReportStatusDone,
	receivingReportStatusPending,
	receivingReportStatusValueEnum,
} from '@/constants/dictionary';
import { useDistributorList } from '@/hooks/useDistributorList';
import { getOrderCount, getPageList, printReceivingOrder } from '@/services/receivingOrder';
import { shippingCompleted } from '@/services/shippingOrder';
import { sortListByLevel as getSortListByLevel } from '@/services/storageAreas';
import { getUrlParam } from '@/utils';
import { notification } from '@/utils/ui';
import { Card, Divider, Form, Modal, Popconfirm, Space } from 'antd';
import moment from 'moment';
import { FC, useEffect, useRef, useState } from 'react';
import { connect, history, useAccess, useModel } from 'umi';
import CodingModal from './CodingModal';
import DetailModal from './DetailModal';
import ReviewModal from './ReviewModal';
import UploadInvoice from './UploadInvoice';

const approvalStatus = {
	pending: { text: '未验收', color: CONFIG_LESS['@c_starus_await'] },
	receiving: { text: '验收中', color: CONFIG_LESS['@c_starus_await'] },
	partial_pass: { text: '部分通过', color: CONFIG_LESS['@c_starus_underway'] },
	all_pass: { text: '验收通过', color: CONFIG_LESS['@c_starus_done'] },
	all_reject: { text: '验收不通过', color: CONFIG_LESS['@c_starus_warning'] },
};

const isWX = sessionStorage.getItem('hospital_id') === '107'; //是否为吴兴医院
type ListRecord = ReceivingOrderController.ListRecord;
const PrintTarget = Print(Target);
const CommonList: FC<{
	global: Record<string, any>;
	match: Record<string, any>;
	pageType: 'handle' | 'query';
}> = ({ global, match, pageType }) => {
	const access = useAccess();
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const distributorOption = useDistributorList();
	const [searchParams, setSearchParams] = useState({});
	const [completeLoading, setCompleteLoading] = useState<boolean>(false);
	const [jumpSearch, setJumpSearch] = useState<boolean>(false);
	const [showModalType, setShowModalType] = useState<string>('');
	const [currentRow, setCurrentRow] = useState<Partial<ListRecord>>({});
	const [isSurgicalRequest, setSurgicalRequest] = useState<boolean>(false);
	const [sortListByLevel, setSortListByLevel] = useState([]);
	const [systemType] = useState<string>(sessionStorage.getItem('systemType') || 'Insight_MS'); // 默认为核心

	// 获取库房
	const getSortListByLevelList = async () => {
		const res = await getSortListByLevel({ isCurrentUser: true });
		if (res && res.code === 0) {
			const result = res.data;
			const arr: any = result.map((item: Record<string, any>) => ({
				value: item.id,
				label: item.name,
				key: item.name,
			}));
			setSortListByLevel(arr);
		}
	};

	// 打开详情/验收/赋码弹窗
	const openModal = (record: ListRecord, type: string) => {
		setShowModalType(type);
		setCurrentRow(record);
	};

	// 关闭弹窗
	const handleCancel = () => setShowModalType('');

	// 请求列表
	const getFormList = async (param: object) => tableRef.current?.reload();
	const getTableList = () => getFormList({});

	const beforeReview = async (record: ListRecord) => {
		if (record.status === 'pending') {
			const res = await getOrderCount(record.receivingId);
			if (res && res.code === 0) {
				const { unBarcodeControlledCount, totalCount } = res.data;
				if (unBarcodeControlledCount >= 30) {
					Modal.confirm({
						title: '赋码数量过多，是否要继续？',
						content: `当前验收单赋码数量(${totalCount})较多，您可以通过网页端设置赋码单位，重新生成验收单，您也可以选择继续验收。`,
						okText: '继续验收',
						onOk: () => openModal(record, 'review'),
					});
				} else {
					openModal(record, 'review');
				}
			}
		} else {
			openModal(record, 'review');
		}
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

	const handleOrderCodeChange = (receivingCode: string, surgicalRequest = false) => {
		// 是否手术
		if (match.url.indexOf('surgical_receiving') > -1) {
			surgicalRequest = true;
		}
		if (receivingCode) {
			if (receivingCode.indexOf('#') > -1) {
				// 全局跳转过来的
				const arr = receivingCode.split('#');
				receivingCode = arr[0];
				const status = arr[1];

				form.setFieldsValue({
					receivingCode,
					statusList: [status],
				});
				setTimeout(() => form.submit(), 200);
				getFormList({ receivingCode, surgicalRequest, pageNum: 0, statusList: status });
			} else if (receivingCode.indexOf('status') > -1) {
				const status: any = getUrlParam(receivingCode, 'status');
				form.setFieldsValue({
					status: status.split(','),
				});
				setSearchParams({
					statusList: status,
				});
				getFormList({ surgicalRequest, pageNum: 0, statusList: status });
			} else {
				getFormList({ receivingCode, surgicalRequest, pageNum: 0 });
			}
			setJumpSearch(true);
		} else {
			getFormList({});
		}
		setSurgicalRequest(surgicalRequest);
	};

	// 查询参数变化后更新列表
	useEffect(() => {
		const state = history?.location.state as { status: string; code: string };
		if (state?.status || state?.code) {
			form.setFieldsValue({ statusList: state?.status, receivingCode: state?.code });
			setTimeout(() => form.submit(), 200);
		}
	}, [history?.location.state]);

	// 查询参数变化后更新列表
	useEffect(() => {
		const receivingCode = getCode();
		if (receivingCode && !jumpSearch) {
			handleOrderCodeChange(receivingCode, false);
		}
	}, [searchParams]);

	// 设置主页跳转状态
	useEffect(() => {
		if (window.location.hash) {
			const code = getCode();
			handleOrderCodeChange(code, false);
		}
	}, [window.location.hash]);

	useEffect(() => {
		getSortListByLevelList();
	}, []);

	// 确认送达
	const orderComplete = async (code: string) => {
		setCompleteLoading(true);
		const res = await shippingCompleted(code);
		if (res && res.code === 0) {
			notification.success('操作成功');
			getFormList({});
		}
		setCompleteLoading(false);
	};

	const searchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'statusList',
			valueType: 'tagSelect',
			fieldProps: {
				options: pageType === 'query' ? receivingReportStatusDone : receivingReportStatusPending,
			},
		},
		{
			title: '发票状态',
			dataIndex: 'isCheck',
			valueType: 'radioButton',
			initialValue: '',
			valueEnum: invoiceStatusEnum,
			fieldProps: {
				className: 'search-radio-button',
			},
		},
		{
			title: '验收时间',
			dataIndex: 'timeCreated',
			valueType: 'dateRangeWithTag',
			hideInForm: pageType == 'handle',
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
			title: '验收单号',
			dataIndex: 'receivingCode',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '配货单号',
			dataIndex: 'shippingCode',
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
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '发票编号',
			dataIndex: 'invoiceCode',
			fieldProps: {
				maxLength: 30,
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
		{
			title: '配货库房',
			dataIndex: 'storageAreaIds',
			valueType: 'select',
			hideInForm: systemType !== 'Insight_DS' || pageType === 'query',
			fieldProps: {
				placeholder: '请选择配货库房',
				showSearch: true,
				allowClear: true,
				options: sortListByLevel,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
	];

	const columns: ProColumns<ListRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 'XXS',
			render: (text, record, index: number) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'status',
			key: 'status',
			width: 'S',
			filters: false,
			valueEnum: receivingReportStatusValueEnum,
		},
		{
			title: '验收单号',
			dataIndex: 'receivingCode',
			key: 'receivingCode',
			width: 'XXXL',
			copyable: true,
			ellipsis: true,
		},
		{
			title: '配送单号',
			dataIndex: 'shippingCode',
			key: 'shippingCode',
			width: 'XXXL',
			copyable: true,
			ellipsis: true,
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorName',
			key: 'distributorName',
			width: 'XXXL',
			ellipsis: true,
		},
		{
			title: '发票编号',
			dataIndex: 'invoiceCode',
			key: 'invoiceCode',
			width: 'XXL',
		},
		{
			title: '配货库房',
			dataIndex: 'storageAreaName',
			key: 'storageAreaName',
			width: 'XXL',
			ellipsis: true,
			hideInTable: systemType !== 'Insight_DS' || pageType === 'query',
		},
		{
			title: '送货员',
			dataIndex: 'deliveryUserName',
			key: 'deliveryUserName',
			width: 'S',
		},
		{
			title: '预计验收日期',
			dataIndex: 'expectDeliveryDate',
			key: 'expectDeliveryDate',
			width: 'L',
			renderText: (text: number) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
		},
		{
			title: '验收人员',
			dataIndex: 'inspectorName',
			key: 'inspectorName',
			width: 'S',
			ellipsis: true,
		},
		{
			title: '验收日期',
			dataIndex: 'actualAcceptanceDate',
			key: 'actualAcceptanceDate',
			width: 'XL',
			sorter: true,
			renderText: (text: number) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
		},
		{
			title: '操作',
			dataIndex: 'receivingId',
			key: 'receivingId',
			fixed: 'right',
			width: 'XXL',
			renderText: (receivingId: number, record) => {
				return (
					<div className='operation'>
						<Space
							size={0}
							split={<Divider type='vertical' />}
							wrap={true}>
							{(pageType === 'query'
								? access['receiving_list_view']
								: access['receiving_order_view']) && (
								<span
									className='handleLink'
									onClick={() => openModal(record, 'detail')}>
									查看
								</span>
							)}
							{/* 发票上传 */}
							{isWX && pageType === 'query' && (!record.invoiceCode || !record.invoicingDate) && (
								<span
									className='handleLink'
									onClick={() => openModal(record, 'invoice')}>
									发票上传
								</span>
							)}
							{record.shippingOrderStatus === 'delivering' &&
								access['receiving_order_confirm_service'] && (
									<Popconfirm
										placement='left'
										title='确认已送达？'
										okButtonProps={{ loading: completeLoading }}
										disabled={completeLoading}
										onConfirm={() => orderComplete(record.shippingCode)}>
										<span className='handleLink'>确认送达</span>
									</Popconfirm>
								)}
							{record.shippingOrderStatus !== 'delivering' &&
								['pending', 'receiving'].includes(record.status) &&
								access['receiving_order_check'] && (
									<span
										className='handleLink'
										onClick={() => beforeReview(record)}>
										验收
									</span>
								)}
							{record.shippingOrderStatus !== 'delivering' &&
								['partial_pass', 'all_pass'].includes(record.status) &&
								access['receiving_order_coding'] && (
									<span
										className='handleLink'
										onClick={() => openModal(record, 'coding')}>
										赋码打印
									</span>
								)}
							{/* 打印功能 */}
							{record.shippingOrderStatus !== 'delivering' &&
								!['pending', 'receiving'].includes(record.status) &&
								access['receiving_list_print'] && (
									<PrintTarget
										url={printReceivingOrder}
										params={{ receivingOrderId: receivingId }}
									/>
								)}
						</Space>
					</div>
				);
			},
		},
	];

	// 详情验收基础信息由列表传进去，修改值避免刷新
	const updateListData = (key: string, value: any) => {
		const dataList = tableRef.current?.getDataSource() || [];
		dataList.forEach((item) => {
			if (item.receivingId === currentRow.receivingId) {
				item[key] = value;
			}
		});
		tableRef.current?.setDataSource(dataList);
	};

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<Card bordered={false}>
				<ProTable<ListRecord>
					api={getPageList}
					columns={columns}
					rowKey='receivingId'
					tableInfoCode={pageType === 'query' ? 'receiving_list_list' : 'receiving_order_list'}
					loadConfig={{
						request: false,
					}}
					searchConfig={{
						form,
						columns: searchColumns,
					}}
					dateFormat={{
						timeCreated: {
							startKey: 'actualAcceptanceFrom',
							endKey: 'actualAcceptanceTo',
						},
					}}
					beforeSearch={(value: Record<string, any>) => {
						const { statusList, storageAreaIds } = value;
						const params = {
							...value,
							surgicalRequest: isSurgicalRequest,
							pageType: pageType,
							statusList: statusList ? statusList.toString() : undefined,
							storageAreaIds: storageAreaIds ? [storageAreaIds] : undefined,
						};
						return params;
					}}
					tableRef={tableRef}
				/>
			</Card>
			{/* 详情Modal */}
			{showModalType === 'detail' && (
				<DetailModal
					approvalStatus={approvalStatus}
					detail={currentRow}
					onCancel={handleCancel}
					updateListData={updateListData}
				/>
			)}
			{/* 赋码Modal */}
			{showModalType === 'coding' && (
				<CodingModal
					approvalStatus={approvalStatus}
					detail={currentRow}
					onCancel={handleCancel}
				/>
			)}
			{/* 验收Modal */}
			{showModalType === 'review' && (
				<ReviewModal
					approvalStatus={approvalStatus}
					detailInfo={currentRow}
					getTableList={getTableList}
					onCancel={() => {
						handleCancel();
						tableRef.current?.reload();
					}}
					updateListData={updateListData}
				/>
			)}
			{/* 发票上传 */}
			{showModalType === 'invoice' && (
				<UploadInvoice
					detailInfo={currentRow}
					closeModal={handleCancel}
					reloadList={() => tableRef.current?.reload()}
				/>
			)}
		</div>
	);
};

export default connect(({ global }: Record<string, any>) => ({ global }))(CommonList);
