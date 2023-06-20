import InputUnit from '@/components/InputUnit';
import type { ProColumns } from '@/components/ProTable/typings';
import ProTable from '@/components/ResizableTable';
import { formatPackageQuantity, formatStrConnect } from '@/utils/format';
import { Input, Form } from 'antd';
import { debounce } from 'lodash';
import { ChangeEvent, FC, useEffect, useImperativeHandle, useState } from 'react';
import { useModel } from 'umi';
const FormItem = Form.Item;
interface RefData {
	getTableData: () => Record<string, any>[];
}
interface Props {
	title: string;
	modalType: string;
	goodsRef: React.MutableRefObject<RefData | undefined>;
	reasonType: Record<string, string>;
	quantityType: Record<string, string>;
	detail: Record<string, any>;
	tableData: Record<string, any>[];
	apply_detail: Record<string, any>;
	setIssubmtFn: (value: boolean) => void;
}
type GoodsRecord = GoodsRequestController.GoodsRecord;

const Goods: FC<Props> = ({
	detail,
	modalType,
	setIssubmtFn,
	reasonType,
	quantityType,
	tableData,
	apply_detail = {},
	goodsRef,
}) => {
	const { fields } = useModel('fieldsMapping');

	useImperativeHandle(goodsRef, () => ({
		getTableData: () => {
			return goodsData;
		},
	}));
	const [goodsData, setGoodsData] = useState<GoodsRecord[]>([]);
	let isApprovalReview = apply_detail?.status == 'approval_review_pending' ? false : true;
	useEffect(() => {
		const getDetails = () => {
			let result = (tableData || []).map((item) =>
				modalType == 'view'
					? {
							...item,
							quantity: item.quantity,
							approvalQuantity: item.approvalQuantity,
							approvalReviewQuantity: item.approvalReviewQuantity,
							minTotal:
								(item.approvalReviewQuantity == 0 ? '0' : item.approvalReviewQuantity) ||
								(item.approvalQuantity == 0 ? '0' : item.approvalQuantity) ||
								item.quantity,
					  }
					: modalType == 'audit'
					? {
							...item,
							minTotal: item.quantity,
							approvalQuantity: item.quantity,
					  }
					: {
							...item,
							minTotal: item.approvalQuantity,
							approvalReviewQuantity: item.approvalQuantity,
					  },
			);
			setGoodsData(result);
		};
		getDetails();
	}, []);

	const onChangeAddQuantity = (values: number | string, id: number | string) => {
		if (values === 0) {
			setIssubmtFn(true);
			return;
		}
		setIssubmtFn(false);

		let newGoods = goodsData.map((item) =>
			id == item.id
				? {
						...item,
						[quantityType[modalType]]: values || 0,
						minTotal: values ? (values as number) : '',
				  }
				: { ...item },
		);
		setGoodsData(newGoods);
	};

	const inputChange = (e: ChangeEvent<HTMLInputElement>, id: number) => {
		let newGoods = goodsData.map((item) =>
			id == item.id ? { ...item, [reasonType[modalType]]: e.target.value || '' } : { ...item },
		);
		setGoodsData(newGoods);
	};

	const goodsColumnsPend: ProColumns<GoodsRecord>[] = [
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
			width: 140,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '通用名称',
			dataIndex: 'commonName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 150,
			ellipsis: true,
			renderText: (text: string, record) => {
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
			title: '请领数量基数',
			dataIndex: 'conversionRate',
			width: 120,
			render: (text, record) => {
				return `${text || ''} ${record.minGoodsUnit || ''}`;
			},
		},
		{
			title: '库存量',
			dataIndex: 'stocks',
			key: 'stocks',
			width: 100,
			hideInTable: isApprovalReview,
			render: (text, record) => {
				let stocks = Number(record.stocks || 0);
				return stocks && stocks > 0 ? stocks : 0;
			},
		},
		{
			title: '申请数量',
			dataIndex:
				modalType == 'view'
					? 'quantity'
					: modalType == 'audit'
					? 'approvalQuantity'
					: 'approvalReviewQuantity',
			width: 120,
			render: (text, record) => {
				const { status } = detail;
				let key = ['approval_review_success', 'approval_part_success'].includes(status)
					? 'approvalReviewQuantity'
					: ['approval_review_pending', 'approval_review_failure'].includes(status)
					? 'approvalQuantity'
					: 'quantity';
				return (
					<>
						{modalType === 'view' && (
							<span>{`${record[key] || 0}${record.conversionUnitName}`}</span>
						)}
						{modalType !== 'view' && (
							<FormItem
								style={{ margin: 0 }}
								name={`quantity${record.id}`}
								initialValue={text ? Number(text || 0) : undefined}
								rules={[
									{ required: true, message: '请输入' },
									{
										validator: (_rule, value: string) => {
											if (!value) {
												return Promise.resolve();
											} else {
												if (Number(value) % record.conversionRate !== 0) {
													return Promise.reject(`请输入 ${record.conversionRate} 的倍数`);
												}
												return Promise.resolve();
											}
										},
									},
								]}>
								<InputUnit
									min={0}
									max={999999}
									value={Number(text)}
									style={{ width: '100px' }}
									unit={record.conversionUnitName}
									onChange={debounce((val) => onChangeAddQuantity(val, record.id), 300)}
								/>
							</FormItem>
						)}
					</>
				);
			},
		},
		{
			title: '小计数量',
			dataIndex: 'minTotal',
			width: 100,
			render: (text, record) => (text ? `${text}${record.minGoodsUnit}` : '-'),
		},
		{
			title: '大/中/散',
			dataIndex: 'packageQuantity',
			width: 100,
			render: (text, record) => {
				return formatPackageQuantity({
					goods: record,
					quantity: 'minTotal',
				});
			},
		},
		{
			title: '全院剩余额度',
			dataIndex: 'limitPerMonth',
			key: 'limitPerMonth',
			width: 120,
			hideInTable: isApprovalReview,
			renderText: (text: number, record) => {
				return record.limitType && text ? (
					<span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>
						{parseInt((text - record.inboundPerMonth).toString()) + record.minGoodsUnit}
					</span>
				) : (
					'-'
				);
			},
		},

		{
			title: '备注',
			dataIndex: 'operationRecords',
			width: 500,
			ellipsis: true,
		},
		{
			title: '批注',
			dataIndex: modalType == 'audit' ? 'approvalReason' : 'approvalReviewReason',
			width: 180,
			hideInTable: modalType == 'view' ? true : false,
			renderText: (text, record) => {
				return (
					<>
						{modalType != 'view' && (
							<>
								<Input
									onChange={(e) => inputChange(e, record.id)}
									value={text || ''}
									style={{ width: '150px' }}
									maxLength={100}
								/>
							</>
						)}
					</>
				);
			},
		},
	];

	return (
		<>
			{goodsData.length > 0 && (
				<div>
					<ProTable<GoodsRecord>
						columns={goodsColumnsPend}
						rowKey='id'
						loadConfig={{
							request: false,
						}}
						scroll={{ y: 300 }}
						dataSource={goodsData}
						headerTitle={fields.baseGoods}
						searchConfig={undefined}
						tableInfoCode={
							modalType === 'review' ? 'warehouse_request_approval_review_goods' : undefined
						}
						options={
							modalType === 'review' ? {} : { density: false, fullScreen: false, setting: false }
						}
					/>
				</div>
			)}
		</>
	);
};
export default Goods;
