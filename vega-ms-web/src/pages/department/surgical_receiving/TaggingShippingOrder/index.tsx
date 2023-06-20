import ThermalPrinter from '@/components/print/ThermalPrinter';
import { extractOperatorBarcode, getScrollX, retryPrintBarcode } from '@/utils';
import { formatUnitNum, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Badge, Button, Descriptions, Divider, Modal, Statistic, Table } from 'antd';
import moment from 'moment';
import { useRef } from 'react';
import { connect, useModel } from 'umi';

import {
	shippingOrderDetailItemStatusTextMap,
	shippingOrderDetailItemStatusValueEnum,
	shippingOrderStatusTextMap,
} from '@/constants/dictionary';

const TaggingShippingOrder = ({ loading, delivery, dispatch, ...props }) => {
	const { modalVisible, setModalVisible, handleType, singleRecevingInfo } = props;
	const { goodsGroupList } = delivery;
	const thermalPrinter = useRef();
	const { fields } = useModel('fieldsMapping');

	const columnsModal = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render: (text, record, index) => {
				return <span>{index + 1}</span>;
			},
		},
		{
			title: '状态',
			dataIndex: 'status',
			key: 'status',
			width: 100,
			render: (text, record) => {
				return (
					<span>
						<Badge color={(shippingOrderDetailItemStatusValueEnum[text] || {}).color} />
						{shippingOrderDetailItemStatusTextMap[text] || ''}
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
			render: (text) => {
				return <span>{text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'}</span>;
			},
		},
		{
			title: '灭菌日期',
			dataIndex: 'sterilizationDate',
			key: 'sterilizationDate',
			width: 120,
			render: (text, record) => {
				return <span>{text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'}</span>;
			},
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 120,
			render: (text, record) => {
				let day = parseInt((text - Date.now()) / (1000 * 60 * 60 * 24));
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
			render: (text, record) => {
				return <span>{formatUnitNum(text, record.minUnitName, record.purchaseUnitName)}</span>;
			},
		},
		{
			title: '通过数量',
			dataIndex: 'passedQuantity',
			key: 'passedQuantity',
			width: 110,
			render: (text, record) => {
				return (
					<span>{record.passedQuantity ? record.passedQuantity + record.minUnitName : '-'}</span>
				);
			},
		},
		{
			title: '不通过原因',
			dataIndex: 'acceptanceConclusion',
			key: 'acceptanceConclusion',
			width: 150,
			ellipsis: true,
			render: (text) => {
				return <span>{text || '-'}</span>;
			},
		},
		{
			title: '打印状态',
			dataIndex: 'printed',
			key: 'printed',
			width: 100,
			render: (text, record) => {
				if (!!record.printed === true) {
					return <span>已打印</span>;
				}
				if (!!record.printed === false) {
					return <span>未打印</span>;
				}
			},
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
	const printBarCode = (record) => {
		if (!Object.keys(thermalPrinter.current.state.selected_device).length) {
			notification.warning('请先选择打印机');
			return;
		}
		dispatch({
			type: 'global/thermalPrint',
			payload: { id: record.id, type: 'shipping_goods' },
		}).then((res) => {
			if (res && res.code === 0) {
				let printResult = thermalPrinter.current.print(res.data);
				printResult.xhr.onreadystatechange = async function () {
					// 当打印结果为500时，修改当前打印条目状态为打印失败
					if (printResult.xhr.readyState === 4 && printResult.xhr.status >= 500) {
						// 当打印失败时重试，默认重试三次
						let result = await retryPrintBarcode(thermalPrinter, res.data);
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
			}
		});
	};

	const // 打印全部已验收基础物资
		printAllBarCode = async () => {
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
			}).then((res) => {
				if (res && res.code === 0) {
					for (let i = 0; i < res.data.length; i++) {
						setTimeout(() => {
							let printResult = thermalPrinter.current.print(res.data[i]);
							let that = this;
							printResult.xhr.onreadystatechange = async function () {
								// 当打印结果为500时，修改当前打印条目状态为打印失败
								let operatorBarCode = extractOperatorBarcode(printResult.data);
								let record = goodsGroupList.filter(
									(item) => item.operatorBarcode === operatorBarCode,
								)[0];
								if (printResult.xhr.readyState === 4 && printResult.xhr.status >= 500) {
									let result = await that.retryPrintBarcode(res.data[i], 0, 1000 * (i + 1));
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
					setTimeout(() => {}, 1000 * res.data.length);
				}
			});
		};

	const modal = {
		title: '配送单赋码',
		visible: modalVisible,
		maskClosable: false,
		onCancel: () => setModalVisible(false),
		width: '80%',
		destroyOnClose: true,
		footer: [
			<>
				<span>* 仅打印状态为「未打印」的基础{fields.goods}条码</span>
				<Button
					onClick={printAllBarCode}
					type={'primary'}
					style={{ marginLeft: 8 }}>
					全部打印
				</Button>
			</>,
		],
	};
	return (
		<Modal
			{...modal}
			className='modalDetails'>
			<div className='modelInfo'>
				<div className='left'>
					<Descriptions
						column={{ xs: 1, sm: 2, lg: 3 }}
						size='small'>
						<Descriptions.Item label='配送单号'>
							{singleRecevingInfo.shippingOrderCode}
						</Descriptions.Item>
						<Descriptions.Item label={fields.distributor}>
							{singleRecevingInfo.supplierName}
						</Descriptions.Item>
						<Descriptions.Item label='科室'>
							{singleRecevingInfo.departmentName ? singleRecevingInfo.departmentName : '-'}
						</Descriptions.Item>
						<Descriptions.Item label='预计验收日期'>
							{singleRecevingInfo.expectedDeliveryDate
								? moment(singleRecevingInfo.expectedDeliveryDate).format('YYYY/MM/DD')
								: '-'}
						</Descriptions.Item>
						<Descriptions.Item label='配送员'>
							{singleRecevingInfo.deliveryUserName}
						</Descriptions.Item>
						<Descriptions.Item label='联系电话'>
							{singleRecevingInfo.deliveryUserPhone}
						</Descriptions.Item>
						<Descriptions.Item label='快递单号'>{singleRecevingInfo.expressNo}</Descriptions.Item>
					</Descriptions>
				</div>
				<div className='right'>
					<Statistic
						title='当前状态'
						value={shippingOrderStatusTextMap[singleRecevingInfo.combinedStatus] || ''}
					/>
				</div>
			</div>
			<Divider
				type='horizontal'
				style={{ marginBottom: '12px' }}
			/>
			<div className='thermalPrinterWrap'>
				<label>*</label>
				<span>请选择打印机 :</span>
				<ThermalPrinter ref={thermalPrinter} />
			</div>
			<Table
				columns={columnsModal}
				rowKey={(record, index) => String(index)}
				dataSource={goodsGroupList}
				className='mb2'
				scroll={{
					y: goodsGroupList.length > 6 ? 300 : undefined,
					x: getScrollX(columnsModal, true),
				}}
				pagination={false}
				loading={loading}
				size='small'
			/>
		</Modal>
	);
};

export default connect(
	({ loading, delivery }: { delivery; loading: { effects: { [key: string]: boolean } } }) => ({
		delivery,
		loading: loading.effects['delivery/queryDeliveryDetail'],
	}),
)(TaggingShippingOrder);
