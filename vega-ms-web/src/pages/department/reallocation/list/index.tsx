import { DownOutlined, UpOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Card, Input, Col, Row, Select } from 'antd';
import { Link, connect, history } from 'umi';
import React, { useState, useEffect } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import TagSelect from '@/components/TagSelect';
import DatePickerMore from '@/components/DatePickerMore';
import TableBox from '@/components/TableBox';
import PaginationBox from '@/components/Pagination';
import Print from '@/components/print';
import Target from '@/components/print/reallocation';
import { getUrlParam } from '@/utils';
import moment from 'moment';
import { useWarehouseListAll } from '@/hooks/useWarehouseList';
import DetailModal from './component/detail';
import { getDay } from '@/utils';

import { getList } from './service';
import style from './index.less';
import api from '@/constants/api';
import { reallocationStatus, reallocationStatusValueEnum } from '@/constants/dictionary';
import {
	searchFormItemSingle4,
	searchFormItem4,
	searchColItemSingle,
	searchColItem,
} from '@/constants/formLayout';

const FormItem = Form.Item;

const PrintTarget = Print(Target);

const TableList: React.FC<{}> = ({ global, ...props }) => {
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const [list, setList] = useState([]);
	const [sortList, setSortList] = useState([]);
	const [total, setTotal] = useState(0);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const [loading, setLoading] = useState<boolean>(false);
	const [showMore, setShowMore] = useState<boolean>(true);
	const [jumpSearch, setJumpSearch] = useState<boolean>(false);

	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [orderId, setOrderId] = useState<string>('');
	const [handleType, setHandleType] = useState<string>('');
	const [stateCode, setStateCode] = useState<string | undefined>(undefined);
	const [sortedInfo, setSortedInfo] = useState({});
	const [isFirst, setIsFirst] = useState(true);

	const warehouseList = useWarehouseListAll();

	const [form] = Form.useForm();

	const getSearchDate = () => {
		let formDate = form.getFieldsValue();
		const params = {
			statusList: formDate.status && formDate.status[0] ? formDate.status.join(',') : undefined,
			sourceWarehouseIds:
				formDate.sourceWarehouseIds && formDate.sourceWarehouseIds.length
					? formDate.sourceWarehouseIds.join(',')
					: undefined,
			targetWarehouseIds:
				formDate.targetWarehouseIds && formDate.targetWarehouseIds.length
					? formDate.targetWarehouseIds.join(',')
					: undefined,
			createdFrom:
				formDate.timeCreated && formDate.timeCreated[0]
					? getDay(formDate.timeCreated[0])
					: undefined,
			createdTo:
				formDate.timeCreated && formDate.timeCreated[0]
					? getDay(formDate.timeCreated[1], 'end')
					: undefined,
			approvedFrom:
				formDate.timeAccepted && formDate.timeAccepted[0]
					? getDay(formDate.timeAccepted[0])
					: undefined,
			approvedTo:
				formDate.timeAccepted && formDate.timeAccepted[0]
					? getDay(formDate.timeAccepted[1], 'end')
					: undefined,
			...formDate,
		};
		delete params.status;
		delete params.timeCreated;
		delete params.timeAccepted;
		return params;
	};

	// 列表
	const getFormList = async (param: any) => {
		setIsFirst(false);
		const params = {
			sortList,
			...pageConfig,
			...getSearchDate(),
			...param,
		};
		setLoading(true);
		const res = await getList(params);
		if (res && res.code === 0) {
			setList(res.data.rows);
			setTotal(res.data.totalCount);
			setPageConfig({ pageNum: res.data.pageNum, pageSize: res.data.pageSize });
		}
		setLoading(false);
	};

	// 重置
	const resetSerach = () => {
		form.resetFields();
		setSortList(undefined);
		setSortedInfo({});
		getFormList({ pageNum: 0, sortList: {} });
	};

	// 排序
	const handleChangeTable = (pagination: any, filter: any, sorter: any) => {
		setSortedInfo(sorter);
		const sorters =
			sorter.order == null
				? []
				: [{ desc: sorter.order === 'descend', sortName: sorter.columnKey }];
		setSortList(sorters);
		getFormList({ sortList: sorters, pageNum: 0 });
	};

	// 拆分全局搜索参数
	const handleOrderCodeChange = (code) => {
		setStateCode(code);
		if (code) {
			let status;
			if (code.indexOf('#') > -1) {
				let arr = code.split('#');
				code = arr[0];
				status = arr[1];
				form.setFieldsValue({
					code,
					status: [status],
				});
			} else if (code.indexOf('status') > -1) {
				status = getUrlParam(code, 'status');
				form.setFieldsValue({
					status: status.split(','),
				});
			}
			getFormList({ statusList: status });
			setJumpSearch(true);
		} else {
			// getFormList({});
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
		const code = getCode();
		if (!jumpSearch) {
			handleOrderCodeChange(code);
		} else {
			getFormList({});
		}
	}, []);
	useEffect(() => {
		if (window.location.hash) {
			const code = getCode();
			handleOrderCodeChange(code);
		}
	}, [window.location.hash]);

	const showDetail = (record: object, type: string) => {
		setModalVisible(true);
		setHandleType(type);
		setOrderId(record.id);
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
			key: 'status',
			width: 110,
			filters: false,
			valueEnum: reallocationStatusValueEnum,
		},
		{
			title: '调拨单号',
			dataIndex: 'code',
			key: 'code',
			width: 230,
			copyable: true,
		},
		{
			title: '发起仓库',
			dataIndex: 'sourceWarehouseName',
			key: 'sourceWarehouseId',
			width: 160,
			ellipsis: true,
		},
		{
			title: '接收仓库',
			dataIndex: 'targetWarehouseName',
			key: 'targetWarehouseId',
			width: 160,
			ellipsis: true,
		},
		{
			title: '申请人',
			dataIndex: 'createdName',
			key: 'createdName',
			width: 120,
		},
		{
			title: '申请时间',
			dataIndex: 'timeCreated',
			key: 'timeCreated',
			width: 180,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'timeCreated' && sortedInfo.order,
			render: (time) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '验收人员',
			dataIndex: 'acceptedName',
			key: 'acceptedName',
			width: 120,
		},
		{
			title: '验收时间',
			dataIndex: 'timeAccepted',
			key: 'timeAccepted',
			width: 180,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'timeAccepted' && sortedInfo.order,
			render: (time) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '操作',
			dataIndex: 'option',
			valueType: 'option',
			width: 152,
			fixed: 'right',
			render: (_, record) => (
				<div className='operation'>
					{permissions.includes('warehouse_request_view') && (
						<a onClick={() => showDetail(record, 'detail')}>查看</a>
					)}
					{/* containedDepartment 标识是否为接收科室的人 */}
					{record.status === 'approve_pending' &&
						permissions.includes('warehouse_request_approval') &&
						record.containedDepartment && (
							<>
								<Divider type='vertical' />
								<a onClick={() => showDetail(record, 'approve')}>审核</a>
							</>
						)}
					{['accept_pending', 'accepting'].includes(record.status) &&
						permissions.includes('warehouse_request_accept') &&
						record.containedDepartment && (
							<>
								<Divider type='vertical' />
								<a onClick={() => showDetail(record, 'acceptance')}>验收</a>
							</>
						)}
					{permissions.includes('warehouse_request_print') && record.timeDelivered && (
						<>
							<Divider type='vertical' />
							<PrintTarget
								url={api.reallocation.getDetails}
								params={{ reallocateId: record.id }}
							/>
						</>
					)}
				</div>
			),
		},
	];

	return (
		<div className={style.reallocationWrap}>
			<Breadcrumb config={['', '']} />
			<Form
				form={form}
				onFinish={() => getFormList({ pageNum: 0 })}
				{...searchFormItem4}
				labelAlign='left'>
				<Card bordered={false}>
					<div className='searchWrap'>
						<Row className='searchForm'>
							<Row style={{ width: '100%' }}>
								<Col {...searchColItemSingle}>
									<FormItem
										name='status'
										label='状态'
										{...searchFormItemSingle4}>
										<TagSelect>
											{reallocationStatus.map((item) => {
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
							</Row>
							<Row className={showMore ? '' : 'dis-n'}>
								<Row style={{ width: '100%' }}>
									<Col {...searchColItemSingle}>
										<FormItem
											name='timeCreated'
											label='申请时间'
											{...searchFormItemSingle4}>
											<DatePickerMore
												format={['YYYY-MM-DD', 'YYYY/MM/DD']}
												isToday={true}
											/>
										</FormItem>
									</Col>
								</Row>
								<Row style={{ width: '100%' }}>
									<Col {...searchColItemSingle}>
										<FormItem
											name='timeAccepted'
											label='验收时间'
											{...searchFormItemSingle4}>
											<DatePickerMore
												format={['YYYY-MM-DD', 'YYYY/MM/DD']}
												isToday={true}
											/>
										</FormItem>
									</Col>
								</Row>
								<Col {...searchColItem}>
									<FormItem
										name='sourceWarehouseIds'
										label='发起仓库'>
										<Select
											showSearch
											allowClear
											optionFilterProp='children'
											placeholder='请选择'
											filterOption={(input, option) =>
												option.props.key.toLowerCase().indexOf(input.toLowerCase()) >= 0
											}>
											{warehouseList.map((item) => {
												return (
													<Select.Option
														value={item.id}
														key={(item.nameAcronym || '') + '' + item.name}>
														{item.name}
													</Select.Option>
												);
											})}
										</Select>
									</FormItem>
								</Col>
								<Col {...searchColItem}>
									<FormItem
										name='targetWarehouseIds'
										label='接收仓库'>
										<Select
											showSearch
											allowClear
											optionFilterProp='children'
											placeholder='请选择'
											filterOption={(input, option) =>
												option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
											}>
											{warehouseList.map((item) => {
												return (
													<Select.Option
														value={item.id}
														key={item.id}>
														{item.name}
													</Select.Option>
												);
											})}
										</Select>
									</FormItem>
								</Col>
								<Col {...searchColItem}>
									<FormItem
										name='createdName'
										label='申请人'>
										<Input
											maxLength={30}
											placeholder='请输入'
										/>
									</FormItem>
								</Col>
								<Col {...searchColItem}>
									<FormItem
										name='code'
										label='调拨单号'>
										<Input
											maxLength={30}
											placeholder='请输入'
										/>
									</FormItem>
								</Col>
							</Row>
						</Row>
						<div className='searchBtn'>
							<Button
								type='primary'
								htmlType='submit'>
								查询
							</Button>
							<Button onClick={resetSerach}>重置</Button>
							<a onClick={() => setShowMore(!showMore)}>
								{showMore ? (
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
					<TableBox
						isFirst={isFirst}
						headerTitle='科室调拨列表'
						toolBarRender={() => [
							permissions.includes('warehouse_request_add_apply') && (
								<Button
									icon={<PlusOutlined />}
									type='primary'
									onClick={() => {
										history.push('/department/reallocation/add');
									}}>
									发起调拨
								</Button>
							),
						]}
						rowKey='id'
						columns={columns}
						dataSource={list}
						scroll={{
							x: '100%',
							y: global.scrollY,
						}}
						loading={loading}
						onChange={handleChangeTable}
					/>
					{total > 0 && (
						<PaginationBox
							data={{ total, ...pageConfig }}
							pageChange={(pageNum: number, pageSize: number) => getFormList({ pageNum, pageSize })}
						/>
					)}
				</Card>
			</Form>

			<DetailModal
				isOpen={modalVisible}
				setIsOpen={setModalVisible}
				handleType={handleType}
				orderId={orderId}
				getFormList={getFormList}
			/>
		</div>
	);
};

export default connect(({ global }) => ({ global }))(TableList);
