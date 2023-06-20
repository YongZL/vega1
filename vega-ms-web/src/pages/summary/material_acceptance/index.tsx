import type { ProTableAction } from '@/components//ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ProTable';
import { timeType3 } from '@/constants';
import api from '@/constants/api';
import { useDepartmentList } from '@/hooks/useDepartmentList';
import { useDistributorList } from '@/hooks/useDistributorList';
import { convertPriceWithDecimal } from '@/utils/format';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Card } from 'antd';
import moment from 'moment';
import { useRef, useState } from 'react';
import { useModel } from 'umi';
import { queryRule } from './service';

const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');

const MaterialAcceptance = () => {
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const [summary, setSummary] = useState();
	const distributorOption = useDistributorList();
	const departmentList = (useDepartmentList() || []).map((item: Record<string, any>) => {
		const { name, id, nameAcronym } = item;
		return { value: id, label: name, key: (nameAcronym || '') + '' + name };
	});
	const [isExportFile, setIsExportFile] = useState(false);
	const searchColumns: ProFormColumns = [
		{
			title: '验收时间',
			dataIndex: 'receivingTime',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType3,
			},
		},
		{
			title: '验收单号',
			dataIndex: 'receivingOrderCode',
		},
		{
			title: '配送单号',
			dataIndex: 'shippingOrderCode',
		},
		{
			title: '科室',
			dataIndex: 'departmentIds',
			valueType: 'select',
			fieldProps: {
				// mode: 'multiple',
				allowClear: true,
				showArrow: true,
				showSearch: true,
				options: departmentList,
				filterOption: (input: string, option: { label: string }) => {
					return option['data-item'].key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorId',
			valueType: 'select',
			fieldProps: {
				placeholder: '',
				showSearch: true,
				allowClear: true,
				options: distributorOption,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
	];

	const getSearchDate = () => {
		return tableRef.current?.getParams();
	};

	const columns = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			render: (text: string, redord: object, index: number) => <span>{index + 1}</span>,
		},
		{
			width: 'XXXL',
			title: '验收单号',
			dataIndex: 'receivingOrderCode',
			copyable: true,
		},
		{
			width: 'XL',
			title: '验收日期',
			dataIndex: 'receivingTime',
			hideInSearch: true,
			show: true,
			sorter: true,
			render: (time: number, record: { receivingTime: number }) => {
				return record.receivingTime ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			width: 'L',
			title: '科室',
			dataIndex: 'departmentName',
		},
		{
			width: 'L',
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			ellipsis: true,
		},
		{
			width: 'XXL',
			title: fields.goodsName,
			dataIndex: 'goodsName',
			ellipsis: true,
		},
		{
			width: 'XS',
			title: '配送数量',
			dataIndex: 'shippingQuantity',
		},
		{
			width: 'XS',
			title: '验收数量',
			dataIndex: 'receivingQuantity',
		},
		{
			width: 'XXS',
			title: '单位',
			dataIndex: 'minGoodsUnit',
		},
		{
			width: 'L',
			title: '本地医保编码',
			dataIndex: 'chargeNum',
		},
		{
			width: 'XXXL',
			title: '配送单号',
			dataIndex: 'shippingOrderCode',
		},
		{
			width: 'L',
			title: fields.distributor,
			dataIndex: 'distributorName',
			ellipsis: true,
		},
		{
			width: 'L',
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			ellipsis: true,
		},
	];
	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<Card bordered={false}>
				<ProTable
					rowKey='id'
					tableInfoId='86'
					api={queryRule}
					loadConfig={{
						request: false,
					}}
					columns={columns}
					searchConfig={{
						columns: searchColumns,
					}}
					dateFormat={{
						receivingTime: {
							endKey: 'endTime',
							startKey: 'beginTime',
						},
					}}
					requestCompleted={(rows) => {
						setIsExportFile(rows.length > 0);
					}}
					setRows={(res: Record<string, any>) => {
						let result = res.data;
						setSummary(result.sumPrice);
						return result;
					}}
					tableRef={tableRef}
					headerTitle={
						<div className='flex flex-between'>
							<div className='tableTitle'>
								{(summary || summary == 0) && (
									<div className='tableTitle'>
										<span className='tableAlert'>
											<ExclamationCircleFilled
												style={{
													color: CONFIG_LESS['@c_starus_await'],
													marginRight: '8px',
													fontSize: '12px',
												}}
											/>
											<span className='consumeCount'>
												合计金额：￥{' '}
												<span className='count'>{convertPriceWithDecimal(summary) || 0}</span>
											</span>
										</span>
									</div>
								)}
							</div>
						</div>
					}
					toolBarRender={() => [
						permissions.includes('material_acceptance_export') && (
							<ExportFile
								data={{
									filters: { ...getSearchDate() },
									link: api.material_acceptance.export,
									getForm: getSearchDate,
								}}
								disabled={!isExportFile}
							/>
						),
					]}
				/>
			</Card>
		</div>
	);
};

export default MaterialAcceptance;
