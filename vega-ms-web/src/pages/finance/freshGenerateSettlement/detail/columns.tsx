import { ProColumns } from '@/components/ProTable/typings';

import { convertPriceWithDecimal } from '@/utils/format';
import moment from 'moment';

export const columnsSurgical1: ProColumns<
	SettlementController.InvoiceSyncRecord | SettlementController.DetailRecord
>[] = [
	{
		title: '科室名称',
		dataIndex: 'departmentName',
		key: 'departmentName',
		width: 140,
	},
	{
		title: '数量',
		dataIndex: 'number',
		key: 'number',
		width: 140,
		renderText: (text: number) =>
			text < 0 ? <span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>{text}</span> : text,
	},
];

export const columnsSurgical2: ProColumns<
	SettlementController.InvoiceSyncRecord | SettlementController.DetailRecord
>[] = [
	{
		title: '请领单号',
		dataIndex: 'reqOrder',
		key: 'reqOrder',
		width: 160,
	},
	{
		title: '请领时间',
		dataIndex: 'reqTime',
		key: 'reqTime',
		width: 180,
		sorter: true,
		renderText: (text: number) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
	},
	{
		title: '请领人员',
		dataIndex: 'reqName',
		key: 'reqName',
		width: 140,
	},
	{
		title: '数量',
		dataIndex: 'acceptanceNumber',
		key: 'acceptanceNumber',
		width: 140,
	},
	{
		title: '单价(元)',
		dataIndex: 'price',
		key: 'price',
		width: 110,
		align: 'right',
		renderText: (text: number) => <span>{convertPriceWithDecimal(text)}</span>,
	},
	{
		title: '配货人员',
		dataIndex: 'pickingName',
		key: 'pickingName',
		ellipsis: true,
		width: 140,
	},
	{
		title: '验收人员',
		dataIndex: 'acceptanceName',
		key: 'acceptanceName',
		width: 140,
		ellipsis: true,
	},
	{
		title: '验收时间',
		dataIndex: 'acceptanceTime',
		key: 'acceptanceTime',
		width: 180,
		sorter: true,
		renderText: (text: number) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
	},
	{
		title: '消耗类型',
		dataIndex: 'consumeType',
		key: 'consumeType',
		width: 140,
		ellipsis: true,
	},
];

export const columnsSurgical3: ProColumns<
	SettlementController.InvoiceSyncRecord | SettlementController.DetailRecord
>[] = [
	{
		title: '退货单号',
		dataIndex: 'reqOrder',
		key: 'reqOrder',
		width: 140,
	},
	{
		title: '退货时间',
		dataIndex: 'reqTime',
		key: 'reqTime',
		width: 180,
		sorter: true,
		renderText: (text: number) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
	},
	{
		title: '退货人员',
		dataIndex: 'reqName',
		key: 'reqName',
		width: 140,
	},
	{
		title: '数量',
		dataIndex: 'acceptanceNumber',
		key: 'acceptanceNumber',
		width: 140,
		renderText: (text: number) => (
			<span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>{text}</span>
		),
	},
	{
		title: '单价(元)',
		dataIndex: 'price',
		key: 'price',
		width: 110,
		align: 'right',
		renderText: (text: number) => <span>{convertPriceWithDecimal(text)}</span>,
	},
];

export const columnsSurgical4: ProColumns<
	SettlementController.InvoiceSyncRecord | SettlementController.DetailRecord
>[] = [
	{
		title: '验收单号',
		dataIndex: 'acceptanceCode',
		key: 'acceptanceCode',
		width: 180,
	},
	{
		title: '验收时间',
		dataIndex: 'acceptanceTime',
		key: 'acceptanceTime',
		width: 140,
		renderText: (text: number) => (text ? text : '-'),
	},
	{
		title: '发票号',
		dataIndex: 'invoiceCode',
		key: 'invoiceCode',
		width: 140,
	},
	{
		title: '验收人员',
		dataIndex: 'acceptanceName',
		key: 'acceptanceName',
		width: 140,
	},
	{
		title: '数量',
		dataIndex: 'acceptanceNumber',
		key: 'acceptanceNumber',
		width: 120,
	},
	{
		title: '单价(元)',
		dataIndex: 'price',
		key: 'price',
		width: 120,
		renderText: (text: number) => <span>{convertPriceWithDecimal(text)}</span>,
	},
];

export const columnsSurgical5: ProColumns<
	SettlementController.InvoiceSyncRecord | SettlementController.DetailRecord
>[] = [
	{
		title: '退货单号',
		dataIndex: 'acceptanceCode',
		key: 'acceptanceCode',
		width: 180,
	},
	{
		title: '退货时间',
		dataIndex: 'acceptanceTime',
		key: 'acceptanceTime',
		width: 140,
		renderText: (text: number) => (text ? text : '-'),
	},
	{
		title: '退货人员',
		dataIndex: 'acceptanceName',
		key: 'acceptanceName',
		width: 140,
	},
	{
		title: '数量',
		dataIndex: 'acceptanceNumber',
		key: 'acceptanceNumber',
		width: 120,
	},
	{
		title: '单价(元)',
		dataIndex: 'price',
		key: 'price',
		width: 120,
		renderText: (text: number) => <span>{convertPriceWithDecimal(text)}</span>,
	},
];

export const columnsSurgical6: ProColumns<
	SettlementController.InvoiceSyncRecord | SettlementController.DetailRecord
>[] = [
	{
		title: '收费序号',
		dataIndex: 'chargeCode',
		key: 'chargeCode',
		width: 140,
	},
	{
		title: '病人名称',
		dataIndex: 'patientName',
		key: 'patientName',
		width: 140,
	},
	{
		title: '开单科室',
		dataIndex: 'billDeptName',
		key: 'billDeptName',
		ellipsis: true,
		width: 140,
	},
	{
		title: '消耗人员',
		dataIndex: 'consumeName',
		key: 'consumeName',
		width: 140,
		ellipsis: true,
	},
	{
		title: '消耗时间',
		dataIndex: 'consumeTime',
		key: 'consumeTime',
		width: 180,
		sorter: true,
		renderText: (text: number) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
	},
];
