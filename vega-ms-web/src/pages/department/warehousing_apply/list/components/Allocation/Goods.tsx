import ProTable from '@/components/ProTable';
import type { ProColumns } from '@/components/ProTable/typings';
import { reallocationOrderStatusValueEnum } from '@/constants/dictionary';
import { formatStrConnect } from '@/utils/format';
import { FC } from 'react';
import { useModel } from 'umi';
interface Props {
	modalType: string;
	tableData: GoodsRecord[];
}
type GoodsRecord = ReallocateController.GoodsListRecord;
const Goods: FC<Props> = ({ tableData, modalType }) => {
	const { fields } = useModel('fieldsMapping');

	const { rejected, passed } = reallocationOrderStatusValueEnum;
	const reallocationStatus = {
		...reallocationOrderStatusValueEnum,
		rejected: {
			...rejected,
			text: '验收不通过',
		},
		passed: {
			...passed,
			text: '验收通过',
		},
	};

	const goodsColumnsPend: ProColumns<GoodsRecord>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 80,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: '验收状态',
			dataIndex: 'status',
			key: 'status',
			width: 120,
			filters: false,
			hideInTable: modalType === 'approve',
			valueEnum: reallocationStatus,
		},
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 180,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 150,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			render: (text, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 200,
			ellipsis: true,
		},
		{
			title: '调拨数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 120,
			render: (text, record) => {
				return <span>1 {record.minUnitName}</span>;
			},
		},
		{
			title: '调拨事由',
			dataIndex: 'remarks',
			key: 'remarks',
			width: 140,
		},
		{
			title: '验收不通过原因',
			dataIndex: 'reason',
			key: 'reason',
			width: 150,
			ellipsis: true,
			hideInTable: modalType === 'approve',
		},
	];

	return (
		<>
			{tableData.length > 0 && (
				<div>
					<ProTable<GoodsRecord>
						columns={goodsColumnsPend}
						rowKey='operatorBarcode'
						loadConfig={{
							request: false,
						}}
						scroll={{ y: 300 }}
						dataSource={tableData}
						headerTitle={fields.baseGoods}
						searchConfig={undefined}
						options={{ density: false, fullScreen: false, setting: false }}
					/>
				</div>
			)}
		</>
	);
};
export default Goods;
