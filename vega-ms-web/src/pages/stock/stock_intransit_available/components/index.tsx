import type { ProColumns, ProTableAction } from '@/components//ProTable/typings';
import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { getAvailableStocks, getStockWithPage } from '@/services/stock';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import React, { useRef, useState } from 'react';
import { useAccess, useModel } from 'umi';
import { ExclamationCircleFilled } from '@ant-design/icons';

const List: React.FC<{ pageType: 'intransit' | 'available' }> = (props) => {
	let { pageType } = props;
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const access = useAccess();
	const [isExportFile, setIsExportFile] = useState(false);
	const searchColumns: ProFormColumns<StockController.GetStockWithPage> = [
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: '规格/型号',
			dataIndex: 'commonSearch.specificationAndModel',
		},
	];

	const intransitcolumns: ProColumns<
		StockController.GetQueryStockWithPage | StockController.GetQueryAvailableStocks
	>[] = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'id',
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			width: 'S',
			title: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			width: 'L',
			title: fields.goodsName,
			dataIndex: 'goodsName',
			ellipsis: true,
		},
		{
			width: 'XXL',
			title: fields.distributor,
			dataIndex: 'distributorName',
			ellipsis: true,
		},
		{
			width: 'XXL',
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			ellipsis: true,
		},
		{
			width: 'L',
			title: '规格/型号',
			dataIndex: 'specification',
			ellipsis: true,
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			width: 'M',
			title: '包装数',
			dataIndex: 'unitNum',
		},
		{
			width: 'M',
			title: '库存总量',
			dataIndex: 'repositoryStocksTotal',
		},
		{
			width: 'S',
			title: '待上架',
			dataIndex: 'repositoryStocksPutOnShelfPending',
		},
		{
			width: 'S',
			title: '已上架',
			dataIndex: 'repositoryStocksPutOnShelf',
		},
		{
			width: 'S',
			title: '已下架',
			dataIndex: 'repositoryStocksPutOffShelf',
		},
		{
			width: 'S',
			title: '推送中',
			dataIndex: 'repositoryStocksDelivery',
		},
		{
			width: 'S',
			title: '退货中',
			dataIndex: 'repositoryStocksReturnGoodsPending',
		},
		{
			width: 'M',
			title: `已拆分的订单中${fields.baseGoods}数量`,
			dataIndex: 'orderNums',
		},
		{
			width: 'L',
			title: '已拆分订单中 在途库存(已分配但未验收)',
			dataIndex: 'inTransitStocks',
		},
		{
			width: 'M',
			title: '已拆分订单中 未分配的数量',
			dataIndex: 'separatedOrderStocks',
		},
		{
			width: 'M',
			title: '未拆分订单库存',
			dataIndex: 'composedOrderStocks',
		},
		{
			width: 'M',
			title: '采购计划库存',
			dataIndex: 'planStocks',
		},
	];
	const availablecolumns: ProColumns<
		StockController.GetQueryStockWithPage | StockController.GetQueryAvailableStocks
	>[] = [
		{
			width: 'XXXS',
			title: '序号',
			dataIndex: 'id',
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			width: 'L',
			title: fields.goodsCode,
			ellipsis: true,
			dataIndex: 'materialCode',
		},
		{
			width: 'L',
			title: fields.goodsName,
			dataIndex: 'goodsName',
			ellipsis: true,
			renderText: (text, record) => {
				return record.isLowerLimit ? (
					<span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>{text}</span>
				) : (
					text
				);
			},
		},
		{
			width: 'XS',
			title: '通用名',
			dataIndex: 'commonName',
			ellipsis: true,
		},
		{
			width: 'L',
			title: '规格/型号',
			dataIndex: 'specification',
			ellipsis: true,
			render: (text, record) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			width: 'L',
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			ellipsis: true,
		},
		{
			width: 'XXS',
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			align: 'right',
			renderText: (text: number) => convertPriceWithDecimal(text),
		},
		{
			width: 'XS',
			title: '单位',
			dataIndex: 'unitName',
		},
		{
			width: 'XXS',
			title: '总价(元)',
			dataIndex: 'totalPrice',
			key: 'totalPrice',
			align: 'right',
			renderText: (text: number) => convertPriceWithDecimal(text),
		},
		{
			width: 'XS',
			title: '库存总量',
			dataIndex: 'stocks',
		},
		{
			width: 'L',
			title: '配货单占用',
			dataIndex: 'occupied',
		},
		{
			width: 'XS',
			title: '已过期',
			dataIndex: 'expired',
		},
		{
			width: 'XS',
			title: '可用量',
			dataIndex: 'canUse',
			renderText: (text, record) => {
				return record.isLowerLimit ? (
					<span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>{text}</span>
				) : (
					text
				);
			},
		},
	];
	const getSearchDate = () => {
		return { ...tableRef.current?.getParams() };
	};
	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<ProTable
				requestCompleted={(rows) => {
					setIsExportFile(rows.length > 0);
				}}
				tableInfoCode={
					pageType === 'intransit' ? 'inventory_intransit_list' : 'stock_available_list'
				}
				headerTitle={
					pageType !== 'intransit' && (
						<div className='flex flex-between'>
							<div className='tableTitle'>
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
									<span>* 如物资可用库存达到设置下限范围，可用库存将红字显示提示</span>
								</span>
							</div>
						</div>
					)
				}
				// tableInfoId={pageType === 'intransit' ? "52" : '53'}
				rowKey='id'
				columns={pageType === 'intransit' ? intransitcolumns : availablecolumns}
				api={pageType === 'intransit' ? getStockWithPage : getAvailableStocks}
				loadConfig={{
					request: false,
				}}
				searchConfig={{
					columns: searchColumns,
				}}
				tableRef={tableRef}
				toolBarRender={() => [
					access.consume_history_export && pageType === 'available' && (
						<ExportFile
							data={{
								filters: { ...getSearchDate() },
								link: '/api/admin/stock/1.0/exportAvailableStocks',
								getForm: getSearchDate,
							}}
							disabled={!isExportFile}
						/>
					),
				]}
			/>
		</div>
	);
};

export default List;
