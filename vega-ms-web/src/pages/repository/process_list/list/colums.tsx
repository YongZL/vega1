//由于手术套包只是隐去此代码无法删

import { Badge, Progress } from 'antd';
import { useModel } from 'umi';
import { formatStrConnect } from '@/utils/format';

const { fields } = useModel('fieldsMapping');

export const AddColumns = (type: string) => {
	const pulkColums = [
		{
			title: '定数包名称',
			dataIndex: 'packageBulkName',
			key: 'packageBulkName',
			width: 150,
			ellipsis: true,
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
			render: (text: string, record: any) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			title: '包装数',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
			render: (text: string, record: any) => {
				return `${text}${record.minGoodsUnit}/包`;
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 150,
		},
	];
	// const surgicalColums = [
	//   {
	//     title: '套包名称',
	//     dataIndex: 'name',
	//     key: 'name',
	//     width: 150,
	//     ellipsis: true,
	//   },
	//   {
	//     title: '类别',
	//     dataIndex: 'categoryName',
	//     key: 'categoryName',
	//     width: 100,
	//     ellipsis: true,
	//     render: (text) => text || '-',
	//   },
	//   {
	//     title: '套包描述',
	//     dataIndex: 'detailGoodsMessage',
	//     key: 'detailGoodsMessage',
	//     ellipsis: true,
	//     width: 200,
	//   },
	//   {
	//     title: '单位',
	//     dataIndex: 'unit',
	//     key: 'unit',
	//     width: 100,
	//     render: () => {
	//       return <span>套</span>;
	//     },
	//   },
	//   {
	//     title: fields.goodsCode,
	//     dataIndex: 'materialCode',
	//     key: 'materialCode',
	//     width: 150,
	//   },
	// ];

	const ordinaryColums = [
		{
			title: '普耗包编码',
			dataIndex: 'ordinaryCode',
			key: 'ordinaryCode',
			width: 150,
		},
		{
			title: '普耗包名称',
			dataIndex: 'name',
			key: 'name',
			width: 150,
			ellipsis: true,
		},
		{
			title: '普耗包说明',
			dataIndex: 'detailGoodsMessage',
			key: 'detailGoodsMessage',
			// ellipsis: true,
			width: 200,
			render: (text, record) => (
				<div
					className='detailGoodsMessage'
					title={record.description ? record.description : text}>
					{' '}
					{record.description ? record.description : text}{' '}
				</div>
			),
		},
	];

	return type === 'package_bulk' ? pulkColums : ordinaryColums;
	//  surgicalColums;
};

export const SubmitColumns = (type: string) => {
	const pulkColums = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 80,
			render: (text, record, index) => index + 1,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 150,
		},
		{
			title: '定数包名称',
			dataIndex: 'packageBulkName',
			key: 'packageBulkName',
			width: 150,
			ellipsis: true,
		},
	];
	// const surgicalColums = [
	//   {
	//     title: '序号',
	//     dataIndex: 'index',
	//     key: 'index',
	//     align: 'center',
	//     width: 80,
	//     render: (text: string, record: any, index: number) => index + 1,
	//   },
	//   {
	//     title: fields.goodsCode,
	//     dataIndex: 'materialCode',
	//     key: 'materialCode',
	//     width: 150,
	//   },
	//   {
	//     title: '套包名称',
	//     dataIndex: 'name',
	//     key: 'name',
	//     width: 150,
	//     ellipsis: true,
	//   },
	//   {
	//     title: '套包描述',
	//     dataIndex: 'detailGoodsMessage',
	//     key: 'detailGoodsMessage',
	//     ellipsis: true,
	//     width: 200,
	//   },
	// ];

	const ordinaryColums = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 80,
			render: (text: string, record: any, index: number) => index + 1,
		},
		{
			title: '普耗包编码',
			dataIndex: 'ordinaryCode',
			key: 'ordinaryCode',
			width: 150,
		},
		{
			title: '普耗包名称',
			dataIndex: 'name',
			key: 'name',
			width: 150,
			ellipsis: true,
		},
		{
			title: '普耗包说明',
			dataIndex: 'detailGoodsMessage',
			key: 'detailGoodsMessage',
			// ellipsis: true,
			width: 200,
			render: (text, record) => (
				<div
					className='detailGoodsMessage'
					title={record.description ? record.description : text}>
					{record.description ? record.description : text}{' '}
				</div>
			),
		},
	];
	return type === 'package_bulk' ? pulkColums : ordinaryColums;
};

export const DetailColumns = (type: string) => {
	const pulkColums = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 80,
			render: (text, record, index) => index + 1,
		},
		{
			title: '定数包名称',
			dataIndex: 'packageBulkName',
			key: 'packageBulkName',
			width: 150,
			ellipsis: true,
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
			render: (text: any, record: any) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
			render: (text: string) => {
				return `${text}包`;
			},
		},
	];
	const surgicalColums = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 80,
			render: (text: string, record: any, index: number) => index + 1,
		},
		{
			title: '普耗包名称',
			dataIndex: 'ordinaryName',
			key: 'ordinaryName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '普耗包说明',
			dataIndex: 'ordinaryDetailGoodsMessage',
			key: 'ordinaryDetailGoodsMessage',
			// ellipsis: true,
			width: 200,
			render: (text, record) => (
				<div
					className='detailGoodsMessage'
					title={record.description ? record.description : text}>
					{record.description ? record.description : text}{' '}
				</div>
			),
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
			render: (text: string) => {
				return `${text}包`;
			},
		},
	];
	return type === 'package_bulk' ? pulkColums : surgicalColums;
};

export const ProcessColumns = (type: string) => {
	const pulkColums = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 80,
			render: (text, record, index: number) => index + 1,
		},
		{
			title: '打印状态',
			dataIndex: 'printed',
			key: 'printed',
			width: 100,
			render: (printed: boolean) => {
				return (
					<Badge
						color={
							printed === true ? CONFIG_LESS['@c_starus_disabled'] : CONFIG_LESS['@c_starus_await']
						}
						text={printed === true ? '已打印' : '待打印'}
					/>
				);
			},
		},
		{
			title: '定数包名称',
			dataIndex: 'packageBulkName',
			key: 'packageBulkName',
			width: 150,
			ellipsis: true,
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
			render: (text: any, record: any) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
			render: (text: string) => {
				return `${text}包`;
			},
		},
	];
	const surgicalColums = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 80,
			render: (text: string, record: any, index: number) => index + 1,
		},
		{
			title: '打印状态',
			dataIndex: 'printed',
			key: 'printed',
			width: 100,
			render: (printed: boolean) => {
				return (
					<Badge
						color={
							printed === true ? CONFIG_LESS['@c_starus_disabled'] : CONFIG_LESS['@c_starus_await']
						}
						text={printed === true ? '已打印' : '待打印'}
					/>
				);
			},
		},
		{
			title: '普耗包名称',
			dataIndex: 'ordinaryName',
			key: 'ordinaryName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '普耗包说明',
			dataIndex: 'ordinaryDetailGoodsMessage',
			key: 'ordinaryDetailGoodsMessage',
			// ellipsis: true,
			width: 200,
			render: (text, record) => (
				<div
					className='detailGoodsMessage'
					title={record.description ? record.description : text}>
					{record.description ? record.description : text}{' '}
				</div>
			),
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
			render: (text: string) => {
				return `${text}包`;
			},
		},
	];
	return type === 'package_bulk' ? pulkColums : surgicalColums;
};

export const goodsColums = [
	{
		title: '序号',
		dataIndex: 'index',
		key: 'index',
		align: 'center',
		width: 80,
		render: (text, record, index) => index + 1,
	},
	{
		title: fields.goodsCode,
		dataIndex: 'materialCode',
		key: 'materialCode',
		width: 150,
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
		dataIndex: 'goodsSpecification',
		key: 'goodsSpecification',
		ellipsis: true,
		width: 150,
		renderText: (text: string, record: any) =>
			formatStrConnect(record, ['goodsSpecification', 'goodsModel']),
	},
	{
		title: '数量',
		dataIndex: 'quantity',
		key: 'quantity',
		width: 100,
		render: (text: string) => {
			return `${text}`;
		},
	},
	{
		title: '已扫数量',
		dataIndex: 'goodsItemId',
		key: 'goodsItemId',
		width: 100,
		render: (text: string, record: any) => {
			const pre = text ? parseInt((text.length / record.quantity) * 100) : 0;
			return (
				<Progress
					percent={pre}
					size='small'
					format={(pre) => (text ? text.length : 0)}
					strokeColor='#3D66FF'
				/>
			);
		},
	},
];

export const upackedColums = [
	{
		title: '序号',
		dataIndex: 'index',
		key: 'index',
		align: 'center',
		width: 80,
		render: (text, record, index) => index + 1,
	},
	{
		title: fields.goodsCode,
		dataIndex: 'materialCode',
		key: 'materialCode',
		width: 150,
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
		render: (text: any, record: Record<string, any>) => {
			return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
		},
	},
	{
		title: `${fields.goods}条码`,
		dataIndex: 'operatorBarcode',
		key: 'operatorBarcode',
		width: 150,
	},
];
