import { ProColumns } from '@/components/ProTable/typings';
import Descriptions, { DescriptionsItemProps } from '@/components/Descriptions';
import ProTable from '@/components/ProTable';
import {
	queryReceiptListDetail,
	postexamine,
	receiptListPrintUrl,
	exportReceiptUrl,
} from '@/services/receipt';
import { convertPriceWithDecimal } from '@/utils/format';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal, Popover, Statistic, Button, Input, Form, DatePicker, Select } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useAccess, useModel } from 'umi';
import styles from '../list/index.less';
import { accessNameMap, getEndTime } from '@/utils';
import ApprovalResult from './ApprovalResult';
import { notification } from '@/utils/ui';
import Print from '@/components/print/indexsl';
import Target from '@/components/print/materialReceipt';
import ExportFile from '@/components/ExportFile';
import { taxRate, taxRateTextMap } from '@/constants/dictionary';
import { validateInvoiceAmount } from '@/utils/validator';
import { getTimeList } from '@/services/settlement';

const FormItem = Form.Item;
const { Option } = Select;
const payWay = {
	cash: '现金',
	cheque: '支票',
	clientPayment: '付委',
};
type FormDataItem = {
	auditType: string;
	// reason: string;
};
const PrintTarget = Print(Target);
const DetailModal = ({
	visible,
	setVisibleDetail,
	record,
	activeKey,
	getFormList,
	pageType,
}: ReceiptController.DetailProps) => {
	const [form] = Form.useForm();
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [list, setList] = useState<ReceiptController.DetailData[]>([]);
	const [searchParams, setSearchParams] = useState({});
	const [isExportFile, setIsExportFile] = useState(false);
	const [FormData, setFormData] = useState<FormDataItem>();
	const accessNameMaplist: Record<string, any> = accessNameMap();
	const [timeList, setTimeList] = useState<SettlementController.TimeListRecord[]>([]);
	const getInfo = async () => {
		setLoading(true);
		const res = await queryReceiptListDetail({ id: record.id });
		setLoading(false);
		if (res && res.code === 0) {
			setList(res.data);
			setIsExportFile(res.data.length > 0);
			setSearchParams(record);
		}
	};
	const getSearchDate = () => {
		return {
			id: record.id,
		};
	};
	useEffect(() => {
		if (visible) getInfo();
		if (visible && activeKey === '2' && pageType === 'handle' && record.type !== 'Viewlook') {
			getTimeListFun();
		}
	}, [visible]);

	useEffect(() => {
		form.setFieldsValue({
			invoiceCode: record.invoiceCode,
			invoiceNo: record.invoiceNo,
			invoicingDate: record.invoicingDate ? moment(new Date(record.invoicingDate)) : undefined,
			invoiceAmount: record.invoiceAmount
				? convertPriceWithDecimal(record.invoiceAmount)
				: undefined,
			taxRate: record.taxRate,
		});
	}, [record]);

	const getTimeListFun = async () => {
		const res = await getTimeList({ invoiceSync: false });
		if (res.code === 0) {
			setTimeList(res.data);
			if (res.data.length) {
				form.setFieldsValue({ approvalTime: res.data[0].timeTo });
			}
		}
	};

	const detail = (record: any) => {
		return (
			<>
				<div className={styles.topTitle}>
					<div>实际结算周期</div>
					<div className={styles.title}>数量</div>
				</div>
				{record.fuseInfo.length &&
					record.fuseInfo.map((item: any) => {
						return (
							<div className={styles.textTitle}>
								<div className={styles.date}>
									{moment(item.timeFrom).format('YYYY/MM/DD')}～
									{moment(item.timeTo).format('YYYY/MM/DD')}
								</div>
								<div className={styles.num}>{item.num}</div>
							</div>
						);
					})}
			</>
		);
	};
	const handleOk = async () => {
		if (FormData && FormData.auditType === 'Y') {
			if (!record.invoiceCode && !form.getFieldsValue().invoiceCode) {
				notification.warning('暂未填写发票编号，无法提交审核！');
				return;
			}
			//提交请求
			const res = await postexamine({
				receiptId: record.id,
				status: FormData.auditType === 'Y',
				...form.getFieldsValue(),
				invoicingDate:
					form.getFieldsValue().invoicingDate && form.getFieldsValue().invoicingDate.valueOf(),
				invoiceAmount:
					form.getFieldsValue().invoiceAmount && form.getFieldsValue().invoiceAmount * 10000,
			});
			if (res.code === 0) {
				setVisibleDetail(false);
				getFormList();
			}
		} else {
			//提交请求
			const res = await postexamine({
				receiptId: record.id,
				status: FormData.auditType === 'Y',
				...form.getFieldsValue(),
				invoicingDate:
					form.getFieldsValue().invoicingDate && form.getFieldsValue().invoicingDate.valueOf(),
				invoiceAmount:
					form.getFieldsValue().invoiceAmount && form.getFieldsValue().invoiceAmount * 10000,
			});
			if (res.code === 0) {
				setVisibleDetail(false);
				getFormList();
			}
		}
	};
	let footer = () => {
		return [
			<Button
				key='back'
				onClick={() => {
					setVisibleDetail(false);
				}}>
				取消
			</Button>,
			<Button
				key='submit'
				type='primary'
				loading={loading}
				onClick={handleOk}>
				提交
			</Button>,
		];
	};

	const columns: ProColumns<ReceiptController.DetailData>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 80,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: '类别/目录',
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 130,
		},
		{
			title: '品名',
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 160,
			ellipsis: true,
		},
		{
			title: '规格',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 120,
		},
		{
			title: '单位',
			dataIndex: 'unitName',
			key: 'unitName',
			width: 160,
			ellipsis: true,
		},
		{
			title: '发票编号',
			dataIndex: 'invoiceCode',
			key: 'invoiceCode',
			width: 160,
			ellipsis: true,
		},
		{
			title: '收料单号',
			dataIndex: 'receiptCode',
			key: 'receiptCode',
			width: 160,
			ellipsis: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'consumeGoodsUnitPrice',
			key: 'consumeGoodsUnitPrice',
			width: 140,
			align: 'right',
			renderText: (text: number) => <span>{convertPriceWithDecimal(text)}</span>,
		},
		{
			title: '数量',
			dataIndex: 'consumeGoodsQuantity',
			key: 'consumeGoodsQuantity',
			width: 160,
			ellipsis: true,
			renderText: (text: number, record) => {
				return (
					<>
						{record.consumeGoodsQuantity < 0 ? (
							<span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>
								{record.consumeGoodsQuantity}
							</span>
						) : (
							record.consumeGoodsQuantity
						)}
						{record.fuse && (
							<Popover
								trigger='hover'
								placement='leftBottom'
								content={detail(record)}>
								<ExclamationCircleOutlined style={{ color: CONFIG_LESS['@c_hint'] }} />
							</Popover>
						)}
					</>
				);
			},
		},
		{
			title: '金额(元)',
			dataIndex: 'consumeGoodsSumPrice',
			key: 'consumeGoodsSumPrice',
			width: 140,
			align: 'right',
			renderText: (text: number) => {
				return text < 0 ? (
					<span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>
						{text ? convertPriceWithDecimal(text) : '-'}
					</span>
				) : (
					<span>{text ? convertPriceWithDecimal(text) : '-'}</span>
				);
			},
		},
	];

	const descriptionsOptions: DescriptionsItemProps[] = [
		{
			label: '收料单号',
			dataIndex: 'receiptCode',
		},
		{
			label: '结算周期',
			dataIndex: 'timeFrom',
			show: activeKey !== '1',
			render: (text: number, record) => {
				return record
					? moment(text).format('YYYY/MM/DD') + '~' + moment(record.timeTo).format('YYYY/MM/DD')
					: '-';
			},
		},
		{
			label: fields.distributor,
			dataIndex: 'authorizingDistributorName',
		},
		{
			label: '发票编号',
			dataIndex: 'invoiceCode',
			labelStyle: { paddingTop: record.type === 'Viewlook' ? 0 : '4px' },
			render: (text) => {
				return record.type === 'Viewlook' ? (
					text
				) : (
					<FormItem
						style={{ width: '100%', marginBottom: 0 }}
						label=''
						name='invoiceCode'>
						<Input
							placeholder='请输入发票编号'
							style={{ width: '80%' }}
						/>
					</FormItem>
				);
			},
		},
		{
			label: '发票代码',
			dataIndex: 'invoiceNo',
			labelStyle: { paddingTop: record.type === 'Viewlook' ? 0 : '4px' },
			render: (text) => {
				return record.type === 'Viewlook' ? (
					text
				) : (
					<FormItem
						style={{ width: '100%', marginBottom: 0 }}
						label=''
						name='invoiceNo'
						rules={[{ pattern: new RegExp('^[a-zA-Z0-9]*$'), message: '请输入字母或数字' }]}>
						<Input
							style={{ width: '80%' }}
							placeholder='请输入发票代码'
							maxLength={20}
						/>
					</FormItem>
				);
			},
		},
		{
			label: '开票日期',
			dataIndex: 'invoicingDate',
			labelStyle: { paddingTop: record.type === 'Viewlook' ? 0 : '4px' },
			render: (text) => {
				return record.type === 'Viewlook' ? (
					text ? (
						moment(text).format('YYYY/MM/DD')
					) : (
						'-'
					)
				) : (
					<FormItem
						label=''
						name='invoicingDate'
						// initialValue={moment(getStartTime())}
						style={{ width: '100%', marginBottom: 0 }}>
						<DatePicker
							style={{ width: '80%' }}
							format={['YYYY-MM-DD', 'YYYY/MM/DD']}
							disabledDate={(current) => current && current >= moment(getEndTime()).endOf('day')}
						/>
					</FormItem>
				);
			},
		},
		{
			label: '税 率',
			dataIndex: 'taxRate',
			labelStyle: { paddingTop: record.type === 'Viewlook' ? 0 : '4px' },
			render: (text: number, record) => {
				return record.type === 'Viewlook' ? (
					text || text === 0 ? (
						taxRateTextMap[text]
					) : (
						'-'
					)
				) : (
					<FormItem
						label=''
						name='taxRate'
						style={{ width: '100%', marginBottom: 0 }}>
						<Select
							style={{ width: '80%' }}
							placeholder='请选择税率'
							allowClear>
							{taxRate.map((item) => {
								return <Option value={item.value}>{item.label}</Option>;
							})}
						</Select>
					</FormItem>
				);
			},
		},
		{
			label: '发票金额',
			dataIndex: 'invoiceAmount',
			labelStyle: { paddingTop: record.type === 'Viewlook' ? 0 : '4px' },
			render: (text) => {
				return record.type === 'Viewlook' ? (
					text || text == 0 ? (
						convertPriceWithDecimal(text) + ' 元'
					) : (
						'-'
					)
				) : (
					<FormItem
						label=''
						name='invoiceAmount'
						rules={[{ validator: validateInvoiceAmount }]}
						style={{ width: '100%', marginBottom: 0 }}>
						<Input
							style={{ width: '80%' }}
							placeholder='请输入发票金额'
							suffix='元'
						/>
					</FormItem>
				);
			},
		},
		{
			label: '付款方式',
			dataIndex: 'payWay',
			render: (text: string) => (text ? payWay[text] : '-'),
		},
		{
			label: '结算周期',
			dataIndex: 'approvalTime',
			span: record.type === 'Viewlook' ? undefined : 1,
			show: activeKey === '2' && pageType === 'handle',
			labelStyle: { paddingTop: record.type === 'Viewlook' ? 0 : '4px' },
			render: (text: string, record) => {
				return record.type === 'Viewlook' ? (
					moment(record.timeFrom).format('YYYY/MM/DD') +
						'～' +
						moment(record.timeTo).format('YYYY/MM/DD')
				) : (
					<FormItem
						label=''
						name='approvalTime'
						rules={[{ required: true, message: '请选择结算周期' }]}
						style={{ width: '100%', marginBottom: 0 }}>
						<Select
							style={{ width: '80%' }}
							placeholder='请选择结算周期'
							allowClear>
							{timeList.map((item) => {
								return (
									<Option value={item.timeTo}>
										{moment(item.timeFrom).format('YYYY/MM/DD')}～
										{moment(item.timeTo).format('YYYY/MM/DD')}
									</Option>
								);
							})}
						</Select>
					</FormItem>
				);
			},
		},
	];

	return (
		<Modal
			visible={visible}
			width='80%'
			maskClosable={false}
			destroyOnClose={true}
			onCancel={() => setVisibleDetail(false)}
			title={record.type === 'audit' ? accessNameMaplist.fresh_material_receipt_audit : '查看'}
			className='modalDetails'
			footer={record.type === 'Viewlook' ? false : footer()}>
			<div className='modelInfo'>
				<div className='left'>
					<Form form={form}>
						<Descriptions
							options={descriptionsOptions}
							data={record}
							optionEmptyText='-'
						/>
					</Form>
				</div>
				<div
					className='right'
					style={{ display: 'flex', justifyContent: 'space-between' }}>
					<Statistic
						title='收料单金额'
						value={record ? `￥${convertPriceWithDecimal(record.price)}` : 0}
					/>
				</div>
			</div>

			<ProTable
				columns={columns}
				rowKey='operatorBarcode'
				dataSource={list}
				className='mb2'
				options={{ density: false, fullScreen: false, setting: false }}
				toolBarRender={() => [
					access['fresh_material_receipt_print'] && pageType === 'query' && (
						<>
							<PrintTarget
								url={receiptListPrintUrl}
								params={{ ...getSearchDate() }}
								parameters={{ ...searchParams }}
								printType={true}
								isBillsInThreeParts={true}
							/>
						</>
					),
					access['fresh_material_receipt_export'] && pageType === 'query' && (
						<>
							<ExportFile
								data={{
									filters: { ...getSearchDate() },
									link: exportReceiptUrl,
									getForm: getSearchDate,
								}}
								disabled={!isExportFile}
							/>
						</>
					),
				]}
				scroll={{
					y: 300,
				}}
				loading={loading}
				size='small'
			/>

			{record.type === 'audit' && (
				<div className='operateBorder'>
					<ApprovalResult
						{...{
							setFormData: (value: FormDataItem) => {
								setFormData(value);
							},
						}}
					/>
				</div>
			)}
		</Modal>
	);
};

export default DetailModal;
