import type { ProTableAction } from '@/components//ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ProTable';
import api from '@/constants/api';
import { antiEpidemicType, antiEpidemicTypeTextMap } from '@/constants/dictionary';
import { useDepartmentList } from '@/hooks/useDepartmentList';
import { useDistributorList } from '@/hooks/useDistributorList';
import { convertPriceWithDecimal } from '@/utils/format';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Card, Form } from 'antd';
import moment from 'moment';
import { useRef, useState } from 'react';
import { useModel } from 'umi';
import { queryRule } from './service';

const List = () => {
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const [summary, setSummary] = useState();
	const distributorOption = useDistributorList();
	const tableRef = useRef<ProTableAction>();
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const newDictionary = JSON.parse(sessionStorage.getItem('newDictionary') || '{}');
	const [isExportFile, setIsExportFile] = useState(false);
	const departmentList = (useDepartmentList() || []).map((item: Record<string, any>) => {
		const { name, id, nameAcronym } = item;
		return { value: id, label: name, key: (nameAcronym || '') + '' + name };
	});

	const searchColumns: ProFormColumns = [
		{
			title: fields.antiEpidemic,
			dataIndex: 'antiEpidemic',
			valueType: 'tagSelect',
			fieldProps: {
				options: antiEpidemicType,
			},
		},
		{
			title: fields.goodsType,
			dataIndex: 'materialCategoryList',
			valueType: 'tagSelect',
			fieldProps: {
				options: newDictionary.material_category,
			},
		},
		{
			title: '日期范围',
			dataIndex: 'time',
			valueType: 'dateRange',
			// fieldProps: {
			//   placeholder: '',
			// },
		},
		{
			title: '科室',
			dataIndex: 'deptId',
			valueType: 'select',
			fieldProps: {
				options: departmentList,
				filterOption: (input: string, option: { label: string }) => {
					return option['data-item'].key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorId',
			valueType: 'select',
			fieldProps: {
				placeholder: '',
				showSearch: true,
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
			width: 'XL',
			title: '日期范围',
			dataIndex: 'timeFrom',
			render: (text: string, record: { timeFrom: number; timeTo: number }) => {
				return (
					<span>
						{moment(record.timeFrom).format('YYYY/MM/DD')}～
						{moment(record.timeTo).format('YYYY/MM/DD')}
					</span>
				);
			},
		},
		{
			width: 'L',
			title: '系统科室',
			dataIndex: 'departmentName',
		},
		{
			width: 'XL',
			title: fields.goodsType,
			dataIndex: 'materialCategory',
			ellipsis: true,
		},
		{
			width: 'L',
			title: fields.distributor,
			dataIndex: 'distributorName',
			ellipsis: true,
		},
		{
			width: 'S',
			title: fields.antiEpidemic,
			dataIndex: 'antiEpidemic',
			render: (text: string, recrod: { antiEpidemic: string }) => {
				let antiEpidemic = recrod.antiEpidemic;
				return antiEpidemicTypeTextMap[antiEpidemic] || '-';
			},
		},
		{
			width: 'XL',
			title: '金额(元)',
			dataIndex: 'totalAmount',
			align: 'right',
			render: (text: number) => convertPriceWithDecimal(text),
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
					api={queryRule}
					searchConfig={{
						form,
						columns: searchColumns,
					}}
					tableInfoId='77'
					columns={columns}
					loadConfig={{
						request: false,
					}}
					dateFormat={{
						time: {
							endKey: 'timeTo',
							startKey: 'timeFrom',
						},
					}}
					requestCompleted={(rows) => {
						setIsExportFile(rows.length > 0);
					}}
					beforeSearch={(value: Record<string, any>) => {
						let data;
						const { antiEpidemic } = value;
						if (antiEpidemic) {
							data = antiEpidemic.split(',').length == 2 ? '' : antiEpidemic;
						}
						const params = {
							...value,
							antiEpidemic: data ? data : undefined,
						};
						return params;
					}}
					setRows={(res: Record<string, any>) => {
						let result = res.data;
						setSummary(result.sumPrice);
						return result;
					}}
					headerTitle={
						<div className='flex flex-between'>
							<div className='tableTitle'>
								{summary && (
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
						permissions.includes('repository_inbound_summary_export') && (
							<ExportFile
								data={{
									filters: { ...getSearchDate() },
									link: api.repository_inbound.export,
									getForm: getSearchDate,
								}}
								disabled={!isExportFile}
							/>
						),
					]}
					tableRef={tableRef}
				/>
			</Card>
		</div>
	);
};

export default List;
