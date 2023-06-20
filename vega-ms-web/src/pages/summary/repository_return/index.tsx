import type { ProTableAction } from '@/components//ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ProTable';
import { timeType3 } from '@/constants';
import {
	isHightValue,
	repostoryReturnStatus,
	returnType,
	returnTypeTextMap,
	returnTypeValueEnum,
} from '@/constants/dictionary';
import { useDistributorList } from '@/hooks/useDistributorList';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { Badge } from 'antd';
import { useRef } from 'react';
import { useModel } from 'umi';
import { queryRule } from './service';

const RepositoryReturn = () => {
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const distributorOption = useDistributorList();
	const searchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'status',
			valueType: 'tagSelect',
			fieldProps: {
				options: repostoryReturnStatus,
			},
		},
		{
			title: '退货时间',
			dataIndex: 'submitTime',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType3,
			},
		},
		{
			title: '退货原因',
			dataIndex: 'reason',
			valueType: 'select',
			fieldProps: {
				placeholder: '',
				showSearch: true,
				options: returnType,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
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
		{
			title: fields.goodsProperty,
			dataIndex: 'isHighValue',
			valueType: 'select',
			fieldProps: {
				options: isHightValue,
			},
		},
	];

	const columns = [
		{
			width: 'XXS',
			title: '序号',
			align: 'center',
			dataIndex: 'index',
			render: (text: string, redord: object, index: number) => <span>{index + 1}</span>,
		},
		{
			width: 'S',
			title: '状态',
			dataIndex: 'returnStatus',
			render: (text: string, record: { returnStatus: string }) => {
				let statusText, statusColor;
				if (record.returnStatus == 'finished') {
					statusText = '已退货';
					statusColor = CONFIG_LESS['@c_starus_disabled'];
				} else {
					statusText = '待退货';
					statusColor = CONFIG_LESS['@c_starus_warning'];
				}
				return (
					<Badge
						color={statusColor}
						text={statusText}
					/>
				);
			},
		},
		{
			width: 'M',
			ellipsis: true,
			title: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			width: 'L',
			ellipsis: true,
			title: fields.goodsName,
			dataIndex: 'name',
		},
		{
			width: 'L',
			title: '规格/型号',
			dataIndex: 'specification',
			ellipsis: true,
			render: (text: string, record: { specification: string; model: string }) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			width: 'S',
			title: fields.goodsProperty,
			dataIndex: 'isHighValue',
			renderText: (text: boolean) => (typeof text === 'boolean' ? (text ? '高值' : '低值') : '-'),
		},
		{
			width: 'S',
			title: '退货数量',
			dataIndex: 'quantity',
		},
		{
			width: 'S',
			title: '单价(元)',
			dataIndex: 'singlePrice',
			hideInSearch: true,
			show: true,
			sorter: true,
			align: 'right',
			render: (text: number) => {
				return <span>{convertPriceWithDecimal(text)}</span>;
			},
		},
		{
			width: 'S',
			title: '总金额',
			dataIndex: 'totalPrice',
			align: 'right',
			render: (text: number) => {
				return <span>{convertPriceWithDecimal(text)}</span>;
			},
		},
		{
			width: 'S',
			title: '退货原因',
			dataIndex: 'returnReason',
			ellipsis: true,
			render: (t: string, record: { returnReason: string }) => {
				const text = record.returnReason;
				return (
					<span className={(returnTypeValueEnum[text] || {}).color}>{returnTypeTextMap[text]}</span>
				);
			},
		},
		{
			width: 'XXXL',
			title: fields.distributor,
			dataIndex: 'distributorName',
			ellipsis: true,
		},
	];
	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<ProTable
				api={queryRule}
				tableInfoId='84'
				rowKey='id'
				loadConfig={{
					request: false,
				}}
				columns={columns}
				searchConfig={{
					columns: searchColumns,
				}}
				dateFormat={{
					submitTime: {
						endKey: 'createdTo',
						startKey: 'createdFrom',
					},
				}}
				beforeSearch={(value: Record<string, any>) => {
					const { status } = value;
					const params = {
						...value,
						status: status ? status.toString() : undefined,
					};
					return params;
				}}
				tableRef={tableRef}
			/>
		</div>
	);
};

export default RepositoryReturn;
