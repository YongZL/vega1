import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import PaginationBox from '@/components/Pagination';
import TableBox from '@/components/TableBox';
import api from '@/constants/api';
import { logicStockOperationTypeTextMap } from '@/constants/dictionary';
import { getDay } from '@/utils';
import { formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Badge, Card, Form } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect, useModel } from 'umi';
import FormSearch from './formSearch';
import { queryProcess, queryRule } from './service';

const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');

const PickingList: React.FC<{}> = ({ global }) => {
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [list, setList] = useState([]);
	const [timeParams, setTimeParams] = useState({});
	const [total, setTotal] = useState(0);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const [sortedInfo, setSortedInfo] = useState({});
	// 同步操作
	const handleProcess = async (id) => {
		let res = await queryProcess({ stockOperationId: id });
		if (res && res.code === 0) {
			notification.success('操作成功');
			getFormList({});
		}
	};

	const getSearchDate = () => {
		const values = form.getFieldsValue();
		const params = {
			...values,
			warehouseIds: values.warehouseId || undefined,
			createdFrom:
				values.submitTime && values.submitTime.length && values.submitTime[0]
					? getDay(values.submitTime[0])
					: undefined,
			createdTo:
				values.submitTime && values.submitTime.length && values.submitTime[1]
					? getDay(values.submitTime[1], 'end')
					: undefined,
			handleResult: values.succeeded,
		};
		delete params.warehouseId;
		delete params.submitTime;
		delete params.succeeded;
		return params;
	};

	// 请求列表
	const getFormList = async (param: any) => {
		const params = {
			...pageConfig,
			...getSearchDate(),
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
	// 查询参数变化后更新列表
	useEffect(() => {
		getFormList({});
	}, []);

	// 排序
	const handleChangeTable = (pagination: any, filter: any, sorter: any) => {
		setSortedInfo(sorter);
		const params = {
			sortList:
				sorter.order == null
					? undefined
					: [{ desc: sorter.order === 'descend', sortName: sorter.columnKey }],
		};
		setTimeParams({ ...params });
		getFormList({ ...params });
	};
	const reSetFormSearch = () => {
		setSortedInfo({});
		setTimeParams({});
		getFormList({ pageNum: 0 });
	};
	const columns = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			render: (text, redord, index) => <span>{index + 1}</span>,
			width: 60,
		},
		{
			title: '同步结果',
			dataIndex: 'succeeded',
			width: 100,
			render: (text, record) => {
				return (
					<span>
						{text || record.processed ? (
							<Badge
								color={CONFIG_LESS['@c_starus_done']}
								text='成功'
							/>
						) : (
							<Badge
								color={CONFIG_LESS['@c_starus_disabled']}
								text='失败'
							/>
						)}
					</span>
				);
			},
		},
		{
			title: '科室',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 120,
			ellipsis: true,
		},
		{
			title: '仓库',
			dataIndex: 'warehouseName',
			key: 'warehouseName',
			width: 120,
			ellipsis: true,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 140,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 180,
			render: (text: any, record: Record<string, any>) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '类型',
			dataIndex: 'type',
			key: 'type',
			ellipsis: true,
			width: 120,
			render: (text) => {
				return <span>{logicStockOperationTypeTextMap[text]}</span>;
			},
		},
		{
			title: '数量',
			dataIndex: 'changeQuantity',
			key: 'changeQuantity',
			width: 80,
		},
		{
			title: '创建时间',
			dataIndex: 'timeCreated',
			key: 'wlso.time_created',
			width: 170,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'wlso.time_created' && sortedInfo.order,
			render: (time: any) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '操作时间',
			dataIndex: 'timeProcessed',
			key: 'wlso.time_processed',
			width: 170,
			sorter: true,
			render: (time: any) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '操作人',
			dataIndex: 'processedByName',
			key: 'processedByName',
			width: 120,
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			fixed: 'right',
			width: 62,
			render: (id, record) => {
				return record.succeeded || record.processed ? null : (
					<div className='operation'>
						<span
							className='handleLink'
							onClick={() => {
								handleProcess(record.id);
							}}>
							同步
						</span>
					</div>
				);
			},
		},
	];

	return (
		<div>
			<Breadcrumb config={['', '']} />
			<Card bordered={false}>
				<FormSearch
					searchTabeList={getFormList}
					reSetFormSearch={reSetFormSearch}
					form={form}
				/>
				<TableBox
					toolBarRender={() => [
						permissions.includes('logic_stock_operation_export') && (
							<ExportFile
								data={{
									filters: { ...getSearchDate() },
									link: api.logic_stock_operation.export,
									getForm: getSearchDate,
								}}
							/>
						),
					]}
					tableInfoId='106'
					options={{
						reload: () => getFormList({}),
					}}
					rowKey='id'
					scroll={{
						x: '100%',
						y: global.scrollY,
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
		</div>
	);
};

export default connect(({ global }) => ({ global }))(PickingList);
