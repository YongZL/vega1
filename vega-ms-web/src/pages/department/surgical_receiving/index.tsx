import Breadcrumb from '@/components/Breadcrumb';
import DatePickerMore from '@/components/DatePickerMore';
import PaginationBox from '@/components/Pagination';
import Print from '@/components/print';
import Target from '@/components/print/delivery_order';
import TableBox from '@/components/TableBox';
import TagSelect from '@/components/TagSelect';
import { useDistributorList } from '@/hooks/useDistributorList';
import { calColumnsWidth } from '@/utils';
import request from '@/utils/request';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Col, Divider, Form, Input, Row, Select } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { connect, useModel } from 'umi';
import DetailModal from './Detail';

import basicStyles from '@/assets/style/basic.less';
import api from '@/constants/api';
import {
	receivingReportStatus,
	receivingReportStatusTextMap,
	receivingReportStatusValueEnum,
} from '@/constants/dictionary';
import {
	searchColItem,
	searchColItemSingle,
	searchFormItem4,
	searchFormItemSingle4,
	searchFormItemSingle6,
} from '@/constants/formLayout';

const PrintTarget = Print(Target);

const FormItem = Form.Item;

const SurgicalReceiving = ({ loading, surgicalReceiving, dispatch, global, ...props }) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [sortList, setSortList] = useState<Array<any> | undefined>(undefined);
	const [singleRecevingInfo, setSingleRecevingInfo] = useState({});
	const [handleType, setHandleType] = useState('view');
	const [expand, setExpand] = useState(true);
	const [stateCode, setStateCode] = useState<string | undefined>(undefined);
	const [jumpSearch, setJumpSearch] = useState<boolean>(false);
	const { pageNum, pageSize, total, list } = surgicalReceiving;
	const [form] = Form.useForm();
	const distributorOption = useDistributorList();
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const [sortedInfo, setSortedInfo] = useState({});
	const { fields } = useModel('fieldsMapping');

	// 拆分全局搜索参数
	const handleOrderCodeChange = (code) => {
		setStateCode(code);
		if (code) {
			if (code.indexOf('#') > -1) {
				let arr = code.split('#');
				code = arr[0];
				let status = arr[1];
				form.setFieldsValue({
					receivingCode: code,
					status: [status],
				});
			}
			fetchReceivingList({ receivingCode: code });
			setJumpSearch(true);
		} else {
			fetchReceivingList();
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

	useEffect(() => {
		// 设置主页跳转状态
		let code = getCode();
		if (!jumpSearch) {
			handleOrderCodeChange(code);
		} else {
			fetchReceivingList();
		}
		handleMsgPush();
	}, []);

	const handleMsgPush = async () => {
		// 配送单消息推送
		const { params } = props.match;
		if (params.id) {
			const { id } = params;
			const res = await request(api.order_delivery.print, {
				params: { shippingOrderId: id },
			});
			const { summary } = res.data;
			// 验收单，配货单，配送单，盘货单 一定是只读的
			orderDetail(summary, 'view');
		}
	};

	const fetchReceivingList = (params = {}) => {
		const searchParams = convertSearchParams(form.getFieldsValue());
		dispatch({
			type: 'surgicalReceiving/queryReceivingList',
			payload: {
				pageNum,
				pageSize,
				...searchParams,
				sortList,
				...params,
				surgicalRequest: true,
			},
		});
	};

	const orderDetail = async (record, type) => {
		setModalVisible(true);
		setSingleRecevingInfo(record);
		setHandleType(type);
		if (type === 'detail' || type === 'accept') {
			dispatch({
				type: 'surgicalReceiving/queryReceivingDetail',
				payload: {
					receivingOrderId: record.receivingId,
				},
			});
		} else {
			dispatch({
				type: 'surgicalReceiving/queryBarcodeDetial',
				payload: {
					receivingOrderId: record.receivingId,
				},
			});
		}
	};

	// 表单搜索
	const onFinishSearch = () => {
		fetchReceivingList({ pageNum: 0, pageSize: 50 });
	};

	// 表单搜索重置
	const onResetSerach = () => {
		form.resetFields();
		setSortList(undefined);
		setSortedInfo({});
		fetchReceivingList({ pageNum: 0, pageSize: 50, sortList: undefined });
	};

	// 转化表单数据为后端所需参数格式
	const convertSearchParams = (values: any) => {
		let params = {
			statusList: values.status,
			receivingCode: values.receivingCode,
			shippingCode: values.shippingCode,
			supplierId: values.supplierId,
			actualAcceptanceFrom: values.actualAcceptanceTime
				? values.actualAcceptanceTime[0].valueOf()
				: undefined,
			actualAcceptanceTo: values.actualAcceptanceTime
				? values.actualAcceptanceTime[1].valueOf()
				: undefined,
		};
		return params;
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
			width: 100,
			render: (text) => {
				return (
					<span>
						<Badge color={(receivingReportStatusValueEnum[text] || {}).color} />
						{receivingReportStatusTextMap[text]}
					</span>
				);
			},
		},
		{
			title: '验收单号',
			dataIndex: 'receivingCode',
			key: 'receivingCode',
			width: 260,
			copyable: true,
		},
		{
			title: '配送单号',
			dataIndex: 'shippingCode',
			key: 'shippingCode',
			width: 260,
			copyable: true,
		},
		{
			title: fields.distributor,
			dataIndex: 'supplierName',
			key: 'supplierName',
			width: 220,
			ellipsis: true,
		},
		{
			title: '科室',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '送货员',
			dataIndex: 'deliveryUserName',
			key: 'deliveryUserName',
			width: 120,
		},
		{
			title: '预计验收日期',
			dataIndex: 'expectDeliveryDate',
			width: 120,
			key: 'expectDeliveryDate',
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'expectDeliveryDate' && sortedInfo.order,
			render: (text) => {
				return <span>{text ? moment(text).format('YYYY/MM/DD') : ''}</span>;
			},
		},
		{
			title: '验收人员',
			dataIndex: 'inspectorName',
			key: 'inspectorName',
			width: 120,
		},
		{
			title: '实际验收日期',
			dataIndex: 'actualAcceptanceDate',
			key: 'actualAcceptanceDate',
			width: 160,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'actualAcceptanceDate' && sortedInfo.order,
			render: (text) => {
				return <span>{text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : ''}</span>;
			},
		},
		{
			title: '操作',
			dataIndex: 'receivingId',
			key: 'receivingId',
			width: 152,
			fixed: 'right',
			render: (receivingId, record) => {
				return (
					<div
						className='operation'
						style={{ display: 'flex' }}
						onClick={(e) => e.stopPropagation()}>
						{permissions.includes('surgical_receiving_view') ? (
							<span
								className='handleLink'
								onClick={() => orderDetail(record, 'detail')}>
								查看
							</span>
						) : null}
						{record.shippingOrderStatus !== 'delivering' &&
							['pending', 'receiving'].includes(record.status) &&
							permissions.includes('surgical_receiving_check') &&
							record.surgicalPackageSelected && (
								<>
									<Divider
										type='vertical'
										className='mt_6'
									/>
									<span
										className='handleLink'
										onClick={() => orderDetail(record, 'accept')}>
										验收
									</span>
								</>
							)}
						{record.shippingOrderStatus !== 'delivering' &&
							['partial_pass', 'all_pass'].includes(record.status) &&
							permissions.includes('surgical_receiving_coding') && (
								<>
									<Divider
										type='vertical'
										className='mt_6'
									/>
									<span
										className='handleLink'
										onClick={() => orderDetail(record, 'tagging')}>
										赋码
									</span>
								</>
							)}
						{/* 打印功能 */}
						{record.shippingOrderStatus !== 'delivering' &&
							!['pending', 'receiving'].includes(record.status) &&
							permissions.includes('surgical_receiving_print') && (
								<>
									<Divider
										type='vertical'
										className='mt_6'
									/>
									<PrintTarget
										url={api.receiving.print}
										params={{ receivingOrderId: receivingId }}
									/>
								</>
							)}
					</div>
				);
			},
		},
	];

	return (
		<div>
			<Breadcrumb config={['', '']} />
			<Card
				bordered={false}
				className='list-card'>
				<Form
					form={form}
					onFinish={onFinishSearch}
					labelAlign='left'
					{...searchFormItem4}>
					<div className='searchWrap'>
						<Row className='searchForm'>
							<Row style={{ width: '100%' }}>
								<Col {...searchColItemSingle}>
									<FormItem
										name='status'
										label='状态'
										{...searchFormItemSingle4}>
										<TagSelect>
											{receivingReportStatus.map((item) => {
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
										<Col {...searchColItemSingle}>
											<FormItem
												name='actualAcceptanceTime'
												label='实际验收时间'
												{...searchFormItemSingle6}>
												<DatePickerMore
													format={['YYYY-MM-DD', 'YYYY/MM/DD']}
													type='L'
												/>
											</FormItem>
										</Col>
									</Row>
									<Row>
										<Col {...searchColItem}>
											<FormItem
												name='supplierId'
												label={fields.distributor}>
												<Select
													filterOption={(inputValue, option) =>
														option.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
													}
													allowClear
													showSearch
													placeholder='请选择'>
													{distributorOption.map((item: any) => {
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
												name='receivingCode'
												label='验收单号'>
												<Input
													maxLength={30}
													placeholder='请输入'
												/>
											</FormItem>
										</Col>
										<Col {...searchColItem}>
											<FormItem
												name='shippingCode'
												label='配送单号'>
												<Input
													maxLength={30}
													placeholder='请输入'
												/>
											</FormItem>
										</Col>
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
							<a onClick={() => setExpand(!expand)}>
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
					tableInfoId='43'
					options={{
						reload: () => fetchReceivingList({}),
					}}
					rowKey='id'
					dataSource={list}
					columns={calColumnsWidth(columns, false)}
					scroll={{
						x: '100%',
						y: global.scrollY + 7,
					}}
					loading={loading}
					onChange={(pagination, filter, sorter) => {
						setSortedInfo(sorter);
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
						fetchReceivingList({ sortList: sortParams });
					}}
				/>
				{total ? (
					<PaginationBox
						data={{ total, pageNum, pageSize }}
						pageChange={(cur: number, size: number) =>
							fetchReceivingList({ pageNum: cur, pageSize: size })
						}
					/>
				) : null}
				<DetailModal
					modalVisible={modalVisible}
					setModalVisible={setModalVisible}
					singleRecevingInfo={singleRecevingInfo}
					handleType={handleType}
					getList={fetchReceivingList}
				/>
			</Card>
		</div>
	);
};

export default connect(
	({
		loading,
		surgicalReceiving,
		global,
	}: {
		global: any;
		surgicalReceiving: any;
		loading: { effects: { [key: string]: boolean } };
	}) => ({
		surgicalReceiving,
		global,
		submitting: loading.effects['surgicalReceiving/batchPass'],
		loading: loading.effects['surgicalReceiving/queryReceivingList'],
	}),
)(SurgicalReceiving);
