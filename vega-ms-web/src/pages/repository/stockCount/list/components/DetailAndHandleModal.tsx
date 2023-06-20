import Descriptions, { DescriptionsItemProps } from '@/components/Descriptions';
import ProTable from '@/components/ResizableTable';
import { ProColumns, ProTableAction } from '@/components/ProTable';
import { stockTakingStatusTextMap } from '@/constants/dictionary';
import { RawValueType, LabelInValueType } from 'rc-select/es/Select';
import { accessNameMap } from '@/utils';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { Button, Col, Form, InputNumber, Modal, Row, Select, Statistic, Tag } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import styles from './index.less';
import ReasonEditor from '../../components/ReasonEditor';
import {
	getStockDetail,
	getStockTakingOrderReasonList,
	stockTaking,
} from '@/services/stockTakingOrder';
import { notification } from '@/utils/ui';
const accessNameMaplist: Record<string, any> = accessNameMap();
const DetailAndHandleModal: React.FC<{
	visible: boolean;
	onCancel: () => void;
	tableRef: React.MutableRefObject<ProTableAction | undefined>;
	modalType: 'handle' | 'detail';
	pageType: 'handle' | 'query';
	record: StockTakingOrderController.GetDetailRuleParams;
}> = ({ visible, onCancel, tableRef, modalType, pageType, record }) => {
	const { fields } = useModel('fieldsMapping');
	const [form] = Form.useForm();
	const [loading, setLoading] = useState<boolean>(false);
	const [errorReasonLoading, setErrorReasonLoading] = useState<boolean>(false);
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [holdLoading, setHoldLoading] = useState<boolean>(false);
	const [okLoading, setOkLoading] = useState<boolean>(false);
	const [dataSource, setDataSource] = useState<StockTakingOrderController.GetStockDetailParams[]>(
		[],
	); // 盘点处理弹窗数据
	const [errorReasonList, setErrorReasonList] = useState<StockTakingOrderController.ReasonList[]>(
		[],
	);
	const [confirmData, setConfirmData] = useState<StockTakingOrderController.GetStockDetailParams[]>(
		[],
	); // 确认盘点弹窗数据
	const [open, setOpen] = useState<boolean>(true); // 点击确认盘点按钮，控制盘点处理弹窗
	const [confirmVisible, setConfirmVisible] = useState<boolean>(false); //控制确认盘点弹窗
	// 获取所有盈亏原因
	const getReason = async () => {
		setErrorReasonLoading(true);
		try {
			const res = await getStockTakingOrderReasonList();
			if (res.code === 0) {
				setErrorReasonList(res.data);
			}
		} finally {
			setErrorReasonLoading(false);
		}
	};
	// 获取盘库单详情
	const getDetail = async () => {
		setLoading(true);
		try {
			const res = await getStockDetail(record.id!);
			if (res.code === 0) {
				setDataSource(res.data);
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const data = [...dataSource];
		data.forEach((item) => {
			// 若确认数量没有 && 为非条码管控。确认数量默认填充为提示数量
			if (typeof item.actualStockQuantity !== 'number' && !item.barcodeControlled) {
				item.actualStockQuantity = item.systemStockQuantity;
			}
		});
		getDetail();
		getReason();
		setDataSource([...data]);
	}, []);
	const options: DescriptionsItemProps<StockTakingOrderController.GetDetailRuleParams>[] = [
		{
			label: '盘库单号',
			dataIndex: 'code',
		},
		{
			label: '盘点仓库',
			dataIndex: 'storageAreaName',
		},
		{
			label: '创建人员',
			dataIndex: 'createdByName',
		},
		{
			label: '创建时间',
			dataIndex: 'timeCreated',
			render: (text) => (text ? moment(new Date(text)).format('YYYY/MM/DD HH:mm:ss') : '-'),
		},
	];
	const numChange = (id: number, val: number) => {
		const data = dataSource.map((item) =>
			item.id === id
				? { ...item, actualStockQuantity: val || val === 0 ? Math.floor(val) : undefined }
				: { ...item },
		);
		setDataSource([...data]);
	};
	const onSelected = (value: RawValueType | LabelInValueType, id: number) => {
		const data = dataSource.map((item) =>
			item.id === id ? { ...item, errorReason: value as string } : { ...item },
		);
		setDataSource([...data]);
	};

	const columns: ProColumns<StockTakingOrderController.GetStockDetailParams>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 180,
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 180,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			render: (text, record) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			title: '批号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 100,
			ellipsis: true,
		},
		{
			title: '效期',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 130,
			renderText: (text) => (text ? moment(text).format('YYYY-MM-DD') : '-'),
		},
		{
			title: '单价',
			dataIndex: 'price',
			key: 'price',
			width: 100,
			renderText: (text) => convertPriceWithDecimal(text),
		},
		{
			title: pageType === 'handle' ? '提示数量' : '盘前数量',
			dataIndex: 'systemStockQuantity',
			key: 'systemStockQuantity',
			width: 100,
		},
		{
			title: () => (
				<>
					{modalType === 'handle' && <span className='cl_FF110B'>*</span>}
					{pageType === 'handle' ? '确认数量' : '实际数量'}
				</>
			),
			dataIndex: 'actualStockQuantity',
			key: 'actualStockQuantity',
			width: 140,
			renderText: (text, record) => {
				return modalType === 'handle' ? (
					<Form.Item
						className='mg0'
						name={`actualStockQuantity${record.id}`}
						initialValue={
							typeof text === 'number' ? text : record.barcodeControlled ? '-' : undefined
						}
						rules={[
							{
								required: true,
								message: '',
								pattern: new RegExp(/^[0-9]*$/, 'g'),
							},
						]}>
						<InputNumber
							autoFocus={true}
							min={0}
							max={9999999}
							style={{ width: '100px' }}
							key={record.id}
							onChange={(value) => numChange(record.id, value)}
							disabled={record.barcodeControlled}
						/>
					</Form.Item>
				) : typeof text === 'number' ? (
					text
				) : (
					'-'
				);
			},
		},
		{
			title: '盈亏情况',
			dataIndex: 'id',
			key: 'id',
			width: 100,
			renderText: (_, record) => {
				const result = Number(record.actualStockQuantity! - record.systemStockQuantity);
				let text: string | number = result;
				let color: string = 'default';
				switch (true) {
					case result < 0:
						color = CONFIG_LESS['@c_starus_warning'];
						break;
					case result > 0:
						color = CONFIG_LESS['@c_starus_done'];
						text = '+' + result;
						break;
					case result === 0:
						color = CONFIG_LESS['@c_starus_disabled'];
						break;
				}
				return typeof record.actualStockQuantity === 'number' ? (
					<div className='widthTag'>
						<Tag color={color}>{text}</Tag>
					</div>
				) : (
					'-'
				);
			},
		},
		{
			title: '单位',
			dataIndex: 'unit',
			key: 'unit',
			width: 100,
			ellipsis: true,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 180,
			ellipsis: true,
		},
		{
			title: () => <>{modalType === 'handle' && <span className='cl_FF110B'>*</span>}盈亏原因</>,
			dataIndex: 'errorReason',
			key: 'errorReason',
			width: 220,
			ellipsis: true,
			renderText: (text, record) => {
				const disabled =
					Number(record.actualStockQuantity! - record.systemStockQuantity) === 0 ||
					(record.barcodeControlled && typeof record.actualStockQuantity !== 'number');
				return modalType === 'handle' ? (
					<Form.Item
						className='mg0'
						name={`errorReason${record.id}`}
						initialValue={text}
						rules={[
							{
								required: !disabled,
								message: '',
							},
						]}>
						<Select
							style={{ width: 200 }}
							disabled={disabled}
							loading={errorReasonLoading}
							onClick={(e) => e.stopPropagation()}
							onFocus={() => {
								getReason();
							}}
							onSelect={(value: RawValueType | LabelInValueType) => onSelected(value, record.id)}>
							{errorReasonList.map((item) => {
								return (
									<Select.Option
										key={item.id}
										value={item.reason}>
										{item.reason}
									</Select.Option>
								);
							})}
						</Select>
					</Form.Item>
				) : (
					text
				);
			},
		},
		{
			title: '操作设备',
			dataIndex: 'terminal',
			key: 'terminal',
			width: 120,
			ellipsis: true,
		},
		{
			title: '操作人员',
			dataIndex: 'operator',
			key: 'operator',
			width: 120,
			ellipsis: true,
		},
		{
			title: '操作时间',
			dataIndex: 'operationTime',
			key: 'operationTime',
			width: 130,
			renderText: (text) => (text ? moment(text).format('YYYY-MM-DD') : '-'),
		},
	];
	const confirmColumns: ProColumns<StockTakingOrderController.GetStockDetailParams>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 180,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			render: (text, record) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 180,
			ellipsis: true,
		},
		{
			title: '批号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 100,
			ellipsis: true,
		},
		{
			title: '效期',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 130,
			renderText: (text) => (text ? moment(text).format('YYYY-MM-DD') : '-'),
		},
		{
			title: '盘前数量',
			dataIndex: 'systemStockQuantity',
			key: 'systemStockQuantity',
			width: 100,
		},
		{
			title: '实盘数量',
			dataIndex: 'actualStockQuantity',
			key: 'actualStockQuantity',
			width: 100,
		},
		{
			title: '盈亏情况',
			dataIndex: 'id',
			key: 'id',
			width: 100,
			renderText: (_, record) => {
				const result = Number(record.actualStockQuantity! - record.systemStockQuantity);
				let text: string | number = result;
				let color: string = 'default';
				switch (true) {
					case result < 0:
						color = CONFIG_LESS['@c_starus_warning'];
						break;
					case result > 0:
						color = CONFIG_LESS['@c_starus_done'];
						text = '+' + result;
						break;
				}
				return (
					<div className='widthTag'>
						<Tag color={color}>{text}</Tag>
					</div>
				);
			},
		},
		{
			title: '盈亏原因',
			dataIndex: 'errorReason',
			key: 'errorReason',
			width: 220,
			ellipsis: true,
		},
	];
	const onSubmit = () => {
		form
			.validateFields()
			.then(async (value) => {
				setSubmitLoading(true);
				try {
					// 在所有数据盘平的情况下，点击确认盘库。直接发请求关闭弹窗、否则开启“盘点确认”弹窗
					const newConfirmData = dataSource.filter(
						(item) => !(Number(item.actualStockQuantity! - item.systemStockQuantity) === 0),
					);
					if (newConfirmData.length > 0) {
						setConfirmData(newConfirmData);
						setOpen(false);
						setConfirmVisible(true);
					} else {
						const itemDtoList = dataSource.map((item) => {
							const { id, actualStockQuantity } = item;
							//盘平的情况下不需要原因
							return { itemId: id, actualStockQuantity };
						});
						const res = await stockTaking({
							stockTakingOrderId: record.id!,
							itemDtoList,
							status: 'finished',
						});
						if (res.code === 0) {
							notification.success('操作成功！');
							onCancel();
							tableRef.current?.reload();
						}
					}
				} finally {
					setSubmitLoading(false);
				}
			})
			.catch((error) => {
				form.scrollToField(
					error.errorFields[0] && error.errorFields[0].name && error.errorFields[0].name[0],
				);
			});
	};
	const onHold = async () => {
		setHoldLoading(true);
		try {
			const itemDtoList = dataSource.map((item) => {
				const { id, actualStockQuantity, systemStockQuantity, errorReason } = item;
				//盘平的情况下不需要原因
				if (Number(actualStockQuantity! - systemStockQuantity) === 0) {
					return { itemId: id, actualStockQuantity };
				} else {
					return { itemId: id, actualStockQuantity, errorReason };
				}
			});
			const res = await stockTaking({
				stockTakingOrderId: record.id!,
				itemDtoList: itemDtoList,
				status: 'stock_taking',
			});
			if (res.code === 0) {
				notification.success('操作成功！');
			}
		} finally {
			setHoldLoading(false);
		}
	};
	const onConfirmModalCancel = () => {
		setConfirmVisible(false);
		setOpen(true);
	};
	const onOk = async () => {
		setOkLoading(true);
		try {
			const itemDtoList = dataSource.map((item) => {
				const { id, actualStockQuantity, systemStockQuantity, errorReason } = item;
				//盘平的情况下不需要原因
				if (Number(actualStockQuantity! - systemStockQuantity) === 0) {
					return { itemId: id, actualStockQuantity };
				} else {
					return { itemId: id, actualStockQuantity, errorReason };
				}
			});
			const res = await stockTaking({
				stockTakingOrderId: record.id!,
				itemDtoList,
				status: 'finished',
			});
			if (res.code === 0) {
				notification.success('操作成功！');
				setConfirmVisible(false);
				onCancel();
				tableRef.current?.reload();
			}
		} finally {
			setOkLoading(false);
		}
	};
	return (
		<>
			<Modal
				maskClosable={false}
				visible={visible && open}
				title={
					pageType === 'handle'
						? accessNameMaplist.stock_taking_order_handle
						: modalType === 'handle'
						? accessNameMaplist.stock_taking_order_view
						: accessNameMaplist.stock_taking_order_detail
				}
				className='ant-detail-modal'
				onCancel={onCancel}
				footer={
					modalType === 'handle' && [
						<Button onClick={onCancel}>取消</Button>,
						<Button
							type='primary'
							loading={holdLoading || loading}
							onClick={onHold}>
							暂存
						</Button>,
						<Button
							type='primary'
							loading={submitLoading || loading}
							onClick={onSubmit}>
							确认盘点
						</Button>,
					]
				}>
				<Row className='detailsBorder four'>
					<Col className='left'>
						<Descriptions<StockTakingOrderController.GetDetailRuleParams>
							options={options}
							data={record}
							column={4}
							optionEmptyText={'-'}
						/>
					</Col>
					<Col className='right'>
						<Statistic
							title='当前状态'
							value={stockTakingStatusTextMap[record.status as string] || '-'}
						/>
					</Col>
				</Row>
				<Form form={form}>
					<ProTable
						columns={columns}
						tableInfoCode={
							pageType === 'handle'
								? 'stock_taking_order_handle'
								: modalType === 'handle'
								? 'stock_taking_order_view'
								: 'stock_taking_order_detail'
						}
						className={styles.errorForm}
						rowKey='id'
						dataSource={dataSource}
						scroll={{
							y: 300,
						}}
						toolBarRender={() => [
							modalType === 'handle' && (
								<ReasonEditor>
									<Button type='primary'>盈亏原因编辑</Button>
								</ReasonEditor>
							),
						]}
						pagination={false}
						size='small'
					/>
				</Form>
			</Modal>
			{confirmVisible && (
				<Modal
					maskClosable={false}
					visible={confirmVisible}
					title='盘点确认'
					className='ant-detail-modal'
					onCancel={onConfirmModalCancel}
					footer={[
						<Button onClick={onConfirmModalCancel}>取消</Button>,
						<Button
							type='primary'
							loading={okLoading}
							onClick={onOk}>
							确认盘点
						</Button>,
					]}>
					<p>以下物资的实盘数量与盘前数量不符，请确认后点击“确认盘点”按钮！</p>
					<ProTable
						loading={loading}
						columns={confirmColumns}
						className={styles.errorForm}
						rowKey='id'
						dataSource={confirmData}
						scroll={{
							y: 300,
						}}
						options={{ density: false, fullScreen: false, setting: false }}
						pagination={false}
						size='small'
					/>
				</Modal>
			)}
		</>
	);
};
export default DetailAndHandleModal;
