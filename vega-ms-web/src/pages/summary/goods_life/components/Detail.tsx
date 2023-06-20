import type { ProColumns } from '@ant-design/pro-table';

import TableBox from '@/components/TableBox';
import { goodsLifeStatusTextMap, goodsLifeStatusValueEnum } from '@/constants/dictionary';
import { getStockOperatorByGoodsItemId } from '@/services/stockOperation';
import { Col, Descriptions, Modal, Row } from 'antd';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';
import { useModel } from 'umi';
import { accessNameMap } from '@/utils';
const CheckModal: FC<{
	detail: StockController.GoodsItem;
	visible: boolean;
	onCancel: () => void;
}> = ({ detail, visible, onCancel }) => {
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [goodsData, setGoodsData] = useState<StockOperationController.StockOperatorRecord[]>([]);
	const accessNameMaplist: Record<string, any> = accessNameMap();
	useEffect(() => {
		const getDetail = async (id: number) => {
			let res = await getStockOperatorByGoodsItemId({
				id,
			});
			if (res && res.code === 0) {
				setGoodsData(res.data || []);
			}
			setLoading(false);
		};
		if (detail.id) {
			setLoading(true);
			getDetail(detail.id);
		}
	}, [detail]);

	const goodsColumns: ProColumns<StockOperationController.StockOperatorRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			render: (text, redord, index) => <span>{index + 1}</span>,
			width: 60,
		},
		{
			title: '操作类型',
			dataIndex: 'type',
			key: 'type',
			width: 120,
			render: (text) => {
				return (
					<span className={(goodsLifeStatusValueEnum[text as string] || {}).color}>
						{goodsLifeStatusTextMap[text as string]}
					</span>
				);
			},
		},
		{
			title: '操作人',
			dataIndex: 'operator',
			key: 'operator',
			width: 150,
		},
		{
			title: '操作时间',
			dataIndex: 'operatorTime',
			key: 'operatorTime',
			width: 170,
			render: (text) => {
				return (
					<span>
						{text ? moment(new Date(text as number)).format('YYYY/MM/DD  HH:mm:ss') : '-'}
					</span>
				);
			},
		},
		{
			title: '单据号',
			dataIndex: 'orderCode',
			key: 'orderCode',
			width: 180,
		},
	];

	return (
		<div>
			<Modal
				visible={visible}
				width={'80%'}
				maskClosable={false}
				title={accessNameMaplist.goods_life_detail}
				onCancel={onCancel}
				footer={false}
				className='ant-detail-modal'>
				<Row className='detailsBorderAndMargin four'>
					<Col>
						<Descriptions>
							<Descriptions.Item label={`${fields.goods}条码`}>
								{detail.operatorBarcode}
							</Descriptions.Item>
							<Descriptions.Item label={fields.goodsName}>{detail.goodsName}</Descriptions.Item>
						</Descriptions>
					</Col>
				</Row>
				<TableBox
					loading={loading}
					size='middle'
					pagination={false}
					columns={goodsColumns}
					dataSource={goodsData}
					options={{ density: false, fullScreen: false, setting: false }}
					scroll={{ x: '100%', y: 300 }}
					tableInfoId='105'
				/>
			</Modal>
		</div>
	);
};
export default CheckModal;
