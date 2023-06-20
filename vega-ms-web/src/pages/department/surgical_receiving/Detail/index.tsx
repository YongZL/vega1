import ThermalPrinter from '@/components/print/ThermalPrinter';
import {
	receivingReportDetailStatusTextMap,
	receivingReportDetailStatusValueEnum,
	receivingReportStatusTextMap,
} from '@/constants/dictionary';
import { extractOperatorBarcode, getScrollX, retryPrintBarcode } from '@/utils';
import { formatStrConnect, formatUnitNum } from '@/utils/format';
import { notification } from '@/utils/ui';
import {
	Badge,
	Button,
	Descriptions,
	Form,
	Input,
	Modal,
	Radio,
	Statistic,
	Table,
	Tooltip,
} from 'antd';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import React, { useRef, useState } from 'react';
import { connect, useModel } from 'umi';

const FormItem = Form.Item;

const DetailModal = ({
	loading,
	submitting,
	acceptSubmitting,
	printLoading,
	surgicalReceiving,
	dispatch,
	...props
}) => {
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [acceptVisible, setAcceptVisible] = useState(false);
	const [goodsInfo, setGoodsInfo] = useState<any>({});
	const { modalVisible, setModalVisible, handleType, singleRecevingInfo, getList } = props;
	const { detailList, receivingList, receivedList } = surgicalReceiving;
	const [form] = Form.useForm();
	const thermalPrinter = useRef();
	const { fields } = useModel('fieldsMapping');

	// 基础物资赋码
	const printBarCode = (record) => {
		if (!Object.keys(thermalPrinter.current.state.selected_device).length) {
			notification.warning('请先选择打印机');
			return;
		}
		dispatch({
			type: 'global/thermalPrint',
			payload: { id: record.id, type: 'goods_code' },
		}).then((res) => {
			if (res && res.code === 0) {
				let printResult = thermalPrinter.current.print(res.data);
				printResult.xhr.onreadystatechange = async function () {
					// 当打印结果为500时，修改当前打印条目状态为打印失败
					if (printResult.xhr.readyState === 4 && printResult.xhr.status >= 500) {
						// 当打印失败时重试，默认重试三次
						let result = await retryPrintBarcode(thermalPrinter.current, res.data);
						if (result === 'error') {
							record.printed = false;
						} else if (result === 'success') {
							record.printed = true;
							dispatch({
								type: 'global/markPrintSuccess',
								payload: {
									id: record.id,
									type: 'goods_code',
								},
								callback: (res) => {
									if (res && res.code === 0) {
										dispatch({
											type: 'surgicalReceiving/queryBarcodeDetial',
											payload: {
												// 选型/消耗
												receivingOrderId:
													singleRecevingInfo.receivingId || singleRecevingInfo.receivingOrderId,
											},
										});
									}
								},
							});
						}
					} else if (printResult.xhr.readyState === 4 && printResult.xhr.status === 200) {
						record.printed = true;
						dispatch({
							type: 'global/markPrintSuccess',
							payload: {
								id: record.id,
								type: 'goods_code',
							},
							callback: (res) => {
								if (res && res.code === 0) {
									dispatch({
										type: 'surgicalReceiving/queryBarcodeDetial',
										payload: {
											// 选型/消耗
											receivingOrderId:
												singleRecevingInfo.receivingId || singleRecevingInfo.receivingOrderId,
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

	// 批量打印
	const printAllBarCode = async () => {
		if (!Object.keys(thermalPrinter.current.state.selected_device).length) {
			notification.warning('请先选择打印机');
			return;
		}
		dispatch({
			type: 'global/batchThermalPrint',
			payload: {
				ids: detailList
					.filter((goods) => goods.status === 'passed' || goods.status === 'partial_pass')
					.filter((goods) => goods.printed === false)
					.map((item) => item.id)
					.join(','),
				type: 'goods_code',
			},
		}).then((res) => {
			if (res && res.code === 0) {
				for (let i = 0; i < res.data.length; i++) {
					setTimeout(() => {
						let printResult = thermalPrinter.current.print(res.data[i]);
						printResult.xhr.onreadystatechange = async function () {
							// 当打印结果为500时，修改当前打印条目状态为打印失败
							let operatorBarCode = extractOperatorBarcode(printResult.data);
							let record = detailList.filter((item) => item.operatorBarcode === operatorBarCode)[0];
							if (printResult.xhr.readyState === 4 && printResult.xhr.status >= 500) {
								let result = await retryPrintBarcode(res.data[i], 0, 1000 * (i + 1));
								if (result === 'error') {
									record.printed = false;
								} else if (result === 'success') {
									record.printed = true;
									dispatch({
										type: 'global/markPrintSuccess',
										payload: {
											id: record.id,
											type: 'goods_code',
										},
									});
								}
							} else if (printResult.xhr.readyState === 4 && printResult.xhr.status === 200) {
								record.printed = true;
								dispatch({
									type: 'global/markPrintSuccess',
									payload: {
										id: record.id,
										type: 'goods_code',
									},
								});
							}
						};
					}, 1000 * (i + 1));
				}
				setTimeout(() => {
					dispatch({
						type: 'surgicalReceiving/queryBarcodeDetial',
						payload: {
							receivingOrderId: singleRecevingInfo.receivingId,
						},
					});
				}, 1000 * res.data.length);
			}
		});
	};
	// 单行点击选中
	const selectRowOfClick = (record) => {
		if (['tagging', 'detail'].includes(handleType) || record.status !== null) {
			return;
		}
		let key = cloneDeep(selectedRowKeys);
		if (key.some((item) => item == record.operatorBarcode)) {
			key = key.filter((item) => item != record.operatorBarcode);
		} else {
			key.push(record.operatorBarcode);
		}
		setSelectedRowKeys(key);
	};

	// 验收
	const goodsAccept = (record) => {
		setAcceptVisible(true);
		setGoodsInfo(record);
	};
	// 撤回
	const goodsRevert = (record) => {
		dispatch({
			type: 'surgicalReceiving/recevingRevert',
			payload: {
				freeCode: record.operatorBarcode,
				shippingOrderCode: singleRecevingInfo.shippingCode || singleRecevingInfo.shippingOrderCode,
			},
			callback: (res) => {
				if (res && res.code === 0) {
					notification.success('操作成功！');
					dispatch({
						type: 'surgicalReceiving/queryReceivingDetail',
						payload: {
							receivingOrderId:
								singleRecevingInfo.receivingId || singleRecevingInfo.receivingOrderId,
						},
					});
				}
			},
		});
	};

	const goodsAcceptSubmit = () => {
		form
			.validateFields()
			.then(async (values) => {
				// 表明已选择某个物资进行验收
				if (goodsInfo && Object.keys(goodsInfo).length) {
					let params = {};
					let response;
					if (values['info.auditType'] === 'Y') {
						params = {
							freeCode: goodsInfo.operatorBarcode,
							shippingOrderCode:
								singleRecevingInfo.shippingCode || singleRecevingInfo.shippingOrderCode,
						};
						response = await dispatch({
							type: 'surgicalReceiving/recevingPass',
							payload: params,
						});
					} else {
						params = {
							freeCode: goodsInfo.operatorBarcode,
							reason: values['info.reason'],
							shippingOrderCode:
								singleRecevingInfo.shippingCode || singleRecevingInfo.shippingOrderCode,
						};
						response = await dispatch({
							type: 'surgicalReceiving/recevingReject',
							payload: params,
						});
					}
					if (response && response.code === 0) {
						notification.success('操作成功！');
						setAcceptVisible(false);
						form.resetFields();
						dispatch({
							type: 'surgicalReceiving/queryReceivingDetail',
							payload: {
								receivingOrderId:
									singleRecevingInfo.receivingId || singleRecevingInfo.receivingOrderId,
							},
						});
					}
				} else {
					// 批量验收
					let params = {
						operatorCodes: selectedRowKeys,
						reason: values['info.reason'],
						shippingOrderCode:
							singleRecevingInfo.shippingCode || singleRecevingInfo.shippingOrderCode,
						status: values['info.auditType'] == 'Y' ? 'passed' : 'rejected',
					};
					dispatch({
						type: 'surgicalReceiving/batchPass',
						payload: params,
						callback: (res) => {
							if (res && res.code === 0) {
								notification.success('操作成功！');
								setAcceptVisible(false);
								setSelectedRowKeys([]);
								form.resetFields();
								dispatch({
									type: 'surgicalReceiving/queryReceivingDetail',
									payload: {
										receivingOrderId:
											singleRecevingInfo.receivingId || singleRecevingInfo.receivingOrderId,
									},
								});
							}
						},
					});
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	// 结单
	const modalSubmit = () => {
		if (receivingList.length > 0) {
			notification.warning(`存在未验收的${fields.goods}`);
			return;
		}
		dispatch({
			type: 'surgicalReceiving/submitReceiving',
			payload: {
				receivingOrderId: singleRecevingInfo.receivingId || singleRecevingInfo.receivingOrderId,
			},
			callback: (res) => {
				if (res && res.code === 0) {
					notification.success('提交成功！');
					setModalVisible(false);
					getList();
				}
			},
		});
	};

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
				if (handleType === 'tagging') {
					return (
						<Badge
							color={
								record.printed ? CONFIG_LESS['@c_starus_disabled'] : CONFIG_LESS['@c_starus_await']
							}
							text={record.printed ? '已打印' : '待打印'}
						/>
					);
				}
				return (
					<span>
						<Badge color={(receivingReportDetailStatusValueEnum[text] || {}).color} />
						{receivingReportDetailStatusTextMap[text]}
					</span>
				);
			},
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
			width: 110,
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 110,
			render: (text) => {
				return <span>{text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'}</span>;
			},
		},
		{
			title: '灭菌日期',
			dataIndex: 'sterilizationDate',
			key: 'sterilizationDate',
			width: 110,
			render: (text, record) => {
				return <span>{text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'}</span>;
			},
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 110, //
			render: (text, record) => {
				let day = parseInt((text - Date.now()) / (1000 * 60 * 60 * 24));
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
			title: '包装规格',
			dataIndex: 'unitNum',
			key: 'unitNum',
			width: 110,
			render: (text, record) => {
				return <span>{formatUnitNum(text, record.minUnitName, record.purchaseUnitName)}</span>;
			},
		},
		{
			title: '本单数',
			dataIndex: 'quantityInMin',
			key: 'quantityInMin',
			width: 120,
			render: (text, record) => {
				return <span>{record.quantityInMin + record.minUnitName}</span>;
			},
		},
		{
			title: '验收通过数',
			dataIndex: 'passedQuantity',
			key: 'passedQuantity',
			width: 110,
			render: (text, record) => {
				return <span>{text ? text + record.minUnitName : '-'}</span>;
			},
		},
		{
			title: '验收不通过原因',
			dataIndex: 'acceptanceConclusion',
			key: 'acceptanceConclusion',
			width: 150,
			ellipsis: true,
			render: (text) => {
				return <span>{text || '-'}</span>;
			},
		},
	];

	const operationColumn = [
		{
			title: '操作',
			dataIndex: 'operation',
			key: 'operation',
			width: 88,
			fixed: 'right',
			render: (text, record) => {
				return (
					<div className='operation'>
						{!record.status && handleType == 'accept' && (
							<span
								className='handleLink'
								onClick={() => goodsAccept(record)}>
								确认验收
							</span>
						)}
						{record.status && handleType == 'accept' && (
							<span
								className='handleLink'
								onClick={() => goodsRevert(record)}>
								撤回
							</span>
						)}
						{(record.status === 'passed' || record.status === 'partial_pass') &&
							handleType === 'tagging' && (
								<span
									className='handleLink'
									onClick={() => {
										printBarCode(record);
									}}>
									{record.printed ? '补打' : '打印'}
								</span>
							)}
					</div>
				);
			},
		},
	];

	const modal = {
		title: `${
			handleType === 'detail'
				? '验收单详情'
				: handleType === 'accept'
				? '定制耗材验收'
				: '验收单赋码'
		}`,
		visible: modalVisible,
		maskClosable: false,
		onCancel: () => setModalVisible(false),
		width: '80%',
		footer: [
			handleType == 'accept' && (
				<div
					className='modal-footer'
					key='accept'>
					<Button
						type='primary'
						className='modalButton'
						disabled={selectedRowKeys.length <= 0}
						onClick={() => goodsAccept(false)}>
						批量操作
					</Button>
					<Button
						type='primary'
						className='modalButton'
						onClick={modalSubmit}
						loading={submitting}>
						提交
					</Button>
				</div>
			),
			handleType == 'tagging' && (
				<div key='tagging'>
					<span>* 仅打印状态为「未打印」的基础{fields.goods}条码</span>
					<Button
						onClick={printAllBarCode}
						type={'primary'}
						style={{ marginLeft: 8 }}
						loading={printLoading}>
						全部打印
					</Button>
				</div>
			),
		],
	};
	const rowSelection = {
		selectedRowKeys,
		onChange: (selectedRowKeys) => setSelectedRowKeys(selectedRowKeys),
		getCheckboxProps: (record) => ({
			disabled: record.status !== null,
		}),
	};
	// 验收
	const modalAccept = {
		visible: acceptVisible,
		maskClosable: false,
		destroyOnClose: true,
		width: '30%',
		style: { height: '80%', overflowY: 'scroll' },
		title: '验收',
		footer: (
			<React.Fragment>
				<Button
					className='modalButton'
					onClick={() => {
						form.resetFields();
						setAcceptVisible(false);
						setSelectedRowKeys([]);
					}}
					disabled={acceptSubmitting}>
					取消
				</Button>
				<Button
					type='primary'
					onClick={() => goodsAcceptSubmit()}
					loading={acceptSubmitting}>
					确定
				</Button>
			</React.Fragment>
		),
		onCancel: () => {
			form.resetFields();
			setAcceptVisible(false);
			setSelectedRowKeys([]);
		},
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
						<Descriptions.Item label='验收单号'>
							{singleRecevingInfo.receivingCode || singleRecevingInfo.receivingOrderCode}
						</Descriptions.Item>
						<Descriptions.Item label={fields.distributor}>
							{singleRecevingInfo.supplierName}
						</Descriptions.Item>
						<Descriptions.Item label='科室'>
							{singleRecevingInfo.departmentName ? singleRecevingInfo.departmentName : '-'}
						</Descriptions.Item>
						<Descriptions.Item label='仓库'>
							{singleRecevingInfo.warehouseName ? singleRecevingInfo.warehouseName : '-'}
						</Descriptions.Item>
						<Descriptions.Item label='预计验收日期'>
							{singleRecevingInfo.expectDeliveryDate
								? moment(singleRecevingInfo.expectDeliveryDate).format('YYYY/MM/DD')
								: '-'}
						</Descriptions.Item>
					</Descriptions>
				</div>
				<div className='right'>
					<Statistic
						title='未验收'
						value={receivingList.length}
					/>
					<Statistic
						title='已验收'
						value={receivedList.length}
					/>
					<Statistic
						title='当前状态'
						value={receivingReportStatusTextMap[singleRecevingInfo.status]}
					/>
				</div>
			</div>
			{handleType == 'tagging' ? (
				<div className='thermalPrinterWrap'>
					<label>*</label>
					<span>选择打印机 :</span>
					<ThermalPrinter ref={thermalPrinter} />
				</div>
			) : null}
			<Table
				columns={handleType === 'detail' ? columnsModal : columnsModal.concat(operationColumn)}
				rowKey={'operatorBarcode'}
				dataSource={detailList}
				className='mb2'
				scroll={{ x: getScrollX(columnsModal, true) }}
				pagination={false}
				loading={loading}
				rowSelection={['tagging', 'detail'].includes(handleType) ? undefined : rowSelection}
				size='small'
				onRow={(record) => ({
					onClick: () => {
						selectRowOfClick(record);
					},
				})}
			/>
			<Modal
				{...modalAccept}
				className='hidden'>
				<Form
					form={form}
					initialValues={{ 'info.auditType': 'Y' }}>
					<FormItem
						label='验收结果'
						name='info.auditType'
						rules={[{ required: true, message: '请选择' }]}>
						<Radio.Group>
							<Radio value='Y'>通过</Radio>
							<Radio value='N'>不通过</Radio>
						</Radio.Group>
					</FormItem>
					<Form.Item
						shouldUpdate={(prevValues, currentValues) =>
							prevValues['info.auditType'] !== currentValues['info.auditType']
						}>
						{({ getFieldValue }) =>
							getFieldValue('info.auditType') === 'N' ? (
								<FormItem
									label='原因'
									style={{ marginBottom: '0px' }}
									name='info.reason'
									rules={[{ required: true, message: '请输入' }]}>
									<Input.TextArea
										rows={4}
										maxLength={100}
									/>
								</FormItem>
							) : null
						}
					</Form.Item>
				</Form>
			</Modal>
		</Modal>
	);
};

export default connect(
	({
		loading,
		surgicalReceiving,
	}: {
		surgicalReceiving;
		loading: { effects: { [key: string]: boolean } };
	}) => ({
		surgicalReceiving,
		batchSubmitting: loading.effects['surgicalReceiving/batchPass'],
		submitting: loading.effects['surgicalReceiving/submitReceiving'],
		acceptSubmitting:
			loading.effects['surgicalReceiving/recevingPass'] ||
			loading.effects['surgicalReceiving/recevingReject'] ||
			loading.effects['surgicalReceiving/batchPass'],
		loading:
			loading.effects['surgicalReceiving/queryReceivingDetail'] ||
			loading.effects['surgicalReceiving/recevingRevert'] ||
			loading.effects['surgicalReceiving/queryReceivingList'] ||
			loading.effects['surgicalReceiving/queryBarcodeDetial'],
		printLoading: loading.effects['global/batchThermalPrint'],
	}),
)(DetailModal);
