import type { ProColumns, ProTableAction } from '@/components//ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import ProTable from '@/components/ResizableTable';
import { invoiceSync } from '@/constants';
import { getListByInvoiceSync } from '@/services/distributor';
import { postUpdateReceiptCode, postUploadInvoice, queryReceiptList } from '@/services/receipt';
import { getStatementTimeList } from '@/services/statement';
import { convertPriceWithDecimal } from '@/utils/format';
import { notification } from '@/utils/ui';
import {
	EditOutlined,
	ExclamationCircleFilled,
	ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Form, Typography, Divider } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useAccess, useModel } from 'umi';
import DetailModal from '../components/DetailModal';
import EditModal from '../components/EditCodeModal';

const FormItem = Form.Item;
const InvoiceAudit: React.FC<{ activeKey: string; pageType: string }> = (props) => {
	const access = useAccess();
	const [form] = Form.useForm();
	const [formProTable] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const [visibleDetail, setVisibleDetail] = useState<boolean>(false);
	const [isShowEdit, setIsShowEdit] = useState<boolean>(false);
	const [record, setRecord] = useState<Partial<ReceiptController.ListRecord>>({});
	const [time, setTime] = useState<SettlementController.SelectRecord[]>([]);
	const [distributorList, setDistributorList] = useState<SettlementController.SelectRecord[]>([]);
	const [clickItem, setClickItem] = useState<Partial<ReceiptController.ClickItem>>({});
	const [statementList, setStatementList] = useState<Record<string, any>>({ sumPrice: null });
	const [receiptCode, setEditReceiptCode] = useState<string | null | undefined>(undefined);
	const [newInvoiceCode, setnewInvoiceCode] = useState<string | null | undefined>(undefined);
	const [list, setList] = useState<ReceiptController.ListRecord[]>([]);
	const [type, setType] = useState<string>('');
	const [checkedValue, setCheckedValue] = useState<string>('');

	const { activeKey, pageType } = props;
	// 获取结算周期
	const getTime = async (param: Record<string, any>) => {
		const res = await getStatementTimeList(param);
		if (res && res.code === 0) {
			const result = res.data.map((item) => {
				const { timeFrom, timeTo } = item;
				return {
					value: timeFrom + '|' + timeTo,
					label:
						(timeFrom ? moment(timeFrom).format('YYYY/MM/DD') + '~' : '') +
						(timeTo ? moment(timeTo).format('YYYY/MM/DD') : ''),
				};
			});
			setTime(result);
		}
	};

	// 根据是否货票同行获取配送商业/药商
	const getDistributor = async (params: Record<string, any>) => {
		const res = await getListByInvoiceSync(params);
		if (res.code === 0) {
			const result = res.data.map((item) => ({
				value: item.id,
				label: item.companyName,
			}));
			setDistributorList(result);
		}
	};

	useEffect(() => {
		if (activeKey === '2') {
			getTime({ invoiceSync: false });
		}
		getDistributor({ invoiceSync: activeKey === '1' ? true : false, type: true });
	}, [activeKey]);

	// 请求列表
	const getFormList = () => tableRef.current?.reload();

	// 详情
	const detailInfo = (record: React.SetStateAction<{}>, type: string) => {
		setRecord({ ...record, type });
		setVisibleDetail(true);
	};

	const onChange = (item: ReceiptController.ListRecord) => {
		setCheckedValue(item.payWay);
		setType(item.title);
		setIsShowEdit(true);
		setClickItem(item);
	};

	const onSubmit = async () => {
		if (type === 'receiptCode') {
			if (!receiptCode) {
				notification.warning('请填写收料单号');
				return;
			}
			setIsShowEdit(false);
			if (receiptCode === clickItem.receiptCode) {
				return;
			}
			const res = await postUpdateReceiptCode({ id: clickItem.id, receiptCode });
			if (res && res.code === 0) {
				notification.success('修改成功');
				setType('');
				setCheckedValue('');
				setEditReceiptCode(undefined);
				setnewInvoiceCode(undefined);
				getFormList();
			}
		}
		if (type === 'invoiceCode') {
			if (!newInvoiceCode) {
				notification.warning('请填写发票编号');
				return;
			}
			setIsShowEdit(false);
			if (newInvoiceCode === clickItem.newInvoiceCode) {
				return;
			}
			const res = await postUploadInvoice({
				receiptId: clickItem.id,
				invoiceCode: newInvoiceCode,
				payWay: checkedValue,
			});
			if (res && res.code === 0) {
				notification.success('修改成功');
				setType('');
				setCheckedValue('');
				setEditReceiptCode(undefined);
				setnewInvoiceCode(undefined);
				getFormList();
			}
		}
	};
	const searchColumns: ProFormColumns = [
		{
			title: '结算周期',
			dataIndex: 'settlementTime',
			valueType: 'select',
			hideInForm: activeKey === '1',
			fieldProps: {
				placeholder: '请选择结算周期',
				options: time,
				showSearch: true,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: fields.distributor,
			dataIndex: 'authorizingDistributorId',
			valueType: 'select',
			fieldProps: {
				placeholder: `请选择${fields.distributor}`,
				showSearch: true,
				options: distributorList,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '发票编号',
			dataIndex: 'invoiceCode',
			fieldProps: {
				maxLength: 30,
				placeholder: '请输入发票编号',
			},
		},
		{
			title: '收料单号',
			dataIndex: 'receiptCode',
			fieldProps: {
				placeholder: '请输入收料单号',
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
		},
		{
			title: '规格/型号',
			dataIndex: 'commonSearch.specificationAndModel',
		},
	];

	const columns: ProColumns<ReceiptController.ListRecord>[] = [
		{
			width: 'S',
			title: '序号',
			dataIndex: 'index',
			hideInSearch: true,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			width: 'XXL',
			sorter: true,
			title: '收料单号',
			dataIndex: 'receiptCode',
			key: 'receipt_code',
			renderText: (text: string, record) => {
				return (
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<span className='selectTableModalspan'>{text}</span>
						{pageType === 'handle' && (
							<EditOutlined
								style={{ color: CONFIG_LESS['@c_starus_await'] }}
								onClick={(e) => {
									e.stopPropagation();
									onChange({ ...record, title: 'receiptCode' });
								}}
							/>
						)}
						<Typography.Paragraph
							copyable={{ text }}
							style={{ marginBottom: 0 }}
						/>
					</div>
				);
			},
		},
		{
			width: 'L',
			ellipsis: true,
			title: '结算周期',
			dataIndex: 'timeFrom',
			hideInTable: activeKey === '1',
			renderText: (text: number, record) => {
				return (
					<>
						{moment(text).format('YYYY/MM/DD')}～{moment(record.timeTo).format('YYYY/MM/DD')}
						{record.fuse && (
							<ExclamationCircleOutlined style={{ color: CONFIG_LESS['@c_starus_await'] }} />
						)}
					</>
				);
			},
		},
		{
			width: 'S',
			ellipsis: true,
			title: fields.distributor,
			dataIndex: 'authorizingDistributorName',
		},
		{
			width: 'XXL',
			title: '发票编号',
			dataIndex: 'invoiceCode',
			renderText: (text: string, record) => {
				return (
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<span className='selectTableModalspan'>{text}</span>
						{access['fresh_uploadInvoice'] && pageType === 'handle' && (
							<EditOutlined
								style={{ color: CONFIG_LESS['@c_starus_await'] }}
								onClick={(e) => {
									e.stopPropagation();
									onChange({ ...record, title: 'invoiceCode' });
								}}
							/>
						)}
						{text && (
							<Typography.Paragraph
								copyable={{ text }}
								style={{ marginBottom: 0 }}
							/>
						)}
					</div>
				);
			},
		},
		{
			width: 'M',
			align: 'right',
			sorter: true,
			title: '金额(元)',
			dataIndex: 'price',
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
		{
			width: 'S',
			fixed: 'right',
			title: '操作',
			dataIndex: 'option',
			renderText: (_: string, record) => {
				return (
					<div className='operation'>
						<span
							className='handleLink'
							onClick={(e) => detailInfo(record, 'Viewlook')}>
							查看
						</span>
						{access['fresh_material_receipt_audit'] && pageType === 'handle' && (
							<>
								<Divider type='vertical' />
								<span
									className='handleLink'
									onClick={(e) => detailInfo(record, 'audit')}>
									审核
								</span>
							</>
						)}
					</div>
				);
			},
		},
	];

	return (
		<div>
			<ProTable<ReceiptController.ListRecord>
				tableInfoCode='fresh_material_receipt'
				api={queryReceiptList}
				requestCompleted={(list, params, dataObj) => {
					setList(list);
					setStatementList(dataObj);
				}}
				rowKey='id'
				tableAlertRender={false}
				columns={columns}
				tableRef={tableRef}
				loadConfig={{ request: false }}
				searchConfig={{
					columns: searchColumns,
					form: formProTable,
				}}
				beforeSearch={(params: Record<string, any>) => {
					const { settlementTime } = params;
					const timeArr = settlementTime ? settlementTime.split('|') : '';
					return {
						...params,
						invoiceSync: activeKey === '1' ? true : false,
						pageType: pageType,
						settlementTime: undefined,
						timeFrom: settlementTime && moment(Number(timeArr[0])).valueOf(),
						timeTo: settlementTime && moment(Number(timeArr[1])).endOf('day').valueOf(),
					};
				}}
				headerTitle={
					<div className='flex flex-between'>
						<div className='tableTitle'>
							{(list || []).length > 0 && (
								<span
									className='tableAlert'
									style={{
										backgroundColor: CONFIG_LESS['@bgc_search'],
										borderRadius: '5px',
										marginLeft: '10px',
									}}>
									<ExclamationCircleFilled
										style={{
											color: CONFIG_LESS['@c_starus_await'],
											marginRight: '8px',
											fontSize: '12px',
										}}
									/>
									<span
										className='consumeCount'
										// style={{ color: CONFIG_LESS['@c_starus_warning'], border: 0 }}
									>
										金额总计：￥
										<span className='titlecollect'>
											{statementList.sumPrice
												? convertPriceWithDecimal(statementList.sumPrice)
												: '-'}
										</span>
									</span>
								</span>
							)}
						</div>
					</div>
				}
			/>
			{/* 详情modal */}
			{visibleDetail && (
				<DetailModal
					visible={visibleDetail}
					setVisibleDetail={setVisibleDetail}
					record={record}
					activeKey={activeKey}
					getFormList={getFormList}
					pageType={pageType}
				/>
			)}
			{/* 编辑单号 */}
			{isShowEdit && (
				<EditModal
					onOk={onSubmit}
					visible={isShowEdit}
					onCancel={() => setIsShowEdit(false)}
					clickItem={clickItem}
					checkedValue={checkedValue}
					setCheckedValue={setCheckedValue}
					editReceiptCode={setEditReceiptCode}
					setnewInvoiceCode={setnewInvoiceCode}
				/>
			)}
		</div>
	);
};

export default InvoiceAudit;
