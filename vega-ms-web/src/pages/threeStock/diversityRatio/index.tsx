import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ResizableTable';
import { timeType3 } from '@/constants';
import { useDepartmentList } from '@/hooks/useDepartmentList';
import { getDifferenceRateList } from '@/services/inventory';
import { convertPriceWithDecimal } from '@/utils/format';
import { Form } from 'antd';
import moment from 'moment';
import { useRef } from 'react';
import { history, useAccess } from 'umi';

const List = () => {
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const access = useAccess();
	const departmentList = (useDepartmentList() || []).map((item: Record<string, any>) => {
		const { name, id, nameAcronym } = item;
		return { value: id, label: name, key: (nameAcronym || '') + '' + name };
	});

	const searchColumns: ProFormColumns = [
		{
			title: '盘库时间',
			dataIndex: 'time',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType3,
			},
		},
		{
			title: '科室',
			dataIndex: 'departmentId',
			valueType: 'select',
			fieldProps: {
				allowClear: true,
				showSearch: true,
				options: departmentList,
				filterOption: (input: string, option: { label: string }) => {
					return option['data-item'].key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
	];

	const columns: ProColumns<InventoryController.DifferenceRateRecord>[] = [
		{
			width: 'XXXS',
			title: '序号',
			dataIndex: 'id',
			align: 'center',
			renderText: (text, record, index) => index + 1,
		},
		{
			width: 'L',
			title: '盘库单号',
			dataIndex: 'inventoryCode',
		},
		{
			width: 'S',
			title: '科室名称',
			dataIndex: 'departmentName',
			ellipsis: true,
		},
		{
			width: 'S',
			title: '创建人员',
			dataIndex: 'inventoryUserName',
		},
		{
			width: 'L',
			title: '盘库时间',
			dataIndex: 'inventoryTime',
			key: 'inventoryTime',
			renderText: (text, record) =>
				record.inventoryTime ? moment(Number(text)).format('YYYY/MM/DD HH:mm:ss') : '',
		},
		{
			width: 'S',
			title: '差异数',
			dataIndex: 'differenceQuantity',
			renderText: (text) => <span className={text < 0 ? 'negativeStyle' : ''}>{text}</span>,
		},
		{
			width: 'S',
			title: '差异总金额(元)',
			dataIndex: 'differenceAmount',
			align: 'right',
			renderText: (text) => (
				<span className={text < 0 ? 'negativeStyle' : ''}>
					{text ? convertPriceWithDecimal(text) : '-'}
				</span>
			),
		},
		{
			width: 'XXS',
			title: '操作',
			dataIndex: 'option',
			fixed: 'right',
			render: (_text, record) => {
				return (
					access.three_stock_diversityRatio_detail && (
						<span
							className='handleLink'
							onClick={() => {
								history.push({
									pathname: '/threeStock/diversityRatio/detail',
									state: {
										...record,
									},
								});
							}}>
							详情
						</span>
					)
				);
			},
		},
	];

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<ProTable
				tableInfoCode='three_stocek_diversityRatio'
				rowKey='id'
				api={getDifferenceRateList}
				columns={columns}
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				searchKey='three_stocek_diversityRatio'
				dateFormat={{
					time: {
						endKey: 'endTime',
						startKey: 'startTime',
					},
				}}
				loadConfig={{
					request: false,
				}}
				tableRef={tableRef}
			/>
		</div>
	);
};

export default List;
