import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import PaginationBox from '@/components/Pagination';
import TableBox from '@/components/TableBox';
import api from '@/constants/api';
import { getDay } from '@/utils';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { Badge, Card, Form } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect, useModel } from 'umi';
import FormSearch from './formSearch';
import { queryRule } from './service';

const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
const approvaStatus = {
	un_charged: { text: '待收费', color: CONFIG_LESS['@c_starus_await'] },
	charged: { text: '已收费', color: CONFIG_LESS['@c_starus_done'] },
	charge_reverted: { text: '已退费', color: CONFIG_LESS['@c_starus_disabled'] },
};

const PickingList: React.FC<{}> = ({ global }) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [list, setList] = useState([]);
	const [timeParams, setTimeParams] = useState({});
	const [total, setTotal] = useState(0);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const [sortedInfo, setSortedInfo] = useState({});
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');

	const getSearchDate = () => {
		const values = form.getFieldsValue();
		const params = {
			...values,
			materialCode: values.materialCode || undefined,
			materialName: values.materialName || undefined,
			hospitalizationNum: values.hospitalizationNum || undefined,
			patientNo: values.patientNo || undefined,
			statusList: values.status && values.status.length ? values.status.join(',') : undefined,
			spdDepartmentIds: values.spdDepartmentName || undefined,
			custodianIds: values.custodianName || undefined,
			timeConsumedFrom:
				values.timeConsumed && values.timeConsumed[0] ? getDay(values.timeConsumed[0]) : undefined,
			timeConsumedTo:
				values.timeConsumed && values.timeConsumed[1]
					? getDay(values.timeConsumed[1], 'end')
					: undefined,
			timeChargedFrom:
				values.timeCharged && values.timeCharged[0] ? getDay(values.timeCharged[0]) : undefined,
			timeChargedTo:
				values.timeCharged && values.timeCharged[1]
					? getDay(values.timeCharged[1], 'end')
					: undefined,
			timeUnchargedFrom:
				values.timeUncharged && values.timeUncharged[0]
					? getDay(values.timeUncharged[0])
					: undefined,
			timeUnchargedTo:
				values.timeUncharged && values.timeUncharged[1]
					? getDay(values.timeUncharged[1], 'end')
					: undefined,
		};
		delete params.status;
		delete params.spdDepartmentName;
		delete params.custodianName;
		delete params.timeConsumed;
		delete params.timeCharged;
		delete params.timeUncharged;
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

	// 重置
	const reSetFormSearch = () => {
		setSortedInfo({});
		setTimeParams({});
		getFormList({ pageNum: 0 });
	};

	useEffect(() => {
		getFormList({});
	}, []);

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
			title: '收费序号',
			dataIndex: 'adviceNo',
			key: 'adviceNo',
			width: 130,
		},
		{
			title: '收费编号',
			dataIndex: 'chargeCode',
			key: 'chargeCode',
			width: 130,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 160,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 150,
		},
		{
			title: fields.goodsName,
			dataIndex: 'materialName',
			key: 'materialName',
			width: 160,
			ellipsis: true,
		},
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 220,
		},
		{
			title: `一级${fields.distributor}`,
			dataIndex: 'custodianName',
			key: 'custodianName',
			width: 180,
			ellipsis: true,
			render: (text, record) => {
				return <span>{record.custodianId == 1 ? '-' : text}</span>;
			},
		},
		{
			title: '产品主码',
			dataIndex: 'pmCode',
			key: 'pmCode',
			width: 100,
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
		},
		{
			title: '单位',
			dataIndex: 'unitName',
			key: 'unitName',
			width: 100,
			render: (text, record) => {
				return record.operatorBarcode.indexOf('PS') > -1 ? '套' : text;
			},
		},

		{
			title: 'SPD单价(元)',
			dataIndex: 'spdPrice',
			key: 'spdPrice',
			align: 'right',
			width: 120,
			render: (text) => {
				return <span>{convertPriceWithDecimal(text)}</span>;
			},
		},
		{
			title: 'HIS单价(元)',
			dataIndex: 'hisPrice',
			key: 'hisPrice',
			width: 120,
			align: 'right',
			render: (text) => {
				return <span>{convertPriceWithDecimal(text)}</span>;
			},
		},
		{
			title: '病人编号',
			dataIndex: 'patientNo',
			key: 'patientNo',
			width: 120,
		},
		{
			title: '病人姓名',
			dataIndex: 'patientName',
			key: 'patientName',
			width: 120,
		},
		{
			title: '住院号',
			dataIndex: 'hospitalizationNum',
			key: 'hospitalizationNum',
			width: 120,
		},
		{
			title: '消耗时间',
			dataIndex: 'timeConsumed',
			key: 'timeConsumed',
			width: 170,
			hideInSearch: true,
			show: true,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'timeConsumed' && sortedInfo.order,
			render: (time: any) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '消耗人',
			dataIndex: 'consumedByName',
			key: 'consumedByName',
			width: 120,
		},

		{
			title: '收费时间',
			dataIndex: 'timeCharged',
			key: 'timeCharged',
			width: 170,
			hideInSearch: true,
			show: true,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'timeCharged' && sortedInfo.order,
			render: (time: any) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '收费流水号',
			dataIndex: 'chargedSerialNo',
			key: 'chargedSerialNo',
			width: 120,
		},
		{
			title: '收费人',
			dataIndex: 'chargedByName',
			key: 'chargedByName',
			width: 120,
		},
		{
			title: '退费时间',
			dataIndex: 'timeUncharged',
			key: 'timeUncharged',
			width: 170,
			hideInSearch: true,
			show: true,
			sorter: true,
			sortOrder: sortedInfo.columnKey == 'timeUncharged' && sortedInfo.order,
			render: (time: any) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '退费流水号',
			dataIndex: 'unchargedSerialNo',
			key: 'unchargedSerialNo',
			width: 120,
		},
		{
			title: '退费人',
			dataIndex: 'unchargedByName',
			key: 'unchargedByName',
			width: 120,
		},

		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			render: (text: any, record: any) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 150,
			ellipsis: true,
		},
		{
			title: fields.distributor,
			dataIndex: 'supplierName',
			key: 'supplierName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: 'SPD科室编号',
			dataIndex: 'spdDepartmentId',
			key: 'spdDepartmentId',
			width: 150,
		},
		{
			title: 'SPD科室名称',
			dataIndex: 'spdDepartmentName',
			key: 'spdDepartmentName',
			width: 150,
			ellipsis: true,
		},
		{
			title: 'HIS科室编号',
			dataIndex: 'hisDepartmentCode',
			key: 'hisDepartmentCode',
			width: 150,
		},
		{
			title: 'HIS科室名称',
			dataIndex: 'hisDepartmentName',
			key: 'hisDepartmentName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '医生编号',
			dataIndex: 'doctorCode',
			key: 'doctorCode',
			width: 100,
		},
		{
			title: '医生姓名',
			dataIndex: 'doctorName',
			key: 'doctorName',
			width: 100,
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			width: 120,
			render: (time: any) => {
				return time ? moment(time).format('YYYY/MM/DD') : '-';
			},
		},
		{
			title: '灭菌日期',
			dataIndex: 'sterilizationDate',
			key: 'sterilizationDate',
			width: 120,
			render: (time: any) => {
				return time ? moment(time).format('YYYY/MM/DD') : '-';
			},
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 120,
			render: (time: any) => {
				return time ? moment(time).format('YYYY/MM/DD') : '-';
			},
		},
		{
			title: '产品注册证',
			dataIndex: 'registrationNum',
			key: 'registrationNum',
			width: 180,
			ellipsis: true,
		},
		{
			title: '手术申请号',
			dataIndex: 'surgicalRequestNo',
			key: 'surgicalRequestNo',
			width: 150,
		},
		{
			title: '手术代码',
			dataIndex: 'surgicalCode',
			key: 'surgicalCode',
			width: 150,
		},
		{
			title: '手术方案',
			dataIndex: 'surgicalName',
			key: 'surgicalName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '申请科室',
			dataIndex: 'applyDeptName',
			key: 'applyDeptName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '主治医生',
			dataIndex: 'applyDoctorName',
			key: 'applyDoctorName',
			width: 120,
		},
		{
			title: '拟施手术日期',
			dataIndex: 'surgicalDate',
			key: 'surgicalDate',
			width: 150,
			render: (time: number) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm') : '-';
			},
		},
		{
			title: '第一助手',
			dataIndex: 'firstAssistant',
			key: 'firstAssistant',
			width: 120,
		},
		{
			title: '第二助手',
			dataIndex: 'secondAssistant',
			key: 'secondAssistant',
			width: 120,
		},
		{
			title: '主刀医生',
			dataIndex: 'surgeonDoctor',
			key: 'surgeonDoctor',
			width: 120,
		},
		{
			title: '麻醉医生',
			dataIndex: 'anesthetist',
			key: 'anesthetist',
			width: 120,
		},
		{
			title: '执行时间',
			dataIndex: 'executeDate',
			key: 'executeDate',
			width: 160,
			render: (time: number) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
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
						permissions.includes('doctor_advice_export') && (
							<ExportFile
								data={{
									filters: { ...getSearchDate() },
									link: api.doctor_advice.export,
									getForm: getSearchDate,
								}}
							/>
						),
					]}
					tableInfoId='71'
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
