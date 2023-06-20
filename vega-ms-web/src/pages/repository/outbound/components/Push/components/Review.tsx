import type { DescriptionsItemProps } from '@/components/Descriptions';
import type { ProColumns } from '@/components/ProTable/typings';

import Descriptions from '@/components/Descriptions';
import ProTable from '@/components/ProTable';
import ScanInput from '@/components/ScanInput/ScanInput';
import { deliveryGoodsStatusValueEnum, deliveryStatusValueEnum } from '@/constants/dictionary';
import {
	queryBatchCheck,
	queryCheck,
	queryDetail,
	querySetPusher,
	queryUnCheck,
} from '@/services/deliveryOrder';
import { queryPusherList } from '@/services/users';
import { accessNameMap, transformSBCtoDBC } from '@/utils';
import { formatUnitNum, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { ScanOutlined } from '@ant-design/icons';
import { Button, Col, Form, Modal, Row, Select, Statistic } from 'antd';
import { Key } from 'antd/es/table/interface';
import { cloneDeep } from 'lodash';
import { FC, useEffect, useState, useRef } from 'react';
import { useModel } from 'umi';
import style from './style.less';
import ApproveModal from './SureReviewModal';

const FormItem = Form.Item;
const CheckModal: FC<{
	visible: boolean;
	onCancel: () => void;
	detail: DeliveryOrderController.QueryRuleRecord;
	getTableList: () => void;
}> = ({ detail = {}, getTableList, visible, onCancel }) => {
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [approveVisible, setApproveVisible] = useState<boolean>(false);
	const [reviewInfo, setReviewInfo] = useState<{
		code?: string;
		deliveryOrderId?: number;
		goodsRequestId?: number;
	}>({});
	const [details, setDetails] = useState<DeliveryOrderController.Order>({});
	const [allList, setAllList] = useState<DeliveryOrderController.Detail[]>([]);
	const [goodsData, setGoodsData] = useState<DeliveryOrderController.DeliveryGoodsDetail[]>([]);
	const [ordinaryData, setOrdinaryData] = useState<
		DeliveryOrderController.DeliveryPackageOrdinaryDetail[]
	>([]);
	const [pusherList, setPusherList] = useState<UsersController.QueryPusherListRecord[]>([]);
	const [scanValue, setScanValue] = useState('');
	const [selectType, setSelectType] = useState('');
	const [selectedGoodsRowKeys, setSelectedGoodsRowKeys] = useState<(string | number)[]>([]);
	const [selectedOrdinaryRowKeys, setSelectedOrdinaryRowKeys] = useState<(string | number)[]>([]);
	const accessName = accessNameMap(); // 权限名称

	const getDetail = async (id: number) => {
		let details = await queryDetail({
			deliveryId: id,
		});
		if (details.code === 0) {
			let result = details.data;
			setDetails(result.order);
			setAllList(result.detail);
			let goodsResult = result.deliveryGoodsDetail,
				ordinaryResult = result.deliveryPackageOrdinaryDetail;
			setGoodsData(goodsResult || []);
			setOrdinaryData(ordinaryResult || []);
			let arr = [...goodsResult, ...ordinaryResult].filter(
				(item) => item?.status === 'review_pending',
			);
			if (arr.length === 0) {
				modalSubmit();
			}
		}
	};

	useEffect(() => {
		const getPusherList = async () => {
			let res = await queryPusherList();
			if (res && res.code === 0) {
				setPusherList(res.data);
			}
		};
		getPusherList();
	}, []);

	const scanChange = (value: string) => setScanValue(value);

	// 扫码提交
	const scanSubmit = async (value: string) => {
		if (!value) return;
		let valueInput = value.replace(//g, '');
		if (allList.some((item) => item.operatorBarcode == valueInput && item.status == 'pass')) {
			notification.warning(`该${fields.baseGoods}已复核`);
			return;
		}

		valueInput = transformSBCtoDBC(valueInput);
		let gs1Code = (valueInput as string).indexOf('_') > -1 ? valueInput : valueInput;
		let params = {
			code: gs1Code as string,
			deliveryOrderId: details!.id,
			status: 'pass',
			isScan: true,
		};
		checkDelivery(params);
	};

	// 单个复核
	const checkDelivery = async (params: DeliveryOrderController.QueryCheckData) => {
		try {
			const res = await queryCheck(params);
			if (res && res.code === 0) {
				if (detail.id) {
					getDetail(detail.id);
				}
				notification.success('复核成功');
				setApproveVisible(false);
				setScanValue('');
				switch (selectType) {
					case 'goods':
						setSelectedGoodsRowKeys([]);
						break;
					case 'ordinary':
						setSelectedOrdinaryRowKeys([]);
						break;
					default:
						setSelectedGoodsRowKeys([]);
						break;
				}
			}
		} finally {
			setScanValue('');
		}
	};

	useEffect(() => {
		if (visible && detail.id) {
			setSelectedGoodsRowKeys([]);
			setSelectedOrdinaryRowKeys([]);
			getDetail(detail.id);
		}
	}, [visible, detail]);

	// 批量复核
	const batchCheckDelivery = async (value: DeliveryOrderController.QueryBatchCheckData) => {
		const params = {
			...value,
			deliveryOrderId: details!.id,
			itemsIds: [...selectedGoodsRowKeys, ...selectedOrdinaryRowKeys],
		};
		const res = await queryBatchCheck(params);
		if (res && res.code === 0) {
			if (detail.id) {
				getDetail(detail.id);
			}
			notification.success('复核成功');
			setApproveVisible(false);
			setSelectedGoodsRowKeys([]);
			setSelectedOrdinaryRowKeys([]);
		}
	};

	const modalSubmit = async () => {
		setLoading(true);
		let res = await querySetPusher({
			pusherId: form.getFieldValue('pusherId'),
			deliveryOrderId: detail.id!,
		});
		if (res && res.code === 0) {
			form.resetFields();
			// getDetail(detail.id!);
			onCancel();
			getTableList();
			notification.success('操作成功');
		}
		setLoading(false);
	};

	// 撤回
	const unCheck = async (record: DeliveryOrderController.DeliveryGoodsDetail) => {
		let params = {};
		// 非条码管控物资撤回
		if (!record.isBarcodeControlled && record.goodsItemId) {
			params = {
				code: record.operatorBarcode,
				id: record.id,
				deliveryOrderId: record.deliveryOrderId,
				isBarcodeControlled: record.isBarcodeControlled,
				goodsId: record.goodsId,
				lotNum: record.lotNum,
				isScan: false,
			};
		} else {
			params = { id: record.id };
		}
		let res = await queryUnCheck(params);
		if (res && res.code === 0) {
			notification.success('操作成功！');
			getDetail(record.deliveryOrderId!);
		}
	};

	// 复核弹窗
	const buttonCheck = (
		record: DeliveryOrderController.DeliveryGoodsDetail = {},
		type: string = '',
	) => {
		const reviewInfo = {
			code: record.operatorBarcode,
			deliveryOrderId: detail.id!,
			goodsRequestId: record.goodsRequestId,
			isBarcodeControlled: record.isBarcodeControlled,
			goodsId: record.goodsId,
			lotNum: record.lotNum,
			isScan: false,
		};
		setReviewInfo(reviewInfo);
		setApproveVisible(true);
		setSelectType(type);
	};

	const goodsColumns: ProColumns<DeliveryOrderController.DeliveryGoodsDetail>[] = [
		{
			title: '序号',
			dataIndex: 'materialCode',
			width: 80,
			align: 'center',
			renderText: (_text, _record, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'status',
			width: 120,
			filters: false,
			valueEnum: deliveryGoodsStatusValueEnum,
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
			renderText: (text: string, record) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			title: '包装规格',
			dataIndex: 'minGoodUnitNum',
			key: 'minGoodUnitNum',
			width: 100,
			renderText: (text, record) => formatUnitNum(text, record.unit!, record.purchaseGoodsUnit),
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 120,
			ellipsis: true,
			renderText: (text, record) => {
				return `${text || '-'}/${record.serialNum || '-'}`;
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			width: 150,
			ellipsis: true,
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			width: 150,
			ellipsis: true,
		},
		{
			title: '推送数量',
			dataIndex: 'quantity_unit',
			key: 'quantity_unit',
			width: 100,
			renderText: (_text, record) =>
				`${record.quantity}${record.packageBulkUnit ? record.packageBulkUnit : record.unit}`,
		},
		{
			title: '复核不通过原因',
			dataIndex: 'reason',
			key: 'reason',
			width: 150,
			ellipsis: true,
			renderText: (text) => (text ? text : '-'),
		},
		{
			title: '操作',
			dataIndex: 'handle',
			key: 'handle',
			width: 62,
			fixed: 'right',
			render: (_text, record) => {
				return (
					<div
						className='operation'
						style={{ width: '100%', height: '100%' }}
						onClick={(e) => {
							e.stopPropagation();
						}}>
						{record.status == 'review_pending' ? (
							<span
								className='handleLink'
								onClick={() => buttonCheck(record, 'goods')}>
								复核
							</span>
						) : (
							<span
								className='handleLink'
								onClick={() => unCheck(record)}>
								撤回
							</span>
						)}
					</div>
				);
			},
		},
	];
	const columnsOrdinary: ProColumns<DeliveryOrderController.DeliveryPackageOrdinaryDetail>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			renderText: (_text, _record, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'status',
			width: 120,
			filters: false,
			valueEnum: deliveryGoodsStatusValueEnum,
		},
		{
			title: '医耗套包名称',
			dataIndex: 'packageOrdinaryName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '医耗套包说明',
			dataIndex: 'detailGoodsMessage',
			width: 160,
			render: (_text, record) => (
				<div
					className='detailGoodsMessage'
					title={record.description ? record.description : record.detailGoodsMessage}>
					{record.description ? record.description : record.detailGoodsMessage}
				</div>
			),
		},
		{
			title: '推送数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
			renderText: (text) => text,
		},
		{
			title: '复核不通过原因',
			dataIndex: 'reason',
			key: 'reason',
			width: 150,
			ellipsis: true,
			renderText: (text) => (text ? text : '-'),
		},
		{
			title: '操作',
			dataIndex: 'handle',
			key: 'handle',
			width: 62,
			fixed: 'right',
			render: (_text, record) => {
				return (
					<div
						className='operation'
						style={{ width: '100%', height: '100%' }}
						onClick={(e) => e.stopPropagation()}>
						{record.status == 'review_pending' ? (
							<span
								className='handleLink'
								onClick={() => buttonCheck(record, 'ordinary')}>
								复核
							</span>
						) : (
							<span
								className='handleLink'
								onClick={() => unCheck(record)}>
								撤回
							</span>
						)}
					</div>
				);
			},
		},
	];

	const changeRowGoods = (val: Key[]) => setSelectedGoodsRowKeys(val);

	const changeRowsurgicals = (val: Key[]) => setSelectedOrdinaryRowKeys(val);

	const goodsRowSelection = {
		selectedRowKeys: selectedGoodsRowKeys,
		onChange: changeRowGoods,
		getCheckboxProps: (record: DeliveryOrderController.DeliveryGoodsDetail) => ({
			disabled: record.status != 'review_pending',
		}),
	};

	// 单行点击选中
	const selectRowOfClick = (record: DeliveryOrderController.DeliveryGoodsDetail) => {
		let keys = cloneDeep(selectedGoodsRowKeys);
		if (selectedGoodsRowKeys.includes(record.id!)) {
			keys = keys.filter((item) => item !== record.id);
		} else {
			keys.push(record.id!);
		}
		changeRowGoods(keys);
	};

	const surgicalsRowSelection = {
		selectedRowKeys: selectedOrdinaryRowKeys,
		onChange: changeRowsurgicals,
		getCheckboxProps: (record: DeliveryOrderController.DeliveryPackageOrdinaryDetail) => ({
			disabled: record.status != 'review_pending',
		}),
	};

	const approvalModals = {
		visible: approveVisible,
		handleCancel: () => setApproveVisible(false),
		info: reviewInfo,
		submit: reviewInfo.goodsRequestId ? checkDelivery : batchCheckDelivery, // 区分是否批量
	};

	const options: DescriptionsItemProps<DeliveryOrderController.Order>[] = [
		{
			dataIndex: 'code',
			label: '推送单号',
		},
		{
			dataIndex: 'departmentName',
			label: '推送科室',
		},
		{
			dataIndex: 'warehouseName',
			label: '推送仓库',
		},
	];

	return (
		<div>
			<Modal
				visible={visible}
				className={'ant-detail-modal' + ' ' + style.pushModal}
				maskClosable={false}
				title={accessName['delivery_order_check']}
				onCancel={() => {
					form.resetFields();
					onCancel();
				}}
				footer={[
					<Button
						key='back'
						type='primary'
						disabled={[...selectedGoodsRowKeys, ...selectedOrdinaryRowKeys].length == 0}
						//@ts-ignore
						onClick={buttonCheck}>
						批量操作
					</Button>,
					// <Button key="submit" type="primary" loading={loading} onClick={modalSubmit}>
					//   提交
					// </Button>,
				]}>
				<ApproveModal {...approvalModals} />

				<div
					className='detailsBorder'
					style={{ paddingBottom: '16px' }}>
					<Row className='five'>
						<Col className='left'>
							<Descriptions<DeliveryOrderController.Order>
								options={options}
								data={details}
								optionEmptyText='-'
								defaultColumn={4}
								minColumn={3}
							/>
							<div style={{ marginTop: '10px' }}>
								<Form form={form}>
									<FormItem
										label='推送人员'
										name='pusherId'
										// rules={[{ required: true, message: '请选择推送人员' }]}
									>
										<Select
											placeholder='请选择推送人员'
											showSearch
											getPopupContainer={(node) => node.parentNode}
											filterOption={(input, option) =>
												option?.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
											}
											style={{ width: 150 }}>
											{pusherList.map((el) => {
												return (
													<Select.Option
														value={el.id}
														key={el.id}>
														{el.name}
													</Select.Option>
												);
											})}
										</Select>
									</FormItem>
								</Form>
							</div>
						</Col>
						<Col className='right'>
							<Statistic
								title='当前状态'
								value={details.status ? deliveryStatusValueEnum[details.status].text : ''}
							/>
						</Col>
					</Row>
				</div>
				<>
					{goodsData.length > 0 && (
						<ProTable<DeliveryOrderController.DeliveryGoodsDetail>
							headerTitle={fields.baseGoods}
							toolBarRender={() => [
								<ScanInput
									value={scanValue}
									placeholder='点击此处扫码'
									onSubmit={scanSubmit}
									onChange={scanChange}
									autoFocus={true}
									suffix={<ScanOutlined />}
									style={{ width: '450px' }}
								/>,
							]}
							rowKey='id'
							pagination={false}
							rowSelection={goodsRowSelection}
							columns={goodsColumns}
							dataSource={goodsData}
							options={{ density: false, fullScreen: false, setting: false }}
							scroll={{ x: '100%', y: 300 }}
							onRow={(record) => ({
								onClick: () => {
									if (record.status !== 'review_pending') {
										return;
									}
									selectRowOfClick(record);
								},
							})}
							tableAlertOptionRender={
								<a
									onClick={() => {
										setSelectedGoodsRowKeys([]);
									}}>
									取消选择
								</a>
							}
						/>
					)}
					{ordinaryData.length > 0 && (
						<ProTable<DeliveryOrderController.DeliveryPackageOrdinaryDetail>
							headerTitle='医耗套包'
							rowKey='id'
							pagination={false}
							rowSelection={surgicalsRowSelection}
							columns={columnsOrdinary}
							dataSource={ordinaryData}
							options={{ density: false, fullScreen: false, setting: false }}
							scroll={{ x: '100%', y: 300 }}
							tableAlertOptionRender={
								<a
									onClick={() => {
										setSelectedOrdinaryRowKeys([]);
									}}>
									取消选择
								</a>
							}
						/>
					)}
				</>
			</Modal>
		</div>
	);
};
export default CheckModal;
