import defaultSettings from '@/../config/defaultSettings';
import InputUnit from '@/components/InputUnit';
import type { ProColumns } from '@/components/ProTable/typings';
import ProTable from '@/components/ResizableTable';
import { formatStrConnect } from '@/utils/format';
import { Col, Input, Row } from 'antd';
import { debounce } from 'lodash';
import { ChangeEvent, createRef, FC, useEffect, useImperativeHandle, useState } from 'react';
import { useModel } from 'umi';
import styles from '../style.less';

interface RefData {
	getTableData: () => Record<string, any>[];
}

interface Props {
	title: string;
	modalType: string;
	reasonType: Record<string, string>;
	ordinaryRef: React.MutableRefObject<RefData | undefined>;
	quantityType: Record<string, string>;
	tableData: Record<string, any>[];
	apply_detail: Record<string, any>;
	setIssubmtFn: (value: boolean) => void;
}

type OrdinaryRecord = GoodsRequestController.OrdinaryRecord;
type OrdinaryGoodsRecord = GoodsRequestController.OrdinaryGoodsRecord;

const CheckModal: FC<Props> = ({ ...props }) => {
	const { fields } = useModel('fieldsMapping');
	const { tableData, apply_detail = {}, ordinaryRef } = props;
	const ordinaryEleRef = createRef<HTMLDivElement>();
	const { quantityType, modalType, reasonType, setIssubmtFn } = props;
	const [goodsxi, setGoodsxi] = useState<OrdinaryGoodsRecord[]>([]);
	const [ordinary, setOrdinary] = useState<OrdinaryRecord[]>([]);
	const [activeId, setActiveId] = useState<string | number>();
	const [ordinaryGoods, setOrdinaryGoods] = useState<OrdinaryRecord[]>([]);
	const [ordinaryRequestItem, setOrdinaryRequestItem] = useState<Record<string, any>>({});

	useImperativeHandle(ordinaryRef, () => ({
		getTableData: () => {
			return ordinaryGoods;
		},
	}));

	useEffect(() => {
		const getDetail = () => {
			let data = tableData as unknown as {
				ordinaryRequestItem: Record<string, any>;
				ordinaryGoods: OrdinaryRecord[];
			};
			setGoodsxi(data.ordinaryGoods[0].goods);
			setOrdinaryGoods(data.ordinaryGoods);
			setOrdinary(data.ordinaryGoods);
			setActiveId(data?.ordinaryGoods[0]?.ordinaryId);
			setOrdinaryRequestItem(data.ordinaryRequestItem);
		};

		if (apply_detail.id) {
			getDetail();
		}
	}, []);

	const onChangeAddQuantity = (values: number | string, id: number | string) => {
		if (values === 0) {
			setIssubmtFn(true);
			return;
		}
		setIssubmtFn(false);
		let newGoods = ordinaryGoods.map((item) =>
			id == item.ordinaryId ? { ...item, [quantityType[modalType]]: values || 0 } : { ...item },
		);
		setOrdinaryGoods(newGoods);
		setOrdinary(newGoods);
	};

	const inputChange = (e: ChangeEvent<HTMLInputElement>, id: number) => {
		let newOrdinary = ordinaryGoods.map((item) =>
			id == item.ordinaryId
				? { ...item, [reasonType[modalType]]: e.target.value || '' }
				: { ...item },
		);
		setOrdinaryGoods(newOrdinary);
	};

	const selectRowOfClick = (id: number) => {
		setActiveId(id);
		ordinary.map((item) => {
			if (item.ordinaryId == id) {
				setGoodsxi(item.goods);
			}
		});
	};

	const column: ProColumns<OrdinaryRecord>[] = [
		{
			title: '医耗套包编号',
			dataIndex: 'ordinaryCode',
			key: 'ordinaryCode',
			width: 140,
		},
		{
			title: '医耗套包名称',
			dataIndex: 'name',
			key: 'name',
			width: 140,
		},
		{
			title: '申请数量',
			dataIndex:
				modalType == 'view'
					? 'quantity'
					: modalType == 'audit'
					? 'approvalQuantity'
					: 'approvalReviewQuantity',
			width: 130,
			render: (_text, record) => {
				let value = record.approvalReviewQuantity
					? Number(record.approvalReviewQuantity)
					: record.approvalQuantity
					? Number(record.approvalQuantity)
					: Number(record.requestNum);
				return (
					<>
						{modalType == 'view' && <span>{value}</span>}
						{modalType != 'view' && (
							<div ref={ordinaryEleRef}>
								<InputUnit
									min={0}
									max={999999}
									value={value}
									// autoFocus={record.ordinaryId == activeId}
									style={{
										width: '100px',

										borderColor: record.ordinaryId == activeId ? defaultSettings.primaryColor : '',
									}}
									onChange={debounce((value) => onChangeAddQuantity(value, record.ordinaryId), 300)}
								/>
							</div>
						)}
					</>
				);
			},
		},
		{
			title: '备注',
			dataIndex: 'operationRecords',
			width: 500,
			ellipsis: true,
			renderText: (_text, record) => {
				return record.operationRecords;
			},
		},
	];
	let reasonArr = {
		title: '批注',
		width: 180,
		dataIndex: modalType == 'audit' ? 'approvalReason' : 'approvalReviewReason',
		render: (text: string, record: Record<string, any>) => {
			return (
				<>
					{modalType != 'view' && (
						<>
							<Input
								value={text || ''}
								maxLength={100}
								style={{ width: '150px' }}
								onChange={(e) => inputChange(e, record.ordinaryId)}
							/>
						</>
					)}
				</>
			);
		},
	};

	if (modalType !== 'view') {
		column.push(reasonArr);
	}
	const columnGoods: ProColumns<OrdinaryGoodsRecord>[] = [
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 140,
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			key: 'name',
			width: 140,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 150,
			ellipsis: true,
			render: (text, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '包装规格',
			dataIndex: 'minGoodsUnit',
			key: 'minGoodsUnit',
			width: 150,
			ellipsis: true,
			render: (_text, record) => {
				const info = `${record.unitNum || ''} ${
					(record.minGoodsUnit && record.purchaseGoodsUnit && '/') || ''
				} ${record.purchaseGoodsUnit || ''}`;
				return <span>{info}</span>;
			},
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 140,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			width: 150,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 200,
			ellipsis: true,
		},
	];

	return (
		<div className={styles.ordinary}>
			{Object.keys(ordinaryRequestItem).length > 0 && (
				<Row>
					<Col
						sm={24}
						md={10}
						style={{ paddingRight: '3px' }}>
						<ProTable<OrdinaryRecord>
							columns={column}
							rowKey='ordinaryId'
							loadConfig={{
								request: false,
							}}
							dataSource={ordinaryGoods}
							headerTitle='医耗套包'
							searchConfig={undefined}
							scroll={{ x: '100%', y: 220 }}
							rowClassName={(record) => {
								return record.ordinaryId == activeId ? `${styles.rowActived}` : '';
							}}
							options={{ density: false, fullScreen: false, setting: false }}
							onRow={(record) => ({
								onClick: (e) => {
									selectRowOfClick(record.ordinaryId);
								},
							})}
						/>
					</Col>
					<Col
						sm={24}
						md={14}
						style={{ paddingLeft: '3px' }}>
						<ProTable<OrdinaryGoodsRecord>
							columns={columnGoods}
							rowKey='id'
							loadConfig={{
								request: false,
							}}
							dataSource={goodsxi}
							headerTitle={`医耗套包${fields.goods}明细`}
							searchConfig={undefined}
							scroll={{ x: '100%', y: 220 }}
							tableInfoCode={
								modalType === 'review' ? 'warehouse_request_approval_review_ordinary' : undefined
							}
							options={
								modalType === 'review' ? {} : { density: false, fullScreen: false, setting: false }
							}
						/>
					</Col>
				</Row>
			)}
		</div>
	);
};
export default CheckModal;
