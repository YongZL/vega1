import { DescriptionsItemProps } from '@/components/Descriptions/typings';
import { ProColumns } from '@/components/ProTable/typings';

import Descriptions from '@/components/Descriptions';
import ThermalPrinter from '@/components/print/ThermalPrinter';
import ProTable from '@/components/ProTable';
import { batchThermalPrint } from '@/services/print';
import { loadBarcodeControlledList } from '@/services/receivingOrder';
import { accessNameMap, retryPrintBarcode } from '@/utils';
import { getTotalNum } from '@/utils/calculate';
import { formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { AlertRenderType } from '@ant-design/pro-table/lib/components/Alert';
import { Badge, Button, Col, Modal, Row, Statistic, Tooltip } from 'antd';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';

import { dealPackNum } from '@/utils/dataUtil';
import CodeModal from './CodeModal';
type PropsType = {
	approvalStatus: Record<string, any>;
	detail: Partial<ReceivingOrderController.ListRecord>;
	onCancel: () => void;
};

const CodingModal = ({ approvalStatus, detail = {}, onCancel }: PropsType) => {
	const thermalPrinter: any = useRef();
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [goodsData, setGoodsData] = useState<ReceivingOrderController.DetailGoodsList[]>([]);
	const [barcodeQuantity, setBarcodeQuantity] = useState(0);
	const [quantityInMin, setQuantityInMin] = useState(0);
	const [printLoading, setPrintLoading] = useState(false);
	const [selectList, setSelectList] = useState<ReceivingOrderController.DetailGoodsList[]>([]);
	const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
	const [openCodeModal, setOpenCodeModal] = useState<boolean>(false);
	const [clickRecord, setClickRecord] = useState<GoodsBarcodeRecordController.GoodsBarcodeRecord>();
	const accessName = accessNameMap(); // 权限名称

	// 获取详情列表数据
	const getDetail = async () => {
		const params = {
			receivingOrderId: detail.receivingId,
		};
		const res = await loadBarcodeControlledList(params);
		if (res && res.code === 0) {
			setGoodsData(res.data || []);
			setBarcodeQuantity(getTotalNum(res.data, 'barcodeQuantity') || 0);
			setQuantityInMin(getTotalNum(res.data, 'quantityInMin') || 0);
		}
		setLoading(false);
	};

	useEffect(() => {
		if (detail.receivingId) {
			setLoading(true);
			getDetail();
		}
	}, [detail]);

	// 打印全部已验收基础物资
	const printAllBarCode = async () => {
		if (!Object.keys(thermalPrinter.current.state.selected_device).length) {
			notification.warning('请先选择打印机');
		}
		setPrintLoading(true);
		const ids = selectedRowKeys.join(',');
		try {
			const res = await batchThermalPrint({ ids, type: 'goods_code' });
			if (res && res.code === 0) {
				const data = res.data;
				for (let i = 0; i < data.length; i++) {
					setTimeout(() => {
						let printResult = thermalPrinter.current.print(data[i]);
						printResult.xhr.onreadystatechange = async function () {
							// 当打印结果为500时，修改当前打印条目状态为打印失败
							if (printResult.xhr.readyState === 4 && printResult.xhr.status >= 500) {
								// 当打印失败时重试，默认重试三次
								retryPrintBarcode(thermalPrinter.current, res.data);
							}
						};
					}, 1000 * (i + 1));
				}
				setTimeout(() => {
					setPrintLoading(false);
				}, 1000 * data.length);
			} else {
				setPrintLoading(false);
			}
		} catch {
			setPrintLoading(false);
		}
	};

	const onCode = (record: GoodsBarcodeRecordController.GoodsBarcodeRecord) => {
		setClickRecord(record);
		setOpenCodeModal(true);
	};

	const goodsColumns: ProColumns<ReceivingOrderController.DetailGoodsList>[] = [
		{
			title: '序号',
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 80,
			align: 'center',
			render: (_text, _record, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'status',
			width: 120,
			renderText: (text: string) => {
				let statusText, statusColor;
				switch (text) {
					case 'passed':
						statusText = '验收通过';
						statusColor = CONFIG_LESS['@c_starus_done'];
						break;
					case 'rejected':
						statusText = '验收不通过';
						statusColor = CONFIG_LESS['@c_starus_warning'];
						break;
					case 'partial_pass':
						statusText = '部分通过';
						statusColor = CONFIG_LESS['@c_starus_underway'];
						break;
					default:
						statusText = '未验收';
						statusColor = CONFIG_LESS['@c_starus_await'];
						break;
				}
				return (
					<Badge
						color={statusColor}
						text={statusText}
					/>
				);
			},
		},
		{
			title: '赋码条码',
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 150,
		},
		{
			title: '赋码数量',
			dataIndex: 'barcodeQuantity',
			key: 'barcodeQuantity',
			width: 100,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 135,
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
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 180,
			ellipsis: true,
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 150,
			ellipsis: true,
			renderText: (text: string, record) => (
				<span>{`${text || '-'}/${record.serialNo || '-'}`}</span>
			),
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 110,
			renderText: (text: number) => (text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'),
		},
		{
			title: '灭菌日期',
			dataIndex: 'sterilizationDate',
			key: 'sterilizationDate',
			width: 110,
			renderText: (text: number) => (text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'),
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 110,
			renderText: (text: number, record) => {
				const time: any = (text - Date.now()) / (1000 * 60 * 60 * 24);
				const day = parseInt(time);
				return (
					<Tooltip
						title={
							day < 0
								? `${record.goodsName}已过期`
								: day < record.nearExpirationDays
								? `${record.goodsName}已近效期`
								: ''
						}
						placement='top'>
						<span
							className={
								day < 0 ? 'cl_FF110B' : day < record.nearExpirationDays ? 'cl_FF9F00' : ''
							}>
							{text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'}
						</span>
					</Tooltip>
				);
			},
		},
		{
			title: '大/中包装',
			dataIndex: 'unitNum',
			key: 'unitNum',
			width: 110,
			renderText: (text: string, record) => dealPackNum(record.largeBoxNum, text),
		},
		{
			title: '操作',
			dataIndex: 'operation',
			key: 'operation',
			width: 62,
			fixed: 'right',
			renderText: (text: string, record: any) => {
				return (
					<div className='operation'>
						{!record.printed && (
							<span
								className='handleLink'
								onClick={() => onCode(record)}>
								赋码
							</span>
						)}
					</div>
				);
			},
		},
	];

	const options: DescriptionsItemProps[] = [
		{
			label: '验收单号',
			dataIndex: 'receivingCode',
		},
		{
			label: fields.distributor,
			dataIndex: 'distributorName',
		},
		{
			label: '验收仓库',
			dataIndex: 'warehouseName',
		},
		{
			label: '库房',
			dataIndex: 'storageAreaName',
		},
		{
			label: '预计验收日期',
			dataIndex: 'expectDeliveryDate',
			render: (text) => <span>{text ? moment(text).format('YYYY/MM/DD') : '-'}</span>,
		},
		{
			label: '两定平台订单',
			dataIndex: 'ambivalentPlatformOrder',
			show: sessionStorage.getItem('hospital_id') === '107' && WEB_PLATFORM === 'MS',
			render: (text) => (text ? '是' : '否'),
		},
	];

	// 选择行
	const selectRow = (
		selectedRecord: ReceivingOrderController.DetailGoodsList,
		selected: boolean,
	) => {
		let newSelectList = selectList;
		if (selected) {
			newSelectList.push(selectedRecord);
		} else {
			newSelectList.forEach((val, index) => {
				if (val.goodsItemId === selectedRecord.goodsItemId) {
					newSelectList.splice(index, 1);
				}
			});
		}
		const selectedRow = newSelectList.map((item) => item.goodsItemId);
		setSelectedRowKeys(selectedRow);
		setSelectList(newSelectList);
	};

	// 点击行
	const selectRowOfClick = (selectedRecord: ReceivingOrderController.DetailGoodsList) => {
		const index = selectedRowKeys.indexOf(selectedRecord.goodsItemId);
		selectedRecord.printed && selectRow(selectedRecord, !(index >= 0));
	};

	// 点击全选复选框
	const onSelectAll = (
		selected: boolean,
		_selectedRecord: ReceivingOrderController.DetailGoodsList[],
		changeRows: ReceivingOrderController.DetailGoodsList[],
	) => {
		let newSelectList = selectList;
		changeRows.forEach((item) => {
			if (selected) {
				const rowKeyId = item.goodsItemId;
				const record = item;
				if (selectedRowKeys.indexOf(rowKeyId) < 0) {
					newSelectList.push(record);
				}
			} else {
				newSelectList = newSelectList.filter((val) => val.goodsItemId !== item.goodsItemId);
			}
		});
		const selectedRow = newSelectList.map((item) => item.goodsItemId);
		setSelectedRowKeys(selectedRow);
		setSelectList(newSelectList);
	};
	//取消选择
	const cancelSelect = () => {
		setSelectList([]);
		setSelectedRowKeys([]);
	};
	return (
		<>
			<Modal
				visible={true}
				maskClosable={false}
				title={accessName['receiving_order_coding']}
				onCancel={onCancel}
				footer={false}
				className='ant-detail-modal'>
				<Row className='detailsBorder four'>
					<Col className='left'>
						<Descriptions
							options={options}
							data={detail || {}}
							optionEmptyText='-'
							defaultColumn={3}
							minColumn={2}
						/>
					</Col>
					<Col className='right'>
						<Statistic
							title='已验收'
							value={quantityInMin}
						/>
						<Statistic
							title='未赋码'
							value={quantityInMin - barcodeQuantity}
						/>
						<Statistic
							title='当前状态'
							value={detail.status ? approvalStatus[detail.status].text : ''}
						/>
						<Statistic
							title='赋码状态'
							value={
								barcodeQuantity === 0
									? '未赋码'
									: barcodeQuantity === quantityInMin
									? '全部赋码'
									: '部分赋码'
							}
						/>
					</Col>
				</Row>
				<ProTable<ReceivingOrderController.DetailGoodsList>
					headerTitle='基础物资'
					toolBarRender={() => [
						<div>
							<label>*</label>
							<span>请选择打印机 :</span>
							<ThermalPrinter ref={thermalPrinter} />
						</div>,
						<Button
							type='primary'
							loading={printLoading}
							disabled={selectList.length === 0}
							onClick={printAllBarCode}>
							打印
						</Button>,
					]}
					size='middle'
					rowKey='goodsItemId'
					pagination={false}
					loading={loading}
					columns={goodsColumns}
					options={{ density: false, fullScreen: false, setting: false }}
					scroll={{ y: 300 }}
					dataSource={goodsData}
					rowSelection={{
						selectedRowKeys: selectedRowKeys,
						onSelect: selectRow,
						onSelectAll: onSelectAll,
						getCheckboxProps: (record) => ({
							disabled: !record.printed,
						}),
					}}
					onRow={(record) => ({
						onClick: () => {
							selectRowOfClick(record);
						},
					})}
					tableAlertOptionRender={
						(
							<a
								onClick={() => {
									cancelSelect();
								}}>
								取消选择
							</a>
						) as unknown as AlertRenderType<Record<string, any>> | undefined
					}
				/>
			</Modal>
			{openCodeModal && (
				<CodeModal
					onCancel={() => setOpenCodeModal(false)}
					record={clickRecord}
					getDetail={() => getDetail()}
				/>
			)}
		</>
	);
};

export default CodingModal;
