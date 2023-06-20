import type { ProColumns, ProTableAction } from '@/components//ProTable/typings';
import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { invoiceSync } from '@/constants';
import { getListByInvoiceSync } from '@/services/distributor';
import { postUpdateReceiptCode, postUploadInvoice, queryReceiptList } from '@/services/receipt';
import { getStatementTimeList } from '@/services/statement';
import { accessNameMap } from '@/utils';
import { convertPriceWithDecimal } from '@/utils/format';
import { notification } from '@/utils/ui';
import {
	EditOutlined,
	ExclamationCircleFilled,
	ExclamationCircleOutlined,
	UploadOutlined,
} from '@ant-design/icons';
import { Button, Form, Input, Modal, Typography } from 'antd';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useAccess, useModel } from 'umi';
import DetailModal from '../components/DetailModal';
import EditModal from '../components/EditCodeModal';

const FormItem = Form.Item;
const PickingList: React.FC<{}> = () => {
	const access = useAccess();
	const [form] = Form.useForm();
	const [formProTable] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const [visibleDetail, setVisibleDetail] = useState<boolean>(false);
	const [isShowEdit, setIsShowEdit] = useState<boolean>(false);
	const [isRequest, setIsRequest] = useState<boolean>(false);
	const [invoiceSyncValue, setInvoiceSyncValue] = useState<boolean>(false);
	const [popConfirmVisible, setPopConfirmVisible] = useState<boolean>(false);
	const [record, setRecord] = useState<Partial<ReceiptController.ListRecord>>({});
	const [time, setTime] = useState<SettlementController.SelectRecord[]>([]);
	const [distributorList, setDistributorList] = useState<SettlementController.SelectRecord[]>([]);
	const [clickItem, setClickItem] = useState<Partial<ReceiptController.ClickItem>>({});
	const [statementList, setStatementList] = useState<Record<string, any>>({ sumPrice: null });
	const [serialNumber, setSerialNumber] = useState<string>('');
	const [selectedKeys, setSelectedKeys] = useState<number[]>([]);
	const [selectRowKeys, setSelectRowKeys] = useState<ReceiptController.ListRecord[]>([]);
	const [receiptCode, setEditReceiptCode] = useState<string | null>(null);
	const [list, setList] = useState<ReceiptController.ListRecord[]>([]);
	const [searchParams, setSearchParams] = useState<Record<string, any>>({});
	const [validateObj, setValidateObj] = useState<ReceiptController.ValidateItem>({
		validateStatus: '',
		help: '',
	});
	const accessNameMaplist: Record<string, any> = accessNameMap();
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
		getTime({ invoiceSync: invoiceSyncValue });
		getDistributor({ invoiceSync: invoiceSyncValue, type: true });
	}, [invoiceSyncValue]);

	// 请求列表
	const getFormList = () => tableRef.current?.reload();

	const changeSelectRowKey = (row: [], rowKey: []) => {
		setSelectedKeys(row);
		setSelectRowKeys(rowKey);
	};

	// 校验发票号
	const validateFn = (value: string | boolean) => {
		let obj: any = { validateStatus: '', help: '' };
		if (!value) {
			obj = { validateStatus: 'error', help: '请输入发票号' };
		}
		setValidateObj({ ...obj });
	};

	// 关闭气泡框
	const closePopConfirm = () => {
		validateFn(true);
		setSerialNumber('');
		setPopConfirmVisible(false);
		form.setFieldsValue({ serialNumber: '' });
	};

	// 上传发票
	const postData = async () => {
		validateFn(serialNumber);
		if (serialNumber) {
			const goodsIds: number[] = [];
			(selectRowKeys || []).forEach((item: { id: number }) => {
				goodsIds.push(item.id);
			});
			const params = {
				receiptIds: goodsIds,
				invoiceCode: serialNumber,
			};
			const res = await postUploadInvoice(params);
			if (res && res.code == 0) {
				setSelectedKeys([]);
				setSelectRowKeys([]);
				closePopConfirm();
				getFormList();
				notification.success('上传成功');
			}
		}
	};

	// 详情
	const detailInfo = (record: React.SetStateAction<{}>) => {
		setRecord(record);
		setVisibleDetail(true);
	};

	const onChange = (item: ReceiptController.ListRecord) => {
		setIsShowEdit(true);
		setClickItem(item);
	};

	const onSubmit = async () => {
		setIsShowEdit(false);
		const res = await postUpdateReceiptCode({ id: clickItem.id, receiptCode });
		if (res && res.code === 0) {
			notification.success('修改成功');
			getFormList();
		}
	};

	const rule = (message: string) => {
		return {
			rules: [
				{
					required: true,
					message: message,
				},
			],
		};
	};

	const searchColumns: ProFormColumns = [
		{
			title: '是否货票同行',
			dataIndex: 'invoiceSync',
			valueType: 'select',
			initialValue: false,
			fieldProps: {
				placeholder: '请选择',
				allowClear: false,
				options: invoiceSync,
				onChange: (value: boolean) => {
					setInvoiceSyncValue(value);
					formProTable.resetFields(['settlementTime', 'authorizingDistributorId']);
				},
			},
			formItemProps: {
				...rule('请选择是否货票同行'),
			},
		},
		{
			title: '结算周期',
			dataIndex: 'settlementTime',
			valueType: 'select',
			fieldProps: {
				placeholder: '请选择结算周期',
				options: time,
				showSearch: true,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
			formItemProps: {
				...rule('请选择结算周期'),
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
			formItemProps: {
				...rule(`请选择${fields.distributor}`),
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
			title: '收料单编号',
			dataIndex: 'receiptCode',
			fieldProps: {
				placeholder: '请输入收料单编号',
			},
		},
	];

	const columns: ProColumns<ReceiptController.ListRecord>[] = [
		{
			width: 'XXS',
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
						<EditOutlined
							style={{ color: CONFIG_LESS['@c_starus_await'] }}
							onClick={(e) => {
								e.stopPropagation();
								onChange(record);
							}}
						/>
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
			width: 'L',
			ellipsis: true,
			copyable: true,
			title: '发票编号',
			dataIndex: 'invoiceCode',
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
						{access['fresh_material_receipt_view'] && (
							<span
								className='handleLink'
								onClick={(e) => detailInfo(record)}>
								查看
							</span>
						)}
					</div>
				);
			},
		},
	];

	const generateCheck = () => {
		const { timeFrom, timeTo, invoiceSync, authorizingDistributorId } = searchParams;
		if (!isRequest) {
			notification.error('当前检索条件与列表信息不符，请先点击查询按钮');
			return false;
		}
		if (!timeFrom || !timeTo) {
			notification.error('结算周期不能为空');
			return false;
		}
		if (!authorizingDistributorId) {
			notification.error(`${fields.distributor}不能为空`);
			return false;
		}
		if (invoiceSync === '' || invoiceSync === undefined) {
			notification.error('是否货票同行不能为空');
			return false;
		}
		if (selectedKeys.length == 0) {
			notification.error(`请在列表勾选${fields.goods}`);
			return false;
		}
	};

	// 单行点击选中
	const selectRowOfClick = (record: ReceiptController.ListRecord) => {
		const id = record.id;
		let keys = cloneDeep(selectedKeys);
		let rowKeys = cloneDeep(selectRowKeys) || [];

		if (selectedKeys.includes(id)) {
			keys = keys.filter((item) => item !== id);
			rowKeys = rowKeys.filter((item) => item.id !== record.id);
		} else {
			keys.push(id);
			rowKeys.push(record);
		}
		setSelectedKeys(keys);
		setSelectRowKeys(rowKeys);
	};

	const rowSelection = {
		width: 0,
		preserveSelectedRowKeys: true,
		selectedRowKeys: selectedKeys,
		onChange: changeSelectRowKey,
		getCheckboxProps: (record: { generateReceipt: boolean }) => ({
			disabled: record.generateReceipt == true,
		}),
	};

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<ProTable<ReceiptController.ListRecord>
				tableInfoCode='fresh_material_receipt'
				api={queryReceiptList}
				requestCompleted={(list, params, dataObj) => {
					setList(list);
					setSearchParams(params);
					setStatementList(dataObj);
					setIsRequest(true);
				}}
				onRow={(record: any) => ({
					onClick: (e) => {
						e.stopPropagation();
						selectRowOfClick(record);
					},
				})}
				rowKey='id'
				tableAlertRender={false}
				rowSelection={rowSelection as Record<string, any>}
				columns={columns}
				tableRef={tableRef}
				loadConfig={{ request: false, reset: false }}
				searchConfig={{
					columns: searchColumns,
					form: formProTable,
				}}
				onReset={() => {
					setInvoiceSyncValue(false);
					setIsRequest(false);
					setList([]);
					setSelectedKeys([]);
					setSelectRowKeys([]);
				}}
				tableAlertOptionRender={
					<a
						onClick={() => {
							setSelectedKeys([]);
							setSelectRowKeys([]);
						}}>
						取消选择
					</a>
				}
				beforeSearch={(params: Record<string, any>) => {
					const { settlementTime } = params;
					const timeArr = settlementTime ? settlementTime.split('|') : '';
					return {
						...params,
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
										style={{ color: CONFIG_LESS['@c_starus_warning'], border: 0 }}>
										金额总计：￥
										{statementList.sumPrice ? convertPriceWithDecimal(statementList.sumPrice) : '-'}
									</span>
								</span>
							)}
						</div>
					</div>
				}
				toolBarRender={() => [
					access['fresh_uploadInvoice'] && (
						<>
							{searchParams.timeFrom &&
							(searchParams.invoiceSync || searchParams.invoiceSync === false) &&
							searchParams.timeTo &&
							selectedKeys.length > 0 &&
							searchParams.authorizingDistributorId ? (
								<>
									<Modal
										visible={popConfirmVisible}
										title={accessNameMaplist.fresh_uploadInvoice}
										onOk={postData}
										onCancel={closePopConfirm}
										okText='提交'
										cancelText='取消'>
										<Form form={form}>
											<FormItem
												name='serialNumber'
												label='发票编号'
												rules={[{ required: true }]}
												validateStatus={validateObj.validateStatus}
												help={validateObj.help}>
												<Input
													placeholder='请输入发票编号'
													maxLength={30}
													onKeyUp={(e: any) => {
														const value = e.target.value.replace(/\s+/g, '');
														setSerialNumber(value);
														validateFn(value);
													}}
												/>
											</FormItem>
										</Form>
									</Modal>
									<Button
										icon={<UploadOutlined />}
										type='primary'
										onClick={() => setPopConfirmVisible(true)}>
										上传发票
									</Button>
								</>
							) : (
								<Button
									icon={<UploadOutlined style={{ marginLeft: -4 }} />}
									type='primary'
									onClick={() => generateCheck()}
									className='iconButton'>
									上传发票
								</Button>
							)}
						</>
					),
				]}
			/>
			{/* 详情modal */}
			{visibleDetail && (
				<DetailModal
					visible={visibleDetail}
					setVisibleDetail={setVisibleDetail}
					record={record}
				/>
			)}
			{/* 编辑单号 */}
			{isShowEdit && (
				<EditModal
					onOk={onSubmit}
					visible={isShowEdit}
					onCancel={() => setIsShowEdit(false)}
					clickItem={clickItem}
					editReceiptCode={setEditReceiptCode}
				/>
			)}
		</div>
	);
};

export default PickingList;
