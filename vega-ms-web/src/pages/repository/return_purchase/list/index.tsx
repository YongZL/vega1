import type { ProTableAction } from '@/components//ProTable/typings';
import Print from '@/components/print';
import Target from '@/components/print/return_order';
import ProTable, { ProColumns } from '@/components/ProTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { timeType2 } from '@/constants';
import api from '@/constants/api';
import {
	returnStatusDone,
	returnStatusPending,
	returnStatusValueEnum,
	shippingOrderType,
	shippingOrderTypeTextMap,
} from '@/constants/dictionary';
import { useDistributorList } from '@/hooks/useDistributorList';
import { getDetail, getList } from '@/services/returnGoods';
import { getUrlParam } from '@/utils';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Form } from 'antd';
import moment from 'moment';
import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { connect, history, useAccess, useModel } from 'umi';
import DetailModal from '../components/Detail';

export interface UpdateProps {
	pageType?: string;
	global: Record<string, any>;
	match: Record<string, any>;
}
const PrintTarget = Print(Target);

const TableList: FC<UpdateProps> = ({ global, ...props }) => {
	const [form] = Form.useForm();
	const { pageType } = props;
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const distributorOption = useDistributorList();
	const [orderId, setOrderId] = useState<string>('');
	const [handleType, setHandleType] = useState<string>('');
	const [jumpSearch, setJumpSearch] = useState<boolean>(false);
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const access = useAccess();

	const searchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'statusList',
			valueType: 'tagSelect',
			fieldProps: {
				options: pageType === 'handle' ? returnStatusPending : returnStatusDone,
			},
		},
		{
			title: '创建时间',
			dataIndex: 'timeCreated',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType2,
			},
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorId',
			valueType: 'select',
			fieldProps: {
				showSearch: true,
				options: distributorOption,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '退货单号',
			dataIndex: 'code',
		},
		{
			title: '退货方式',
			dataIndex: 'type',
			valueType: 'select',
			fieldProps: {
				options: shippingOrderType,
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
	// 列表
	const getFormList = () => {
		tableRef.current?.reload();
	};

	// 拆分全局搜索参数
	const handleOrderCodeChange = (code: string) => {
		if (code) {
			let status: any;
			if (code.indexOf('#') > -1) {
				let arr = code.split('#');
				code = arr[0];
				status = arr[1];
				form.setFieldsValue({
					code,
					statusList: status,
				});
				setTimeout(() => form.submit(), 200);
			} else if (code.indexOf('status') > -1) {
				status = getUrlParam(code, 'status');
				form.setFieldsValue({
					status: status.split(','),
				});
			}
		}
		//  getFormList({});
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
		if (hash.indexOf('status') > -1) {
			code = hash;
		}
		return code;
	};

	const showDetail = (record: Record<string, any>, type: React.SetStateAction<string>) => {
		setModalVisible(true);
		setHandleType(type);
		setOrderId(record.id);
	};

	// 消息
	const handleMsgPush = async () => {
		const { params } = props.match;
		if (params.id) {
			const { id, readOnly } = params;
			const res = await getDetail({ returnGoodsId: id });
			if (res && res.code === 0) {
				const { order }: Record<string, any> = res.data;
				setOrderId(String(order.id));
				if (readOnly === 'true') {
					showDetail(order, 'detail');
				} else {
					switch (order.returnStatus) {
						case 'pending_confirm':
							showDetail(order, 'confirm');
							break;
						case 'pending_approve':
							if (
								global.config.is_online &&
								global.config.is_online === 'true' &&
								order.invoiceSync &&
								order.type === 'online_order'
							) {
								showDetail(order, 'detail');
							} else {
								showDetail(order, 'approve');
							}
							break;
						default:
							showDetail(order, 'detail');
							break;
					}
				}
			}
		}
	};

	useEffect(() => {
		// 设置主页跳转状态
		if (!jumpSearch) {
			const code = getCode();
			handleOrderCodeChange(code);
			setJumpSearch(true);
		} else {
			getFormList();
		}
		handleMsgPush();
		let state = history?.location.state as { status: string; code: string };
		if (state?.status || state?.code) {
			form.setFieldsValue({ statusList: state?.status, code: state?.code });
			setTimeout(() => form.submit(), 200);
		}
	}, []);

	useEffect(() => {
		// 设置主页跳转状态
		if (window.location.hash) {
			const code = getCode();
			handleOrderCodeChange(code);
		}
	}, [window.location.hash]);

	const columns: ProColumns<ReturnGoodsController.ReturnGoodsRecord>[] = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'id',
			align: 'center',
			renderText: (text, record: Record<string, any>, index: number) => index + 1,
		},
		{
			width: 'S',
			title: '状态',
			dataIndex: 'returnStatus',
			filters: false,
			valueEnum: returnStatusValueEnum,
		},
		{
			width: 'XXXL',
			title: '退货单号',
			dataIndex: 'code',
			copyable: true,
			ellipsis: true,
		},
		{
			width: 'M',
			title: '退货仓库',
			dataIndex: 'warehouseName',
			ellipsis: true,
		},
		{
			width: 'L',
			title: fields.distributor,
			dataIndex: 'distributorName',
			ellipsis: true,
		},
		{
			width: 'XS',
			title: '退货方式',
			dataIndex: 'type',
			renderText: (val: string) => shippingOrderTypeTextMap[val] || '-',
		},
		{
			width: 'XS',
			title: '创建人员',
			dataIndex: 'createdName',
			ellipsis: true,
		},
		{
			width: 'S',
			title: '联系方式',
			dataIndex: 'contactPhone',
			ellipsis: true,
		},
		{
			width: 'XL',
			title: '创建时间',
			dataIndex: 'timeCreated',
			sorter: true,
			key: 'timeCreated',
			renderText: (time: moment.MomentInput, record: Record<string, any>) =>
				record.timeCreated ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-',
		},
		{
			width: 'XS',
			title: '审核人员',
			dataIndex: 'approvedName',
			ellipsis: true,
		},
		{
			width: 'XL',
			title: '审核时间',
			dataIndex: 'timeApproved',
			sorter: true,
			key: 'timeApproved',
			renderText: (time: moment.MomentInput, record: Record<string, any>) =>
				record.timeApproved ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-',
		},
		{
			width: 'XS',
			title: '确认人员',
			dataIndex: 'confirmedName',
			ellipsis: true,
		},
		{
			width: 'XL',
			title: '确认时间',
			dataIndex: 'timeConfirmed',
			sorter: true,
			key: 'timeConfirmed',
			renderText: (time: moment.MomentInput, record: Record<string, any>) =>
				record.timeConfirmed ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-',
		},
		{
			width: 'XL',
			title: '操作',
			fixed: 'right',
			dataIndex: 'option',
			valueType: 'option',
			render: (_: ReactNode, record: Record<string, any>) => (
				<>
					{(pageType === 'handle'
						? access.return_goods_view
						: access.return_central_goods_view) && (
						<a onClick={() => showDetail(record, 'detail')}>查看</a>
					)}
					{record.returnStatus === 'pending_confirm' && access.return_goods_confirm && (
						<>
							<Divider type='vertical' />
							<a onClick={() => showDetail(record, 'confirm')}>确认</a>
						</>
					)}
					{!(
						global.config.is_online &&
						global.config.is_online === 'true' &&
						record.invoiceSync &&
						record.type === 'online_order'
					) &&
						record.returnStatus === 'pending_approve' &&
						access.return_goods_check && (
							<>
								<Divider type='vertical' />
								<a onClick={() => showDetail(record, 'approve')}>审核</a>
							</>
						)}
					{record.returnStatus === 'pending_return' &&
						access.return_goods_delivered &&
						!record.timeDelivered && (
							<>
								<Divider type='vertical' />
								<a onClick={() => showDetail(record, 'confirmDelivered')}>确认送达</a>
							</>
						)}
					{record.returnStatus === 'pending_return' &&
						access.scan_return_goods &&
						record.timeDelivered && (
							<>
								<Divider type='vertical' />
								<a onClick={() => showDetail(record, 'return')}>扫码退货</a>
							</>
						)}
					{['pending_return', 'return_finished'].includes(record.returnStatus) &&
						(pageType === 'handle'
							? access.return_goods_print
							: access.return_central_goods_print) &&
						record.timeDelivered && (
							<>
								<Divider type='vertical' />
								<PrintTarget
									url={api.return_purchase.detail}
									params={{ returnGoodsId: record.id }}
								/>
							</>
						)}
				</>
			),
		},
	];
	return (
		<>
			<ProTable
				loadConfig={{
					request: false,
				}}
				api={getList}
				rowKey='id'
				columns={columns}
				dateFormat={{
					timeCreated: {
						endKey: 'end',
						startKey: 'start',
					},
				}}
				searchConfig={{
					form: form,
					columns: searchColumns,
				}}
				searchKey={pageType === 'handle' ? 'return_goods' : 'central_return_query'}
				toolBarRender={() => [
					access.add_return_goods && pageType === 'handle' && (
						<Button
							icon={<PlusOutlined style={{ marginLeft: -4 }} />}
							type='primary'
							onClick={() => {
								history.push('/department/return_processing/return_purchase_add');
							}}
							className='iconButton'>
							发起退货
						</Button>
					),
				]}
				beforeSearch={(value: Record<string, any>) => {
					const { statusList } = value;
					const params = {
						...value,
						level: 0,
						pageType,
						statusList: statusList ? statusList.toString() : undefined,
					};
					return params;
				}}
				tableRef={tableRef}
			/>

			{modalVisible && (
				<DetailModal
					isOpen={modalVisible}
					setIsOpen={setModalVisible}
					handleType={handleType}
					orderId={orderId}
					getFormList={getFormList}
				/>
			)}
		</>
	);
};

export default connect(({ global }: { global: Record<string, any> }) => ({ global }))(TableList);
