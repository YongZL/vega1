import type { ProColumns, ProTableAction } from '@/components//ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import Breadcrumb from '@/components/Breadcrumb';
import InputUnit from '@/components/InputUnit';
import ProTable from '@/components/ResizableTable';
import { invoiceSync } from '@/constants';
import { getListByInvoiceSync } from '@/services/distributor';
import {
	postGenerateReceipt,
	queryNotFinishDateList,
	queryReceiptGoodsList,
} from '@/services/receipt';
import { countTotal } from '@/utils/calculate';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Form } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useAccess, useModel } from 'umi';
import GenerateList from './components/GenerateListModal';

const MaterialReceiptCreate: React.FC<{}> = () => {
	const access = useAccess();
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const [sumPrice, setSumPrice] = useState<number>(0);
	const [visible, setVisible] = useState<boolean>(false);
	const [isRequest, setIsRequest] = useState<boolean>(false);
	const [time, setTime] = useState<ReceiptController.SelectRecord[]>([]);
	const [checkedValue, setCheckedValue] = useState<string>('clientPayment');
	const [invoiceSyncValue, setInvoiceSyncValue] = useState<boolean>(false);
	const [distributorId, setDistributorId] = useState<number>();
	const [searchParams, setSearchParams] = useState<Record<string, any>>({});
	const [list, setList] = useState<ReceiptController.GoodsListRecord[]>([]);
	const [selectedKeys, setSelectedKeys] = useState<number[]>([]);
	const [selectRowKeys, setSelectRowKeys] = useState<ReceiptController.GoodsListRecord[]>([]);
	const [distributorData, setDistributorData] = useState<ReceiptController.SelectRecord[]>([]);

	useEffect(() => {
		const getDistributor = async () => {
			form.setFieldsValue({ item: undefined });
			form.setFieldsValue({ authorizingDistributorId: undefined });
			const res = await getListByInvoiceSync({ invoiceSync: invoiceSyncValue });
			if (res && res.code === 0) {
				const result = res.data.map((item) => ({
					value: item.id,
					label: item.companyName,
				}));
				setDistributorData(result);
			}
		};
		getDistributor();
		setTimeout(() => {
			tableRef.current?.reload();
		}, 100);
	}, [invoiceSyncValue]);

	const getTime = async (param: ReceiptController.DateListParams) => {
		form.setFieldsValue({ item: undefined });
		const res = await queryNotFinishDateList(param);
		if (res && res.code === 0) {
			const result = res.data.map((item) => ({
				value: item.timeFrom + '|' + item.timeTo,
				label:
					(item.timeFrom ? moment(item.timeFrom).format('YYYY/MM/DD') + '~' : '') +
					(item.timeTo ? moment(item.timeTo).format('YYYY/MM/DD') : ''),
			}));
			setTime(result);
		}
	};

	useEffect(() => {
		if (distributorId) {
			getTime({ invoiceSync: invoiceSyncValue, authorizingDistributorId: distributorId });
		}
	}, [invoiceSyncValue, distributorId]);

	useEffect(() => {
		if (!visible) setCheckedValue('clientPayment');
	}, [visible]);

	// 请求列表
	const getFormList = async () => {
		setSelectedKeys([]);
		setSelectRowKeys([]);
		tableRef.current?.reload();
	};

	// 修改数量
	const changeNum = async (record: ReceiptController.GoodsListRecord, value: number | string) => {
		const newDataList = list.map((item) => {
			return item.id === record.id
				? { ...item, rowPrice: item.price * Number(value), totalNum: value }
				: { ...item };
		});
		setList([...newDataList]);
		tableRef.current?.setDataSource([...newDataList]);
		const selectRowKeysList = selectRowKeys.map((item) => {
			return item.id === record.id
				? { ...item, rowPrice: item.price * Number(value), totalNum: value }
				: { ...item };
		});
		setSelectRowKeys([...selectRowKeysList]);
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
					setSelectedKeys([]);
					setSelectRowKeys([]);
				},
			},
			formItemProps: {
				...rule('请选择是否货票同行'),
			},
		},
		{
			title: fields.distributor,
			dataIndex: 'authorizingDistributorId',
			valueType: 'select',
			formItemProps: {
				...rule(`请选择${fields.distributor}`),
			},
			fieldProps: {
				placeholder: `请选择${fields.distributor}`,
				showSearch: true,
				options: distributorData,
				onChange: (value: number) => setDistributorId(value),
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '结算周期',
			dataIndex: 'item',
			valueType: 'select',
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
			title: `${fields.goodsName}/编号`,
			dataIndex: 'goodsNameAndCode',
			fieldProps: {
				placeholder: '请输入',
			},
		},
	];

	const columns: ProColumns<ReceiptController.GoodsListRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			width: 'XXS',
			hideInSearch: true,
			align: 'center',
			renderText: (text: string, record, index: number) => index + 1,
		},
		{
			title: fields.goodsCode,
			key: 'material_code',
			width: 'M',
			dataIndex: 'materialNumber',
			hideInSearch: true,
			ellipsis: true,
			sorter: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'materialName',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '本地医保编码',
			dataIndex: 'medicareNumber',
			width: 'L',
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			width: 'L',
			ellipsis: true,
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 'L',
			ellipsis: true,
		},

		{
			title: '单位',
			dataIndex: 'unit',
			width: 'S',
			key: 'unit',
			ellipsis: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			width: 'M',
			align: 'right',
			sorter: true,
			renderText: (text: number) => <span>{convertPriceWithDecimal(text)}</span>,
		},
		{
			title: '数量',
			dataIndex: 'number',
			width: 'L',
			ellipsis: true,
			renderText: (text: number, record) => {
				const { generateReceipt, consumeGoodsQuantity, remainingNum } = record;
				const value = generateReceipt ? Number(consumeGoodsQuantity) : Number(remainingNum);
				const min = value < 0 ? value : 1;
				const max = value < 0 ? -1 : value;
				return (
					<InputUnit
						key='id'
						value={value}
						defaultValue={value}
						disabled={record.generateReceipt}
						min={min}
						max={max}
						onChange={(value: number | string) => changeNum(record, value)}
					/>
				);
			},
		},
		{
			title: '小计(元)',
			dataIndex: 'rowPrice',
			width: 'M',
			align: 'right',
			renderText: (text: number) => (
				<span style={{ color: text < 0 ? CONFIG_LESS['@c_starus_warning'] : '' }}>
					{text ? convertPriceWithDecimal(text) : '-'}
				</span>
			),
		},
		{
			title: '结算周期',
			dataIndex: 'timeFrom',
			width: 'XXL',
			ellipsis: true,
			renderText: (text: string, record) => (
				<>
					<span>{text ? moment(text).format('YYYY/MM/DD') : ''}</span>~
					<span>{record.timeTo ? moment(record.timeTo).format('YYYY/MM/DD') : ''} </span>
				</>
			),
		},
		{
			title: fields.distributor,
			dataIndex: 'authorizingDistributorName',
			width: 'XXL',
			ellipsis: true,
		},
	];

	const generateCheck = () => {
		const { invoiceSync } = searchParams;
		if (!isRequest) {
			notification.error('当前检索条件与列表信息不符，请先点击查询按钮');
			return false;
		}
		if (selectedKeys.length == 0) {
			notification.error(`请在列表勾选${fields.goods}`);
			return false;
		}
		if (invoiceSync === '' || invoiceSync === undefined) {
			notification.error('是否货票同行不能为空');
			return false;
		}
	};

	//生成收料单
	const postData = async () => {
		const goodsList = selectRowKeys.map((item) => {
			return {
				goodsId: item.goodsId,
				goodsPrice: item.price,
				num: item.totalNum
					? item.totalNum
					: item.generateReceipt
					? item.consumeGoodsQuantity
					: item.remainingNum,
				id: item.id,
				timeFrom: item.timeFrom,
				timeTo: item.timeTo,
				authorizingDistributorId: item.authorizingDistributorId,
			};
		});

		const price: number[] = [];
		const goodsIds: number[] = [];
		(selectRowKeys || []).forEach((item) => {
			price.push(item.price);
			goodsIds.push(item.goodsId);
		});
		const { timeTo, timeFrom, invoiceSync, authorizingDistributorId } = searchParams;
		const params = {
			goodsIds: goodsIds,
			goodsPrice: price,
			statementId: list[0].statementId,
			authorizingDistributorId: authorizingDistributorId,
			goodsList: goodsList,
			invoiceSync: invoiceSync,
			timeFrom: timeFrom,
			timeTo: timeTo,
			payWay: checkedValue,
		};
		const res = await postGenerateReceipt(params);
		if (res && res.code == 0) {
			notification.success('生成成功');
			setSelectedKeys([]);
			setSelectRowKeys([]);
			setVisible(false);
			getFormList();
		}
	};

	const changeSelectRowKey = (row: [], rowKey: ReceiptController.GoodsListRecord[]) => {
		if (!isRepeat(rowKey)) {
			notification.error(`请选择相同${fields.distributor}！`);
			return;
		}
		for (let i = 0; i < rowKey.length - 1; i++) {
			for (let j = i + 1; j < rowKey.length; j++) {
				if (rowKey[i].goodsId === rowKey[j].goodsId && rowKey[i].price !== rowKey[j].price) {
					notification.error(`相同${fields.goods}价格不一致！`);
					return;
				}
			}
		}
		setSelectedKeys([...row]);
		setSelectRowKeys([...rowKey]);
	};

	const isRepeat = (arr: ReceiptController.GoodsListRecord[]) => {
		const hash = {};
		for (let i = 0; i < arr.length; i++) {
			if (!hash[arr[i].authorizingDistributorId]) {
				hash[arr[i].authorizingDistributorId] = true;
			}
		}
		return !(Object.keys(hash).length > 1);
	};

	const rowSelection = {
		selectedRowKeys: selectedKeys,
		// 添加后分页不会清楚上页的选中
		preserveSelectedRowKeys: true,
		onChange: changeSelectRowKey,
		getCheckboxProps: (record: any) => ({
			disabled: record.generateReceipt == true,
		}),
	};

	useEffect(() => {
		setSumPrice(countTotal(selectRowKeys, 'rowPrice'));
	}, [selectRowKeys]);

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<ProTable<ReceiptController.GoodsListRecord>
				tableInfoCode='materialReceiptCreate'
				loadConfig={{
					request: false,
				}}
				api={queryReceiptGoodsList}
				pagination={{
					pageSizeOptions: ['99999'],
					defaultPageSize: 99999,
					hideOnSinglePage: true,
				}}
				params={{ pageSize: 99999 }}
				columns={columns}
				rowKey='id'
				tableAlertRender={false}
				rowSelection={rowSelection as Record<string, any>}
				searchConfig={{
					columns: searchColumns,
					form,
				}}
				beforeSearch={(value: Record<string, any>) => {
					const newData = value.item?.split('|');
					if (newData && newData.length) {
						value.timeFrom = newData[0];
						value.timeTo = newData[1];
						delete value.item;
					}
					return { ...value, invoiceSync: invoiceSyncValue };
				}}
				onFinish={() => {
					if (
						selectRowKeys.length > 0 &&
						selectRowKeys[0].authorizingDistributorId !== distributorId
					) {
						setSelectedKeys([]);
						setSelectRowKeys([]);
					}
				}}
				onReset={() => {
					setInvoiceSyncValue(false);
					setTime([]);
					setIsRequest(false);
					setList([]);
					setSelectedKeys([]);
					setSelectRowKeys([]);
				}}
				headerTitle={
					<div className='flex flex-between'>
						<div className='tableTitle'>
							{(list || []).length > 0 && sumPrice > 0 && (
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
										总金额：￥{sumPrice ? convertPriceWithDecimal(sumPrice) : '-'}
									</span>
								</span>
							)}
						</div>
					</div>
				}
				toolBarRender={() => [
					access['fresh_receipt_add'] && (
						<>
							{(invoiceSyncValue || invoiceSyncValue === false) && selectedKeys.length > 0 ? (
								<Button
									type='primary'
									onClick={() => setVisible(true)}>
									生成收料单
								</Button>
							) : (
								<Button
									type='primary'
									onClick={() => generateCheck()}>
									生成收料单
								</Button>
							)}
						</>
					),
				]}
				tableRef={tableRef}
				requestCompleted={(list, params: Record<string, any>) => {
					setList(list);
					setSearchParams(params);
					setIsRequest(true);
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
			/>
			{/*生成收料通知单modal */}
			{visible && (
				<GenerateList
					visible={visible}
					onCancel={() => setVisible(false)}
					onOk={() => postData()}
					selectedKeys={selectedKeys}
					selectRowKeys={selectRowKeys}
					onChecked={setCheckedValue}
					checkedValue={checkedValue}
				/>
			)}
		</div>
	);
};

export default MaterialReceiptCreate;
