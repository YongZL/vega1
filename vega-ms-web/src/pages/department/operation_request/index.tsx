import Breadcrumb from '@/components/Breadcrumb';
import PaginationBox from '@/components/Pagination';
import TableBox from '@/components/TableBox';
import { getUrlParam } from '@/utils';
import { notification } from '@/utils/ui';
import { Badge, Card, Divider, Popconfirm } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { connect, history } from 'umi';
import CheckModal from './cheack';
import FormSearch from './formSearch';
import { queryDetail, queryRemove, queryRule } from './service';

const approvaStatus = {
	surgical_request_pending: { text: '待请领', color: CONFIG_LESS['@c_starus_await'] },
	approval_pending: { text: '待审核', color: CONFIG_LESS['@c_starus_await'] },
	approval_review_success: { text: '审核通过', color: CONFIG_LESS['@c_starus_done'] },
	approval_review_failure: { text: '审核不通过', color: CONFIG_LESS['@c_starus_warning'] },
};

const PickingList: React.FC<{}> = ({ global, ...props }) => {
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const [createModalVisible, handleModalVisible] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [list, setList] = useState([]);
	const [searchParams, setSearchParams] = useState({});
	const [timeParams, setTimeParams] = useState({});
	const [total, setTotal] = useState(0);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const [goodsRequestId, setGoodsRequestId] = useState(null);

	const [modalType, setModalType] = useState('');
	const [jumpSearch, setJumpSearch] = useState(false);
	const [sortedInfo, setSortedInfo] = useState({});
	const formRef = useRef();
	// 打开查看弹窗
	const openModal = (record: object, type: string) => {
		handleModalVisible(true);
		setGoodsRequestId(record.id);
		setModalType(type);
	};
	//  关闭弹窗
	const handleCancel = () => {
		handleModalVisible(false);
	};
	// 请求列表
	const getFormList = async (param: any) => {
		const params = {
			...pageConfig,
			...searchParams,
			...timeParams,
			...param,
		};
		setLoading(true);
		const res = await queryRule(params);
		if (res && res.code === 0) {
			setList(res.data.rows);
			setTotal(res.data.totalCount);
			setPageConfig({ pageNum: res.data.pageNum, pageSize: res.data.pageSize });
		}
		setLoading(false);
	};
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
	//  如果为全局搜索跳转,拆分参数
	const handleOrderCodeChange = (code) => {
		if (code) {
			if (code.indexOf('#') > -1) {
				let arr = code.split('#');
				code = arr[0];
				let status = arr[1];
				getFormList({ code, statuses: status });
				formRef.current.setFieldsValue({
					status: [status],
					code,
				});
			} else if (code.indexOf('?status') > -1) {
				const status = getUrlParam(code, 'status');
				formRef.current.setFieldsValue({
					status: status.split(','),
				});
				getFormList({ statuses: status, pageNum: 0 });
			} else {
				getFormList({ code, pageNum: 0 });
			}
		} else {
			getFormList({ pageNum: 0 });
		}
	};

	// 消息
	const handleMsgPush = async () => {
		const { params } = props.match;
		if (params.id) {
			const { id, readOnly } = params;
			const res = await queryDetail({ id });
			if (res && res.code === 0) {
				const detail = res.data;
				const { status } = detail;
				if (readOnly === 'true') {
					openModal(detail, 'detail');
				} else {
					if (status === 'approval_pending') {
						openModal(detail, 'audit');
					} else {
						openModal(detail, 'detail');
					}
				}
			}
		}
	};

	// 查询参数变化后更新列表
	useEffect(() => {
		//  设置主页跳转状态
		const code = getCode();
		if (!jumpSearch) {
			handleOrderCodeChange(code);
			setJumpSearch(true);
		} else {
			getFormList({});
		}
	}, [searchParams, timeParams]);

	useEffect(() => {
		handleMsgPush();
	}, []);

	useEffect(() => {
		if (window.location.hash) {
			const code = getCode();
			handleOrderCodeChange(code);
		}
	}, [window.location.hash]);
	// 更新查询表单
	const searchTabeList = (value: Object) => {
		setSearchParams({ ...value });
	};
	//  排序
	const handleChangeTable = (pagination: any, filter: any, sorter: any) => {
		setSortedInfo(sorter);
		const params = {
			sortList:
				sorter.order == null
					? undefined
					: [{ desc: sorter.order === 'descend', sortName: sorter.columnKey }],
		};
		setTimeParams({ ...params });
	};
	const reSetFormSearch = (value) => {
		setSortedInfo({});
		setTimeParams({});
		setSearchParams({ ...value });
	};

	// 删除
	const removeRequest = async (id: string | number) => {
		const res = await queryRemove(id);
		if (res && res.code == 0) {
			notification.success('操作成功');
			getFormList({ pageNum: 0 });
		}
	};
	const columns = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			render: (text, redord, index) => <span>{index + 1}</span>,
			width: 80,
		},
		{
			title: '状态',
			dataIndex: 'status',
			width: 120,
			render: (text: any) => (
				<>
					<Badge
						color={approvaStatus[text].color}
						text={approvaStatus[text].text}
					/>
				</>
			),
		},
		{
			title: '病号',
			dataIndex: 'patientNo',
			key: 'patientNo',
			ellipsis: true,
			width: 140,
		},
		{
			title: '病人名称',
			dataIndex: 'name',
			key: 'name',
			width: 90,
		},

		{
			title: '手术',
			dataIndex: 'surgicalName',
			key: 'surgicalName',
			ellipsis: true,
			width: 150,
		},
		{
			title: '科室',
			dataIndex: 'departmentName',
			key: 'warehouseName',
			width: 120,
		},
		{
			title: '仓库',
			dataIndex: 'warehouseName',
			key: 'warehouseName',
			width: 150,
		},
		{
			title: '创建时间',
			dataIndex: 'timeCreated',
			key: 'time_created',
			width: 170,
			hideInSearch: true,
			show: true,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'time_created' && sortedInfo.order,
			render: (time: any) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '请领人',
			dataIndex: 'requestedByName',
			key: 'requestedByName',
			ellipsis: true,
			width: 100,
		},
		{
			title: '请领时间',
			dataIndex: 'requestTime',
			key: 'request_time',
			width: 170,
			hideInSearch: true,
			show: true,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'request_time' && sortedInfo.order,
			render: (time: any) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '期望到货时间',
			dataIndex: 'expectedTime',
			key: 'expected_time',
			width: 170,
			hideInSearch: true,
			show: true,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'expected_time' && sortedInfo.order,
			render: (time: any) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '审核人员',
			dataIndex: 'approvalReviewByName',
			key: 'approvalReviewByName',
			ellipsis: true,
			width: 100,
		},
		{
			title: '审核时间',
			dataIndex: 'approvalReviewTime',
			key: 'approval_time',
			width: 170,
			hideInSearch: true,
			show: true,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'approval_time' && sortedInfo.order,
			render: (time: any) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '请领单号',
			dataIndex: 'code',
			width: 220,
			copyable: true,
		},
		{
			title: '操作',
			dataIndex: 'option',
			valueType: 'option',
			fixed: 'right',
			width: 136,
			render: (id: string | number, record: object) => {
				return (
					<div
						className='operation'
						onClick={(e) => e.stopPropagation()}>
						{permissions.includes('surgical_package_request_view') ? (
							<span
								className='handleLink'
								onClick={() => {
									openModal(record, 'detail');
								}}>
								查看
							</span>
						) : null}
						{record.status === 'surgical_request_pending' && (
							<>
								{permissions.includes('add_surgical_package_request') && (
									<>
										<Divider type='vertical' />
										<a
											onClick={() => {
												history.push(`/department/operation_request/add/${record.id}`);
											}}>
											请领
										</a>
									</>
								)}
								{permissions.includes('delete_surgical_package_request') && (
									<>
										<Divider type='vertical' />
										<Popconfirm
											placement='left'
											title={`确定要删除？`}
											onConfirm={() => {
												removeRequest(record.id);
											}}>
											<span className='handleLink'>删除</span>
										</Popconfirm>
									</>
								)}
							</>
						)}

						{/* {["approval_pending", "approval_review_pending"].includes( */}
						{['approval_pending'].includes(record.status) &&
							permissions.includes('edit_surgical_package_request') && (
								<>
									<Divider type='vertical' />
									<a
										onClick={() => {
											history.push(`/department/operation_request/add/${record.id}`);
										}}>
										编辑
									</a>
								</>
							)}

						{record.status === 'approval_pending' &&
							permissions.includes('approval_surgical_package_request') && (
								<>
									<Divider type='vertical' />
									<span
										className='handleLink'
										onClick={() => {
											openModal(record, 'audit');
										}}>
										审核
									</span>
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
		id: goodsRequestId,
		modalType: modalType,
		getList: getFormList,
	};

	return (
		<div>
			<Breadcrumb config={['', '']} />
			<Card bordered={false}>
				<FormSearch
					searchTabeList={searchTabeList}
					ref={formRef}
					reSetFormSearch={reSetFormSearch}
				/>
				<TableBox
					headerTitle='手术请领列表'
					tableInfoId='40'
					options={{
						reload: () => getFormList({}),
					}}
					rowKey='id'
					scroll={{
						x: '100%',
						y: global.scrollY + 7,
					}}
					onChange={handleChangeTable}
					dataSource={list}
					loading={loading}
					columns={columns}
				/>
				{total > 0 && (
					<PaginationBox
						data={{ total, ...pageConfig }}
						pageChange={(pageNum: number, pageSize: number) => getFormList({ pageNum, pageSize })}
					/>
				)}
			</Card>
			<CheckModal {...checkModals} />
		</div>
	);
};

export default connect(({ global }) => ({ global }))(PickingList);
