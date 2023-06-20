import Descriptions, { DescriptionsItemProps } from '@/components/Descriptions';
import ProTable, { ProColumns, ProTableAction } from '@/components/ProTable';
import ScanInput from '@/components/ScanInput/ScanInput';
import { approve, confirmReturn, getDetail, returnGoods } from '@/services/returnGoods';
import { searchGoods } from '@/services/stock';
import { accessNameMap, judgeBarCodeOrUDI, transformSBCtoDBC } from '@/utils';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { getUrl } from '@/utils/utils';
import '@ant-design/compatible/assets/index.css';
import { ScanOutlined } from '@ant-design/icons';
import { Badge, Button, Col, Form, Input, Modal, Radio, Row, Statistic } from 'antd';
import moment from 'moment';
import React, { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { useAccess, useModel } from 'umi';
import style from '../list/index.less';
const accessNameMaplist: Record<string, any> = accessNameMap();
const FormItem = Form.Item;
const handleTitle = {
	detail: accessNameMaplist.return_goods_view,
	approve: accessNameMaplist.return_goods_check,
	confirm: accessNameMaplist.return_goods_confirm,
	confirmDelivered: accessNameMaplist.return_goods_delivered,
	return: accessNameMaplist.scan_return_goods,
};

export interface UpdateProps {
	setIsOpen: (value: boolean) => void;
	isOpen: boolean;
	handleType?: string;
	orderId?: string;
	getFormList?: () => void;
}

const DetailModal: React.FC<UpdateProps> = (props) => {
	const { fields } = useModel('fieldsMapping');
	const { isOpen, handleType = '', orderId, setIsOpen, getFormList = () => {} } = props;
	const [list, setList] = useState<ReturnGoodsController.GoodList[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [detail, setDetail] = useState<Partial<ReturnGoodsController.Order>>({});
	const [preVisible, setPreVisible] = useState<boolean>(false);
	const [preImage, setPreImage] = useState<string>('');
	const [formAgree, setFormAgree] = useState<string>('');
	const [scanValue, setScanValue] = useState<string>('');
	const [barCodes, setBarCodes] = useState<Record<string, any>>([]);
	const access = useAccess();
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();

	const scanChange = (value: React.SetStateAction<string>) => setScanValue(value);

	// 关闭弹窗
	const modalCancel = (update: boolean) => {
		setScanValue('');
		setList([]);
		setIsOpen(false);
		form.resetFields();
		if (update) {
			getFormList();
		}
	};

	// 扫码提交
	const scanSubmit = async (value: FormEvent<HTMLInputElement> | string) => {
		if (!scanValue) {
			return;
		}
		const transValue = transformSBCtoDBC(value);
		const gs1Code = scanValue.indexOf('_') > -1 ? transValue : transValue;

		// 扫码退货
		if (handleType === 'return') {
			const params = {
				operatorBarcode: gs1Code,
				returnGoodsCode: detail.code,
			};
			setLoading(true);
			try {
				const res = await returnGoods(params);
				if (res && res.code === 0) {
					notification.success('操作成功！');
					tableRef.current?.reload();
					getFormList();
					setScanValue('');
				}
			} finally {
				setLoading(false);
			}
		}

		// 确认送达
		if (handleType === 'confirmDelivered') {
			const params = {
				operatorBarcode: gs1Code,
			};
			setLoading(true);
			const res = await searchGoods(params);
			if (res && res.code === 0) {
				let itemArr =
					list &&
					list.length &&
					list.filter((item) => {
						console.log('确认送达', item);
						return (
							item.operatorBarcode === res.data.operatorBarcode ||
							item.newOperatorBarcode === res.data.operatorBarcode
						);
					});
				if (!itemArr || itemArr.length <= 0) {
					notification.error(`该${fields.baseGoods}不在列表内`);
					return;
				}
				const code = itemArr[0].operatorBarcode || itemArr[0].newOperatorBarcode;
				if (barCodes.indexOf(code) >= 0) {
					notification.warning('该产品已扫码！');
					return;
				}
				setBarCodes((pro) => pro.concat(code));
				// setItemsIds((pro) => pro.concat(itemArr[0].returnGoodsItemId));
				notification.success('扫码成功！');
				setScanValue('');
			}
			setLoading(false);
		}
	};

	// 提交
	const returnSubmit = async () => {
		form.validateFields().then(async (values) => {
			setLoading(true);

			// // 确认送达
			// if (handleType === 'confirmDelivered') {
			//   const params = {
			//     itemsIds,
			//     returnGoodsId: detail.id,
			//   };
			//   setLoading(true);
			//   const res = await confirmDelivered(params);
			//   if (res && res.code === 0) {
			//     notification.success('操作成功！');
			//     modalCancel(true);
			//   }
			//   setLoading(false);
			//   return;
			// }
			// console.log('valuesvalues', values);

			const params = transformSBCtoDBC({
				agree: values.agree !== 'N',
				reason: values.reason,
				returnGoodsId: detail.id,
			});
			// if (handleType === 'confirm') {
			//   // 确认
			//   const res = await confirm(params);
			//   if (res && res.code === 0) {
			//     notification.success('操作成功！');
			//     modalCancel(true);
			//   }
			// } else {
			// 审核
			const res = await approve(params);
			if (res && res.code === 0) {
				notification.success('操作成功！');
				modalCancel(true);
				// }
			}
			setLoading(false);
		});
	};
	//确认退货
	const handleConfirmReturn = async (record: ReturnGoodsController.GoodList) => {
		const { goodsId, lotNum } = record;
		setLoading(true);
		try {
			const res = await confirmReturn({
				goodsId: goodsId!,
				lotNum: lotNum!,
				returnGoodsCode: detail.code!,
			});
			if (res && res.code === 0) {
				notification.success('操作成功！');
				tableRef.current?.reload();
			}
		} finally {
			setLoading(false);
		}
	};

	let columns: ProColumns<ReturnGoodsController.GoodList>[] = [
		{
			title: '序号',
			dataIndex: 'returnGoodsId',
			key: 'returnGoodsId',
			align: 'center',
			width: 80,
			render: (_id: any, _record: any, index: number) => index + 1,
		},
		{
			title: `${fields.goods}条码/UDI`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 180,
			ellipsis: true,
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
			width: 110,
			renderText: (text: string, record) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 100,
			align: 'right',
			render: (_text, record) => convertPriceWithDecimal(record.price),
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 150,
			ellipsis: true,
			renderText: (text: string, record) => (
				<span>{`${text || '-'}/${record.serialNum || '-'}`}</span>
			),
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 120,
			renderText: (text: moment.MomentInput) =>
				text ? moment(new Date(text as number)).format('YYYY/MM/DD') : '-',
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 120,
			renderText: (text: moment.MomentInput) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
		},
		{
			title: '退货数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
			renderText: (text: ReactNode, record) =>
				`${text}${record.minGoodsUnitName ? record.minGoodsUnitName : ''}`,
		},
		{
			title: '总价(元)',
			dataIndex: 'totalAmount',
			key: 'totalAmount',
			width: 100,
			align: 'right',
			renderText: (text: number, record) => convertPriceWithDecimal(text),
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
			render: (_text, record, _index) => {
				return (
					record.attachments &&
					record.attachments.map((item: string, index: React.Key | null | undefined) => {
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
		{
			title: '操作',
			dataIndex: 'goodsId',
			key: 'goodsId',
			hideInTable: handleType !== 'return',
			width: 100,
			fixed: 'right',
			render: (text, record) =>
				!record.barcodeControlled &&
				!record.handled && (
					<a
						onClick={() => {
							handleConfirmReturn(record);
						}}>
						确认退货
					</a>
				),
		},
	];
	if (handleType === 'confirmDelivered') {
		columns.splice(1, 0, {
			title: '是否送达',
			dataIndex: 'deliverStatus',
			key: 'deliverStatus',
			width: 120,
			render: (
				_text: ReactNode,
				record: { newOperatorBarcode?: string; operatorBarcode?: string },
			) => {
				const code = record.newOperatorBarcode ? record.newOperatorBarcode : record.operatorBarcode;
				return <span>{barCodes.indexOf(code) >= 0 ? '已送达' : '未送达'}</span>;
			},
		});
	}

	if (handleType === 'return') {
		columns.splice(1, 0, {
			title: '状态',
			dataIndex: 'handled',
			key: 'handled',
			width: 100,
			render: (text: any) => {
				return (
					<Badge
						color={text ? CONFIG_LESS['@c_starus_done'] : CONFIG_LESS['@c_starus_await']}
						text={text ? '已退货' : '待退货'}
					/>
				);
			},
		});
	}

	useEffect(() => {
		if (isOpen) {
			form.setFieldsValue({ agree: 'Y' });
			setFormAgree('Y');
		}
	}, [isOpen]);

	useEffect(() => {
		if (['approve', 'confirm'].includes(handleType)) {
			form.setFieldsValue({ agree: 'Y' });
			setFormAgree('Y');
		}
	}, [handleType]);

	interface DataItem {
		code?: string;
		warehouseName?: string;
		distributorName?: string;
		contactPhone?: string;
		type?: string;
	}

	const options: DescriptionsItemProps<DataItem>[] = [
		{
			label: '退货单号',
			dataIndex: 'code',
		},
		{
			label: '退货仓库',
			dataIndex: 'warehouseName',
		},
		{
			label: fields.distributor,
			dataIndex: 'distributorName',
		},
		{
			label: '联系方式',
			dataIndex: 'contactPhone',
		},
		{
			label: '退货方式',
			dataIndex: 'type',
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
			onCancel={() => modalCancel(true)}
			footer={
				(handleType === 'confirm' && access.return_goods_confirm) ||
				(handleType === 'approve' && access.return_goods_check) ||
				(handleType === 'confirmDelivered' && access.return_goods_delivered)
					? [
							<Button
								type='primary'
								onClick={returnSubmit}
								loading={loading}>
								提交
							</Button>,
					  ]
					: false
			}>
			<Row className='detailsBorder five'>
				<Col className='left'>
					<Descriptions<DataItem>
						options={options}
						data={detail}
						optionEmptyText={'-'}
					/>
				</Col>
				<Col className='right'>
					<Statistic
						title='当前状态'
						value={detail.returnStatusCh || '-'}
					/>
				</Col>
			</Row>
			<div className='ant-table-line'></div>
			<ProTable
				headerTitle={''}
				loading={loading}
				columns={columns}
				rowKey='returnGoodsItemId'
				style={{ marginTop: handleType === 'return' ? -11 : '' }}
				toolBarRender={
					handleType === 'return'
						? () => [
								['confirmDelivered', 'return'].includes(handleType) ? (
									<div
										className='scanInput'
										style={{ marginTop: -30, marginBottom: -1 }}>
										<ScanInput
											value={scanValue}
											placeholder='点击此处扫码'
											onSubmit={scanSubmit}
											// onPressEnter={scanSubmit}
											onChange={scanChange}
											autoFocus={true}
											suffix={<ScanOutlined />}
										/>
									</div>
								) : null,
						  ]
						: undefined
				}
				api={getDetail as any}
				tableRef={tableRef}
				params={{ returnGoodsId: orderId }}
				options={{ density: false, fullScreen: false, setting: false }}
				scroll={{ y: 300 }}
				pagination={false}
				size='small'
				setRows={(res: Record<string, any>) => {
					const { goodsList, order } = res.data;
					setList(goodsList && goodsList);
					if (order && JSON.stringify(order) !== '{}') {
						setDetail(order);
					}
					if (goodsList && goodsList.length) {
						setList(goodsList);
					}
					return { rows: goodsList };
				}}
			/>
			<Form form={form}>
				{['approve', 'confirm'].includes(handleType) && (
					<>
						<div className='modelTitle'>
							<h3>{handleType === 'approve' ? '审核结果' : '确认结果'}</h3>
						</div>
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
