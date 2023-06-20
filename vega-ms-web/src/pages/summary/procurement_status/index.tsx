import type { ProTableAction } from '@/components//ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ProTable';
import { timeType3 } from '@/constants';
import api from '@/constants/api';
import { isHightValue, orderStatus } from '@/constants/dictionary';
import { useDistributorList } from '@/hooks/useDistributorList';
import { Badge } from 'antd';
import moment from 'moment';
import { useRef, useState } from 'react';
import { useModel } from 'umi';
import { queryRule } from './service';
import { formatStrConnect } from '@/utils/format';

const approvaStatus = {
	receive_pending: { text: '待接收', color: CONFIG_LESS['@c_starus_await'] },
	received: { text: '已接收', color: CONFIG_LESS['@c_starus_done'] },
	delivering: { text: '配送中', color: CONFIG_LESS['@c_starus_warning'] },
	refused: { text: '已拒绝', color: CONFIG_LESS['@c_starus_underway'] },
	finish: { text: '已完成', color: CONFIG_LESS['@c_starus_done'] },
	closed: { text: '已关闭', color: CONFIG_LESS['@c_starus_underway'] },
};

const ProcurementStatus = () => {
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const distributorOption = useDistributorList();
	const [isExportFile, setIsExportFile] = useState(false);
	const searchColumns: ProFormColumns = [
		{
			title: fields.goodsType,
			dataIndex: '订单状态',
			valueType: 'tagSelect',
			fieldProps: {
				options: orderStatus,
			},
		},
		{
			title: '创建时间',
			dataIndex: 'timeCreated',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType3,
			},
		},
		{
			title: '订单号',
			dataIndex: 'orderCode',
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
			dataIndex: 'highValue',
			valueType: 'select',
			fieldProps: {
				options: isHightValue,
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
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
			render: (text: string, record: object, index: number) => <span>{index + 1}</span>,
		},
		{
			width: 'S',
			title: '状态',
			dataIndex: 'status',
			render: (text: string) => (
				<>
					<Badge
						color={approvaStatus[text].color}
						text={approvaStatus[text].text}
					/>
				</>
			),
		},
		{
			width: 'XXXL',
			title: '订单号',
			dataIndex: 'orderCode',
			copyable: true,
		},
		{
			width: 'XL',
			title: '提交时间',
			dataIndex: 'timeCreated',
			key: 'opo.time_created',
			hideInSearch: true,
			show: true,
			sorter: true,
			render: (time: number, record: Record<string, any>) => {
				return record.timeCreated ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			width: 'XL',
			title: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			width: 'XL',
			title: fields.goodsName,
			dataIndex: 'goodsName',
			ellipsis: true,
		},
		{
			width: 'L',
			title: '本地医保编码',
			dataIndex: 'chargeNum',
		},
		{
			width: 'L',
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			key: 'nationalNo',
			ellipsis: true,
		},
		{
			width: 'XL',
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
			dataIndex: 'highValue',
			renderText: (text: boolean) => (typeof text === 'boolean' ? (text ? '高值' : '低值') : '-'),
		},
		{
			width: 'XS',
			title: '订单数量',
			dataIndex: 'orderAmount',
		},
		{
			width: 'XS',
			title: '配送数量',
			dataIndex: 'shippingAmount',
		},
		{
			width: 'XS',
			title: '验收数量',
			dataIndex: 'receivingAmount',
		},
		{
			width: 'XL',
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
				searchConfig={{
					columns: searchColumns,
				}}
				dateFormat={{
					createdTime: {
						endKey: 'timeTo',
						startKey: 'timeFrom',
					},
				}}
				loadConfig={{
					request: false,
				}}
				requestCompleted={(rows) => {
					setIsExportFile(rows.length > 0);
				}}
				beforeSearch={(value: Record<string, any>) => {
					const { status } = value;
					const params = {
						...value,
						status: status ? status.toString() : undefined,
					};
					return params;
				}}
				api={queryRule}
				toolBarRender={() => [
					<ExportFile
						data={{
							filters: { ...getSearchDate() },
							link: api.purchase_order.export,
							getForm: getSearchDate,
						}}
						disabled={!isExportFile}
					/>,
				]}
				tableInfoId='83'
				rowKey='index'
				columns={columns}
				tableRef={tableRef}
			/>
		</div>
	);
};

export default ProcurementStatus;
