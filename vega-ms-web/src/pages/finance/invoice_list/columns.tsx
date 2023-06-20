import { isReverseTextMap, makeInvoiceTypeTextMap } from '@/constants/dictionary';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { Divider, Popconfirm } from 'antd';
import moment from 'moment';
import { useModel } from 'umi';

const { fields } = useModel('fieldsMapping');

export const approveColumns = (permissions: any, handleType) => {
	const colums = [
		{
			title: '发票号码',
			dataIndex: 'serialNumber',
			key: 'serialNumber',
			width: 150,
		},
		{
			title: '发票代码',
			dataIndex: 'serialCode',
			key: 'serialCode',
			width: 150,
		},
		{
			title: '开票方式',
			dataIndex: 'releaseType',
			key: 'releaseType',
			width: 120,
			render: (text: string) => makeInvoiceTypeTextMap[text],
		},
		// {
		//   title: '分类',
		//   dataIndex: 'invoiceSync',
		//   key: 'invoiceSync',
		//   width: 100,
		//   render: (text: boolean) => {
		//     return text ? '货票同行' : '销后结算';
		//   },
		// },
		// {
		//   title: '发票类型',
		//   dataIndex: 'category',
		//   key: 'category',
		//   width: 150,
		//   render: (text: string) => invoiceTypeTextMap[text],
		{
			title: '付款方',
			dataIndex: 'title',
			key: 'title',
			width: 150,
			ellipsis: true,
		},
		{
			title: '发票含税金额(元)',
			dataIndex: 'totalAmount',
			key: 'totalAmount',
			width: 150,
			align: 'right',
			render: (text: number, record: any) => {
				return (
					<span className={record.invoiceType == 'reverse' ? 'cl_FF110B' : ''}>
						{convertPriceWithDecimal(text)}
					</span>
				);
			},
		},
		{
			title: '开票日期',
			dataIndex: 'releaseDate',
			key: 'releaseDate',
			width: 120,
			render: (text: number) => {
				return text ? moment(text).format('YYYY/MM/DD') : '-';
			},
		},
		{
			title: '上传时间',
			dataIndex: 'uploadTime',
			key: 'uploadTime',
			width: 150,
			render: (text: number) => {
				return text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '红冲票',
			dataIndex: 'invoiceType',
			key: 'invoiceType',
			width: 100,
			render: (text: string) => isReverseTextMap[text],
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			fixed: 'right',
			width: 106,
			render: (_, record) => {
				return (
					<div>
						<span
							className='handleLink'
							onClick={() => handleType(record, 'detail')}>
							查看
						</span>
						{permissions.includes('invoice_approve') && (
							<>
								<Divider type='vertical' />
								<span
									className='handleLink'
									onClick={() => handleType(record, 'approve_pending')}>
									审核
								</span>
							</>
						)}
					</div>
				);
			},
		},
	];
	return colums;
};

export const checkColumns = (permissions: any, handleType) => {
	const colums = [
		{
			title: '发票号码',
			dataIndex: 'serialNumber',
			key: 'serialNumber',
			width: 150,
		},
		{
			title: '发票代码',
			dataIndex: 'serialCode',
			key: 'serialCode',
			width: 120,
		},
		{
			title: '开票方式',
			dataIndex: 'releaseType',
			key: 'releaseType',
			width: 120,
			render: (text: string) => makeInvoiceTypeTextMap[text],
		},
		// {
		//   title: '发票类型',
		//   dataIndex: 'category',
		//   key: 'category',
		//   width: 120,
		//   render: (text: string) => invoiceTypeTextMap[text],
		{
			title: '开票企业',
			dataIndex: 'enterprise',
			key: 'enterprise',
			width: 150,
			ellipsis: true,
		},
		{
			title: '发票含税金额(元)',
			dataIndex: 'totalAmount',
			key: 'totalAmount',
			width: 150,
			align: 'right',
			render: (text: number, record: any) => {
				return (
					<span className={record.invoiceType == 'reverse' ? 'cl_FF110B' : ''}>
						{convertPriceWithDecimal(text)}
					</span>
				);
			},
		},
		{
			title: '开票日期',
			dataIndex: 'releaseDate',
			key: 'releaseDate',
			width: 120,
			render: (text: number) => {
				return text ? moment(text).format('YYYY/MM/DD') : '-';
			},
		},
		{
			title: '上传时间',
			dataIndex: 'uploadTime',
			key: 'uploadTime',
			width: 150,
			render: (text: number) => {
				return text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '审核时间',
			dataIndex: 'approveTime',
			key: 'approveTime',
			width: 140,
			render: (text: number) => {
				return text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '红冲票',
			dataIndex: 'invoiceType',
			key: 'invoiceType',
			width: 100,
			render: (text: string) => isReverseTextMap[text],
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 106,
			fixed: 'right',
			render: (_, record) => {
				return (
					<div>
						<span
							className='handleLink'
							onClick={() => handleType(record, 'detail')}>
							查看
						</span>
						{permissions.includes('invoice_check') && (
							<>
								<Divider type='vertical' />
								<span
									className='handleLink'
									onClick={() => handleType(record, 'check_pending')}>
									验收
								</span>
							</>
						)}
					</div>
				);
			},
		},
	];
	return colums;
};

export const payColumns = (permissions: any, handleType) => {
	const colums = [
		{
			title: '发票号码',
			dataIndex: 'serialNumber',
			key: 'serialNumber',
			width: 150,
		},
		{
			title: '发票代码',
			dataIndex: 'serialCode',
			key: 'serialCode',
			width: 150,
		},
		{
			title: '开票方式',
			dataIndex: 'releaseType',
			key: 'releaseType',
			width: 120,
			render: (text: string) => makeInvoiceTypeTextMap[text],
		},
		// {
		//   title: '发票类型',
		//   dataIndex: 'category',
		//   key: 'category',
		//   width: 150,
		//   render: (text: string) => invoiceTypeTextMap[text],
		{
			title: '开票企业',
			dataIndex: 'enterprise',
			key: 'enterprise',
			width: 150,
			ellipsis: true,
		},
		{
			title: '发票含税金额(元)',
			dataIndex: 'totalAmount',
			key: 'totalAmount',
			width: 150,
			align: 'right',
			render: (text: number, record: any) => {
				return (
					<span className={record.invoiceType == 'reverse' ? 'cl_FF110B' : ''}>
						{convertPriceWithDecimal(text)}
					</span>
				);
			},
		},
		{
			title: '开票日期',
			dataIndex: 'releaseDate',
			key: 'releaseDate',
			width: 120,
			render: (text: number) => {
				return text ? moment(text).format('YYYY/MM/DD') : '-';
			},
		},
		{
			title: '上传时间',
			dataIndex: 'uploadTime',
			key: 'uploadTime',
			width: 150,
			render: (text: number) => {
				return text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '审核时间',
			dataIndex: 'approveTime',
			key: 'approveTime',
			width: 150,
			render: (text: number) => {
				return text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '验收时间',
			dataIndex: 'checkTime',
			key: 'checkTime',
			width: 150,
			render: (text: number) => {
				return text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '账期',
			dataIndex: 'accountPeriod',
			key: 'accountPeriod',
			width: 100,
			render: (text) => {
				return text + '天';
			},
		},
		{
			title: '到期日期',
			dataIndex: 'dueDate',
			key: 'dueDate',
			width: 120,
			render: (text: number) => {
				return text ? moment(text).format('YYYY/MM/DD') : '-';
			},
		},
		{
			title: '红冲票',
			dataIndex: 'invoiceType',
			key: 'invoiceType',
			width: 100,
			render: (text: string) => isReverseTextMap[text],
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			fixed: 'right',
			width: 162,
			render: (_, record) => {
				return (
					<div
						onClick={(e) => {
							e.stopPropagation();
						}}>
						<span
							className='handleLink'
							onClick={() => handleType(record, 'detail')}>
							查看
						</span>
						{record.invoiceType === 'normal' && permissions.includes('invoice_pay') && (
							<>
								<Divider type='vertical' />
								<span
									className='handleLink'
									onClick={() => {
										handleType(record, 'pay');
									}}>
									上传转账凭证
								</span>
							</>
						)}
					</div>
				);
			},
		},
	];
	return colums;
};

export const finishedColumns = (permissions: any, handleType) => {
	const colums = [
		{
			title: '发票号码',
			dataIndex: 'serialNumber',
			key: 'serialNumber',
			width: 150,
		},
		{
			title: '发票代码',
			dataIndex: 'serialCode',
			key: 'serialCode',
			width: 150,
		},
		{
			title: '开票方式',
			dataIndex: 'releaseType',
			key: 'releaseType',
			width: 120,
			render: (text: string) => makeInvoiceTypeTextMap[text],
		},
		// {
		//   title: '发票类型',
		//   dataIndex: 'category',
		//   key: 'category',
		//   width: 150,
		//   render: (text: string) => invoiceTypeTextMap[text],
		{
			title: '开票企业',
			dataIndex: 'enterprise',
			key: 'enterprise',
			width: 150,
			ellipsis: true,
		},
		{
			title: '发票含税金额(元)',
			dataIndex: 'totalAmount',
			key: 'totalAmount',
			width: 150,
			align: 'right',
			render: (text: number, record: any) => {
				return (
					<span className={record.invoiceType == 'reverse' ? 'cl_FF110B' : ''}>
						{convertPriceWithDecimal(text)}
					</span>
				);
			},
		},
		{
			title: '开票日期',
			dataIndex: 'releaseDate',
			key: 'releaseDate',
			width: 120,
			render: (text: number) => {
				return text ? moment(text).format('YYYY/MM/DD') : '-';
			},
		},
		{
			title: '上传时间',
			dataIndex: 'uploadTime',
			key: 'uploadTime',
			width: 150,
			render: (text: number) => {
				return text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '审核时间',
			dataIndex: 'approveTime',
			key: 'approveTime',
			width: 150,
			render: (text: number) => {
				return text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '验收时间',
			dataIndex: 'checkTime',
			key: 'checkTime',
			width: 150,
			render: (text: number) => {
				return text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '转账日期',
			dataIndex: 'paymentDate',
			key: 'paymentDate',
			width: 120,
			render: (text: number) => {
				return text ? moment(text).format('YYYY/MM/DD') : '-';
			},
		},
		{
			title: '红冲票',
			dataIndex: 'invoiceType',
			key: 'invoiceType',
			width: 100,
			render: (text: string) => isReverseTextMap[text],
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			fixed: 'right',
			width: 162,
			render: (_, record) => {
				return (
					<div>
						<span
							className='handleLink'
							onClick={() => handleType(record, 'detail')}>
							查看
						</span>
						<Divider type='vertical' />
						<span
							className='handleLink'
							onClick={() => handleType(record, 'payDetail')}>
							查看转账凭证
						</span>
					</div>
				);
			},
		},
	];
	return colums;
};

export const rejectColumns = (permissions: any, handleType) => {
	const colums = [
		{
			title: '发票号码',
			dataIndex: 'serialNumber',
			key: 'serialNumber',
			width: 150,
		},
		{
			title: '发票代码',
			dataIndex: 'serialCode',
			key: 'serialCode',
			width: 150,
		},
		{
			title: '开票方式',
			dataIndex: 'releaseType',
			key: 'releaseType',
			width: 120,
			render: (text: string) => makeInvoiceTypeTextMap[text],
		},
		// {
		//   title: '发票类型',
		//   dataIndex: 'category',
		//   key: 'category',
		//   width: 150,
		//   render: (text: string) => invoiceTypeTextMap[text],
		{
			title: '付款方',
			dataIndex: 'title',
			key: 'title',
			width: 150,
			ellipsis: true,
		},
		{
			title: '发票含税金额(元)',
			dataIndex: 'totalAmount',
			key: 'totalAmount',
			width: 150,
			align: 'right',
			render: (text: number, record: any) => {
				return (
					<span className={record.invoiceType == 'reverse' ? 'cl_FF110B' : ''}>
						{convertPriceWithDecimal(text)}
					</span>
				);
			},
		},
		{
			title: '开票日期',
			dataIndex: 'releaseDate',
			key: 'releaseDate',
			width: 120,
			render: (text: number) => {
				return text ? moment(text).format('YYYY/MM/DD') : '-';
			},
		},
		{
			title: '上传时间',
			dataIndex: 'uploadTime',
			key: 'uploadTime',
			width: 150,
			render: (text: number) => {
				return text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '驳回时间',
			dataIndex: 'checkTime',
			key: 'checkTime',
			width: 150,
			render: (text: number, record: any) => {
				return text
					? moment(text).format('YYYY/MM/DD HH:mm:ss')
					: moment(record.approveTime).format('YYYY/MM/DD HH:mm:ss');
			},
		},
		{
			title: '驳回理由',
			dataIndex: 'reason',
			key: 'reason',
			width: 120,
			ellipsis: true,
		},
		{
			title: '驳回类型',
			dataIndex: 'approveTime',
			key: 'approveTime',
			width: 120,
			render: (text: number, record: any) => {
				return record.checkTime ? '验收驳回' : '审核驳回';
			},
		},
		{
			title: '红冲票',
			dataIndex: 'invoiceType',
			key: 'invoiceType',
			width: 100,
			render: (text: string) => isReverseTextMap[text],
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 151,
			fixed: 'right',
			render: (_, record) => {
				return (
					<div>
						<span
							className='handleLink'
							onClick={() => handleType(record, 'detail')}>
							查看
						</span>
						{permissions.includes('invoice_remove') && (
							<>
								<Divider type='vertical' />
								<Popconfirm
									placement='left'
									title='作废后将不能找回，是否继续作废？'
									onConfirm={() => {
										handleType(record, 'remove');
									}}>
									<span className='handleLink'>作废</span>
								</Popconfirm>
							</>
						)}
						{permissions.includes('invoice_update') &&
							!(
								record.invoiceType === 'reverse' && record.releaseType === 'electronic_invoice'
							) && (
								<>
									<Divider type='vertical' />
									<span
										className='handleLink'
										onClick={() => handleType(record, 'edit')}>
										修改
									</span>
								</>
							)}
					</div>
				);
			},
		},
	];
	return colums;
};

export const billColumns = (invoiceType: string) => {
	const colums = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			render: (text, redord, index) => <span>{index + 1}</span>,
			width: 70,
		},
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 160,
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
			title: '开票数量',
			dataIndex: 'quantity',
			key: 'quantity',
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
				return convertPriceWithDecimal(text);
			},
		},
		{
			title: '含税金额(元)',
			dataIndex: 'amount',
			key: 'amount',
			width: 130,
			align: 'right',
			render: (text: number) => {
				return (
					<span className={invoiceType == 'reverse' ? 'cl_FF110B' : ''}>
						{invoiceType == 'reverse' ? '-' : ''}
						{convertPriceWithDecimal(text)}
					</span>
				);
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
			render: (text) => text || '-',
		},
		{
			title: '验收数量',
			dataIndex: 'passedQuantity',
			key: 'passedQuantity',
			width: 120,
		},
		{
			title: '验收日期',
			dataIndex: 'acceptanceTime',
			key: 'acceptanceTime',
			width: 120,
			render: (text) => {
				return text ? moment(text).format('YYYY/MM/DD') : '-';
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

export const salesColumns = (invoiceType: string) => {
	const colums = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			render: (text, redord, index) => <span>{index + 1}</span>,
			width: 70,
		},
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 160,
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
			title: '开票数量',
			dataIndex: 'quantity',
			key: 'quantity',
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
			title: '含税金额(元)',
			dataIndex: 'amount',
			key: 'amount',
			width: 130,
			align: 'right',
			render: (text: number) => {
				return (
					<span className={invoiceType == 'reverse' ? 'cl_FF110B' : ''}>
						{invoiceType == 'reverse' ? '-' : ''}
						{convertPriceWithDecimal(text)}
					</span>
				);
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
			title: '验收日期',
			dataIndex: 'acceptanceTime',
			key: 'acceptanceTime',
			width: 120,
			render: (text) => {
				return text ? moment(text).format('YYYY/MM/DD') : '-';
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
