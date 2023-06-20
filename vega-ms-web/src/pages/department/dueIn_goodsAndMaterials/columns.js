import { Popconfirm } from 'antd';
import moment from 'moment';
import { pickingPendingSourceTextMap, pickingPendingStatusTextMap } from '@/constants/dictionary';
import { formatStrConnect } from '@/utils/format';

const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');

// 基础物资
export const getGoodsColumns = ({ handleCancels } = {}) => {
	let column = [
		{
			title: '推送科室',
			dataIndex: 'departmentName',
			width: 130,
			ellipsis: true,
		},
		{
			title: '推送仓库',
			dataIndex: 'warehouseName',
			width: 130,
			ellipsis: true,
		},
		{
			title: '货位号',
			dataIndex: 'locationNo',
			width: 120,
			ellipsis: true,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			width: 130,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			render: (text, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			width: 100,
			render: (text, record) => {
				return <span>{text + record.unit}</span>;
			},
		},
		{
			title: '状态',
			dataIndex: 'status',
			width: 100,
			render: (text) => {
				return <span>{pickingPendingStatusTextMap[text]}</span>;
			},
		},
		{
			title: '类型',
			dataIndex: 'source',
			width: 100,
			render: (text) => {
				return <span>{[pickingPendingSourceTextMap[text]]}</span>;
			},
		},
		{
			title: '提交时间',
			dataIndex: 'timeCreated',
			key: 'timeCreated',
			width: 180,
			render: (text) => {
				return <span>{text ? moment(text).format('YYYY/MM/DD  HH:mm:ss') : '-'}</span>;
			},
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 62,
			render: (id, record) => {
				return (
					<div
						className='operation'
						onClick={(e) => {
							e.stopPropagation();
						}}>
						{record.status !== 'canceled' && (
							<Popconfirm
								title='确定取消？'
								onConfirm={() => handleCancels(record.id)}>
								<span className='handleLink'>取消</span>
							</Popconfirm>
						)}
					</div>
				);
			},
		},
	];
	return column;
};

// 定数包
export const getPackageBulkColumns = ({ handleCancels } = {}) => {
	let column = [
		{
			title: '推送科室',
			dataIndex: 'departmentName',
			width: 120,
			ellipsis: true,
		},
		{
			title: '推送仓库',
			dataIndex: 'warehouseName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '货位号',
			dataIndex: 'locationNo',
			width: 120,
			ellipsis: true,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			width: 120,
		},
		{
			title: '定数包名称',
			dataIndex: 'packageBulkName',
			width: 120,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			render: (text, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			width: 100,
			render: (text, record) => {
				return <span>{text + record.packageBulkUnit}</span>;
			},
		},
		{
			title: '状态',
			dataIndex: 'status',
			width: 100,
			render: (text) => {
				return <span>{pickingPendingStatusTextMap[text]}</span>;
			},
		},
		{
			title: '类型',
			dataIndex: 'source',
			width: 120,
			render: (text, record) => {
				return <span>{[pickingPendingSourceTextMap[text]]}</span>;
			},
		},
		{
			title: '提交时间',
			dataIndex: 'timeCreated',
			width: 180,
			render: (text) => {
				return <span>{text ? moment(text).format('YYYY/MM/DD  HH:mm:ss') : '-'}</span>;
			},
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 62,
			render: (id, record) => {
				return (
					<div
						className='operation'
						onClick={(e) => {
							e.stopPropagation();
						}}>
						{record.status !== 'canceled' && (
							<Popconfirm
								title='确定取消？'
								onConfirm={() => handleCancels(record.id)}>
								<span className='handleLink'>取消</span>
							</Popconfirm>
						)}
					</div>
				);
			},
		},
	];
	return column;
};

// 医耗套包
export const getPackageColumns = ({ handleCancels } = {}) => {
	let column = [
		{
			title: '推送科室',
			dataIndex: 'departmentName',
			width: 120,
			ellipsis: true,
		},
		{
			title: '推送仓库',
			dataIndex: 'warehouseName',
			width: 180,
			ellipsis: true,
		},
		{
			title: '货位号',
			dataIndex: 'locationNo',
			width: 150,
			ellipsis: true,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			width: 120,
		},
		{
			title: '套包名称',
			dataIndex: 'goodsName',
			width: 160,
			ellipsis: true,
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			width: 100,
			render: (text, record) => {
				return <span>{text + record.unit}</span>;
			},
		},
		{
			title: '状态',
			dataIndex: 'status',
			width: 100,
			render: (text) => {
				return <span>{pickingPendingStatusTextMap[text]}</span>;
			},
		},
		{
			title: '类型',
			dataIndex: 'source',
			width: 120,
			render: (text, record) => {
				return <span>{[pickingPendingSourceTextMap[text]]}</span>;
			},
		},
		{
			title: '提交时间',
			dataIndex: 'timeCreated',
			width: 200,
			render: (text) => {
				return <span>{text ? moment(text).format('YYYY/MM/DD  HH:mm:ss') : '-'}</span>;
			},
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 62,
			render: (id, record) => {
				return (
					<div
						className='operation'
						onClick={(e) => {
							e.stopPropagation();
						}}>
						{record.status !== 'canceled' && (
							<Popconfirm
								title='确定取消？'
								onConfirm={() => handleCancels(record.id)}>
								<span className='handleLink'>取消</span>
							</Popconfirm>
						)}
					</div>
				);
			},
		},
	];
	return column;
};

// 基础物资配货单详情
export const getGoodsDetailColumns = ({ handleDelete }) => [
	{
		title: fields.goodsCode,
		dataIndex: 'materialCode',
		width: 120,
	},
	{
		title: fields.goodsName,
		dataIndex: 'goodsName',
		width: 160,
		ellipsis: true,
	},
	{
		title: '规格/型号',
		dataIndex: 'specification',
		key: 'specification',
		ellipsis: true,
		width: 150,
		render: (text, record) => {
			return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
		},
	},
	{
		title: '生产厂家',
		dataIndex: 'manufacturerName',
		width: 150,
		ellipsis: true,
	},
	{
		title: '数量',
		dataIndex: 'quantity',
		width: 100,
		render: (text, record) => {
			return <span>{text + record.unit}</span>;
		},
	},
	{
		title: '可用库存',
		dataIndex: 'stock',
		width: 100,
		render: (text, record) => {
			return <span>{text + record.unit}</span>;
		},
	},
	{
		title: '操作',
		dataIndex: 'option',
		key: 'option',
		width: 62,
		render: (id, record) => {
			return (
				<Popconfirm
					title={`确定删除该${fields.baseGoods}？`}
					onConfirm={() => handleDelete(record.id)}>
					<span className='handleDanger'>删除</span>
				</Popconfirm>
			);
		},
	},
];

// 定数包配货单详情
export const getPackageBulkDetailColumns = ({ handleDelete }) => [
	{
		title: fields.goodsCode,
		dataIndex: 'materialCode',
		width: 120,
	},
	{
		title: '定数包名称',
		dataIndex: 'packageBulkName',
		width: 120,
		ellipsis: true,
	},
	{
		title: '规格/型号',
		dataIndex: 'specification',
		key: 'specification',
		ellipsis: true,
		width: 150,
		render: (text, record) => {
			return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
		},
	},
	{
		title: '生产厂家',
		dataIndex: 'manufacturerName',
		width: 150,
		ellipsis: true,
	},
	{
		title: '数量',
		dataIndex: 'quantity',
		width: 100,
		render: (text, record) => {
			return <span>{text + record.packageBulkUnit}</span>;
		},
	},
	{
		title: '可用库存',
		dataIndex: 'stock',
		width: 100,
		render: (text, record) => {
			return <span>{text + record.packageBulkUnit}</span>;
		},
	},
	{
		title: '操作',
		dataIndex: 'option',
		key: 'option',
		width: 62,
		render: (id, record) => {
			return (
				<Popconfirm
					title={`确定删除该${fields.baseGoods}？`}
					onConfirm={() => handleDelete(record.id)}>
					<span className='handleDanger'>删除</span>
				</Popconfirm>
			);
		},
	},
];

// 套包配货单详情
export const getPackageDetaiColumns = ({ handleDelete }) => [
	{
		title: fields.goodsCode,
		dataIndex: 'materialCode',
		key: 'materialCode',
		width: 120,
	},
	{
		title: '套包名称',
		dataIndex: 'goodsName',
		key: 'goodsName',
		width: 160,
		ellipsis: true,
	},
	{
		title: '数量',
		dataIndex: 'quantity',
		key: 'quantity',
		width: 100,
		render: (text, record) => {
			return <span>{text + record.unit}</span>;
		},
	},
	{
		title: '可用库存',
		dataIndex: 'stock',
		key: 'stock',
		width: 100,
		render: (text, record) => {
			return <span>{text + record.unit}</span>;
		},
	},
	{
		title: '操作',
		dataIndex: 'option',
		key: 'option',
		width: 62,
		render: (id, record) => {
			return (
				<Popconfirm
					title={`确定删除该${fields.baseGoods}？`}
					onConfirm={handleDelete(record.id)}>
					<span className='handleDanger'> 删除</span>
				</Popconfirm>
			);
		},
	},
];
