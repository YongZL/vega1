import type { DescriptionsItemProps } from '@/components/Descriptions/typings';
import type { ProColumns } from '@/components/ProTable/typings';
import { FC, MouseEvent } from 'react';

import Descriptions from '@/components/Descriptions';
import ProTable from '@/components/ProTable';
import { allocationApplyTypeTextMap, allocationStatusTypeTextMap } from '@/constants/dictionary';
import { getDetailItem } from '@/services/storageReallocation';
import { accessNameMap } from '@/utils';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { Col, Modal, Row, Statistic } from 'antd';
import moment from 'moment';
import { cloneElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';
import { DealDate } from '@/utils/DealDate';

type ReallocateDetailRecord = StorageReallocateController.ReallocateDetailRecord;
type ReallocateRecord = StorageReallocateController.ReallocateRecord;

export const options: DescriptionsItemProps<ReallocateRecord>[] = [
	{
		dataIndex: 'code',
		label: '调拨单号',
	},
	{
		dataIndex: 'sourceStorageAreaName',
		label: '供货库房',
	},
	{
		dataIndex: 'targetStorageAreaName',
		label: '到货库房',
	},
	{
		dataIndex: 'createdByName',
		label: '申请人员',
	},
	{
		dataIndex: 'type',
		label: '调拨类型',
		render: (text: number) => allocationApplyTypeTextMap[text] || '',
	},
	{
		dataIndex: 'expectedTime',
		label: '预计送达时间',
		render: (text) => (text ? moment(text).format('yyyy-MM-DD') : ''),
	},
];

interface Props {
	trigger: JSX.Element;
	detail?: ReallocateRecord;
	rowDetail?: ReallocateDetailRecord;
	onVisibleChange?: (visible: boolean) => void; // 当前组件的状态改变
}

interface DataItem {
	barcode: string;
	reallocateQuantity: number;
	expirationDate: number;
}

const DetailModal: FC<Props> = ({
	detail = {} as ReallocateRecord,
	rowDetail = {} as ReallocateDetailRecord,
	trigger,
	onVisibleChange,
}) => {
	const { fields } = useModel('fieldsMapping');
	const [visible, setVisible] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	const [dataSource, setDataSource] = useState<DataItem[]>([]);
	const accessName = accessNameMap(); // 权限名称

	const getDetail = useCallback(async () => {
		if (loading) {
			return;
		}
		setLoading(true);
		try {
			const res = await getDetailItem({
				id: rowDetail.id,
				goodsId: rowDetail.goodsId,
				lotNum: rowDetail.lotNum ?? undefined,
				productionDate: rowDetail.productionDate ?? undefined,
				expirationDate: rowDetail.expirationDate ?? undefined,
			});
			if (res.code === 0) {
				setIsLoaded(true);
				const dataList = (res.data || []).map((item: any) => ({
					barcode: item.barcode,
					reallocateQuantity: item.reallocateQuantity,
					expirationDate: item.expirationDate,
				}));
				setDataSource(dataList);
			}
		} finally {
			setLoading(false);
		}
	}, [rowDetail.id]);

	useEffect(() => {
		if (visible && !isLoaded && rowDetail.id) {
			getDetail();
		}
	}, [visible, rowDetail.id, getDetail, isLoaded]);

	const handleVisibleChange = useCallback(
		(v) => {
			if (typeof onVisibleChange === 'function') {
				onVisibleChange(v);
			}
		},
		[onVisibleChange],
	);

	const columns: ProColumns<DataItem>[] = useMemo(
		() =>
			detail.goodsType === 1
				? [
						{
							dataIndex: 'index',
							title: '序号',
							width: 'XXS',
							align: 'center',
							renderText: (_text: number, _record, index) => index + 1,
						},
						{
							title: `${fields.goods}条码/UDI`,
							dataIndex: 'barcode',
							key: 'barcode',
							width: 'XXXL',
							ellipsis: true,
							renderText: (text: string) => (rowDetail.barcodeControlled ? text : '-'),
						},
						{
							dataIndex: 'relationName',
							title: fields.goodsName,
							width: 'S',
							renderText: () => rowDetail.relationName || '-',
						},
						{
							dataIndex: 'commonName',
							title: '通用名称',
							width: 'S',
							renderText: () => rowDetail.commonName || '-',
						},
						{
							dataIndex: 'specification',
							title: '规格/型号',
							width: 'S',
							render: () => {
								return <span>{formatStrConnect(rowDetail, ['specification', 'model'])}</span>;
							},
						},
						{
							dataIndex: 'lotNum',
							title: '批号',
							width: 'S',
							renderText: () => rowDetail.lotNum,
						},
						{
							dataIndex: 'productionDate',
							title: '生产日期',
							width: 'S',
							renderText: () => DealDate(rowDetail.productionDate, 0, '-'),
						},
						{
							dataIndex: 'expirationDate',
							title: '有效期至',
							width: 'S',
							renderText: (text: string, record) => DealDate(record.expirationDate, 0, '-'),
						},
						{
							dataIndex: 'price',
							title: '单价(元)',
							width: 'S',
							render: (text, record) => {
								return (
									<span>{rowDetail.price ? convertPriceWithDecimal(rowDetail.price) : '-'}</span>
								);
							},
						},
						{
							dataIndex: 'reallocateQuantity',
							title: '数量',
							width: 'S',
						},
						{
							dataIndex: 'num',
							title: '金额(元)',
							width: 'S',
							renderText: (text: number, record) =>
								convertPriceWithDecimal(rowDetail.price * Number(record.reallocateQuantity)),
						},
						{
							dataIndex: 'manufacturerName',
							title: '生产厂家',
							width: 'XXL',
							renderText: () => rowDetail.manufacturerName || '-',
						},
				  ]
				: [
						{
							dataIndex: 'index',
							title: '序号',
							width: 'XXS',
							align: 'center',
							renderText: (_text: number, _record, index) => index + 1,
						},
						{
							dataIndex: 'barcode',
							title: '医耗套包条码',
							width: 'XXXL',
						},
						{
							dataIndex: 'relationName',
							title: '医耗套包名称',
							width: 'L',
							renderText: () => rowDetail.relationName || '-',
						},
						{
							dataIndex: 'ordinaryDescription',
							title: '医耗套包说明',
							width: 'XXXL',
							renderText: () => rowDetail.ordinaryDescription || '-',
						},
				  ],
		[detail.goodsType, rowDetail],
	);

	const onClose = useCallback(() => {
		setVisible(false);
		handleVisibleChange(false);
	}, [handleVisibleChange]);

	return (
		<>
			{cloneElement(trigger, {
				onClick: () => {
					handleVisibleChange(true);
					setVisible(true);
				},
			})}
			<Modal
				title={accessName['allocation_handle_detail'] + '明细'}
				visible={visible}
				onCancel={(_e: MouseEvent) => onClose()}
				footer={null}
				className='ant-detail-modal'>
				<Row className='detailsBorder five'>
					<Col className='left'>
						<Descriptions<ReallocateRecord>
							options={options}
							data={detail as ReallocateRecord}
							optionEmptyText='-'
							defaultColumn={4}
							minColumn={3}
						/>
					</Col>
					<Col className='right'>
						<Statistic
							title='当前状态'
							value={allocationStatusTypeTextMap[detail.status] || ''}
						/>
					</Col>
				</Row>
				<ProTable<DataItem>
					headerTitle={detail.goodsType === 1 ? fields.baseGoods : '医耗套包'}
					pagination={false}
					scroll={{ y: 300 }}
					options={{
						setting: false,
						density: false,
					}}
					columns={columns}
					dataSource={dataSource}
				/>
			</Modal>
		</>
	);
};

export default DetailModal;
