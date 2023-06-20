import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import moment from 'moment';
import { useModel } from 'umi';

const { fields } = useModel('fieldsMapping');

export const billColumns = () => {
	const colums = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			render: (text, record, index) => <span>{index + 1}</span>,
			width: 70,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 130,
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
			width: 150,
			render: (text: any, record: any) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 140,
		},
		{
			title: '可用数量',
			dataIndex: 'remainQuantity',
			key: 'remainQuantity',
			width: 120,
		},
		{
			title: '计价单位',
			dataIndex: 'minUnitName',
			key: 'minUnitName',
			width: 120,
		},
		{
			title: '含税单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 130,
			align: 'right',
			render: (text) => {
				return <span>{convertPriceWithDecimal(text)}</span>;
			},
		},
		{
			title: '订单号',
			dataIndex: 'orderCode',
			key: 'orderCode',
			width: 180,
		},
		{
			title: '配送单号',
			dataIndex: 'shippingOrderCode',
			key: 'shippingOrderCode',
			width: 200,
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 120,
			render: (text) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 120,
			render: (text) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 120,
		},
		{
			title: '验收数量',
			dataIndex: 'passedQuantity',
			key: 'passedQuantity',
			width: 120,
		},
		{
			title: '验收时间',
			dataIndex: 'acceptanceTime',
			key: 'acceptanceTime',
			sorter: true,
			width: 160,
			render: (text) => {
				return text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: fields.distributor,
			dataIndex: 'custodianName',
			key: 'custodianName',
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
	];
	return colums;
};

export const salesColumns = () => {
	const colums = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			render: (text, record, index) => <span>{index + 1}</span>,
			width: 70,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 130,
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
			width: 150,
			render: (text: any, record: any) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 140,
		},
		{
			title: '可用数量',
			dataIndex: 'remainQuantity',
			key: 'remainQuantity',
			width: 120,
		},
		{
			title: '计价单位',
			dataIndex: 'minUnitName',
			key: 'minUnitName',
			width: 120,
		},
		{
			title: '含税单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 120,
			align: 'right',
			render: (text) => {
				return <span>{convertPriceWithDecimal(text)}</span>;
			},
		},
		{
			title: '结算周期',
			dataIndex: 'timeFrom',
			key: 'timeFrom',
			width: 180,
			render: (text, record) => (
				<span>
					{moment(record.timeFrom).format('YYYY/MM/DD')}～
					{moment(record.timeTo).format('YYYY/MM/DD')}
				</span>
			),
		},
		{
			title: '结算单号',
			dataIndex: 'statementNo',
			key: 'statementNo',
			width: 140,
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 120,
			render: (text) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 120,
			render: (text, record) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 120,
		},
		{
			title: '验收数量',
			dataIndex: 'passedQuantity',
			key: 'passedQuantity',
			width: 120,
		},
		{
			title: '验收时间',
			dataIndex: 'acceptanceTime',
			key: 'acceptanceTime',
			sorter: true,
			width: 160,
			render: (text) => {
				return text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: fields.distributor,
			dataIndex: 'custodianName',
			key: 'custodianName',
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
	];
	return colums;
};

export const billModalColumns = () => {
	const colums = [
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 130,
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
			width: 150,
			render: (text: any, record: any) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 140,
		},
		{
			title: '可用数量',
			dataIndex: 'remainQuantity',
			key: 'remainQuantity',
			width: 120,
		},
		{
			title: '计价单位',
			dataIndex: 'minUnitName',
			key: 'minUnitName',
			width: 100,
		},
		{
			title: '含税单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 130,
			align: 'right',
			render: (text) => {
				return <span>{convertPriceWithDecimal(text)}</span>;
			},
		},
		{
			title: '含税金额(元)',
			dataIndex: 'totalAmount',
			key: 'totalAmount',
			width: 130,
			align: 'right',
			render: (text: number) => {
				return <span className={text < 0 ? 'cl_FF110B' : ''}>{convertPriceWithDecimal(text)}</span>;
			},
		},
		{
			title: '订单号',
			dataIndex: 'orderCode',
			key: 'orderCode',
			width: 180,
		},
		{
			title: '配送单号',
			dataIndex: 'shippingOrderCode',
			key: 'shippingOrderCode',
			width: 200,
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 120,
			render: (text: number) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 120,
			render: (text: number) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 120,
			render: (text) => text || '-',
		},
		{
			title: '验收数量',
			dataIndex: 'passedQuantity',
			key: 'passedQuantity',
			width: 120,
		},
		{
			title: '验收时间',
			dataIndex: 'acceptanceTime',
			key: 'acceptanceTime',
			width: 160,
			render: (text) => {
				return text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: fields.distributor,
			dataIndex: 'custodianName',
			key: 'custodianName',
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
	];
	return colums;
};

export const salesModalColumns = () => {
	const colums = [
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 130,
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
			width: 150,
			render: (text: any, record: any) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 140,
		},
		{
			title: '可用数量',
			dataIndex: 'remainQuantity',
			key: 'remainQuantity',
			width: 120,
		},
		{
			title: '计价单位',
			dataIndex: 'minUnitName',
			key: 'minUnitName',
			width: 120,
		},
		{
			title: '含税单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 120,
			align: 'right',
			render: (text) => {
				return <span>{convertPriceWithDecimal(text)}</span>;
			},
		},
		{
			title: '含税金额(元)',
			dataIndex: 'totalAmount',
			key: 'totalAmount',
			width: 130,
			align: 'right',
			render: (text: number) => {
				return <span className={text < 0 ? 'cl_FF110B' : ''}>{convertPriceWithDecimal(text)}</span>;
			},
		},
		{
			title: '结算周期',
			dataIndex: 'timeFrom',
			key: 'timeFrom',
			width: 180,
			render: (text, record) => (
				<span>
					{moment(record.timeFrom).format('YYYY/MM/DD')}～
					{moment(record.timeTo).format('YYYY/MM/DD')}
				</span>
			),
		},
		{
			title: '结算单号',
			dataIndex: 'statementNo',
			key: 'statementNo',
			width: 140,
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 120,
			render: (text) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 120,
			render: (text) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 120,
			render: (text) => text || '-',
		},
		{
			title: '验收数量',
			dataIndex: 'passedQuantity',
			key: 'passedQuantity',
			width: 120,
		},
		{
			title: '验收时间',
			dataIndex: 'acceptanceTime',
			key: 'acceptanceTime',
			width: 160,
			render: (text) => {
				return text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: fields.distributor,
			dataIndex: 'custodianName',
			key: 'custodianName',
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
	];
	return colums;
};
