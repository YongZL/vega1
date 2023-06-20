import { DownOutlined, UpOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Card, Input, Col, Row, Select } from 'antd';
import React, { useState, useEffect } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import TagSelect from '@/components/TagSelect';
import DatePickerMore from '@/components/DatePickerMore';
import TableBox from '@/components/TableBox';
import PaginationBox from '@/components/Pagination';
import moment from 'moment';
import { useWarehouseList } from '@/hooks/useWarehouseList';
import AddModal from './component/add';
import DetailModal from './component/detail';
import { connect } from 'umi';
import { getDay } from '@/utils';

import { stockTakingStatus, stockTakingStatusValueEnum } from '@/constants/dictionary';
import {
	searchFormItemSingle4,
	searchFormItem4,
	searchColItemSingle,
	searchColItem,
} from '@/constants/formLayout';
import { getList } from './service';

const FormItem = Form.Item;

const TableList: React.FC<{}> = ({ global, ...props }) => {
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const [list, setList] = useState([]);
	const [sortList, setSortList] = useState([]);
	const [total, setTotal] = useState(0);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const [loading, setLoading] = useState<boolean>(false);
	const [showMore, setShowMore] = useState<boolean>(true);
	const [jumpSearch, setJumpSearch] = useState<boolean>(false);

	const [modalAddVisible, setModalAddVisible] = useState<boolean>(false);
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [orderId, setOrderId] = useState<object>({});
	const [stateCode, setStateCode] = useState<string | undefined>(undefined);
	const [sortedInfo, setSortedInfo] = useState({});
	const warehouseList = useWarehouseList({});
	const [isFirst, setIsFirst] = useState(true);

	const [form] = Form.useForm();

	const getSearchDate = () => {
		let formDate = form.getFieldsValue();
		const params = {
			...formDate,
			status: formDate.status && formDate.status[0] ? formDate.status.join(',') : undefined,
			createdFrom:
				formDate.timeCreated && formDate.timeCreated[0]
					? getDay(formDate.timeCreated[0])
					: undefined,
			createdTo:
				formDate.timeCreated && formDate.timeCreated[0]
					? getDay(formDate.timeCreated[1], 'end')
					: undefined,
		};
		delete params.timeCreated;
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
			if (code.indexOf('#') > -1) {
				let arr = code.split('#');
				code = arr[0];
				let status = arr[1];
				console.log(status);
				form.setFieldsValue({
					code,
					status: [status],
				});
			}
			getFormList({ code });
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
		return code;
	};
	// 消息
	const handleMsgPush = async () => {
		const { params } = props.match;
		if (params.id) {
			showDetail(params);
		}
	};

	useEffect(() => {
		// 设置主页跳转状态
		let code = getCode();
		if (!jumpSearch) {
			handleOrderCodeChange(code);
		} else {
			getFormList({});
		}
		handleMsgPush();
	}, []);

	// 详情弹窗
	const showDetail = (record: any) => {
		setModalVisible(true);
		setOrderId(record.id);
	};

	// 新增
	const showAdd = () => {
		setModalAddVisible(true);
	};

	let columns = [
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
			width: 200,
			copyable: true,
		},
		{
			title: '仓库',
			dataIndex: 'warehouseName',
			key: 'warehouseIds',
			width: 150,
		},
		{
			title: '实盘人',
			dataIndex: 'operator',
			key: 'operator',
			width: 120,
		},
		{
			title: '复盘人',
			dataIndex: 'reviewer',
			key: 'reviewer',
			width: 120,
		},
		{
			title: '监盘人',
			dataIndex: 'watcher',
			key: 'watcher',
			width: 120,
		},
		{
			title: '创建时间',
			dataIndex: 'timeCreated',
			key: 'time_created',
			width: 180,
			sorter: true,
			render: (time: number) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '结束时间',
			dataIndex: 'timeEnd',
			key: 'time_end',
			width: 180,
			sorter: true,
			render: (time: number) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
	];

	if (permissions.includes('stock_taking_order_view')) {
		columns.push({
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 100,
			fixed: 'right',
			render: (text, record) => {
				return (
					<div className='operation'>
						<span
							className='handleLink'
							onClick={() => showDetail(record)}>
							查看
						</span>
					</div>
				);
			},
		});
	}

	return (
		<div>
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
											{stockTakingStatus.map((item) => {
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
											label='创建时间'
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
										name='warehouseIds'
										label='仓库'>
										<Select
											showSearch
											allowClear
											optionFilterProp='children'
											placeholder='请选择'
											filterOption={(input, option: any) =>
												option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
											}>
											{warehouseList.map((item) => {
												return <Select.Option value={item.id}>{item.name}</Select.Option>;
											})}
										</Select>
									</FormItem>
								</Col>
								<Col {...searchColItem}>
									<FormItem
										name='code'
										label='盘库单号'>
										<Input
											maxLength={30}
											placeholder='请输入'
										/>
									</FormItem>
								</Col>
								<Col {...searchColItem}>
									<FormItem
										name='operator'
										label='实盘人'>
										<Input
											maxLength={30}
											placeholder='请输入'
										/>
									</FormItem>
								</Col>
								<Col {...searchColItem}>
									<FormItem
										name='reviewer'
										label='复盘人'>
										<Input
											maxLength={30}
											placeholder='请输入'
										/>
									</FormItem>
								</Col>
								<Col {...searchColItem}>
									<FormItem
										name='watcher'
										label='监盘人'>
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
						headerTitle='盘库列表'
						toolBarRender={() => [
							permissions.includes('add_stock_taking_order') && (
								<Button
									icon={<PlusOutlined style={{ marginLeft: -4 }} />}
									type='primary'
									onClick={showAdd}
									className='iconButton'>
									发起盘库
								</Button>
							),
						]}
						tableInfoId='33'
						options={{
							reload: () => getFormList({}),
						}}
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

			<AddModal
				isOpen={modalAddVisible}
				setIsOpen={setModalAddVisible}
				getFormList={getFormList}
			/>

			<DetailModal
				isOpen={modalVisible}
				setIsOpen={setModalVisible}
				orderId={orderId}
				getFormList={getFormList}
			/>
		</div>
	);
};

export default connect(({ global }) => ({ global }))(TableList);
