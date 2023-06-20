import type { ProTableAction } from '@/components//ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { ProColumns } from '@ant-design/pro-table/lib/typing';

import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import Print from '@/components/print';
import Target from '@/components/print/finalstatement';
import ProTable from '@/components/ResizableTable';
import { invoiceSync } from '@/constants';
import { getListByInvoiceSync } from '@/services/distributor';
import {
	exportHistoryUrl,
	getTimeList,
	historyListUrl,
	queryHistoryList,
} from '@/services/settlement';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Form } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useAccess, useModel } from 'umi';

const PrintTarget = Print(Target);
const HistorySettlementList: React.FC<{}> = () => {
	const access = useAccess();
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const [isRequest, setIsRequest] = useState<boolean>(false);
	const [time, setTime] = useState<SettlementController.SelectRecord[]>([]);
	const [invoiceSyncs, setInvoiceSyncs] = useState<Partial<boolean>>();
	const [searchData, setSearchData] = useState<Record<string, any>>({});
	const [statementEntity, setStatementEntity] = useState<
		Partial<SettlementController.StatementEntity>
	>({});
	const [isExportFile, setIsExportFile] = useState(false);
	const [statementList, setStatementList] = useState<Partial<SettlementController.Statement>>({});
	const [distributorList, setDistributorList] = useState<SettlementController.SelectRecord[]>([]);

	// 获取结算周期
	const getTime = async (params: SettlementController.TimeListParams) => {
		if (params.invoiceSync === undefined) {
			setTime([]);
			return;
		}
		const res = await getTimeList(params);
		if (res && res.code === 0) {
			const result = res.data.map((item) => {
				const { timeFrom, timeTo } = item;
				return {
					label:
						(timeFrom ? moment(timeFrom).format('YYYY/MM/DD') + '~' : '') +
						(timeTo ? moment(timeTo).format('YYYY/MM/DD') : ''),
					value: timeFrom + '|' + timeTo,
				};
			});
			setTime(result);
		}
	};

	// 根据是否货票同行获取配送商业/药商
	const getDistributor = async (params: DistributorController.InvoiceSyncParams) => {
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
		getTime({ invoiceSync: invoiceSyncs });
	}, [invoiceSyncs]);

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
			fieldProps: {
				placeholder: '请选择',
				options: invoiceSync,
				onChange: (value: boolean) => {
					setInvoiceSyncs(value);
					form.resetFields(['settlementTime', 'authorizingDistributorId']);
					getDistributor({ invoiceSync: value, type: false });
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
	];

	const getSearchDate = () => searchData;

	const columns: ProColumns<SettlementController.HistoryGoodsRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			width: 'XXS',
			align: 'center',
			renderText: (text: number, record, index: number) => index + 1,
		},
		{
			title: fields.goodsCode,
			width: 'M',
			dataIndex: 'materialNumber',
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
			title: '国家医保编码',
			dataIndex: 'nationalNo',
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
			title: '消耗类型',
			dataIndex: 'consumeType',
			width: 'L',
			hideInTable: invoiceSyncs,
			ellipsis: true,
		},
		{
			title: '条码管控',
			dataIndex: 'isBarcodeControlled',
			width: 'XS',
			renderText: (text: boolean) => (text == true ? '条码管控' : '非条码管控'),
		},
		{
			title: '单位',
			dataIndex: 'unit',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			width: 'M',
			align: 'right',
			renderText: (text: number) => <span>{convertPriceWithDecimal(text)}</span>,
		},
		{
			title: '数量',
			dataIndex: 'number',
			width: 'L',
			ellipsis: true,
			renderText: (text: number, record) =>
				record.number < 0 ? (
					<span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>{record.number}</span>
				) : (
					record.number
				),
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
	];

	const printTip = () => {
		const { timeFrom, timeTo, authorizingDistributorId } = searchData;
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
	};

	const beforeSearch = (params: Record<string, any>) => {
		const { settlementTime } = params;
		const timeArr = settlementTime ? settlementTime.split('|') : '';
		return {
			...params,
			settlementTime: undefined,
			timeFrom: settlementTime && moment(Number(timeArr[0])).valueOf(),
			timeTo: settlementTime && moment(Number(timeArr[1])).valueOf(),
		};
	};

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<ProTable<SettlementController.HistoryGoodsRecord>
				tableInfoCode='historySettlementList'
				api={queryHistoryList}
				columns={columns}
				searchConfig={{
					columns: searchColumns,
					form: form,
				}}
				onReset={() => {
					setIsRequest(false);
					setInvoiceSyncs(undefined);
					setStatementEntity({});
					setIsExportFile(false);
				}}
				requestCompleted={(rows, params) => {
					setIsExportFile(rows.length > 0);
					setIsRequest(true);
					setSearchData({ ...params });
				}}
				rowKey={(record, index?: number) => `${index}`}
				setRows={(res) => {
					const { statement, statementEntity } = res.data;
					setStatementEntity(statementEntity);
					setStatementList(statement);
					return statement;
				}}
				loadConfig={{ request: false, reset: false }}
				beforeSearch={beforeSearch}
				tableRef={tableRef}
				headerTitle={
					<div className='flex flex-between'>
						<div className='tableTitle'>
							{statementEntity && (
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
										style={{ border: 0 }}>
										结算单号： <span className='titlecollect'>{statementEntity.no || '-'}</span>
										，结算人员：<span className='titlecollect'>{statementEntity.name || '-'}</span>
										，结算时间：
										<span className='titlecollect'>
											{statementEntity.timeCreated
												? moment(statementEntity.timeCreated).format('YYYY/MM/DD HH:mm:ss')
												: '-'}
										</span>
										，总金额：￥
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
				toolBarRender={() => [
					access['operating_history_goods_print_settlement'] && (
						<>
							{searchData.timeFrom && searchData.timeTo && searchData.authorizingDistributorId ? (
								<PrintTarget
									url={historyListUrl}
									params={{ ...searchData }}
									parameters={{
										...searchData,
										...statementEntity,
										...statementList,
										invoiceSyncs,
									}}
									printType={true}
								/>
							) : (
								<Button
									type='primary'
									className='btnOperator'
									onClick={() => printTip()}>
									打印
								</Button>
							)}
						</>
					),
					access['operating_history_goods_print_settlement'] && (
						<>
							{isRequest ? (
								<ExportFile
									data={{
										filters: { ...getSearchDate() },
										link: exportHistoryUrl,
										getForm: getSearchDate,
									}}
									disabled={!isExportFile}
								/>
							) : (
								<Button
									type='primary'
									className='btnOperator'
									disabled={!isExportFile}
									onClick={() => printTip()}>
									导出
								</Button>
							)}
						</>
					),
				]}
			/>
		</div>
	);
};

export default HistorySettlementList;
