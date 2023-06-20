import Descriptions, { DescriptionsItemProps } from '@/components/Descriptions';
import ThermalPrinter from '@/components/print/ThermalPrinter';
import ProTable, { ProColumns } from '@/components/ProTable';
import ScanInput from '@/components/ScanInput/ScanInput';
import { approve, confirm, confirmDelivered, getDetail, returnGoods } from '@/services/returnGoods';
import { searchGoods } from '@/services/stock';
import { accessNameMap, judgeBarCodeOrUDI, transformSBCtoDBC } from '@/utils';
import { formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { getUrl } from '@/utils/utils';
import '@ant-design/compatible/assets/index.css';
import { ScanOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Modal, Radio, Row, Statistic } from 'antd';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import React, { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { useAccess, useModel } from 'umi';
import style from '../index.less';
const accessNameMaplist: Record<string, any> = accessNameMap();
const FormItem = Form.Item;
const handleTitle = {
	detail: accessNameMaplist.department_return_goods_view,
	approve: accessNameMaplist.department_return_goods_check,
	confirm: accessNameMaplist.department_return_goods_confirm,
	confirmDelivered: accessNameMaplist.department_return_goods_delivered,
	print: '退货单赋码',
};

export interface UpdateProps {
	setIsOpen: (value: boolean) => void;
	isOpen: boolean;
	handleType?: string;
	orderId?: string;
	getFormList: any;
}
interface DataItem {
	code?: string;
	departmentName: string;
	warehouseName?: string;
	contactPhone?: string;
}

const DetailModal: React.FC<UpdateProps> = (props) => {
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const [goodsList, setGoodsList] = useState<ReturnGoodsController.GoodsList[]>([]);
	// const [packageBulkList, setPackageBulkList] = useState<ReturnGoodsController.PackageOrdinaryList[]>([]);
	const [surgicalPkgBulkList, setSurgicalPkgBulkList] = useState<
		ReturnGoodsController.PackageOrdinaryList[]
	>([]);
	const [loading, setLoading] = useState(false);
	const [detail, setDetail] = useState<ReturnGoodsController.Order>();
	const [preVisible, setPreVisible] = useState(false);
	const [preImage, setPreImage] = useState<string>('');

	const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
	const [itemsIds, setItemsIds] = useState<number[]>([]);
	const [barCodes, setBarCodes] = useState<string[]>([]);

	const [formAgree, setFormAgree] = useState<string>('');
	const [scanValue, setScanValue] = useState<string>('');

	const [form] = Form.useForm();
	const thermalPrinter: any = useRef<Record<string, any>>();

	const { isOpen, handleType = '', orderId = '', setIsOpen, getFormList } = props;

	const getDetailInfo = async () => {
		setLoading(true);
		const res = await getDetail({ returnGoodsId: orderId });
		if (res && res.code === 0) {
			const { goodsList, order, packageOrdinaryList } = res.data;

			setGoodsList(goodsList as ReturnGoodsController.GoodsList[]);
			// setPackageBulkList(packageBulkList);
			setSurgicalPkgBulkList(packageOrdinaryList as ReturnGoodsController.PackageOrdinaryList[]);
			setDetail(order);
		}
		setLoading(false);
	};

	// 关闭弹窗
	const modalCancel = (update: boolean) => {
		setScanValue('');
		setGoodsList([]);
		setSurgicalPkgBulkList([]);
		setItemsIds([]);
		setBarCodes([]);
		setSelectedKeys([]);
		setIsOpen(false);
		if (update) {
			getFormList();
		}
	};

	// 提交
	const returnSubmit = async () => {
		form.validateFields().then(async (values) => {
			// 确认送达
			if (handleType === 'confirmDelivered') {
				const params = {
					itemsIds,
					returnGoodsId: detail?.id,
				};
				setLoading(true);
				const res = await confirmDelivered(params);
				if (res && res.code === 0) {
					notification.success('操作成功！');
					modalCancel(true);
				}
				setLoading(false);
				return;
			}
			setLoading(true);
			const params = transformSBCtoDBC({
				agree: values.agree === 'N' ? false : true,
				reason: values.reason,
				returnGoodsId: detail?.id,
			});
			if (handleType === 'confirm') {
				// 确认
				const res = await confirm(params);
				if (res && res.code === 0) {
					notification.success('操作成功！');
					modalCancel(true);
				}
			} else {
				// 审核
				const res = await approve(params);
				if (res && res.code === 0) {
					notification.success('操作成功！');
					modalCancel(true);
				}
			}
			setLoading(false);
		});
	};

	// 批量送达
	const submitBatch = () => {
		let barCode: string[] = cloneDeep(barCodes);
		let itemsId = cloneDeep(itemsIds);
		let AllList: any[] = goodsList.concat(surgicalPkgBulkList);
		selectedKeys.forEach((el) => {
			AllList.forEach((item: any) => {
				if (item.operatorBarcode === el) {
					const code: string = item.newOperatorBarcode || item.operatorBarcode;
					if (!barCode.some((itemCode: string) => itemCode === code)) {
						barCode.push(code);
						itemsId.push(item.returnGoodsItemId);
					}
				}
			});
		});
		notification.success('操作成功');
		setBarCodes(barCode);
		setItemsIds(itemsId);
		setSelectedKeys([]);
	};

	const scanChange = (value: string) => {
		setScanValue(value);
	};

	// 扫码提交
	const scanSubmit = async (value: FormEvent<HTMLInputElement> | string) => {
		if (!value) {
			return;
		}
		const transValue = transformSBCtoDBC(value);
		const gs1Code = transValue.indexOf('_') > -1 ? transValue : transValue;
		let dataList = goodsList.concat(surgicalPkgBulkList);

		// 扫码退货
		if (handleType === 'return') {
			const params = {
				operatorBarcode: gs1Code,
				returnGoodsCode: detail?.code,
			};
			setLoading(true);
			const res = await returnGoods(params);
			if (res && res.code === 0) {
				notification.success('操作成功！');
				getDetailInfo();
				getFormList();
				setScanValue('');
			}
			setLoading(false);
		}

		// 确认送达
		if (handleType === 'confirmDelivered') {
			const params = {
				operatorBarcode: gs1Code,
			};
			setLoading(true);
			const res = await searchGoods(params);
			if (res && res.code === 0) {
				setLoading(false);
				let itemArr: ReturnGoodsController.GoodsList[] = dataList.filter((item: any) => {
					return (
						item.operatorBarcode === res.data.operatorBarcode ||
						item.newOperatorBarcode === res.data.operatorBarcode
					);
				});
				if (!itemArr || itemArr.length <= 0) {
					notification.error(`该${fields.baseGoods}不在列表内`);
					return;
				}
				const code = itemArr[0].newOperatorBarcode || (itemArr[0].operatorBarcode as string);
				if (barCodes.includes(code)) {
					notification.warning('该产品已扫码！');
					return;
				}
				setBarCodes((pro) => pro.concat(code));
				setItemsIds((pro) => pro.concat(itemArr[0].returnGoodsItemId as number));
				notification.success('扫码成功！');
				setScanValue('');
			}
			setLoading(false);
		}
	};

	let goodsModal: ProColumns<ReturnGoodsController.GoodList>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 80,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: `${fields.goods}条码/UDI`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 180,
			renderText: (text, record) => judgeBarCodeOrUDI(record, true),
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
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 120,
			renderText: (text: string, record) => (
				<span>{`${text || '-'}/${record.serialNum || '-'}`}</span>
			),
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 120,
			renderText: (text) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 120,
			renderText: (text) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
		},
		{
			title: '退货数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
			render: (text, record) => {
				return <span>{`${text}${record.minGoodsUnitName ? record.minGoodsUnitName : ''}`}</span>;
			},
		},
		{
			title: '退货事由',
			dataIndex: 'returnReasonCh',
			key: 'returnReasonCh',
			width: 150,
		},
		{
			title: '图片',
			dataIndex: 'attachments',
			key: 'attachments',
			width: 160,
			render: (text, record) => {
				return (
					record.attachments &&
					record.attachments.map((item, index) => {
						const url = getUrl() + item;
						return (
							<img
								src={url}
								key={index}
								style={{ width: '50px', paddingRight: '10px' }}
								onClick={() => {
									setPreImage(url);
									setPreVisible(true);
								}}
							/>
						);
					})
				);
			},
		},
	];

	let surgicalModal: ProColumns<ReturnGoodsController.PackageOrdinaryList>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 80,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: '医耗套包条码',
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 180,
		},
		{
			title: '医耗套包名称',
			dataIndex: 'name',
			key: 'name',
			width: 150,
			ellipsis: true,
		},
		{
			title: '包装数量',
			dataIndex: 'detailGoodsMessage',
			key: 'detailGoodsMessage',
			width: 200,
			ellipsis: true,
		},
		{
			title: '退货数量',
			dataIndex: 'id',
			key: 'id',
			width: 100,
			render: () => '1包',
		},
		{
			title: '退货事由',
			dataIndex: 'returnReasonCh',
			key: 'returnReasonCh',
			width: 150,
		},
		{
			title: '图片',
			dataIndex: 'attachments',
			key: 'attachments',
			width: 160,
			render: (text, record) =>
				record.attachments &&
				record.attachments.map((item, index) => {
					return (
						<img
							src={getUrl() + item}
							key={index}
							style={{ width: '50px', paddingRight: '10px' }}
							// onClick={this.handlePreview.bind(this, item)}
						/>
					);
				}),
		},
	];
	let AllList = [goodsModal, surgicalModal];

	if (handleType === 'confirmDelivered') {
		const addItem = {
			title: '是否送达',
			dataIndex: 'deliverStatus',
			key: 'deliverStatus',
			width: 120,
			render: (text: ReactNode, record: any) => {
				const code = record.newOperatorBarcode ? record.newOperatorBarcode : record.operatorBarcode;
				return <span>{barCodes.indexOf(code) >= 0 ? '已送达' : '未送达'}</span>;
			},
		};
		AllList.forEach((item) => {
			item.splice(1, 0, addItem);
		});
	}

	if (handleType === 'return') {
		const addItem = {
			title: '状态',
			dataIndex: 'handled',
			key: 'handled',
			width: 100,
			render: (text: ReactNode, record: any) => (record.handled ? '已退货' : '待退货'),
		};
		AllList.forEach((item) => {
			item.splice(1, 0, addItem);
		});
	}

	// 选择
	const selectRow = (selectData: any, status: boolean) => {
		let selectedRowKeys = cloneDeep(selectedKeys);
		if (status) {
			selectedRowKeys.push(selectData.operatorBarcode);
		} else {
			selectedRowKeys = selectedRowKeys.filter((el) => el !== selectData.operatorBarcode);
		}
		setSelectedKeys(selectedRowKeys);
	};

	// 全选
	const onSelectAll = (selected: boolean, selectedRecords: any, changeRecords: any) => {
		let selectedRowKeys = cloneDeep(selectedKeys);
		let list = changeRecords.map((item: any) => item.operatorBarcode);
		if (selected) {
			selectedRowKeys = Array.from(new Set(selectedRowKeys.concat(list)));
		} else {
			changeRecords.forEach((item: any) => {
				selectedRowKeys = selectedRowKeys.filter((el) => el !== item.operatorBarcode);
			});
		}
		setSelectedKeys(selectedRowKeys);
	};

	// 单行点击选中
	const selectRowOfClick = (
		record: ReturnGoodsController.GoodsList | ReturnGoodsController.PackageOrdinaryList,
	) => {
		const index = selectedKeys.indexOf(record.operatorBarcode as string);
		if (index >= 0) {
			selectRow(record, false);
		} else {
			selectRow(record, true);
		}
	};

	const rowSelection = {
		selectedRowKeys: selectedKeys,
		onSelect: selectRow,
		onSelectAll: onSelectAll,
		getCheckboxProps: (record: any) => ({
			disabled: barCodes.includes(
				record.newOperatorBarcode ? record.newOperatorBarcode : record.operatorBarcode,
			),
		}),
	};

	const tabs = [
		{
			name: fields.baseGoods,
			type: 'goods',
			columns: goodsModal, // 固定列处理
			data: goodsList,
			tableInfoId: '163',
		},
		// {
		//   name: '手术套包',
		//   type: 'package_surgical',
		//   columns: surgicalModal,
		//   data: surgicalPkgBulkList,
		//   tableInfoId:'225'
		// },
		{
			name: '医耗套包',
			type: 'package_surgical',
			columns: surgicalModal,
			data: surgicalPkgBulkList,
			tableInfoId: '225',
		},
	];

	useEffect(() => {
		if (isOpen) {
			getDetailInfo();
		}
	}, [isOpen]);

	useEffect(() => {
		if (['approve', 'confirm'].includes(handleType)) {
			form.setFieldsValue({ agree: 'Y' });
			setFormAgree('Y');
		}
	}, [handleType]);

	const options: DescriptionsItemProps<DataItem>[] = [
		{
			label: '退货单号',
			dataIndex: 'code',
		},
		{
			label: '退货科室',
			dataIndex: 'departmentName',
		},
		{
			label: '退货仓库',
			dataIndex: 'warehouseName',
		},
		{
			label: '联系方式',
			dataIndex: 'contactPhone',
		},
	];

	return (
		<Modal
			className='ant-detail-modal'
			width='80%'
			destroyOnClose
			maskClosable={false}
			visible={isOpen}
			title={<>{handleTitle[handleType]}</>}
			onCancel={() => modalCancel(false)}
			footer={
				(handleType === 'confirm' && access.department_return_goods_confirm) ||
				(handleType === 'approve' && access.department_return_goods_check) ||
				(handleType === 'confirmDelivered' && access.department_return_goods_delivered)
					? [
							<Button
								type='primary'
								onClick={returnSubmit}
								loading={loading}
								disabled={goodsList.length + surgicalPkgBulkList.length <= 0}>
								提交
							</Button>,
							handleType === 'confirmDelivered' && (
								<Button
									type='primary'
									onClick={submitBatch}
									disabled={selectedKeys.length <= 0}>
									批量送达
								</Button>
							),
					  ]
					: false
			}>
			<Row className='detailsBorder five'>
				<Col className='left'>
					<Descriptions<DataItem>
						options={options}
						data={detail || ({} as DataItem)}
						optionEmptyText={'-'}
					/>
				</Col>
				<Col className='right'>
					<Statistic
						title='当前状态'
						value={detail?.returnStatusCh || '-'}
					/>
				</Col>
			</Row>
			<div className='ant-table-line'></div>
			{['confirmDelivered', 'return'].includes(handleType) && (
				<div
					className='scanInput'
					style={{ marginTop: -10 }}>
					<ScanInput
						value={scanValue}
						onSubmit={scanSubmit}
						// onPressEnter={scanSubmit}
						onChange={scanChange}
						autoFocus={true}
						placeholder='点击此处扫码'
						suffix={<ScanOutlined />}
					/>
				</div>
			)}

			{handleType === 'print' && (
				<Row className='modelInfoInline'>
					<Col>
						选择打印机：
						<ThermalPrinter ref={thermalPrinter} />
					</Col>
				</Row>
			)}

			{tabs.map((item) => {
				return (
					item.data.length > 0 && (
						<div
							key={item.type}
							style={{ marginTop: handleType === 'detail' ? -10 : -40 }}>
							<h3>{item.name}</h3>
							<ProTable
								rowSelection={handleType === 'confirmDelivered' ? rowSelection : undefined}
								loading={loading}
								columns={item.columns}
								rowKey='operatorBarcode'
								dataSource={item.data}
								options={{ density: false, fullScreen: false, setting: false }}
								scroll={{ x: '100%', y: 300 }}
								pagination={false}
								size='small'
								onRow={(
									record:
										| ReturnGoodsController.GoodsList
										| ReturnGoodsController.PackageOrdinaryList,
								) => ({
									onClick: (e) => {
										e.stopPropagation();
										selectRowOfClick(record);
									},
								})}
								className='mb4'
								tableAlertOptionRender={
									<a
										onClick={() => {
											setItemsIds([]);
											setBarCodes([]);
											setSelectedKeys([]);
										}}>
										取消选择
									</a>
								}
							/>
						</div>
					)
				);
			})}
			<Form form={form}>
				{((handleType === 'approve' && access.department_return_goods_check) ||
					(handleType === 'confirm' && access.department_return_goods_confirm)) && (
					<>
						<h3 className='mt2 mb1'>{handleType === 'approve' ? '审核结果' : '确认结果'}</h3>
						<FormItem
							name='agree'
							rules={[{ required: true, message: '请选择' }]}>
							<Radio.Group onChange={(e) => setFormAgree(e.target.value)}>
								<Radio
									value='Y'
									style={{ display: 'block', marginBottom: '10px' }}>
									通过
								</Radio>
								<Radio
									value='N'
									style={{ display: 'block' }}>
									不通过
								</Radio>
							</Radio.Group>
						</FormItem>
						{formAgree === 'N' && (
							<>
								<h3 className='mt2 mb1'>备注</h3>
								<FormItem
									name='reason'
									rules={[{ required: true, message: '请输入不通过原因' }]}
									style={{ marginLeft: '22px' }}>
									<Input.TextArea
										style={{ maxWidth: '500px' }}
										rows={3}
										placeholder='请输入不通过原因'
										maxLength={100}
									/>
								</FormItem>
							</>
						)}
					</>
				)}
			</Form>
			<Modal
				visible={preVisible}
				footer={null}
				onCancel={() => {
					setPreVisible(false);
				}}
				style={{ maxWidth: '90%' }}
				className={style.imgModal}>
				<img
					alt='img'
					style={{ width: '100%' }}
					src={preImage}
				/>
			</Modal>
		</Modal>
	);
};

export default DetailModal;
