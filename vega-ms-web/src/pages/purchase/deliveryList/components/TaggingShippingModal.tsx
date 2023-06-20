import { DescriptionsItemProps } from '@/components/Descriptions/typings';
import { ProColumns } from '@ant-design/pro-table/lib/typing';

import Descriptions from '@/components/Descriptions';
import ThermalPrinter from '@/components/print/ThermalPrinter';
import ProTable from '@/components/ProTable';
import { shippingOrderStatusTextMap } from '@/constants/dictionary';
import { accessNameMap, extractOperatorBarcode, retryPrintBarcode } from '@/utils';
import { formatUnitNum, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Badge, Button, Col, Modal, Row, Statistic } from 'antd';
import moment from 'moment';
import { useRef } from 'react';
import { connect, useModel } from 'umi';

const TaggingShippingOrder = ({
	dispatch,
	loading,
	printLoading,
	modalVisible,
	setModalVisible,
	singleDeliveryInfo,
	delivery,
}: ShippingOrderController.DeliveryTaggingProps) => {
	const goodsGroupList: ShippingOrderController.DetailData[] = delivery.goodsGroupList;
	const thermalPrinter: Record<string, any> = useRef();
	const { fields } = useModel('fieldsMapping');
	const accessName = accessNameMap(); // 权限名称

	const columns: ProColumns<ShippingOrderController.DetailData>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: '打印状态',
			dataIndex: 'status',
			key: 'status',
			width: 100,
			render: (text, record) => {
				const color = record.printed ? CONFIG_LESS['@c_disabled'] : CONFIG_LESS['@c_starus_await'];
				const status = record.printed ? '已打印' : '未打印';
				return (
					<span>
						<Badge color={color} /> {status}
					</span>
				);
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 150,
			ellipsis: true,
			renderText: (text: string, record) => {
				return `${record.lotNum || '-'}/${record.serialNo || '-'}`;
			},
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
			width: 150,
			ellipsis: true,
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 120,
			renderText: (text: number) => (text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'),
		},
		{
			title: '灭菌日期',
			dataIndex: 'sterilizationDate',
			key: 'sterilizationDate',
			width: 120,
			renderText: (text: number) => (text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'),
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 120,
			renderText: (text: number, record) => {
				const date: any = (text - Date.now()) / (1000 * 60 * 60 * 24);
				let day = parseInt(date);
				return (
					<span className={day < record.nearExpirationDays ? 'cl_FF9F00' : ''}>
						{text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'}
					</span>
				);
			},
		},
		{
			title: '包装规格',
			dataIndex: 'unitNum',
			key: 'unitNum',
			width: 110,
			renderText: (text: string, record) => (
				<span>{formatUnitNum(text, record.minUnitName, record.purchaseUnitName)}</span>
			),
		},
		{
			title: '赋码单位',
			dataIndex: 'distributionUnitQuantity',
			key: 'distributionUnitQuantity',
			width: 150,
			renderText: (text: number, record) => (
				<span>{text ? text + record.minUnitName + '/' + record.distributionUnitName : '-'}</span>
			),
		},
		{
			title: '本单数量',
			dataIndex: 'quantityInMin',
			key: 'quantityInMin',
			align: 'center',
			width: 80,
			renderText: (text: number, record) => <span>{text + record.minUnitName}</span>,
		},
		{
			title: '通过数量',
			dataIndex: 'passedQuantity',
			key: 'passedQuantity',
			width: 110,
			renderText: (text: number, record) => <span>{text ? text + record.minUnitName : '-'}</span>,
		},
		{
			title: '不通过原因',
			dataIndex: 'acceptanceConclusion',
			key: 'acceptanceConclusion',
			width: 150,
			ellipsis: true,
			renderText: (text: string) => <span>{text || '-'}</span>,
		},
		{
			title: '操作',
			dataIndex: 'operation',
			key: 'operation',
			width: 62,
			fixed: 'right',
			render: (text, record) => {
				return (
					<div className='operation'>
						{record.status === 'pending' && (
							<span
								className='handleLink'
								onClick={() => printBarCode(record)}>
								{record.printed ? '补打' : '打印'}
							</span>
						)}
					</div>
				);
			},
		},
	];

	//基础物资赋码
	const printBarCode = (record: ShippingOrderController.DetailData) => {
		if (!Object.keys(thermalPrinter.current.state.selected_device).length) {
			notification.warning('请先选择打印机');
			return;
		}
		dispatch({
			type: 'global/thermalPrint',
			payload: { id: record.id, type: 'shipping_goods' },
		}).then(async (res: Record<string, any>) => {
			if (res && res.code === 0) {
				let printResult = await thermalPrinter.current.print(res.data);
				printResult.xhr.onreadystatechange = async function () {
					// 当打印结果为500时，修改当前打印条目状态为打印失败
					if (printResult.xhr.readyState === 4 && printResult.xhr.status >= 500) {
						// 当打印失败时重试，默认重试三次
						let result = await retryPrintBarcode(thermalPrinter.current, res.data);
						if (result === 'error') {
							record.printed = false;
						} else if (result === 'success') {
							record.printed = true;
							await dispatch({
								type: 'global/markPrintSuccess',
								payload: {
									id: record.id,
									type: 'shipping_goods',
								},
								callback: (res: Record<string, any>) => {
									if (res && res.code === 0) {
										dispatch({
											type: 'delivery/queryDeliveryDetail',
											payload: {
												shippingOrderId: singleDeliveryInfo.id,
											},
										});
									}
								},
							});
						}
					} else if (printResult.xhr.readyState === 4 && printResult.xhr.status === 200) {
						record.printed = true;
						await dispatch({
							type: 'global/markPrintSuccess',
							payload: {
								id: record.id,
								type: 'shipping_goods',
							},
							callback: (res: Record<string, any>) => {
								if (res && res.code === 0) {
									dispatch({
										type: 'delivery/queryDeliveryDetail',
										payload: {
											shippingOrderId: singleDeliveryInfo.id,
										},
									});
								}
							},
						});
					}
				};
			}
		});
	};

	// 打印全部已验收基础物资
	const printAllBarCode = async () => {
		if (!Object.keys(thermalPrinter.current.state.selected_device).length) {
			notification.warning('请先选择打印机');
			return;
		}
		dispatch({
			type: 'global/batchThermalPrint',
			payload: {
				ids: goodsGroupList
					.filter((goods) => goods.status === 'pending')
					.filter((goods) => goods.printed === false)
					.map((item) => item.id)
					.join(','),
				type: 'shipping_goods',
			},
		}).then((res: Record<string, any>) => {
			if (res && res.code === 0) {
				for (let i = 0; i < res.data.length; i++) {
					setTimeout(() => {
						let printResult = thermalPrinter.current.print(res.data[i]);
						printResult.xhr.onreadystatechange = async function () {
							// 当打印结果为500时，修改当前打印条目状态为打印失败
							let operatorBarCode = extractOperatorBarcode(printResult.data);
							let record = goodsGroupList.filter(
								(item) => item.operatorBarcode === operatorBarCode,
							)[0];
							if (printResult.xhr.readyState === 4 && printResult.xhr.status >= 500) {
								let result = await retryPrintBarcode(
									thermalPrinter.current,
									res.data[i],
									0,
									1000 * (i + 1),
								);
								if (result === 'error') {
									record.printed = false;
								} else if (result === 'success') {
									record.printed = true;
									dispatch({
										type: 'global/markPrintSuccess',
										payload: {
											id: record.id,
											type: 'shipping_goods',
										},
									});
								}
							} else if (printResult.xhr.readyState === 4 && printResult.xhr.status === 200) {
								record.printed = true;
								dispatch({
									type: 'global/markPrintSuccess',
									payload: {
										id: record.id,
										type: 'shipping_goods',
									},
								});
							}
						};
					}, 1000 * (i + 1));
				}
				setTimeout(() => {
					dispatch({
						type: 'delivery/queryDeliveryDetail',
						payload: {
							shippingOrderId: singleDeliveryInfo.id,
						},
					});
				}, 1000 * res.data.length);
			}
		});
	};

	const descriptionsOptions: DescriptionsItemProps[] = [
		{
			label: '配送单号',
			dataIndex: 'shippingOrderCode',
		},
		{
			label: fields.distributor,
			dataIndex: 'distributorName',
		},
		{
			label: '库房',
			dataIndex: 'storageAreaName',
		},
		{
			label: '预计验收日期',
			dataIndex: 'expectedDeliveryDate',
			render: (text: number) => (text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'),
		},
		{
			label: '配送人员',
			dataIndex: 'deliveryUserName',
		},
		{
			label: '联系电话',
			dataIndex: 'deliveryUserPhone',
		},
		{
			label: '备注信息',
			dataIndex: 'expressNo',
		},
	];

	return (
		<Modal
			title={accessName['handled_shipping_order_coding']}
			visible={modalVisible}
			maskClosable={false}
			onCancel={() => setModalVisible(false)}
			width='80%'
			destroyOnClose={true}
			className='ant-detail-modal'
			footer={[
				<div key='printer'>
					<span>* 仅打印状态为「未打印」的基础{fields.goods}条码</span>
					<Button
						onClick={printAllBarCode}
						type={'primary'}
						style={{ marginLeft: 8 }}
						loading={printLoading}>
						全部打印
					</Button>
				</div>,
			]}>
			<Row className='detailsBorderAndMargin four'>
				<Col className='left'>
					<Descriptions
						options={descriptionsOptions}
						data={singleDeliveryInfo}
						optionEmptyText='-'
						defaultColumn={3}
						minColumn={2}
					/>
				</Col>
				<Col className='right'>
					<Statistic
						title='当前状态'
						value={shippingOrderStatusTextMap[singleDeliveryInfo.combinedStatus] || ''}
					/>
				</Col>
			</Row>
			<div className='thermalPrinterWrap'>
				<label>*</label>
				<span>选择打印机 :</span>
				<ThermalPrinter ref={thermalPrinter} />
			</div>

			<ProTable
				columns={columns}
				options={{ density: false, fullScreen: false, setting: false }}
				rowKey={(record, index?: number) => `${index}`}
				dataSource={goodsGroupList}
				className='mb2'
				scroll={{ y: 300 }}
				pagination={false}
				loading={loading}
				size='small'
			/>
		</Modal>
	);
};

export default connect(
	({
		loading,
		delivery,
	}: {
		delivery: ShippingOrderController.DeliveryDataType;
		loading: { effects: { [key: string]: boolean } };
	}) => ({
		delivery,
		loading: loading.effects['delivery/queryDeliveryDetail'],
		printLoading: loading.effects['global/batchThermalPrint'],
	}),
)(TaggingShippingOrder);
