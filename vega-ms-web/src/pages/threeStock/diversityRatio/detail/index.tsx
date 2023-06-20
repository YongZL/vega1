import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar2 from '@/components/FooterToolbar/index2';
import { ProColumns } from '@/components/ProTable';
import ProTable from '@/components/ResizableTable';
import { ProFormColumns } from '@/components/SchemaForm';
import { barcodeControl } from '@/constants';
import { getDifferenceRateDetail } from '@/services/inventory';
import { DealDate } from '@/utils/DealDate';
import { convertPriceWithDecimal } from '@/utils/format';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Card } from 'antd';
import { FC } from 'react';
import { connect, history, useModel } from 'umi';

export interface UpdateProps {
	global: Record<string, any>;
	match: Record<string, any>;
	history: Record<string, any>;
}

const List: FC<UpdateProps> = ({ global }) => {
	const historyState: any = history.location.state;
	const { fields } = useModel('fieldsMapping');
	const aSpan = (item: number) => <span className={item < 0 ? 'negativeStyle' : ''}>{item}</span>;

	const columns: ProColumns<InventoryController.DifferenceRatdeDetailRecord>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 'XXXS',
			align: 'center',
			render: (text: any, record: any, index: number) => index + 1,
		},
		{
			title: '收费项编号',
			dataIndex: 'chargeCode',
			key: 'chargeCode',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '收费项名称',
			dataIndex: 'chargeName',
			key: 'chargeName',
			width: 'S',
			ellipsis: true,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			key: 'nationalNo',
			width: 140,
			ellipsis: true,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 'L',
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 'S',
			align: 'right',
			renderText: (text) => (text ? convertPriceWithDecimal(text) : '-'),
		},
		{
			title: '期初库存',
			dataIndex: 'beginningInventory',
			key: 'beginningInventory',
			width: 'S',
			renderText: (text) => aSpan(text),
		},
		{
			title: 'SPD消耗数',
			dataIndex: 'spdConsumeQuantity',
			key: 'spdConsumeQuantity',
			width: 'S',
			renderText: (text) => aSpan(text),
		},
		{
			title: 'HIS收费数',
			dataIndex: 'hisConsumeQuantity',
			key: 'hisConsumeQuantity',
			width: 'S',
			renderText: (text) => aSpan(text),
		},
		{
			title: '系统库存',
			dataIndex: 'logicalQuantity',
			key: 'logicalQuantity',
			width: 'S',
			renderText: (text) => aSpan(text),
		},
		{
			title: '盘点库存',
			dataIndex: 'actualQuantity',
			key: 'actualQuantity',
			width: 'S',
			renderText: (text) => aSpan(text),
		},
		{
			title: '差异数',
			dataIndex: 'differenceQuantity',
			key: 'differenceQuantity',
			width: 'S',
			renderText: (text) => aSpan(text),
		},
		{
			title: '差异率',
			dataIndex: 'differenceRate',
			key: 'differenceRate',
			width: 'S',
			renderText: (text) => (text ? Number(text * 100).toFixed(2) + '%' : '-'),
		},
		{
			title: '条码管控',
			dataIndex: 'barcodeControlled',
			key: 'barcodeControlled',
			width: 'S',
			renderText: (text) => (text ? '条码管控' : '非条码管控'),
		},
	];

	const searchColumns: ProFormColumns = [
		{
			title: '科室',
			dataIndex: 'AText',
			valueType: 'aText',
			fieldProps: {
				value: (historyState && historyState.departmentName) || '-',
			},
		},
		{
			title: ' 创建人员',
			dataIndex: 'time',
			valueType: 'aText',
			fieldProps: {
				value: (historyState && historyState.inventoryUserName) || '-',
			},
		},
		{
			title: '盘库时间',
			dataIndex: 'remarks',
			valueType: 'aText',
			fieldProps: {
				value:
					historyState &&
					historyState.inventoryTime &&
					DealDate(historyState.inventoryTime, 1, '-'),
			},
		},

		{
			title: '上次盘库时间',
			valueType: 'aText',
			fieldProps: {
				value:
					historyState &&
					historyState.lastInventoryTime &&
					DealDate(historyState.lastInventoryTime, 1, '-'),
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
			title: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
		},
		{
			title: '条码管控',
			dataIndex: 'barcodeControlled',
			valueType: 'select',
			fieldProps: {
				options: barcodeControl,
			},
		},
	];

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', ['', { pathname: '/threeStock/diversityRatio' }], '']} />
			</div>
			<Card bordered={false}>
				<ProTable
					tableInfoCode='three_stock_diversityRatio_detail'
					searchConfig={{
						columns: searchColumns,
					}}
					headerTitle={
						<div className='flex flex-between'>
							<div className='tableTitle'>
								<div className='tableAlert'>
									<ExclamationCircleFilled
										style={{
											color: CONFIG_LESS['@c_starus_await'],
											marginRight: '8px',
											fontSize: CONFIG_LESS['@font-size-12'],
										}}
									/>
									<span className='consumeCount'>
										差异数：{' '}
										<span className='count tableNotificationTitleNum'>
											{historyState?.differenceQuantity}
										</span>
										，差异总金额：￥
										<span className='tableNotificationTitleNum'>
											{convertPriceWithDecimal(historyState?.differenceAmount || 0)}
										</span>
									</span>
								</div>
							</div>
						</div>
					}
					tableStyle={{ padding: 0 }}
					rowKey='id'
					scroll={{ y: global.scrollY - 30 }}
					api={getDifferenceRateDetail}
					params={{
						inventoryId: historyState?.id,
					}}
					columns={columns}
				/>
			</Card>
			<FooterToolbar2>
				<Button
					onClick={() => {
						history.push({ pathname: '/threeStock/diversityRatio' });
					}}>
					返回
				</Button>
			</FooterToolbar2>
		</div>
	);
};

export default connect(({ global }: { global: Record<string, any> }) => ({ global }))(List);
