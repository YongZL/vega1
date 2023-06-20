import Breadcrumb from '@/components/Breadcrumb';
import DatePickerMore from '@/components/DatePickerMore';
import PaginationBox from '@/components/Pagination';
import Print from '@/components/print';
import Target from '@/components/print/settlement';
import TableBox from '@/components/TableBox';
import TagSelect from '@/components/TagSelect';
import { useCustodianList } from '@/hooks/useCustodianList';
import { useDistributorList } from '@/hooks/useDistributorList';
import { calColumnsWidth, getUrlParam, removeColumItemByKey } from '@/utils';
import { convertPriceWithDecimal } from '@/utils/format';
import request from '@/utils/request';
import { getUrl } from '@/utils/utils';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Col, Divider, Form, Input, Row, Select, Tabs } from 'antd';
import { unionBy } from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { connect, useModel } from 'umi';
import DetailModal from './Detail';
import ExportModal from './ExportModal';
import ReceiptModal from './Receipt';

import basicStyles from '@/assets/style/basic.less';
import api from '@/constants/api';
import {
	settlementSupllierReview,
	settlementSupllierReviewTextMap,
	settlementSupllierReviewValueEnum,
	shippingOrderType,
	// shippingOrderTypeTextMap,
	statementStatus,
	statementStatusTextMap,
	statementStatusValueEnum,
} from '@/constants/dictionary';
import {
	searchColItem,
	searchColItemSingle,
	searchFormItem6,
	searchFormItemSingle6,
} from '@/constants/formLayout';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const PrintTarget = Print(Target);

const Settlement = ({
	loading,
	dispatch,
	settlement,
	auditLoading,
	global,
	currentUser,
	...props
}) => {
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const [modalVisible, setModalVisible] = useState(false);
	const [exportVisible, setExportVisible] = useState(false);
	const [receiptModalVisible, setReceiptModalVisible] = useState(false);
	const [singleSettlementInfo, setSingleSettlementInfo] = useState({});
	const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
	const [selectedList, setSelectedList] = useState<any>([]);
	const [activeTab, setActiveTab] = useState(
		permissions.includes('custodian_settlement') ? 'custodians' : 'suppliers',
	);
	const [sortList, setSortList] = useState<Array<any> | undefined>(undefined);
	const [expand, setExpand] = useState(true);
	const [handleType, setHandleType] = useState('detail');
	const { pageNum, pageSize, total, list, detailPageNum, detailPageSize } = settlement;
	const [form] = Form.useForm();
	const distributorOption = useDistributorList();
	const custodianList = useCustodianList();
	const { type: userType } = currentUser;
	const { fields } = useModel('fieldsMapping');

	// 订单消息
	const handleMsgPush = async () => {
		const { params } = props.match;
		if (params.id) {
			const { id, readOnly } = params;
			const res = await request(api.settlement.print, { params: { id } });
			if (res && res.code === 0) {
				const detail = res.data.summary;
				if (readOnly === 'true') {
					orderDetail(detail, 'detail');
				}
			}
		}
	};

	const getCode = () => {
		const hash = window.location.search;
		let no = undefined;
		if (hash.includes('search_key')) {
			no = global.keywords;
		}
		if (hash.includes('search_link')) {
			no = global.linkKeys;
		}
		return { no };
	};

	useEffect(() => {
		if (window.location.hash) {
			const code = getCode();
			fetchList({ pageNum: 0, pageSize: 50, ...code });
			return;
		}
		if (window.location.search) {
			const search = window.location.search;
			const code = getCode();
			fetchList({ pageNum: 0, pageSize: 50, failed: getUrlParam(search, 'failed'), ...code });
			return;
		}
		fetchList({ pageNum: 0, pageSize: 50 });
	}, [activeTab, window.location.hash]);

	useEffect(() => {
		handleMsgPush();
	}, []);

	const fetchList = (params = {}) => {
		const searchParams = convertSearchParams(form.getFieldsValue());
		let queryParams = {
			pageNum,
			pageSize,
			...searchParams,
			sortList,
			...params,
		};
		dispatch({
			type: 'settlement/querySettlementList',
			payload: queryParams,
		});
	};

	// 转化表单数据为后端所需参数格式
	const convertSearchParams = (values: any) => {
		let params = {
			...values,
			statusList: values.statusList ? values.statusList.join(',') : undefined,
			reviewStatusList: values.reviewStatus ? values.reviewStatus.join(',') : undefined,
			supplierIds: values.supplierIds ? values.supplierIds.join(',') : undefined,
			custodianIds: values.custodianIds ? values.custodianIds.join(',') : undefined,
			createdFrom: values.timeCreated ? moment(values.timeCreated[0]).valueOf() : undefined,
			createdTo: values.timeCreated ? moment(values.timeCreated[1]).valueOf() : undefined,
			periodName: values.periodName ? values.periodName.format('YYYY年MM月') : undefined,
		};
		delete params.timeCreated;
		delete params.reviewStatus;
		delete params.settlementPeriod;
		return params;
	};

	// form查询
	const onFinishSearch = () => {
		fetchList({ pageNum: 0, pageSize: 50 });
	};
	// form重置
	const onResetSerach = () => {
		form.resetFields();
		setSortList(undefined);
		fetchList({ pageNum: 0, pageSize: 50, sortList: undefined });
	};

	// 查看详情
	const orderDetail = (record, type) => {
		let params = {
			statementId: record.id,
			pageNum: detailPageNum,
			pageSize: detailPageSize,
		};
		setModalVisible(true);
		setSingleSettlementInfo(record);
		setHandleType(type);
		dispatch({
			type: 'settlement/querySettlementDetails',
			payload: params,
		});
	};

	// 下载
	const orderDownload = (record) => {
		dispatch({
			type: 'settlement/exportSettlement',
			payload: { statementId: record.id },
			callback: (res) => {
				if (res && res.code === 0) {
					window.open(
						`${getUrl()}/api/admin/common/1.0/download?filename=${res.data}&statementId=${
							record.id
						}`,
					);
				}
			},
		});
	};

	// 上传发票
	const uploadFile = (record) => {
		let params = {
			statementId: record.id,
		};
		setReceiptModalVisible(true);
		setSingleSettlementInfo(record);
		dispatch({
			type: 'settlement/loadReceipt',
			payload: params,
		});
	};

	// 重新生成结算单
	const rebuildStatement = async (record, e) => {
		await request(api.settlement.rebuild, { method: 'POST', data: { statementId: record.id } });
		fetchList();
	};

	const onCheckAllChange = (selected, selectedRows, changeRows) => {
		const newSelectList = selectedRows.filter((item) => item && item.status === 'approval_pending');
		let select = [];
		if (selected) {
			select = unionBy(selectedList.concat(newSelectList), 'id');
		} else {
			select = selectedList.filter((item) => {
				return !changeRows.map((item) => item.id).includes(item.id);
			});
		}
		const selectedKeys = select.map((item) => item.id);
		setSelectedList([...select]);
		setSelectedRowKeys([...selectedKeys]);
	};

	const onRowClick = (record, selected, selectedRows) => {
		let select = [];
		if (selected) {
			select = unionBy(selectedList.concat(selectedRows), 'id');
		} else {
			select = selectedList.filter((item) => {
				return item.id !== record.id;
			});
		}
		const selectedKeys = select.map((item) => item.id);
		setSelectedList([...select]);
		setSelectedRowKeys([...selectedKeys]);
	};

	// 重置勾选内容
	const resetSelected = () => {
		setSelectedList([]);
		setSelectedRowKeys([]);
	};

	const exportSettlement = () => {
		setExportVisible(true);
	};

	const batchAudit = () => {
		let params = {
			statementList: selectedRowKeys,
			reason: '',
			status: 'approval_success',
		};
		dispatch({
			type: 'settlement/orderAudit',
			payload: params,
			callback: (res) => {
				if (res && res.code === 0) {
					setSelectedRowKeys([]);
					setSelectedList([]);
					fetchList();
				}
			},
		});
	};

	const columns = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render: (text, record, index) => {
				return <span>{index + 1}</span>;
			},
		},
		{
			title: '状态',
			dataIndex: 'status',
			key: 'status',
			width: 150,
			render: (text) => {
				return (
					<span>
						<Badge color={(statementStatusValueEnum[text] || {}).color} />
						{statementStatusTextMap[text] || '-'}
					</span>
				);
			},
		},
		{
			title: '结算单号',
			dataIndex: 'no',
			key: 'no',
			width: 320,
			copyable: true,
		},
		{
			title: '名称',
			dataIndex: 'name',
			key: 'name',
			width: 320,
		},
		{
			title: '结算周期',
			dataIndex: 'settlementPeriod',
			key: 'state.time_to',
			sorter: true,
			width: 320,
			render: (text, record) => {
				return (
					<span>
						{moment(record.timeFrom).format('YYYY/MM/DD')}～
						{moment(record.timeTo).format('YYYY/MM/DD')}
					</span>
				);
			},
		},
		{
			title: `一级${fields.distributor}`,
			dataIndex: 'custodianName',
			key: 'custodianName',
			width: 320,
			ellipsis: true,
			render: (text, record) => {
				return <span>{record.custodianId == 1 ? '-' : text}</span>;
			},
		},
		{
			title: fields.distributor,
			dataIndex: 'supplierName',
			key: 'supplierName',
			width: 320,
			ellipsis: true,
		},
		{
			title: '结算金额(元)',
			dataIndex: 'totalPrice',
			key: 'totalPrice',
			align: 'right',
			width: 140,
			render: (text, record) => {
				return <span>{convertPriceWithDecimal(record.totalPrice) || '-'}</span>;
			},
		},
		{
			title: `${fields.distributor}复核`,
			dataIndex: 'reviewStatus',
			key: 'reviewStatus',
			width: 180,
			render: (text, record) => {
				if (!text) {
					return <span>-</span>;
				}
				return (
					<Badge
						color={(settlementSupllierReviewValueEnum[text] || {}).color}
						text={settlementSupllierReviewTextMap[text]}
					/>
				);
			},
		},
		// {
		//   title: '订单来源',
		//   dataIndex: 'type',
		//   key: 'type',
		//   width: 140,
		//   render: (text, record) => {
		//     return <span>{shippingOrderTypeTextMap[text] || '-'}</span>;
		//   },
		// },
		{
			title: '创建时间',
			dataIndex: 'timeCreated',
			key: 'state.time_created',
			width: 270,
			sorter: true,
			render: (text) => {
				return <span>{text ? moment(new Date(text)).format('YYYY/MM/DD HH:mm:ss') : '-'}</span>;
			},
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 280,
			fixed: 'right',
			render: (id, record) => {
				return (
					<div className='operation'>
						{permissions.includes('statement_view') && (
							<span
								className='handleLink'
								onClick={() => orderDetail(record, 'detail')}>
								查看
							</span>
						)}
						{record.status == 'commit_pending' && permissions.includes('submit_statement') && (
							<>
								<Divider
									type='vertical'
									className='mt_6'
								/>
								<span
									className='handleLink'
									onClick={() => orderDetail(record, 'commit')}>
									提交
								</span>
							</>
						)}
						{record.status == 'approval_pending' &&
							activeTab === 'custodians' &&
							permissions.includes('approval_statement') && (
								<>
									<Divider
										type='vertical'
										className='mt_6'
									/>
									<span
										className='handleLink'
										onClick={() => orderDetail(record, 'audit')}>
										审核
									</span>
								</>
							)}
						{!(
							global.config.is_online &&
							global.config.is_online === 'true' &&
							!record.invoiceSync &&
							record.type === 'online_order'
						) &&
							record.reviewStatus == 'review_pending' &&
							permissions.includes('review_statement') &&
							activeTab == 'suppliers' && (
								<>
									<Divider
										type='vertical'
										className='mt_6'
									/>
									<span
										className='handleLink'
										onClick={() => orderDetail(record, 'review')}>
										复核
									</span>
								</>
							)}
						{permissions.includes('download_statement') && (
							<>
								<Divider
									type='vertical'
									className='mt_6'
								/>
								<span
									className='handleLink'
									onClick={() => orderDownload(record)}>
									下载
								</span>
							</>
						)}
						{record.status == 'approval_success' &&
							permissions.includes('receipt_upload') &&
							activeTab == 'suppliers' && (
								<>
									<Divider
										type='vertical'
										className='mt_6'
									/>
									<span
										className='handleLink'
										onClick={(e) => uploadFile(record, e)}>
										上传发票
									</span>
								</>
							)}
						{/* {(record.status == 'approval_failure' ||
              record.reviewStatus === 'review_failure' ||
              record.status == 'commit_pending') &&
              permissions.includes('rebuild_statement') &&
              activeTab == 'custodians' && (
                <>
                  <Divider type="vertical" className="mt_6" />
                  <Popconfirm
                    title={'确定重新生成结算单吗'}
                    onConfirm={(e) => rebuildStatement(record, e)}
                  >
                    <span className="handleLink">重新生成</span>
                  </Popconfirm>
                </>
              )} */}
						{/* 打印功能 */}
						{permissions.includes('statement_print') && (
							<>
								<Divider
									type='vertical'
									className='mt_6'
								/>
								<PrintTarget
									url={api.settlement.print}
									params={{ id: record.id }}
								/>
							</>
						)}
					</div>
				);
			},
		},
	];

	const rowSelection = {
		selectedRowKeys: selectedRowKeys,
		onSelect: onRowClick,
		onSelectAll: onCheckAllChange,
		getCheckboxProps: (record) => ({
			disabled: record.status !== 'approval_pending',
		}),
	};

	const tableColumns =
		activeTab === 'suppliers'
			? removeColumItemByKey(
					columns,
					'committedName,committedTime,approvedName,approvedTime,totalPrice,status,reviewStatus',
			  )
			: columns;
	if (activeTab === 'suppliers')
		tableColumns.splice(1, 0, {
			title: `${fields.distributor}复核`,
			dataIndex: 'reviewStatus',
			key: 'reviewStatus',
			width: 180,
			render: (text, record) => {
				if (!text) {
					return <span>-</span>;
				}
				return (
					<Badge
						color={(settlementSupllierReviewValueEnum[text] || {}).color}
						text={settlementSupllierReviewTextMap[text]}
					/>
				);
			},
		});

	const tableInfoIds = {
		custodians: '60',
		suppliers: '61',
	};

	return (
		<div>
			<Breadcrumb config={['', '']} />
			<Card>
				<Tabs
					activeKey={activeTab}
					onChange={(key) => {
						form.resetFields();
						setActiveTab(key);
					}}
					animated={false}>
					{permissions.includes('custodian_settlement') ? (
						<TabPane
							key={'custodians'}
							tab={`一级${fields.distributor}`}></TabPane>
					) : null}
					{permissions.includes('supplier_settlement') ? (
						<TabPane
							key={'suppliers'}
							tab={fields.distributor}></TabPane>
					) : null}
				</Tabs>
				<Form
					form={form}
					onFinish={onFinishSearch}
					{...searchFormItem6}
					labelAlign='left'>
					<div className='searchWrap'>
						<Row className='searchForm'>
							<Row style={{ width: '100%' }}>
								<Col {...searchColItemSingle}>
									<FormItem
										name={activeTab === 'custodians' ? 'statusList' : 'reviewStatus'}
										label={activeTab === 'custodians' ? '状态' : `${fields.distributor}复核`}
										labelAlign='left'
										{...searchFormItemSingle6}>
										<TagSelect>
											{(activeTab === 'custodians'
												? ['operator', 'hospital'].includes(userType)
													? statementStatus
													: statementStatus.slice(1)
												: settlementSupllierReview.slice(1)
											).map((item) => {
												return (
													<TagSelect.Option
														key={item.value}
														value={item.value}>
														{item.label}
													</TagSelect.Option>
												);
											})}
										</TagSelect>
									</FormItem>
								</Col>
								<div className={expand ? basicStyles['boxWidth100'] : basicStyles['dis-n']}>
									<Row style={{ width: '100%' }}>
										{activeTab === 'custodians' ? (
											<Col {...searchColItemSingle}>
												<FormItem
													name='reviewStatus'
													label={`${fields.distributor}复核`}
													labelAlign='left'
													{...searchFormItemSingle6}>
													<TagSelect>
														{settlementSupllierReview.map((item) => {
															return (
																<TagSelect.Option
																	key={item.value}
																	value={item.value}>
																	{item.label}
																</TagSelect.Option>
															);
														})}
													</TagSelect>
												</FormItem>
											</Col>
										) : null}
										<Col {...searchColItemSingle}>
											<FormItem
												name='periodName'
												label='结算周期'
												labelAlign='left'
												{...searchFormItemSingle6}>
												<DatePickerMore
													format={['YYYY-MM-DD', 'YYYY/MM/DD']}
													type='M'
													picker='month'
													single={true}
													checkList={[
														{ text: '本月', key: 'currentMonth' },
														{ text: '上个月', key: 'lastMonth' },
													]}
												/>
											</FormItem>
										</Col>
										<Col {...searchColItemSingle}>
											<FormItem
												name='timeCreated'
												label='创建时间'
												labelAlign='left'
												{...searchFormItemSingle6}>
												<DatePickerMore
													format={['YYYY-MM-DD', 'YYYY/MM/DD']}
													type='M'
												/>
											</FormItem>
										</Col>
									</Row>
									<Row>
										<Col {...searchColItem}>
											<FormItem
												name='custodianIds'
												label={`一级${fields.distributor}`}
												labelAlign='left'
												{...searchFormItem6}>
												<Select
													mode='multiple'
													filterOption={(input, option) =>
														option.props.children
															.toLowerCase()
															.trim()
															.indexOf(input.toLowerCase().trim()) >= 0
													}
													placeholder='请选择'
													allowClear
													showArrow>
													{custodianList.map((item) => {
														return (
															<Select.Option
																value={item.id}
																key={item.id}>
																{item.companyName}
															</Select.Option>
														);
													})}
												</Select>
											</FormItem>
										</Col>
										<Col {...searchColItem}>
											<FormItem
												name='supplierIds'
												label={fields.distributor}
												labelAlign='left'>
												<Select
													mode='multiple'
													filterOption={(input, option) =>
														option.props.children
															.toLowerCase()
															.trim()
															.indexOf(input.toLowerCase().trim()) >= 0
													}
													placeholder='请选择'
													allowClear
													showArrow>
													{distributorOption.map((item) => {
														return (
															<Select.Option
																key={item.value}
																value={item.value}>
																{item.label}
															</Select.Option>
														);
													})}
												</Select>
											</FormItem>
										</Col>
										<Col {...searchColItem}>
											<FormItem
												name='no'
												label='结算单号'>
												<Input
													maxLength={30}
													placeholder='请输入'
												/>
											</FormItem>
										</Col>
										<Col {...searchColItem}>
											<FormItem
												name='name'
												label='名称'>
												<Input
													maxLength={30}
													placeholder='请输入'
												/>
											</FormItem>
										</Col>
										{activeTab === 'custodians' ? (
											<Col {...searchColItem}>
												<FormItem
													name='type'
													label='订单来源'>
													<Select
														allowClear
														placeholder='请选择'
														options={shippingOrderType}
													/>
												</FormItem>
											</Col>
										) : null}
									</Row>
								</div>
							</Row>
						</Row>
						<div className='searchBtn'>
							<Button
								type='primary'
								htmlType='submit'>
								查询
							</Button>
							<Button onClick={onResetSerach}>重置</Button>
							<a
								onClick={() => {
									setExpand(!expand);
								}}>
								{expand ? (
									<>
										收起 <UpOutlined />
									</>
								) : (
									<>
										展开 <DownOutlined />
									</>
								)}
							</a>
						</div>
					</div>
				</Form>
				<TableBox
					toolBarRender={() => [
						activeTab === 'custodians' && permissions.includes('approval_statement') && (
							<Button
								disabled={!selectedRowKeys.length || auditLoading}
								type='primary'
								onClick={batchAudit}>
								批量通过
							</Button>
						),
						activeTab === 'custodians' && permissions.includes('export_custodian_statement') && (
							<Button
								type='primary'
								onClick={exportSettlement}
								className='ml2'>
								导出
							</Button>
						),
					]}
					tableInfoId={tableInfoIds[activeTab]}
					options={{
						reload: () => fetchList({}),
					}}
					rowKey='id'
					dataSource={list}
					columns={calColumnsWidth(tableColumns, false)}
					scroll={{
						x: '100%',
						y: global.scrollY - 61,
					}}
					rowSelection={activeTab === 'custodians' ? rowSelection : false}
					loading={loading}
					onChange={(pagination, filter, sorter) => {
						const sortParams = Array.isArray(sorter)
							? sorter.map((item) => {
									return {
										desc: item.order === 'descend',
										sortName: item.columnKey,
									};
							  })
							: sorter.order
							? [
									{
										desc: sorter.order === 'descend',
										sortName: sorter.columnKey,
									},
							  ]
							: undefined;
						setSortList(sortParams);
						fetchList({ sortList: sortParams });
					}}
					tableAlertOptionRender={
						<a
							onClick={() => {
								setSelectedRowKeys([]);
								setSelectedList([]);
							}}>
							取消选择
						</a>
					}
				/>
				{total ? (
					<PaginationBox
						data={{ total, pageNum, pageSize }}
						pageChange={(cur: number, size: number) => fetchList({ pageNum: cur, pageSize: size })}
					/>
				) : null}
			</Card>
			<DetailModal
				singleSettlementInfo={singleSettlementInfo}
				modalVisible={modalVisible}
				setModalVisible={setModalVisible}
				handleType={handleType}
				fetchList={fetchList}
				activeTab={activeTab}
				resetSelected={resetSelected}
			/>
			<ReceiptModal
				singleSettlementInfo={singleSettlementInfo}
				modalVisible={receiptModalVisible}
				setModalVisible={setReceiptModalVisible}
			/>
			<ExportModal
				modalVisible={exportVisible}
				setModalVisible={setExportVisible}
			/>
		</div>
	);
};

export default connect(({ loading, settlement, global, user }) => ({
	loading: loading.effects['settlement/querySettlementList'],
	detailLoading: loading.effects['settlement/querySettlementDetails'],
	auditLoading: loading.effects['settlement/orderAudit'],
	settlement,
	global,
	currentUser: user.currentUser || {},
}))(Settlement);
