import { ProColumns, ProTableAction } from '@/components/ProTable';
import ProTable from '@/components/ResizableTable';
import { ProFormColumns } from '@/components/SchemaForm';
import { timeType } from '@/constants';
import {
	getDistributorAndManufacturerByInvoiceSync,
	getPendingGenerateReceiptListByInvoiceSync,
} from '@/services/receipt';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button, Form } from 'antd';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useAccess, useModel } from 'umi';
import UploadModal from './components/UploadModal';

const FreightTicket = () => {
	const [form] = Form.useForm();
	const access = useAccess();
	const tableRef = useRef<ProTableAction>();
	const { fields } = useModel('fieldsMapping');
	const [searchParams, setSearchParams] = useState<Record<string, any>>({});
	const [distributorList, setDistributorList] = useState<ReceiptController.distributorList[]>([]);
	const [manufacturerList, setManufacturerList] = useState<ReceiptController.distributorList[]>([]);
	const [selectedKeys, setSelectedKeys] = useState<number[]>([]);
	const [selectRowKeys, setSelectRowKeys] = useState<ReceiptController.DetailInvoiceSync[]>([]);

	useEffect(() => {
		getDistributor();
	}, []);

	const dealList = (data: ReceiptController.distributorList[]) => {
		return (data || []).map((item) => ({
			value: item.id,
			label: item.companyName,
		}));
	};

	const getDistributor = async () => {
		const res = await getDistributorAndManufacturerByInvoiceSync();
		if (res.code === 0) {
			const distributorList: any = dealList(res.data.distributorList);
			setDistributorList(distributorList);
			const manufacturerList: any = dealList(res.data.manufacturerList);
			setManufacturerList(manufacturerList);
		}
	};

	const searchColumns: ProFormColumns = [
		{
			title: '验收日期',
			dataIndex: 'timeCreated',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType,
			},
		},
		{
			title: '订单编号',
			dataIndex: 'receivingOrderCode',
		},
		{
			title: '配送单号',
			dataIndex: 'shippingOrderCode',
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
		},
		{
			title: '规格/型号',
			dataIndex: 'commonSearch.specificationAndModel',
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorId',
			valueType: 'apiSelect',
			fieldProps: {
				options: distributorList,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerId',
			valueType: 'apiSelect',
			fieldProps: {
				options: manufacturerList,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
		},
	];

	const columns: ProColumns<ReceiptController.DetailInvoiceSync>[] = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			renderText: (text: string, record, index: number) => <span>{index + 1}</span>,
		},

		{
			title: fields.goodsCode,
			key: 'materialCode',
			width: 'M',
			dataIndex: 'materialCode',
			hideInSearch: true,
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			width: 'L',
			ellipsis: true,
		},
		{
			width: 'M',
			title: '规格/型号',
			dataIndex: 'specification',
			ellipsis: true,
			renderText: (text, record) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			width: 'M',
			title: '待开数量',
			dataIndex: 'num',
			key: 'num',
			ellipsis: true,
		},
		{
			width: 'XS',
			title: '验收数量',
			dataIndex: 'acceptanceNum',
			ellipsis: true,
		},
		{
			title: '验收时间',
			dataIndex: 'acceptanceTime',
			width: 'XXL',
			sorter: true,
			key: 'orr.actual_acceptance_date',
			ellipsis: true,
			renderText: (text: string, record) => (
				<>
					<span>{text ? moment(text).format('YYYY/MM/DD') : ''}</span>
				</>
			),
		},
		{
			title: '计价单位',
			dataIndex: 'minGoodsUnit',
			ellipsis: true,
		},
		{
			width: 'M',
			title: '含税单价(元)',
			dataIndex: 'price',
			renderText: (text: number) => <span>{convertPriceWithDecimal(text)}</span>,
		},
		{
			title: '订单编号',
			width: 'XXXL',
			dataIndex: 'receivingOrderCode',
		},
		{
			title: '配送单号',
			width: 'XXXL',
			dataIndex: 'shippingOrderCode',
		},
		{
			width: 'XXXL',
			title: '配送商业',
			dataIndex: 'distributorName',
			copyable: true,
		},
		{
			width: 'XXXL',
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			copyable: true,
		},
		{
			width: 'XXXL',
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			copyable: true,
		},
		{
			width: 'XXXL',
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			copyable: true,
		},
	];

	// 请求列表
	const getFormList = async () => {
		setSelectedKeys([]);
		setSelectRowKeys([]);
		tableRef.current?.reload();
	};

	const isRepeat = (arr: ReceiptController.DetailInvoiceSync[]) => {
		const hash = {};
		for (let i = 0; i < arr.length; i++) {
			if (!hash[arr[i].distributorId]) {
				hash[arr[i].distributorId] = true;
			}
		}
		return !(Object.keys(hash).length > 1);
	};

	const changeSelectRowKey = (row: [], rowKey: ReceiptController.DetailInvoiceSync[]) => {
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

	const rowSelection = {
		selectedRowKeys: selectedKeys,
		// 添加后分页不会清楚上页的选中
		preserveSelectedRowKeys: true,
		onChange: changeSelectRowKey,
		getCheckboxProps: (record: Record<string, any>) => ({
			disabled: record.generateReceipt == true,
		}),
	};

	return (
		<>
			<ProTable<ReceiptController.DetailInvoiceSync>
				tableInfoCode='materialReceiptSyncCreate'
				loadConfig={{
					request: false,
				}}
				columns={columns}
				pagination={false}
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				api={getPendingGenerateReceiptListByInvoiceSync}
				rowSelection={rowSelection as Record<string, any>}
				rowKey='id'
				dateFormat={{
					timeCreated: {
						endKey: 'timeTo',
						startKey: 'timeFrom',
					},
				}}
				tableRef={tableRef}
				headerTitle={
					<div className='flex flex-between'>
						<div className='tableTitle'>
							待开票列表
							{
								<span
									className='tableAlert'
									style={{
										backgroundColor: CONFIG_LESS['@bgc_search'],
										borderRadius: '5px',
										marginLeft: '10px',
									}}>
									*本页面可处理货票同行物资的开票业务
								</span>
							}
						</div>
					</div>
				}
				onReset={() => {
					setSelectedKeys([]);
					setSelectRowKeys([]);
				}}
				toolBarRender={() => [
					access['fresh_receipt_add'] && (
						<UploadModal
							getTableList={getFormList}
							searchParams={searchParams}
							trigger={
								<Button
									key='submit'
									type='primary'
									disabled={!selectedKeys.length}>
									上传发票
								</Button>
							}
							listData={selectRowKeys as Record<string, any>}
						/>
					),
				]}
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
		</>
	);
};
export default FreightTicket;
