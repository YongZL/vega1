import type { ProColumns, ProTableAction } from '@/components//ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ResizableTable';
import { barcodeControl } from '@/constants';
import { useDepartmentList } from '@/hooks/useDepartmentList';
import { getStockInquiry } from '@/services/threeStock';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { useModel } from 'umi';

const StockInquiry = () => {
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const [data, setData] = useState<Partial<Pager>>({});

	const departmentList = (useDepartmentList() || []).map((item) => ({
		value: item.id,
		label: item.name,
		key: (item.nameAcronym || '') + '' + item.name,
	}));

	const searchColumns: ProFormColumns = [
		{
			title: '科室',
			dataIndex: 'departmentId',
			valueType: 'select',
			fieldProps: {
				allowClear: true,
				showSearch: true,
				options: departmentList,
				filterOption: (input: string, option: { label: string }) => {
					return option['data-item'].key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
			formItemProps: {
				rules: [
					{
						required: true,
						message: '请选择科室',
					},
				],
			},
		},
		{
			title: '收费项编号',
			dataIndex: 'chargeCode',
		},
		{
			title: '收费项名称',
			dataIndex: 'chargeName',
		},
		{
			title: '条码管控',
			dataIndex: 'isBarcodeControlled',
			valueType: 'select',
			fieldProps: {
				options: barcodeControl,
			},
		},
		{
			title: '规格/型号',
			dataIndex: 'commonSearch.specificationAndModel',
		},
	];

	const columns: ProColumns<ThreeStockController.ThreeStockRecord>[] = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			renderText: (text, record, index) => index + 1,
		},
		{
			width: 'S',
			title: '收费项编号',
			dataIndex: 'chargeCode',
			ellipsis: true,
		},
		{
			width: 'S',
			title: '收费项名称',
			dataIndex: 'chargeName',
			ellipsis: true,
		},
		{
			width: 'M',
			title: '本地医保编码',
			dataIndex: 'chargeNum',
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			width: 'M',
			ellipsis: true,
		},
		{
			width: 'M',
			ellipsis: true,
			title: fields.goodsName,
			dataIndex: 'goodsName',
		},
		{
			width: 'S',
			title: '规格/型号',
			dataIndex: 'specification',
			ellipsis: true,
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			width: 'XXS',
			title: '单价(元)',
			dataIndex: 'price',
			align: 'right',
			renderText: (text: number) => (
				<span>{text || text == 0 ? convertPriceWithDecimal(text) : '-'}</span>
			),
		},
		{
			width: 'XXS',
			title: '当前库存',
			dataIndex: 'quantity',
		},
		{
			width: 'XXS',
			title: '单位',
			dataIndex: 'unitName',
		},
		{
			width: 'XXS',
			title: '条码管控',
			dataIndex: 'isBarcodeControlled',
			renderText: (text: boolean) => (text ? '条码管控' : '非条码管控'),
		},
	];

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<ProTable
				tableInfoCode='three_stock_inquiry'
				api={getStockInquiry}
				rowKey='id'
				columns={columns}
				searchConfig={{
					columns: searchColumns,
				}}
				loadConfig={{
					request: false,
					reset: false,
				}}
				setRows={(res: Record<string, any>) => {
					const result = res.data;
					setData(result);
					return result;
				}}
				onReset={() => {
					tableRef.current?.setDataSource([]);
				}}
				tableRef={tableRef}
				headerTitle={
					<div className='flex flex-between'>
						<div className='tableTitle'>
							{data && JSON.stringify(data) !== '{}' && (
								<div className='tableTitle'>
									<span className='tableAlert'>
										<ExclamationCircleFilled
											style={{
												color: CONFIG_LESS['@c_starus_await'],
												marginRight: '8px',
												fontSize: CONFIG_LESS['@font-size-12'],
											}}
										/>
										<span className='consumeCount'>
											总数量：{' '}
											<span className='count tableNotificationTitleNum'>
												{data.sumQuantity || 0}
											</span>
											，总金额：￥
											<span className='count tableNotificationTitleNum'>
												{convertPriceWithDecimal(data.sumPrice) || 0}
											</span>
										</span>
									</span>
								</div>
							)}
						</div>
					</div>
				}
			/>
		</div>
	);
};

export default StockInquiry;
