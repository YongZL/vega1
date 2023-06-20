import Descriptions from '@/components/Descriptions';
import { DescriptionsItemProps } from '@/components/Descriptions/typings';
import ProTable from '@/components/ProTable';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import ScanInput from '@/components/ScanInput/ScanInput';
import { taxRate, yesOrNo } from '@/constants/dictionary';
import {
	doBatchPass,
	queryDetail,
	queryMakeConclusion,
	queryPass,
	queryReject,
	queryRevert,
	scanCodePass,
	updateAmbivalentPlatformOrder,
	updateInvoiceCode,
} from '@/services/receivingOrder';
import { accessNameMap, transformSBCtoDBC, getEndTime } from '@/utils';
import { getTotalNum } from '@/utils/calculate';
import { dealPackNum } from '@/utils/dataUtil';
import { DealDate } from '@/utils/DealDate';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { validateInvoiceAmount } from '@/utils/validator';
import { CheckOutlined, EditOutlined, ScanOutlined } from '@ant-design/icons';
import {
	Badge,
	Button,
	Checkbox,
	Col,
	DatePicker,
	Input,
	message,
	Modal,
	Popconfirm,
	Row,
	Select,
	Statistic,
	Tooltip,
	Form,
} from 'antd';
import moment from 'moment';
import Qrcode from 'qrcode.react';
import { Key, useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import SureBindModal from './SureBindModal';
import ApproveModal from './SureReviewModal';

type DetailGoodsList = ReceivingOrderController.DetailGoodsList;
type PropsType = {
	approvalStatus: Record<string, any>;
	detailInfo: Partial<ReceivingOrderController.ListRecord>;
	onCancel: () => void;
	getTableList: () => void;
	updateListData: (key: string, value: any) => void;
};

const ReviewModal = ({
	approvalStatus,
	detailInfo = {},
	onCancel,
	getTableList,
	updateListData,
}: PropsType) => {
	console.log('1111111111111------------');
	const isWX = sessionStorage.getItem('hospital_id') === '107'; //是否为吴兴医院
	const tableRef = useRef<ProTableAction>();
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [sureBindVisible, setSureBindVisible] = useState<boolean>(false);
	const [approveVisible, setApproveVisible] = useState<boolean>(false);
	const [reviewInfo, setReviewInfo] = useState<Partial<DetailGoodsList>>({});
	const [barCode, setBarCode] = useState<string>('');
	const [scanValue, setScanValue] = useState<string>('');
	const [selectedGoodsRowKeys, setSelectedGoodsRowKeys] = useState<string[]>([]);
	const [isSingle, setIsSingle] = useState<boolean>(true);
	const [revertLoading, setRevertLoading] = useState<boolean>(false);
	const [isOther, setIsOther] = useState<boolean>(false);
	const [goodsData, setGoodsData] = useState<DetailGoodsList[]>([]);
	const [receivedList, setReceivedList] = useState<DetailGoodsList[]>([]);
	const [sureBindData, setSureBindData] = useState<ReceivingOrderController.GoodsBeans[]>([]);
	const [udiCode, setUdiCode] = useState<string>('');
	const [batch, setBatch] = useState<boolean>(false);
	const [scanCodePassParams, setScanCodePassParams] =
		useState<ReceivingOrderController.ScanCodePassData>();
	const [ambivalentValue, setAmbivalentValue] = useState<boolean>(false);
	const [showEditAmbivalent, setShowEditAmbivalent] = useState<boolean>(false);
	const [form] = Form.useForm();

	const accessName = accessNameMap(); // 权限名称
	const isFirst = useRef<boolean>(true);
	const info = useRef<Partial<ReceivingOrderController.ListRecord>>({});
	const [invoiceRequired, setInvoiceRequired] = useState<boolean>(false);

	useEffect(() => {
		info.current = detailInfo;
		setAmbivalentValue(detailInfo.ambivalentPlatformOrder ? true : false); // 初始化两定平台订单值
		if (detailInfo) {
			form.setFieldsValue({
				...detailInfo,
				invoicingDate: detailInfo.invoicingDate ? moment(detailInfo.invoicingDate) : null,
				invoiceAmount: detailInfo.invoiceAmount ? detailInfo.invoiceAmount / 10000 : null,
			});
			setInvoiceRequired(!!detailInfo.invoicingDate || !!detailInfo.invoiceCode);
		}
	}, [detailInfo]);

	const description = (bindShippingOrderItem: ReceivingOrderController.BindShippingOrderItem) => {
		const { goodsName, lotNum, serialNo, quantity } = bindShippingOrderItem;
		return (
			<>
				<p>
					{fields.goodsName}：{goodsName}
				</p>
				<p>
					批号/序列号：{lotNum || '-'}/{serialNo || '-'}
				</p>
				{quantity && <p>数量：{quantity}</p>}
			</>
		);
	};

	const scanChange = (value: string) => {
		form.setFieldsValue({ scanCode: value });
		// setScanValue(value);
	};

	// 扫码提交
	const scanSubmit = (valueInput: string) => {
		if (!valueInput) return;
		setUdiCode(transformSBCtoDBC(valueInput));
		let quantity = 1;
		if (batch) quantity = 0;
		const params = {
			code: valueInput,
			receivingOrderId: detailInfo.receivingId!,
			quantity,
		};
		setScanCodePassParams(params);
		checkDelivery(params);
	};

	// 扫码验收
	const checkDelivery = async (params: ReceivingOrderController.ScanCodePassData) => {
		try {
			const res = await scanCodePass(params);
			if (res && res.code === 1) {
				return res.msg;
			}
			if (res && res.code === 0) {
				const { goodsBeans, bindShippingOrderItem } = res.data;
				if (goodsBeans && goodsBeans.length > 0) {
					setSureBindData(goodsBeans);
					setSureBindVisible(true);
				}
				if (bindShippingOrderItem) {
					notification.success({
						message: bindShippingOrderItem.msg,
						style: { width: '500px' },
						description: description(bindShippingOrderItem),
					});
				}
				tableRef.current?.reload();
				setApproveVisible(false);
			}
			return '';
		} finally {
			form.setFieldsValue({ scanCode: '' });
		}
	};

	const goodsAcceptSubmit = async (value: Record<string, any>) => {
		if (loading) return;
		let obj = { passedQuantity: value?.quantityInMin };
		if (barCode) {
			// 单个验收
			if (value.auditType === 'Y' || value.auditType === 'P') {
				// 通过或者部分通过
				const params: Record<string, any> = {
					...obj,
					freeCode: reviewInfo.operatorBarcode,
					shippingOrderCode: detailInfo.shippingCode,
				};
				if (value.auditType === 'P') {
					// 部分通过
					params.reason = value.reason;
					params.passedQuantity = value.passedQuantity;
				}
				setLoading(true);

				const res = await queryPass(params);
				if (res && res.code === 0) {
					notification.success('操作成功！');
					tableRef.current?.reload();
					// 待验收时刷新
					if (detailInfo.status === 'pending') {
						getTableList();
					}
					setApproveVisible(false);
				}
				setLoading(false);
			} else if (value.auditType === 'N') {
				const params = {
					...obj,
					freeCode: reviewInfo.operatorBarcode,
					reason: value.reason,
					shippingOrderCode: detailInfo.shippingCode,
				};
				setLoading(true);
				const res = await queryReject(params);
				if (res && res.code === 0) {
					notification.success('操作成功！');
					setApproveVisible(false);
					tableRef.current?.reload();
					// 待验收时刷新
					if (detailInfo.status === 'pending') {
						const info = {
							...detailInfo,
							status: 'receiving',
						};
						getTableList();
					}
				}
			}
			const operatorBarcode = reviewInfo.operatorBarcode;
			const newSelectedRowKeys = selectedGoodsRowKeys.filter((item) => item != operatorBarcode);
			setSelectedGoodsRowKeys(newSelectedRowKeys);
			setLoading(false);
		} else {
			// 批量验收
			const params = {
				...obj,
				operatorCodes: selectedGoodsRowKeys,
				reason: value.reason,
				shippingOrderCode: detailInfo.shippingCode,
				status: value.auditType === 'Y' ? 'passed' : 'rejected',
			};
			setLoading(true);

			const res = await doBatchPass(params);
			if (res && res.code === 0) {
				notification.success('操作成功！');
				setSelectedGoodsRowKeys([]);
				setApproveVisible(false);
				tableRef.current?.reload();
			}
			setLoading(false);
		}
	};

	const modalSubmit = async (type?: boolean) => {
		// if (goodsData.length > 0) {
		//   notification.warning(`存在未验收的${fields.goods}`);
		//   return;
		// }
		setLoading(true);
		const res = await queryMakeConclusion(info.current.receivingId);
		if (res && res.code === 0) {
			if (type) {
				notification.success('操作成功！');
			}
			getTableList();
			onCancel();
		}
		setLoading(false);
	};

	const modalCancel = async () => {
		form.setFieldsValue({ scanCode: '' });
		setSelectedGoodsRowKeys([]);
		onCancel();
	};

	// 撤回
	const goodsRevert = async (record: DetailGoodsList) => {
		setRevertLoading(true);
		const params = {
			freeCode: record.operatorBarcode,
			shippingOrderCode: detailInfo.shippingCode,
		};
		const res = await queryRevert(params);
		if (res && res.code === 0) {
			notification.success('操作成功！');
			tableRef.current?.reload();
		}
		setRevertLoading(false);
	};

	// 验收弹窗
	const goodsAccept = (record?: DetailGoodsList) => {
		const reviewInfo = record ? record : {};
		const barCode = record ? record.operatorBarcode : '';
		const isSingle = record ? true : false;
		const isNoOthers = record ? record.barcodeControlled && record.quantityInMin === 1 : false;
		setIsOther(isNoOthers);
		setIsSingle(isSingle);
		setReviewInfo(reviewInfo);
		setBarCode(barCode);
		setApproveVisible(true);
	};

	const goodsColumns: ProColumns<DetailGoodsList>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render: (text, record, index: number) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'status',
			width: 110,
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
			title: 'UDI',
			dataIndex: 'udiCode',
			key: 'udiCode',
			width: 180,
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
			renderText: (text) => DealDate(text, 0, '-'),
		},
		{
			title: '灭菌日期',
			dataIndex: 'sterilizationDate',
			key: 'sterilizationDate',
			width: 110,
			renderText: (text) => DealDate(text, 0, '-'),
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
			title: '本单数量',
			dataIndex: 'quantityInMin',
			key: 'quantityInMin',
			width: 120,
			renderText: (text: number, record) => <span>{text + record.minUnitName}</span>,
		},
		{
			width: 'XXS',
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			align: 'right',
			renderText: (text: number) => convertPriceWithDecimal(text),
		},
		{
			width: 'XXS',
			title: '总价(元)',
			dataIndex: 'totalPrice',
			key: 'totalPrice',
			align: 'right',
			renderText: (text: number) => convertPriceWithDecimal(text),
		},
		{
			title: '验收通过数',
			dataIndex: 'passedQuantity',
			key: 'passedQuantity',
			width: 110,
			renderText: (text: number, record) => {
				if (record.status === 'rejected') {
					return <span>{0 + record.minUnitName}</span>;
				}
				return <span>{text || text === 0 ? text + record.minUnitName : '-'}</span>;
			},
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
			title: '赠送',
			dataIndex: 'presenter',
			key: 'presenter',
			width: 150,
			ellipsis: true,
			renderText: (text: boolean) => <span>{text ? '赠送' : '-'}</span>,
		},
		{
			title: '操作',
			dataIndex: 'operation',
			key: 'operation',
			width: 62,
			fixed: 'right',
			renderText: (text: string, record) => {
				return (
					<div className='operation'>
						{!record.status && (
							<span
								className='handleLink'
								onClick={(e) => {
									e.stopPropagation();
									goodsAccept(record);
								}}>
								验收
							</span>
						)}
						{record.status && !record.barcodeControlled && (
							<Popconfirm
								placement='left'
								title='确认撤回？'
								onConfirm={(e) => {
									e?.stopPropagation();
									goodsRevert(record);
								}}
								okButtonProps={{ loading: revertLoading }}
								disabled={revertLoading}
								onCancel={(e) => {
									e?.stopPropagation();
								}}>
								<span
									className='handleLink'
									onClick={(e) => {
										e.stopPropagation();
									}}>
									撤回
								</span>
							</Popconfirm>
						)}
					</div>
				);
			},
		},
	];

	const changeRowGoods = (val: Key[]) => {
		if (loading) return;
		setSelectedGoodsRowKeys([]);
		setSelectedGoodsRowKeys([...(val as string[])]);
	};

	const selectRowOfClick = (code: string, status: string) => {
		if (status !== null) {
			return;
		}
		let oldSelectRowKeys: string[] = [...selectedGoodsRowKeys];
		if (oldSelectRowKeys.indexOf(code) >= 0) {
			oldSelectRowKeys = oldSelectRowKeys.filter((item) => item != code);
		} else {
			oldSelectRowKeys.push(code);
		}
		setSelectedGoodsRowKeys(oldSelectRowKeys);
	};

	// 两定平台订单修改
	const confirmEditAmbivalent = async () => {
		const params = {
			receivingOrderId: detailInfo.receivingId,
			ambivalentPlatformOrder: ambivalentValue,
		};
		const res = await updateAmbivalentPlatformOrder(params);
		if (res.code === 0) {
			setShowEditAmbivalent(false);
			notification.success('修改成功');
			updateListData('ambivalentPlatformOrder', ambivalentValue);
		}
	};

	// 修改发票编号
	const submitUpload = async () => {
		form.validateFields().then(async (value) => {
			setLoading(true);
			try {
				const { invoiceAmount, invoicingDate } = value || {};
				const res = await updateInvoiceCode({
					receivingOrderId: detailInfo.receivingId,
					...value,
					invoicingDate: invoicingDate ? moment(invoicingDate).valueOf() : null,
					invoiceAmount: invoiceAmount * 10000,
				});
				if (res && res.code === 0) {
					notification.success('提交成功');
				}
			} finally {
				setLoading(false);
			}
		});
	};

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
			dataIndex: 'invoiceCode',
			labelStyle: { paddingTop: '4px' },
			render: (text) => {
				return (
					<Form.Item
						name='invoiceCode'
						label='发票编号'
						rules={[{ required: isWX ? invoiceRequired : false, message: '请输入发票编号' }]}
						style={{ width: '100%', marginBottom: 0 }}
						initialValue={text}>
						<Input
							onChange={(e) => {
								const value = e.target.value;
								const invoicingDateValue = form.getFieldValue('invoicingDate');
								const requiredValue = !!value || invoicingDateValue;
								setInvoiceRequired(requiredValue);
								if (!requiredValue) {
									form.validateFields();
								}
							}}
							style={{ width: '80%' }}
							maxLength={30}
							placeholder='请输入发票编号'
						/>
					</Form.Item>
				);
			},
		},
		{
			label: '发票代码',
			dataIndex: 'invoiceNo',
			labelStyle: { paddingTop: '4px' },
			render: (text) => {
				return (
					<Form.Item
						style={{ width: '100%', marginBottom: 0 }}
						name='invoiceNo'
						initialValue={text}
						rules={[{ pattern: new RegExp('^[a-zA-Z0-9]*$'), message: '请输入字母或数字' }]}>
						<Input
							style={{ width: '80%' }}
							maxLength={20}
							placeholder='请输入发票代码'
						/>
					</Form.Item>
				);
			},
		},
		{
			dataIndex: 'invoicingDate',
			labelStyle: { paddingTop: '4px' },
			render: (text) => {
				return (
					<Form.Item
						label='开票日期'
						rules={[{ required: isWX ? invoiceRequired : false, message: '请选择开票日期' }]}
						name='invoicingDate'
						style={{ width: '100%', marginBottom: 0 }}
						initialValue={text ? moment(text) : null}>
						<DatePicker
							style={{ width: '80%' }}
							placeholder='请选择开票日期'
							onChange={(value) => {
								const invoiceCodeValue = form.getFieldValue('invoiceCode');
								const requiredValue = !!value || invoiceCodeValue;
								setInvoiceRequired(requiredValue);
								if (!requiredValue) {
									form.validateFields();
								}
							}}
							disabledDate={(current) => current && current >= moment(getEndTime()).endOf('day')}
						/>
					</Form.Item>
				);
			},
		},
		{
			label: '税率',
			dataIndex: 'taxRate',
			labelStyle: { paddingTop: '4px' },
			render: (text) => {
				return (
					<Form.Item
						name='taxRate'
						style={{ width: '100%', marginBottom: 0 }}
						initialValue={text}>
						<Select
							allowClear
							style={{ width: '80%' }}
							placeholder='请选择税率'
							options={taxRate}
						/>
					</Form.Item>
				);
			},
		},
		{
			label: '发票金额',
			dataIndex: 'invoiceAmount',
			span: 1,
			labelStyle: { paddingTop: '4px' },
			render: (text) => {
				return (
					<Form.Item
						name='invoiceAmount'
						style={{ width: '100%', marginBottom: 0 }}
						initialValue={text}
						rules={[{ validator: validateInvoiceAmount }]}>
						<Input
							style={{ width: '80%' }}
							suffix='元'
							placeholder='请输入发票金额'
						/>
					</Form.Item>
				);
			},
		},
		{
			label: '两定平台订单',
			dataIndex: 'ambivalentPlatformOrder',
			labelStyle: { paddingTop: '4px' },
			show: sessionStorage.getItem('hospital_id') === '107' && WEB_PLATFORM === 'MS',
			render: () => {
				if (showEditAmbivalent) {
					return (
						<div style={{ display: 'flex', alignItems: 'center' }}>
							<Select
								options={yesOrNo}
								style={{ width: 80 }}
								value={ambivalentValue}
								onChange={(value) => setAmbivalentValue(value)}
							/>
							<CheckOutlined
								style={{ marginLeft: 8, cursor: 'pointer', color: CONFIG_LESS['@c_starus_await'] }}
								onClick={confirmEditAmbivalent}
							/>
						</div>
					);
				}
				return (
					<div style={{ display: 'flex', alignItems: 'center', paddingTop: '4px' }}>
						{ambivalentValue ? '是' : '否'}
						<EditOutlined
							style={{ marginLeft: 8, cursor: 'pointer', color: CONFIG_LESS['@c_starus_await'] }}
							onClick={() => {
								setAmbivalentValue(ambivalentValue);
								setShowEditAmbivalent(true);
							}}
						/>
					</div>
				);
			},
		},
	];

	return (
		<>
			<Modal
				visible={!sureBindVisible}
				maskClosable={false}
				title={accessName['receiving_order_check']}
				onCancel={modalCancel}
				className='ant-detail-modal'
				footer={[
					<Button
						key='back'
						type='primary'
						disabled={selectedGoodsRowKeys.length === 0}
						onClick={() => goodsAccept()}>
						批量操作
					</Button>,
					// <Button key="submit" type="primary" loading={loading} onClick={modalSubmit}>
					//   提交
					// </Button>,
				]}>
				<>
					<Row className='detailsBorderAndMargin four'>
						<Col className='left'>
							<Form form={form}>
								<Descriptions
									options={options}
									data={detailInfo || {}}
									optionEmptyText='-'
									defaultColumn={3}
									minColumn={2}
								/>
							</Form>
						</Col>
						<Col
							className='right'
							style={{ marginLeft: -20, alignItems: 'flex-end' }}>
							<Button
								type='primary'
								onClick={submitUpload}>
								发票提交
							</Button>
							<div style={{ display: 'flex', height: '100%' }}>
								<Statistic
									title='未验收'
									value={getTotalNum(goodsData, 'quantityInMin')}
								/>
								<Statistic
									title='已验收'
									value={getTotalNum(receivedList, 'quantityInMin')}
								/>
								<Statistic
									title='当前状态'
									value={detailInfo.status ? approvalStatus[detailInfo.status].text : ''}
								/>
								{detailInfo.receivingCode && (
									<Qrcode
										value={detailInfo.receivingCode}
										style={{
											width: '64px',
											height: '64px',
											marginBottom: '10px',
											marginLeft: '16px',
										}}
									/>
								)}
							</div>
						</Col>
					</Row>

					<ProTable
						toolBarRender={() => [
							<div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
								<div style={{ marginRight: '30px' }}>
									<Checkbox
										onChange={() => setBatch(!batch)}
										value={batch}
										style={{ marginRight: '10px' }}
									/>
									批量验收
								</div>
								<div style={{ marginBottom: -20 }}>
									<Form.Item name='scanCode'>
										<ScanInput
											// value={scanValue}
											placeholder='点击此处扫码'
											onSubmit={scanSubmit as any}
											// onPressEnter={scanSubmit as any}
											onChange={scanChange}
											// autoFocus={true}
											suffix={<ScanOutlined />}
											style={{ width: '400px' }}
										/>
									</Form.Item>
								</div>
							</div>,
						]}
						rowKey={(record) => record.operatorBarcode}
						pagination={false}
						loading={loading}
						api={queryDetail}
						requestCompleted={(list) => {
							let arr = (list || []).filter((item) => item?.status === null);
							if (arr.length === 0) {
								modalSubmit(isFirst.current);
							}
							if (isFirst.current) {
								isFirst.current = false;
							}
						}}
						params={{ receivingOrderId: detailInfo?.receivingId }}
						rowSelection={{
							selectedRowKeys: selectedGoodsRowKeys,
							onChange: changeRowGoods,
							getCheckboxProps: (record: DetailGoodsList) => ({
								disabled: record.status !== null || record.barcodeControlled,
							}),
						}}
						tableRef={tableRef}
						columns={goodsColumns}
						setRows={(res) => {
							const { receiving, received } = res.data;
							setGoodsData(receiving || []);
							setReceivedList(received || []);
							return { rows: [...receiving, ...received] };
						}}
						onRow={(record) => ({
							onClick: () => {
								if (record.barcodeControlled) {
									message.warn(`条码管控${fields.goods}需扫码验收，不能批量操作！`);
									return;
								}
								selectRowOfClick(record.operatorBarcode, record.status);
							},
						})}
						scroll={{ y: 300 }}
					/>
				</>
			</Modal>
			{approveVisible && (
				<ApproveModal
					visible={approveVisible}
					goodsInfo={reviewInfo}
					isSingle={isSingle}
					setVisible={setApproveVisible}
					submits={goodsAcceptSubmit}
					isOther={isOther}
					receivingOrderId={detailInfo.receivingId!}
					checkDelivery={checkDelivery}
				/>
			)}
			{/* 验收&绑定DI */}
			{sureBindVisible && (
				<SureBindModal
					checkDelivery={checkDelivery}
					scanCodePassParams={scanCodePassParams}
					udiCode={udiCode}
					dataSource={sureBindData}
					closeModal={() => setSureBindVisible(false)}
				/>
			)}
		</>
	);
};

export default ReviewModal;
