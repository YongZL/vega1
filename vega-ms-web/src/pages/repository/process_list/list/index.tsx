import type { ProFormColumns } from '@/components/SchemaForm/typings';
import type { ProTableAction, ProColumns } from '@/components//ProTable/typings';
import type { ConnectState } from '@/models/connect';
import type { GlobalModelState } from '@/models/global';
import moment from 'moment';
import { Link, connect, history, useAccess } from 'umi';
import { getUrlParam } from '@/utils';
import { notification } from '@/utils/ui';
import ProTable from '@/components/ResizableTable';
import ProcessModal from './component/Process';
import DetailModal from './component/Detail';
import { PlusOutlined } from '@ant-design/icons';
import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import GenerateOrderModal from './component/GenerateOrder';
import { Button, Divider, Form, Popconfirm, Typography } from 'antd';

import {
	processListStatus,
	processListStatusValueEnum,
	processListType,
	processListTypeTextMap,
} from '@/constants/dictionary';
import { getList, submitPickUp, deleteOrder } from '@/services/processingOrder';
import { timeType3 } from '@/constants';

const TableList: React.FC<{ global: GlobalModelState }> = ({ global }) => {
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const [jumpSearch, setJumpSearch] = useState<boolean>(false);
	const [modalProcessVisible, setModalProcessVisible] = useState<boolean>(false);
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [modalOderVisible, setModalOrderVisible] = useState<boolean>(false);
	const [orderInfo, setOrderInfo] = useState<ProcessingOrderController.GetListRecord>({});
	const [isClick, setIsClick] = useState<boolean>(false);
	const access = useAccess();

	const searchColumns: ProFormColumns = [
		{
			title: '类型',
			dataIndex: 'statusList',
			valueType: 'tagSelect',
			fieldProps: {
				options: processListStatus,
			},
		},
		{
			title: '创建时间',
			dataIndex: 'timeCreated',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType3,
			},
		},
		{
			title: '加工单号',
			dataIndex: 'processingOrderCode',
		},
		{
			title: '配货单号',
			dataIndex: 'pickOrderCode',
		},
		{
			title: '加工详情',
			dataIndex: 'description',
		},
		{
			title: '来源',
			dataIndex: 'type',
			valueType: 'select',
			fieldProps: {
				options: processListType,
			},
		},
	];

	// 列表
	const getFormList = () => {
		tableRef.current?.reload();
	};

	// 生成配货单
	const pickUp = async (id: number) => {
		setIsClick(true);
		try {
			const res = await submitPickUp({ processingOrderId: [id] });
			if (res && res.code === 0) {
				notification.success('操作成功！');
				getFormList();
			}
		} finally {
			setIsClick(false);
		}
	};

	// 删除
	const onConfirmDelete = async (id: number) => {
		setIsClick(true);
		try {
			const res = await deleteOrder(id);
			if (res && res.code === 0) {
				notification.success('操作成功！');
				getFormList();
			}
		} finally {
			setIsClick(false);
		}
	};
	// 拆分全局搜索参数
	const handleOrderCodeChange = (code: string | undefined) => {
		// setStateCode(code);
		if (code) {
			let status: string;
			if (code.indexOf('#') > -1) {
				let arr = code.split('#');
				code = arr[0];
				status = arr[1];
				form.setFieldsValue({
					processingOrderCode: code,
					statusList: status,
				});
			} else if (code.indexOf('status') > -1) {
				status = getUrlParam(code, 'status') || '';
				form.setFieldsValue({
					statusList: status.split(','),
				});
			}
			setTimeout(() => form.submit(), 200);
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
		if (hash.indexOf('status') > -1) {
			code = hash;
		}
		return code;
	};
	useEffect(() => {
		// 设置主页跳转状态
		let code = getCode();
		if (!jumpSearch) {
			handleOrderCodeChange(code);
		} else {
			getFormList();
		}
	}, []);
	useEffect(() => {
		let state = history?.location.state as {
			code: string;
			status: string;
		};
		if (state?.status) {
			form.setFieldsValue({ statusList: state?.status, processingOrderCode: state?.code });
			setTimeout(() => form.submit(), 200);
		}
	}, [history?.location.state]);
	useEffect(() => {
		if (window.location.hash) {
			const code = getCode();
			handleOrderCodeChange(code);
		}
	}, [window.location.hash]);

	// 详情弹窗
	const showDetail = (record: ProcessingOrderController.GetListRecord) => {
		setModalVisible(true);
		setOrderInfo(record);
	};

	// 加工赋码
	const processOrder = (record: ProcessingOrderController.GetListRecord) => {
		setModalProcessVisible(true);
		setOrderInfo(record);
	};

	let columns: ProColumns<ProcessingOrderController.GetListRecord>[] = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'id',
			align: 'center',
			renderText: (_text, _redord, index) => index + 1,
		},
		{
			width: 'S',
			title: '状态',
			dataIndex: 'status',
			filters: false,
			valueEnum: processListStatusValueEnum,
		},
		{
			width: 'S',
			title: '来源',
			dataIndex: 'type',
			renderText: (val) => processListTypeTextMap[val],
		},
		{
			width: 'XXXL',
			title: '加工单号',
			dataIndex: 'code',
			copyable: true,
		},
		{
			width: 'XL',
			title: '加工详情',
			dataIndex: 'description',
			key: 'wpo.description',
			ellipsis: true,
			sorter: true,
		},
		{
			width: 'XL',
			title: '库房',
			dataIndex: 'storageAreaName',
			renderText: (value) => value || '-',
		},
		{
			width: 'XS',
			title: '创建人员',
			dataIndex: 'createdName',
		},
		{
			width: 'XL',
			title: '创建时间',
			dataIndex: 'timeCreated',
			key: 'wpo.time_created',
			renderText: (time, record) =>
				record.timeCreated ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-',
			sorter: true,
		},
		{
			width: 'XXXL',
			title: '配货单号',
			dataIndex: 'pickOrderCode',
			render: (text, record) => {
				return record.pickOrderCode ? (
					<>
						{text}
						<Typography.Paragraph
							className='dis-ib mg0'
							copyable={{ text: record.pickOrderCode }}
							onClick={(e) => {
								e?.stopPropagation();
							}}
						/>
					</>
				) : (
					'-'
				);
			},
		},
	];

	if (
		access['process_view'] ||
		access['process_make'] ||
		access['process_delete'] ||
		access['process_coding']
	) {
		columns.push({
			width: 'XXL',
			title: '操作',
			dataIndex: 'option',
			fixed: 'right',
			render: (id, record) => {
				return (
					<div className='operation'>
						{access['process_view'] && (
							<span
								className='handleLink'
								onClick={() => showDetail(record)}>
								查看
							</span>
						)}
						{record.status === 'operate_pending' && (
							<span>
								{access['process_make'] ? (
									<>
										<Divider type='vertical' />
										<Popconfirm
											placement='left'
											title='确定生成配货单？'
											okText='确定'
											cancelText='取消'
											onConfirm={() => pickUp(record.id!)}
											disabled={isClick}>
											<span className='handleLink'>生成配货单</span>
										</Popconfirm>
									</>
								) : null}
								{access['process_delete'] ? (
									<>
										<Divider type='vertical' />
										<Popconfirm
											placement='left'
											title='确定删除该加工单吗？'
											onConfirm={() => onConfirmDelete(record.id!)}
											disabled={isClick}>
											<span className='handleLink'>删除</span>
										</Popconfirm>
									</>
								) : null}
							</span>
						)}
						{access['process_coding'] &&
							['process_pending', 'process_done'].includes(record.status!) && (
								<>
									<Divider type='vertical' />
									<span
										className='handleLink'
										onClick={() => processOrder(record)}>
										{record.status === 'process_done' ? '赋码' : '加工赋码'}
									</span>
								</>
							)}
					</div>
				);
			},
		});
	}
	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<ProTable<ProcessingOrderController.GetListRecord>
				api={getList}
				tableInfoCode='process_list'
				// tableInfoId="28"
				columns={columns}
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				dateFormat={{
					timeCreated: {
						endKey: 'toTime',
						startKey: 'fromTime',
					},
				}}
				loadConfig={{
					request: false,
				}}
				searchKey={'process_list'}
				toolBarRender={() => {
					let timeCreated = form.getFieldsValue().timeCreated;
					if (timeCreated && typeof timeCreated[0] !== 'string') {
						timeCreated = timeCreated.map((item: any) => item._d);
					}
					return [
						access['process_make'] && (
							<Button
								type='primary'
								onClick={() => setModalOrderVisible(true)}
								style={{ width: 114, padding: 0 }}>
								一键生成配货单
							</Button>
						),
						access['processing'] && (
							<Button
								icon={<PlusOutlined style={{ marginLeft: -4 }} />}
								type='primary'
								onClick={() => {
									history.push({
										pathname: '/repository/process_list/add',
										state: { params: { ...form.getFieldsValue(), timeCreated } },
									});
								}}
								className='iconButton'>
								发起加工
							</Button>
						),
					];
				}}
				tableRef={tableRef}
			/>
			<DetailModal
				isOpen={modalVisible}
				setIsOpen={setModalVisible}
				orderInfo={orderInfo}
			/>

			<ProcessModal
				isOpen={modalProcessVisible}
				setIsOpen={setModalProcessVisible}
				orderInfo={orderInfo}
				getFormList={getFormList}
			/>

			<GenerateOrderModal
				isOpen={modalOderVisible}
				setIsOpen={setModalOrderVisible}
				close={() => setModalOrderVisible(false)}
				status={'operate_pending'}
			/>
		</div>
	);
};

export default connect(({ global }: ConnectState) => ({ global }))(TableList);
