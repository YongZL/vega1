import { Tag } from 'antd';
import { useModel } from 'umi';
import { formatStrConnect } from '@/utils/format';

const { fields } = useModel('fieldsMapping');

const DetailColumns = {
	goodsColumns: [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render: (text: any, record: any, index: number) => index + 1,
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
			width: 180,
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
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 100,
			ellipsis: true,
		},
		{
			title: '包装规格',
			dataIndex: 'minGoodsUnitNum',
			key: 'minGoodsUnitNum',
			width: 100,
			render: (text: any, record: { minGoodsUnit: any; purchaseGoodsUnit: string }) => {
				return text + record.minGoodsUnit + '/' + record.purchaseGoodsUnit;
			},
		},
		{
			title: '系统库存',
			dataIndex: 'systemStockQuantity',
			key: 'systemStockQuantity',
			width: 100,
		},
		{
			title: '实际库存',
			dataIndex: 'actualStockQuantity',
			key: 'actualStockQuantity',
			width: 100,
		},
		{
			title: '盈亏情况',
			dataIndex: 'id',
			key: 'id',
			render: (_: any, record: { actualStockQuantity: number; systemStockQuantity: number }) => {
				const result = Number(record.actualStockQuantity - record.systemStockQuantity);
				const color =
					result < 0
						? CONFIG_LESS['@c_starus_done']
						: result > 0
						? CONFIG_LESS['@c_starus_done']
						: 'default';
				return <Tag color={color}>{result}</Tag>;
			},
			width: 100,
		},
		{
			title: '盈亏原因',
			dataIndex: 'errorReason',
			key: 'errorReason',
			width: 120,
			ellipsis: true,
		},
		{
			title: '解决办法',
			dataIndex: 'solutions',
			key: 'solutions',
			width: 120,
			ellipsis: true,
		},
	],
	bulkColumns: [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render: (text: any, record: any, index: number) => index + 1,
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
			width: 160,
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 160,
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
			title: '包装数',
			dataIndex: 'packageBulkUnitNum',
			key: 'packageBulkUnitNum',
			width: 120,
			render: (text: any, record: { minGoodsUnit: any; packageBulkUnit: string }) => {
				return text + record.minGoodsUnit + '/' + record.packageBulkUnit;
			},
		},
		{
			title: '系统库存',
			dataIndex: 'systemStockQuantity',
			key: 'systemStockQuantity',
			width: 100,
		},
		{
			title: '实际库存',
			dataIndex: 'actualStockQuantity',
			key: 'actualStockQuantity',
			width: 100,
		},
		{
			title: '盈亏情况',
			dataIndex: 'id',
			key: 'id',
			render: (x: any, record: { actualStockQuantity: number; systemStockQuantity: number }) => {
				const result = Number(record.actualStockQuantity - record.systemStockQuantity);
				const color =
					result < 0
						? CONFIG_LESS['@c_starus_done']
						: result > 0
						? CONFIG_LESS['@c_starus_done']
						: 'default';
				return <Tag color={color}>{result}</Tag>;
			},
			width: 100,
		},
		{
			title: '盈亏原因',
			dataIndex: 'errorReason',
			key: 'errorReason',
			width: 150,
			ellipsis: true,
		},
		{
			title: '解决办法',
			dataIndex: 'solutions',
			key: 'solutions',
			width: 150,
			ellipsis: true,
		},
	],
	surgicalColumns: [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render: (text: any, record: any, index: number) => index + 1,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 150,
		},
		{
			title: '套包名称',
			dataIndex: 'packageSurgicalName',
			key: 'packageSurgicalName',
			width: 200,
			ellipsis: true,
		},
		{
			title: '系统库存',
			dataIndex: 'systemStockQuantity',
			key: 'systemStockQuantity',
			width: 100,
		},
		{
			title: '实际库存',
			dataIndex: 'actualStockQuantity',
			key: 'actualStockQuantity',
			width: 100,
		},
		{
			title: '盈亏情况',
			dataIndex: 'id',
			key: 'id',
			render: (x: any, record: { actualStockQuantity: number; systemStockQuantity: number }) => {
				const result = Number(record.actualStockQuantity - record.systemStockQuantity);
				const color =
					result < 0
						? CONFIG_LESS['@c_starus_done']
						: result > 0
						? CONFIG_LESS['@c_starus_done']
						: 'default';
				return <Tag color={color}>{result}</Tag>;
			},
			width: 100,
		},
		{
			title: '盈亏原因',
			dataIndex: 'errorReason',
			key: 'errorReason',
			width: 150,
			ellipsis: true,
		},
		{
			title: '解决办法',
			dataIndex: 'solutions',
			key: 'solutions',
			width: 150,
			ellipsis: true,
		},
	],
};
export default DetailColumns;
