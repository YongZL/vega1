import Breadcrumb from '@/components/Breadcrumb';
import { GetNotification, Tips } from '@/components/GetNotification';
import PaginationBox from '@/components/Pagination';
import TableBox from '@/components/TableBox';
import { getUrlParam } from '@/utils';
import { notification } from '@/utils/ui';
import { PlusOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Divider, Form } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { connect, history } from 'umi';
import CheckModal from '../cheack';
import FormSearch from '../formSearch';
import { getDetail, queryRule, removeManualRequest, withdrawManualRequest } from './service';

const approvaStatus = {
	withdraw: { text: '撤回', color: CONFIG_LESS['@c_starus_disabled'] },
	approval_pending: { text: '待审核', color: CONFIG_LESS['@c_starus_await'] },
	approval_failure: { text: '审核不通过', color: CONFIG_LESS['@c_starus_warning'] },
	approval_review_pending: { text: '待复核', color: CONFIG_LESS['@c_starus_await'] },
	approval_review_success: { text: '复核通过', color: CONFIG_LESS['@c_starus_done'] },
	approval_part_success: { text: '部分通过', color: CONFIG_LESS['@c_starus_underway'] },
	approval_review_failure: { text: '复核不通过', color: CONFIG_LESS['@c_starus_warning'] },
	purchasing: { text: '采购中', color: CONFIG_LESS['@c_starus_underway'] },
	in_delivery: { text: '配送中', color: CONFIG_LESS['@c_starus_underway'] },
	partial_delivery: { text: '部分配送', color: CONFIG_LESS['@c_starus_underway'] },
	all_accept: { text: '全部验收', color: CONFIG_LESS['@c_starus_done'] },
	partial_accept: { text: '部分验收', color: CONFIG_LESS['@c_starus_underway'] },
};

const TableList: React.FC<{}> = ({ global, ...props }) => {
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const [createModalVisible, handleModalVisible] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [list, setList] = useState([]);
	const [searchParams, setSearchParams] = useState({});
	const [total, setTotal] = useState(0);
	const [timeParams, setTimeParams] = useState({});
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const [goodsRequestId, setGoodsRequestId] = useState<object>({});
	const [modalTitle, setModalTitle] = useState('');
	const [modalType, setModalType] = useState<string>('');
	const [jumpSearch, setJumpSearch] = useState(false);
	const [sortedInfo, setSortedInfo] = useState({});
	const formRef = useRef();
	const [isFirst, setIsFirst] = useState(true);
	const [form] = Form.useForm();

	//  打开 查看/审核/复核 弹窗
	const openModal = (record: object, title: string, type: string) => {
		setGoodsRequestId(record);
		setModalType(type);
		setModalTitle(title);
		handleModalVisible(true);
	};
	//  关闭弹窗
	const handleCancel = () => {
		handleModalVisible(false);
	};

	const dealTime = (time: moment.MomentInput[]) => {
		return (
			Number(moment(time[0]).startOf('day').format('x')),
			Number(moment(time[1]).endOf('day').format('x'))
		);
	};

	//  跳转->新增/编辑页面
	const goToEditPage = (recod: object) => {
		form.submit();
		const time = form.getFieldsValue().submitTime;
		const spTime = form.getFieldsValue().approvalTime;
		const fhTime = form.getFieldsValue().approvalReviewTime;
		const obj = {
			time: time && time.length && [dealTime(time)],
			spTime: spTime && spTime.length && [dealTime(spTime)],
			fhTime: fhTime && fhTime.length && [dealTime(fhTime)],
			status: form.getFieldsValue().statuses,
			...form.getFieldsValue(),
		};
		delete obj.submitTime;
		delete obj.approvalTime;
		delete obj.approvalReviewTime;
		delete obj.statuses;
		history.push({
			pathname: `/department/manual_request/edit/${recod.id}/${recod.warehouseId}`,
			state: { params: obj },
		});
	};
	//  请求列表
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
	// 更新查询表单
	const searchTabeList = (value: Object) => {
		setSearchParams({ ...value });
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

	const handleMsgPush = async () => {
		// 普通请领消息推送
		const { params } = props.match;
		if (params.id) {
			const { id, readOnly, messageType } = params;
			const res = await getDetail({ id });
			if (res && res.code === 0) {
				const detail = res.data;
				const { status } = detail;
				if (readOnly === 'true') {
					openModal(detail, '请领详情', 'view');
				} else {
					switch (status) {
						case 'approval_pending':
							openModal(detail, '请领审核', 'audit');
							break;
						case 'approval_review_pending':
							if (messageType === 'goods_request_commit') {
								// 从审核界面进入的不能进行复核
								openModal(detail, '请领详情', 'view');
							} else {
								openModal(detail, '请领复核', 'review');
							}
							break;
						default:
							openModal(detail, '请领详情', 'view');
							break;
					}
				}
			}
		}
	};

	//  如果为全局搜索跳转,拆分参数
	const handleOrderCodeChange = (code) => {
		if (code) {
			if (code.indexOf('#') > -1) {
				const arr = code.split('#');
				code = arr[0];
				const status = arr[1];
				getFormList({ code, statuses: status });
				formRef.current.setFieldsValue({
					statuses: [status],
					code,
				});
			} else if (code.indexOf('?status') > -1) {
				const status = getUrlParam(code, 'status');
				formRef.current.setFieldsValue({
					statuses: status.split(','),
				});
				getFormList({ statuses: status, pageNum: 0 });
			} else {
				getFormList({ code, pageNum: 0 });
			}
		} else {
			// getFormList({ pageNum: 0 });
		}
	};
	//  查询参数变化后更新列表
	useEffect(() => {
		//  设置主页跳转状态
		if (!jumpSearch) {
			const code = getCode();
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
	const reSetFormSearch = (value) => {
		setSortedInfo({});
		setTimeParams({});
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
		//  getFormList({ ...params });
	};
	// 撤回
	const rejectRequest = async (goodsRequestId: any) => {
		const res = await withdrawManualRequest({ goodsRequestId });
		if (res && res.code === 0) {
			notification.success('操作成功');
			getFormList({});
		}
	};
	// 删除
	const removeRequest = async (id: string | number) => {
		const res = await removeManualRequest({ goodsRequestId: id });
		if (res && res.code === 0) {
			notification.success('操作成功');
			getFormList({ pageNum: 0 });
		}
	};
	const columns = [
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
			title: '请领人',
			width: 120,
			dataIndex: 'createdByName',
		},
		{
			title: '请领科室',
			dataIndex: 'departmentName',
			width: 150,
		},
		{
			title: '请领仓库',
			dataIndex: 'warehouseName',
			key: 'warehouseName',
			width: 150,
		},
		{
			title: '请领时间',
			dataIndex: 'submitTime',
			key: 'ogr.submit_time',
			width: 170,
			hideInSearch: true,
			show: true,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'ogr.submit_time' && sortedInfo.order,
			render: (time: any) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '审核人员',
			dataIndex: 'approvalByName',
			width: 120,
		},
		{
			title: '审核时间',
			dataIndex: 'approvalTime',
			key: 'ogr.approval_time',
			width: 170,
			hideInSearch: true,
			show: true,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'ogr.approval_time' && sortedInfo.order,
			render: (time: any) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '复核人',
			dataIndex: 'approvalReviewByName',
			width: 120,
		},
		{
			title: '复核时间',
			dataIndex: 'approvalReviewTime',
			key: 'ogr.approval_review_time',
			width: 170,
			hideInSearch: true,
			show: true,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'ogr.approval_review_time' && sortedInfo.order,
			render: (time: any) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '请领单号',
			dataIndex: 'code',
			copyable: true,
			width: 200,
		},
		{
			title: '操作',
			dataIndex: 'option',
			valueType: 'option',
			fixed: 'right',
			width: 136,
			render: (id: string | number, record: object) => {
				return (
					<div className='operation'>
						{permissions.includes('warehouse_request_view') ? (
							<span
								className='handleLink'
								onClick={() => {
									openModal(record, '请领详情', 'view');
								}}>
								查看
							</span>
						) : null}
						{permissions.includes('warehouse_request_edit') &&
							['withdraw'].includes(record.status) && (
								<>
									<Divider type='vertical' />
									<span
										className='handleLink'
										onClick={() => {
											goToEditPage(record);
										}}>
										编辑
									</span>
								</>
							)}
						{permissions.includes('warehouse_request_remove') &&
							['withdraw'].includes(record.status) && (
								<>
									<Divider type='vertical' />
									<span
										className='handleLink'
										onClick={() => removeRequest(record.id)}>
										删除
									</span>
								</>
							)}
						{permissions.includes('warehouse_request_withdraw') &&
							record.status === 'approval_pending' && (
								<>
									<Divider type='vertical' />
									<span
										className='handleLink'
										onClick={() => rejectRequest(record.id)}>
										撤回
									</span>
								</>
							)}
						{permissions.includes('warehouse_request_approval') &&
							record.status === 'approval_pending' && (
								<>
									<Divider type='vertical' />
									<span
										className='handleLink'
										onClick={() => {
											openModal(record, '请领审核', 'audit');
										}}>
										审核
									</span>
								</>
							)}
						{permissions.includes('warehouse_request_approval_review') &&
							record.status === 'approval_review_pending' && (
								<>
									<Divider type='vertical' />
									<span
										className='handleLink'
										onClick={() => {
											openModal(record, '请领复核', 'review');
										}}>
										复核
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
		detail: goodsRequestId,
		title: modalTitle,
		modalType: modalType,
		searchTabeList: () => {
			getFormList({ pageNum: 0 });
		},
	};

	const onAdd = () => {
		history.push({ pathname: '/department/manual_request/add' });
	};

	return (
		<div>
			<Breadcrumb
				config={['', '']}
				notification={<GetNotification />}
			/>
			<Card bordered={false}>
				<FormSearch
					searchTabeList={searchTabeList}
					ref={formRef}
					reSetFormSearch={reSetFormSearch}
					isFirst={() => setIsFirst(false)}
					form={form}
					history={history}
				/>
				<TableBox
					isFirst={isFirst}
					headerTitle={
						<Tips
							headerTitle='请领列表'
							longText={
								<div className='count'>
									<span>
										*状态：显示请领的进度，依次为：待审核→待复核→采购中→配送中→全部验收/部分验收
									</span>{' '}
									&nbsp; &nbsp;
									<span>*撤回：在审核之前,用户撤回该请领重新编辑</span>
								</div>
							}
						/>
					}
					toolBarRender={() => [
						permissions.includes('warehouse_request_add_apply') && (
							// <Link to={{pathname:`/department/manual_request/add`,state:{form:form.getFieldsValue()}}}>
							//   <Button icon={<PlusOutlined />} type="primary" onClick= {()=>form.submit()}>
							//     发起请领
							//   </Button>
							// </Link>
							<Button
								icon={<PlusOutlined />}
								type='primary'
								onClick={onAdd}>
								发起请领
							</Button>
						),
					]}
					tableInfoId='36'
					options={{
						reload: () => getFormList({}),
					}}
					rowKey='id'
					scroll={{
						x: '100%',
						y: global.scrollY,
					}}
					dataSource={list}
					loading={loading}
					columns={columns}
					onChange={handleChangeTable}
				/>
				{total > 0 && (
					<PaginationBox
						data={{ total, ...pageConfig }}
						pageChange={(pageNum: number, pageSize: number) =>
							getFormList({ pageNum, pageSize, ...timeParams })
						}
					/>
				)}
			</Card>
			{createModalVisible && <CheckModal {...checkModals} />}
		</div>
	);
};

export default connect(({ global, permissions: { permissions } }) => ({ global, permissions }))(
	TableList,
);
