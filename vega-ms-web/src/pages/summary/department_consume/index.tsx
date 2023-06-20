import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import PaginationBox from '@/components/Pagination';
import TableBox from '@/components/TableBox';
import api from '@/constants/api';
import { antiEpidemicTypeTextMap } from '@/constants/dictionary';
import { getDay } from '@/utils';
import { convertPriceWithDecimal } from '@/utils/format';
import { Card, Form } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect, useModel } from 'umi';
import FormSearch from './formSearch';
import { queryRule } from './service';

const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');

const List: React.FC<{}> = ({ global }) => {
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [list, setList] = useState([]);
	const [timeParams, setTimeParams] = useState({});
	const [total, setTotal] = useState(0);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });

	const getSearchDate = () => {
		const values = form.getFieldsValue();
		const params = {
			...values,
			timeFrom:
				values.time && values.time.length && values.time[0] ? getDay(values.time[0]) : undefined,
			timeTo:
				values.time && values.time.length && values.time[1]
					? getDay(values.time[1], 'end')
					: undefined,
		};
		delete params.time;
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

	// 更新列表
	useEffect(() => {
		getFormList({});
	}, []);

	const reSetFormSearch = () => {
		setTimeParams({});
		getFormList({ pageNum: 0 });
	};

	const columns = [
		{
			title: '日期范围',
			dataIndex: 'timeFrom',
			key: 'timeFrom',
			width: 180,
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
			title: '财务科室编号',
			dataIndex: 'finDepartmentCode',
			key: 'finDepartmentCode',
			width: 150,
		},
		{
			title: '财务科室名称',
			dataIndex: 'finDepartmentName',
			key: 'finDepartmentName',
			width: 150,
		},
		{
			title: fields.antiEpidemic,
			dataIndex: 'antiEpidemic',
			key: 'antiEpidemic',
			width: 120,
			render: (text) => {
				return antiEpidemicTypeTextMap[text] || '';
			},
		},
		{
			title: '植入器械材料',
			dataIndex: 'implantMaterialAmount',
			key: 'implantMaterialAmount',
			width: 150,
			align: 'right',
			render: (text: number) => convertPriceWithDecimal(text),
		},
		{
			title: '介入器械材料',
			dataIndex: 'interventionalDeviceMaterialAmount',
			key: 'interventionalDeviceMaterialAmount',
			width: 160,
			align: 'right',
			render: (text: number) => convertPriceWithDecimal(text),
		},
		{
			title: '医用高分子材料及制品',
			dataIndex: 'molecularMaterialAmount',
			key: 'molecularMaterialAmount',
			width: 160,
			align: 'right',
			render: (text: number) => convertPriceWithDecimal(text),
		},
		{
			title: '口腔材料',
			dataIndex: 'oralMaterialAmount',
			key: 'oralMaterialAmount',
			width: 160,
			align: 'right',
			render: (text: number) => convertPriceWithDecimal(text),
		},
		{
			title: '普通器械材料',
			dataIndex: 'commonEquipmentMaterialAmount',
			key: 'commonEquipmentMaterialAmount',
			width: 150,
			align: 'right',
			render: (text: number) => convertPriceWithDecimal(text),
		},
		{
			title: '其他材料',
			dataIndex: 'otherMaterialAmount',
			key: 'otherMaterialAmount',
			width: 150,
			align: 'right',
			render: (text: number) => convertPriceWithDecimal(text),
		},
		{
			title: '合计(元)',
			dataIndex: 'totalAmount',
			key: 'totalAmount',
			width: 150,
			align: 'right',
			render: (text: number) => convertPriceWithDecimal(text),
		},
		{
			title: '试剂',
			dataIndex: 'reagentAmount',
			key: 'reagentAmount',
			width: 150,
			align: 'right',
			render: (text: number) => convertPriceWithDecimal(text),
		},
		{
			title: '质控品',
			dataIndex: 'qualityControlAmount',
			key: 'qualityControlAmount',
			width: 150,
			align: 'right',
			render: (text: number) => convertPriceWithDecimal(text),
		},
		{
			title: '定标品',
			dataIndex: 'calibrationAmount',
			key: 'calibrationAmount',
			width: 150,
			align: 'right',
			render: (text: number) => convertPriceWithDecimal(text),
		},
		{
			title: '生化材料',
			dataIndex: 'biochemicalSuppliesAmount',
			key: 'biochemicalSuppliesAmount',
			width: 150,
			align: 'right',
			render: (text: number) => convertPriceWithDecimal(text),
		},
		{
			title: '试剂合计(元)',
			dataIndex: 'reagentTotalAmount',
			key: 'reagentTotalAmount',
			width: 150,
			align: 'right',
			render: (text: number) => convertPriceWithDecimal(text),
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
						permissions.includes('Departments_receive_collect_export') && (
							<ExportFile
								data={{
									filters: { ...getSearchDate() },
									link: api.department_consume.export,
									getForm: getSearchDate,
								}}
							/>
						),
					]}
					tableInfoId='76'
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

export default connect(({ global }) => ({ global }))(List);
