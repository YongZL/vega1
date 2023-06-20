import type { ProFormColumns } from '@/components/SchemaForm/typings';
import type { ProColumns, ProTableAction } from '@/components//ProTable/typings';

import moment from 'moment';
import { Button, Form, InputNumber } from 'antd';
import { notification } from '@/utils/ui';
import { useAccess, useModel } from 'umi';
import ProTable from '@/components/ResizableTable';
import UploadModal from './components/UploadModal';
import { ExclamationCircleFilled } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';

import { countTotal } from '@/utils/calculate';
import { getListByInvoiceSync } from '@/services/distributor';
import { queryNotFinishDateList, queryReceiptGoodsList } from '@/services/receipt';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';

const SettlementAfterCancellation: React.FC<{}> = () => {
	const access = useAccess();
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const { fields } = useModel('fieldsMapping');
	const [sumPrice, setSumPrice] = useState<number>(0);
	const [time, setTime] = useState<ReceiptController.SelectRecord[]>([]);
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
			const res = await getListByInvoiceSync({ invoiceSync: false });
			if (res && res.code === 0) {
				const result = res.data.map((item) => ({
					value: item.id,
					label: item.companyName,
				}));
				setDistributorData(result);
			}
		};
		getDistributor();
		// setTimeout(() => {
		//   tableRef.current?.reload();
		// }, 100);
	}, []);

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
			getTime({ invoiceSync: false, authorizingDistributorId: distributorId });
		}
	}, [distributorId]);

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
			title: `${fields.goodsName}/编码`,
			dataIndex: 'goodsNameAndCode',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '规格/型号',
			dataIndex: 'commonSearch.specificationAndModel',
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
					<InputNumber
						min={min}
						max={max}
						key={record.id}
						defaultValue={value}
						disabled={record.generateReceipt}
						onChange={(v) => changeNum(record, v || min)}
						parser={(v) => {
							return v ? v.replace(/\.\d+/g, '') : min;
						}}
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
		getCheckboxProps: (record: Record<string, any>) => ({
			disabled: record.generateReceipt == true,
		}),
	};

	useEffect(() => {
		setSumPrice(countTotal(selectRowKeys, 'rowPrice'));
	}, [selectRowKeys]);

	return (
		<>
			<ProTable<ReceiptController.GoodsListRecord>
				tableInfoCode='materialReceiptCreate'
				loadConfig={{
					request: false,
					reset: false,
				}}
				tableRef={tableRef}
				api={queryReceiptGoodsList}
				pagination={{
					pageSize: 99999,
					hideOnSinglePage: true,
				}}
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
					return { ...value, invoiceSync: false };
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
					setTime([]);
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
				tableAlertOptionRender={
					<a
						onClick={() => {
							setSelectedKeys([]);
							setSelectRowKeys([]);
						}}>
						取消选择
					</a>
				}
				toolBarRender={() => [
					access['fresh_receipt_add'] && (
						<UploadModal
							listData={selectRowKeys}
							searchParams={searchParams}
							getTableList={getFormList}
							sumPrice={sumPrice}
							trigger={
								<Button
									key='submit'
									type='primary'
									disabled={!selectedKeys.length}>
									上传发票
								</Button>
							}
						/>
					),
				]}
				requestCompleted={(list, params: Record<string, any>) => {
					setList(list);
					setSearchParams(params);
				}}
			/>
		</>
	);
};

export default SettlementAfterCancellation;
