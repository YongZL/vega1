import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import PaginationBox from '@/components/Pagination';
import Print from '@/components/print';
import Target from '@/components/print/dueIn_goodsAndMaterials';
import TableBox from '@/components/TableBox';
import { pickingPendingSourceTextMap } from '@/constants/dictionary';
import { getDay } from '@/utils';
import { Card, Form } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect, useModel } from 'umi';
import FormSearch from './formSearch';

import api from '@/constants/api';
import { queryRule } from './service';
import { formatStrConnect } from '@/utils/format';

const PickingList: React.FC<{}> = ({ global }) => {
	const { fields } = useModel('fieldsMapping');
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const [loading, setLoading] = useState<boolean>(false);
	const [list, setList] = useState([]);
	const [searchParams, setSearchParams] = useState({
		type: 'goods',
		status: 'generate_pick_order_pending',
	});
	const [timeParams, setTimeParams] = useState({});
	const [total, setTotal] = useState(0);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const [sortedInfo, setSortedInfo] = useState({});
	const [isFirst, setIsFirst] = useState(true);
	const [departmentList, setDepartmentList] = useState([]);
	const [form] = Form.useForm();
	const [isExportFile, setIsExportFile] = useState(false);
	const PrintTarget = Print(Target);
	const getSearchDate = () => {
		const filters = form.getFieldsValue();
		const params = {
			...filters,
			start:
				filters.timeCreated && filters.timeCreated.length && filters.timeCreated[0]
					? getDay(filters.timeCreated[0])
					: undefined,
			end:
				filters.timeCreated && filters.timeCreated.length && filters.timeCreated[1]
					? getDay(filters.timeCreated[1], 'end')
					: undefined,
		};
		delete params.timeCreated;
		return params;
	};
	//请求列表
	const getFormList = async (param: any) => {
		const params = {
			...pageConfig,
			// ...getSearchDate(),
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
	};
	const reSetFormSearch = (value: React.SetStateAction<{ type: string; status: string }>) => {
		setSortedInfo({});
		setTimeParams({});
		setSearchParams({ ...value });
		setIsFirst(false);
	};
	//查询参数变化后更新列表
	useEffect(() => {
		if (!isFirst) {
			getFormList({});
		}
	}, [searchParams, timeParams, isFirst]);
	//更新查询表单
	const searchTabeList = (value: Object) => {
		let newIndex = value.type == 'goods' ? '1' : value.type == 'package_bulk' ? '2' : '3';
		setCurrentIndex(newIndex);
		setSearchParams({ ...value });
		setIsFirst(false);
	};
	// Tab切换索引
	const [currentIndex, setCurrentIndex] = useState('1');
	// 抛物小球终点坐标
	const [ballsTarget, setBallsTarget] = useState({ sx: 1340, sy: 390 });
	// 计算抛物小球终点位置
	useEffect(() => {
		setBallsTarget(ballsTarget);
	}, []);
	/* ========== Derived State ========== */
	/* ========== CRUD ========== */
	const columnsGoods = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 80,
			render: (text: any, record: any, index: number) => {
				return <span>{index + 1}</span>;
			},
		},
		// {
		//   title: '状态',
		//   dataIndex: 'status',
		//   width: 100,
		//   render: (text: string | number) => {
		//     return (
		//       <>
		//         <Badge color={approvaStatus[text].color} text={approvaStatus[text].text} />
		//       </>
		//     );
		//   },
		// },
		{
			title: '推送科室',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 130,
			hideInSearch: true,
			show: true,
			ellipsis: true,
			// sorter: true,
			// sortOrder: sortedInfo.columnKey == 'departmentName' && sortedInfo.order,
		},
		{
			title: '推送仓库',
			dataIndex: 'warehouseName',
			width: 130,
			ellipsis: true,
		},
		{
			title: '货位号',
			dataIndex: 'locationNo',
			width: 120,
			ellipsis: true,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			width: 130,
		},
		{
			title: fields.goodsName,
			dataIndex: currentIndex == '2' ? 'packageBulkName' : 'goodsName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '通用名',
			dataIndex: 'commonName',
			key: 'commonName',
			width: 100,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			render: (text: any, record: { specification: any; model: any }) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '配货数量  ',
			dataIndex: 'quantity',
			width: 100,
			render: (text: any, record: { packageBulkUnit: any; unit: any }) => {
				let nowText = currentIndex == '2' ? record.packageBulkUnit : record.unit;
				return <span>{text + nowText}</span>;
			},
		},

		{
			title: '来源',
			dataIndex: 'source',
			width: 100,
			render: (text: any) => {
				return <span>{pickingPendingSourceTextMap[text]}</span>;
			},
		},
		{
			title: '提交时间',
			dataIndex: 'timeCreated',
			key: 'pick.time_created',
			width: 180,
			hideInSearch: true,
			show: true,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'pick.time_created' && sortedInfo.order,
			render: (time: any) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
	];
	const columnsBulk = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 80,
			render: (text: any, record: any, index: number) => {
				return <span>{index + 1}</span>;
			},
		},
		// {
		//   title: '状态',
		//   dataIndex: 'status',
		//   width: 100,
		//   render: (text: string | number) => (
		//     <Badge color={approvaStatus[text].color} text={approvaStatus[text].text} />
		//   )
		// },
		{
			title: '推送科室',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 130,
			hideInSearch: true,
			show: true,
			ellipsis: true,
			// sorter: true,
			// sortOrder: sortedInfo.columnKey == 'departmentName' && sortedInfo.order,
		},
		{
			title: '推送仓库',
			dataIndex: 'warehouseName',
			width: 130,
			ellipsis: true,
		},
		{
			title: '货位号',
			dataIndex: 'locationNo',
			width: 120,
			ellipsis: true,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			width: 130,
		},
		{
			title: '定数包名称',
			dataIndex: 'packageBulkName',
			width: 150,
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 180,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			render: (text: any, record: { specification: any; model: any }) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '包装数',
			dataIndex: 'packageBulkUnitNum',
			key: 'packageBulkUnitNum',
			align: 'center',
			width: 100,
			render: (text: any, record: { unit: any; packageBulkUnit: any }) => {
				return <span>{`${text + record.unit}/${record.packageBulkUnit}`}</span>;
			},
		},
		{
			title: '配货数量  ',
			dataIndex: 'quantity',
			width: 100,
			render: (text: any, record: { packageBulkUnit: any; unit: any }) => {
				let nowText = currentIndex == '2' ? record.packageBulkUnit : record.unit;
				return <span>{text + nowText}</span>;
			},
		},
		{
			title: '来源',
			dataIndex: 'source',
			width: 100,
			render: (text: any) => {
				return <span>{pickingPendingSourceTextMap[text]}</span>;
			},
		},
		{
			title: '提交时间',
			dataIndex: 'timeCreated',
			key: 'pick.time_created',
			width: 180,
			hideInSearch: true,
			show: true,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'pick.time_created' && sortedInfo.order,
			render: (time: any) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
	];
	const columnsOrdinary = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 80,
			render: (text: any, record: any, index: number) => {
				return <span>{index + 1}</span>;
			},
		},
		// {
		//   title: '状态',
		//   dataIndex: 'status',
		//   width: 100,
		//   render: (text: string | number) => {
		//     return (
		//       <>
		//         <Badge color={approvaStatus[text].color} text={approvaStatus[text].text} />
		//       </>
		//     );
		//   },
		// },
		{
			title: '推送科室',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 130,
			hideInSearch: true,
			show: true,
			ellipsis: true,
			// sorter: true,
			// sortOrder: sortedInfo.columnKey == 'departmentName' && sortedInfo.order,
		},
		{
			title: '推送仓库',
			dataIndex: 'warehouseName',
			width: 130,
			ellipsis: true,
		},
		{
			title: '货位号',
			dataIndex: 'locationNo',
			width: 120,
			ellipsis: true,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'ordinaryCode',
			width: 130,
		},
		{
			title: '医耗套包名称',
			dataIndex: 'ordinaryName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '医耗套包说明',
			dataIndex: 'ordinaryDetailGoodsMessage',
			// ellipsis: true,
			width: 160,
			render: (text: {} | null | undefined, record: { description: {} | null | undefined }) => (
				<div
					className='detailGoodsMessage'
					title={record.description ? record.description : text}>
					{' '}
					{record.description ? record.description : text}{' '}
				</div>
			),
		},
		{
			title: '配货数量  ',
			dataIndex: 'quantity',
			width: 100,
			render: (text: any, record: { packageBulkUnit: any; unit: any }) => {
				let nowText = currentIndex == '2' ? record.packageBulkUnit : record.unit;
				return <span>{text + nowText}</span>;
			},
		},

		{
			title: '来源',
			dataIndex: 'source',
			width: 100,
			render: (text: any) => {
				return <span>{pickingPendingSourceTextMap[text]}</span>;
			},
		},
		{
			title: '提交时间',
			dataIndex: 'timeCreated',
			key: 'pick.time_created',
			width: 180,
			hideInSearch: true,
			show: true,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'pick.time_created' && sortedInfo.order,
			render: (time: any) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
	];
	const tabs = {
		'1': {
			name: fields.baseGoods,
			key: '1',
			type: 'goods',
			columns: columnsGoods,
			tableInfoId: '284',
		},
		'2': {
			name: '定数包',
			key: '2',
			type: 'package_bulk',
			columns: columnsBulk,
			tableInfoId: '285',
		},
		'3': {
			name: '医耗套包',
			key: '3',
			type: 'package_ordinary',
			columns: columnsOrdinary,
			tableInfoId: '286',
		},
		// '3': {
		//   name: '手术套包',
		//   key: '3',
		//   type: 'package_surgical',
		//   columns: columnsSurgical,
		//   tableInfoId: '26',
		// },
	};
	return (
		<div>
			<Breadcrumb config={['', '']} />
			<Card bordered={false}>
				<FormSearch
					searchTabeList={searchTabeList}
					setCurrentIndex={setCurrentIndex}
					setTotal={setTotal}
					setPageConfig={setPageConfig}
					reSetFormSearch={reSetFormSearch}
					form={form}
					setSearchParams={setSearchParams}
					setList={setList}
				/>
				<TableBox
					isFirst={isFirst}
					headerTitle={`待收${fields.goods}列表`}
					tableInfoId={tabs[currentIndex].tableInfoId}
					options={{
						reload: () => getFormList({}),
					}}
					toolBarRender={() => [
						permissions.includes('dueIn_goodsAndMaterials_print') && (
							<>
								<PrintTarget
									url={api.dueIn_goodsAndMaterials.list}
									params={{ ...searchParams, pageNum: 0, pageSize: 99999 }}
									parameters={departmentList}
									printType={true}
									getForm={getSearchDate}
								/>
							</>
						),
						permissions.includes('dueIn_goodsAndMaterialsExport') && (
							<>
								{
									<ExportFile
										data={{
											filters: { ...getSearchDate() },
											link: api.dueIn_goodsAndMaterials.export,
											getForm: getSearchDate,
										}}
										disabled={!isExportFile}
									/>
								}
							</>
						),
					]}
					rowKey='id'
					// rowSelection={rowSelection}
					dataSource={list}
					loading={loading}
					scroll={{
						x: '100%',
						y: global.scrollY,
					}}
					onChange={handleChangeTable}
					columns={tabs[currentIndex].columns}
					// onRow={handleRowEvent}
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
