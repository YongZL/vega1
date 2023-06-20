import Descriptions from '@/components/Descriptions';
import type { DescriptionsItemProps } from '@/components/Descriptions/typings';
import ThermalPrinter from '@/components/print/ThermalPrinter';
import ProTable from '@/components/ProTable';
import type { ProColumns } from '@/components/ProTable/typings';
import { stockGoodsStatusAllTextMap } from '@/constants/dictionary';
import { batchThermalPrint, markPrintSuccess, thermalPrint } from '@/services/print';
import { getStockDetails, queryOrdinaryStockDetails } from '@/services/stock';
import {
	accessNameMap,
	extractOperatorBarcode,
	judgeBarCodeOrUDI,
	retryPrintBarcode,
} from '@/utils';
import { convertPriceWithDecimal } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button, Col, Modal, Row, Statistic } from 'antd';
import moment from 'moment';
import { cloneElement, useRef, useState } from 'react';
import { useModel } from 'umi';
type Props = {
	trigger: JSX.Element;
	record: StockController.GetQueryGoodsStockListList & StockController.GetQueryOrdinaryStockList;
	activeTab: string;
	storageAreaId?: number;
};
const DetailModal = (props: Props) => {
	const { trigger, record, activeTab, storageAreaId } = props;
	const { fields } = useModel('fieldsMapping');
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [printLoading, setPrintLoading] = useState<boolean>(false);
	const [detailList, setDetailList] = useState<
		StockController.GetQueryGoodsStockDetails[] & StockController.GetQueryOrdinaryStockDetails[]
	>([]);
	const thermalPrinter = useRef<Record<string, any>>();
	let ids: Array<number> = [];
	const accessNameMaplist: Record<string, any> = accessNameMap();
	const activeType = {
		ordinaryBulk: 'package_ordinary',
		packageBulk: 'package_bulk',
		goods: 'goods_code',
	};

	const getId = {
		ordinaryBulk: 'ordinaryItemId',
		packageBulk: 'packageItemId',
		goods: 'goodsItemId',
	};
	//获取详情数据
	const getDetailInfo = async () => {
		const {
			warehouseId,
			expirationDate,
			productionDate,
			sterilizationDate,
			status,
			procurementPrice,
		} = record;
		const obj = { status, warehouseId };
		const time = { expirationDate, productionDate, sterilizationDate };
		if (activeTab === 'goods') {
			const { goodsId, lotNum } = record;
			let params: Record<string, any> = { goodsId, lotNum, procurementPrice, ...obj, ...time };
			if (storageAreaId) {
				params.storageAreaId = storageAreaId;
			}
			let res = await getStockDetails(params);
			if (res && res.code === 0) {
				setDetailList(res.data);
			}
		} else {
			const { ordinaryId, remaining } = record;
			let params: Record<string, any> =
				(record.remainDay as number) > 0
					? { ordinaryId, remaining, ...obj, ...time, isExpired: false }
					: { ordinaryId, remaining, ...obj, isExpired: true };
			if (storageAreaId) {
				params.storageAreaId = storageAreaId;
			}
			let res = await queryOrdinaryStockDetails(params);
			if (res && res.code === 0) {
				setDetailList(res.data);
			}
		}
	};

	// 提交某条数据打印成功信息
	const postPrintSuccess = async (id: number, type: string) => {
		let params = { id, type };
		await markPrintSuccess(params);
	};

	// 单个打印
	const printBarCode = async (record: StockController.GetQueryOrdinaryStockDetails) => {
		if (!Object.keys(thermalPrinter.current?.state.selected_device).length) {
			notification.warning('请先选择打印机');
			return;
		}
		let id = record[getId[activeTab]];
		let params = { id: id, type: activeType[activeTab] };
		let res = await thermalPrint(params);
		if (res && res.code === 0) {
			let printResult = thermalPrinter?.current?.print(res.data);
			printResult.xhr.onreadystatechange = async function () {
				// 当打印结果为500时，修改当前打印条目状态为打印失败
				if (printResult.xhr.readyState === 4 && printResult.xhr.status >= 500) {
					// 当打印失败时重试，默认重试三次
					let result = await retryPrintBarcode(thermalPrinter.current, res.data);
					if (result === 'error') {
						record.printed = false;
					} else if (result === 'success') {
						record.printed = true;
					}
				} else if (printResult.xhr.readyState === 4 && printResult.xhr.status === 200) {
					record.printed = true;
					// postPrintSuccess(id, activeType[activeTab]);
				}
				getDetailInfo();
			};
		}
	};

	// 批量打印
	const printAllBarCode = async () => {
		if (!Object.keys(thermalPrinter.current?.state.selected_device).length) {
			notification.warning('请先选择打印机');
			return;
		}
		if (printLoading) {
			return;
		}
		setPrintLoading(true);
		try {
			let params = {
				ids:
					activeTab === 'ordinaryBulk'
						? detailList.map((item) => item[getId[activeTab]]).join(',')
						: ids.join(','),
				type: activeType[activeTab],
			};
			let res = await batchThermalPrint(params);
			if (res && res.code === 0) {
				for (let i = 0; i < res.data.length; i++) {
					setTimeout(() => {
						let printResult = thermalPrinter.current?.print(res.data[i]);
						printResult.xhr.onreadystatechange = async function () {
							// 当打印结果为500时，修改当前打印条目状态为打印失败
							let operatorBarCode = extractOperatorBarcode(printResult.data);
							let record = detailList.filter((item) => item.operatorBarcode === operatorBarCode)[0];
							let id = record[getId[activeTab]];
							if (printResult.xhr.readyState === 4 && printResult.xhr.status >= 500) {
								let result = await retryPrintBarcode(res.data[i], 0, 1000 * (i + 1));
								if (result === 'success') {
									record.printed = true;
									postPrintSuccess(id, activeType[activeTab]);
								}
							} else {
								postPrintSuccess(id, activeType[activeTab]);
							}
							getDetailInfo();
						};
					}, 1000 * (i + 1));
				}
			}
		} finally {
			setPrintLoading(false);
		}
	};

	const columnsModal: ProColumns<StockController.GetQueryGoodsStockDetails>[] = [
		{
			title: `${fields.goods}条码/UDI`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 220,
			ellipsis: true,
			renderText: (text, record) => judgeBarCodeOrUDI(record),
		},
		{
			width: 'S',
			title: '批号/序列号',
			dataIndex: 'lotNum',
			ellipsis: true,
			renderText: (text, record) => <span>{`${text || '-'}/${record.serialNum || '-'}`}</span>,
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 100,
			render: (text, record) => (
				<span>
					{record.productionDate
						? moment(new Date(record.productionDate)).format('YYYY/MM/DD')
						: '-'}
				</span>
			),
		},

		{
			title: '灭菌日期',
			dataIndex: 'sterilizationDate',
			key: 'sterilizationDate',
			width: 100,
			render: (text, record) => (
				<span>
					{record.sterilizationDate
						? moment(new Date(record.sterilizationDate)).format('YYYY/MM/DD')
						: '-'}
				</span>
			),
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 100,
			render: (text, record) => (
				<span>
					{record.expirationDate
						? moment(new Date(record.expirationDate)).format('YYYY/MM/DD')
						: '-'}
				</span>
			),
		},
		{
			title: '库房',
			dataIndex: 'storageAreaName',
			key: 'storageAreaName',
			width: 120,
		},
		{
			title: '货架',
			dataIndex: 'storageCabinetName',
			key: 'storageCabinetName',
			width: 120,
		},
		{
			title: '货位',
			dataIndex: 'storageLocBarcode',
			key: 'storageLocBarcode',
			width: 120,
		},
	];

	const ordinaryColumnsModal: ProColumns<StockController.GetQueryOrdinaryStockDetails>[] = [
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 200,
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 100,
			render: (text, record) => (
				<span>
					{record.productionDate
						? moment(new Date(Number(record.productionDate))).format('YYYY/MM/DD')
						: '-'}
				</span>
			),
		},
		{
			title: '灭菌日期',
			dataIndex: 'sterilizationDate',
			key: 'sterilizationDate',
			width: 100,
			render: (text, record) => (
				<span>
					{record.sterilizationDate
						? moment(new Date(Number(record.sterilizationDate))).format('YYYY/MM/DD')
						: '-'}
				</span>
			),
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 100,
			render: (text, record) => (
				<span>
					{record.expirationDate
						? moment(new Date(Number(record.expirationDate))).format('YYYY/MM/DD')
						: '-'}
				</span>
			),
		},
		{
			title: '库房',
			dataIndex: 'areaName',
			key: 'areaName',
			width: 120,
		},
		{
			title: '货架',
			dataIndex: 'cabinetName',
			key: 'cabinetName',
			width: 120,
		},
		{
			title: '货位',
			dataIndex: 'localtionBarcode',
			key: 'localtionBarcode',
			width: 120,
		},
		{
			title: '操作',
			dataIndex: 'operation',
			key: 'operation',
			width: 88,
			fixed: 'right',
			render: (text, record) => (
				<div className='operation'>
					<span
						className='handleLink'
						onClick={() => printBarCode(record)}>
						{record.printed ? '补打' : '打印'}
					</span>
				</div>
			),
		},
	];

	const modal = {
		title: accessNameMaplist.inventory_quantity_view,
		visible: modalVisible,
		maskClosable: false,
		onCancel: () => setModalVisible(false),
		width: '80%',
		destroyOnClose: true,
		footer: [
			<Button
				onClick={printAllBarCode}
				type='primary'
				key='primary'
				style={{ marginLeft: 8 }}
				loading={printLoading}
				disabled={
					('RS' === WEB_PLATFORM &&
						detailList.every((e) => e.status === 'put_on_shelf' || e.status === 'put_off_shelf')) ||
					activeTab === 'ordinaryBulk'
						? false
						: detailList.every((item) => !item.needPrint)
				}>
				{activeTab === 'ordinaryBulk'
					? detailList.every((item) => item.printed)
						? '全部补打'
						: '全部打印'
					: '全部打印'}
			</Button>,
		],
	};

	let goodsText: string, goodsLabel: string, tableInfoId: string;
	if (activeTab === 'ordinaryBulk') {
		goodsLabel = '医耗套包名称';
		goodsText = record.ordinaryName as string;
		tableInfoId = '170';
	}
	// else if (activeTab === 'packageBulk') { //已不存在定数包
	//   goodsLabel = '定数包名称';
	//   goodsText = record.packageName;
	//   tableInfoId = '169';
	// }
	else {
		goodsLabel = fields.goodsName;
		goodsText = record.goodsName as string;
		tableInfoId = '168';
	}

	let arr: ProColumns<StockController.GetQueryGoodsStockDetails>[] = [
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 80,
			align: 'right',
			render: (text, record) => {
				return <span>{record.price ? convertPriceWithDecimal(record.price) : '-'}</span>;
			},
		},
		{
			title: '数量',
			dataIndex: 'remainQuantity',
			key: 'remainQuantity',
			width: 60,
		},
		{
			title: '小计(元)',
			dataIndex: 'totalAmount',
			key: 'totalAmount',
			width: 80,
			align: 'right',
			render: (text, record) => {
				let price = record.price,
					remainQuantity = record.remainQuantity;
				return (
					<span>
						{(price || price == 0) && (remainQuantity || remainQuantity == 0)
							? convertPriceWithDecimal(price * remainQuantity)
							: '-'}
					</span>
				);
			},
		},
		{
			title: '单位',
			dataIndex: 'minGoodsUnit',
			key: 'minGoodsUnit',
			width: 60,
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorName',
			key: 'distributorName',
			width: 180,
			ellipsis: true,
		},
		{
			title: '操作',
			dataIndex: 'operation',
			key: 'operation',
			width: 88,
			fixed: 'right',
			renderText: (text, record) => {
				//  isBarcodeControlled 是否条码管控  keyItem 是否重点物资啊  lotNum 批号   serialNum序列号 printed 是否在pda赋过码
				if (
					(record.isBarcodeControlled &&
						((!record.keyItem && (record.lotNum || record.serialNum)) ||
							(record.keyItem && ((record.lotNum && record.printed) || record.serialNum)))) ||
					('RS' === WEB_PLATFORM && record.status === 'put_on_shelf') ||
					record.status === 'put_off_shelf'
				) {
					ids.push(record[getId[activeTab]]); // 带有打印按钮的id集合(用于全部打印)
					return (
						<div className='operation'>
							<span
								className='handleLink'
								onClick={() => printBarCode(record)}>
								{'打印'}
							</span>
						</div>
					);
				} else {
					return <div className='operation'></div>;
				}
			},
		},
	];

	const tableColumns =
		activeTab === 'ordinaryBulk' ? ordinaryColumnsModal : columnsModal.concat(arr);
	const options: DescriptionsItemProps<
		StockController.GetQueryGoodsStockListList & StockController.GetQueryOrdinaryStockList
	>[] = [
		{
			label: fields.goodsCode,
			dataIndex: 'materialCode',
			render: (text, record) => (record.materialCode ? record.materialCode : record.ordinaryCode),
		},
		{
			label: goodsLabel,
			dataIndex: 'goodsText',
			render: () => <span>{goodsText}</span>,
		},
		{
			label: fields.goodsName,
			dataIndex: 'goodsName',
			show: record.packageId ? true : false,
		},
		{
			label: '仓库',
			dataIndex: 'warehouseName',
		},
	];
	return (
		<>
			{cloneElement(trigger, {
				onClick: () => {
					setModalVisible(true);
					getDetailInfo();
				},
			})}
			<Modal
				{...modal}
				className='ant-detail-modal'>
				<Row className='detailsBorder five'>
					<Col className='left'>
						<Descriptions<
							StockController.GetQueryGoodsStockListList & StockController.GetQueryOrdinaryStockList
						>
							options={options}
							column={4}
							data={record}
						/>
					</Col>
					<Col className='right'>
						{activeTab == 'goods' && (
							<Statistic
								title='总金额'
								value={'￥' + convertPriceWithDecimal(record.totalAmount || 0)}
							/>
						)}
						<Statistic
							title='当前状态'
							value={stockGoodsStatusAllTextMap[record.status as string] || ''}
						/>
					</Col>
				</Row>
				<div
					className='thermalPrinterWrap'
					style={{ marginTop: 16 }}>
					<label>*</label>
					<span>选择打印机 :</span>
					<ThermalPrinter ref={thermalPrinter as any} />
				</div>
				<ProTable
					columns={tableColumns}
					rowKey={(record, index) => String(index)}
					dataSource={detailList}
					className='mb4'
					options={{ density: false, fullScreen: false, setting: false }}
					scroll={{ x: '100%', y: 300 }}
					pagination={false}
					size='small'
				/>
			</Modal>
		</>
	);
};

export default DetailModal;
