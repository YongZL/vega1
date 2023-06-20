import type { ProColumns } from '@/components/ProTable/typings';
import type { FC } from 'react';

import Descriptions from '@/components/Descriptions';
import ProTable from '@/components/ProTable';
import { allocationStatusTypeTextMap } from '@/constants/dictionary';
import { getDetail as queryDetail } from '@/services/storageReallocation';
import { accessNameMap } from '@/utils';
import { Col, Modal, Row, Statistic } from 'antd';
import { cloneElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';
import AllocationDetailModal, { options } from './AllocationDetailModal';
import { formatStrConnect } from '@/utils/format';

type ReallocateDetailRecord = StorageReallocateController.ReallocateDetailRecord;
type ReallocateRecord = StorageReallocateController.ReallocateRecord;
interface Props {
	trigger: JSX.Element;
	detail?: ReallocateRecord;
	disabled?: boolean;
}

const DetailModal: FC<Props> = ({ trigger, detail = {} as ReallocateRecord, disabled }) => {
	const { fields } = useModel('fieldsMapping');
	const [visible, setVisible] = useState<boolean>(false);
	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [dataSource, setDataSource] = useState<ReallocateDetailRecord[]>([]);
	const accessName = accessNameMap(); // 权限名称

	const getDetail = useCallback(async () => {
		if (loading) {
			return;
		}
		setLoading(true);
		try {
			const res = await queryDetail({ storageReallocateId: detail.id });
			if (res.code === 0) {
				setIsLoaded(true);
				setDataSource(res.data || []);
			}
		} finally {
			setLoading(false);
		}
	}, [detail.id]);

	useEffect(() => {
		if (visible && !isLoaded && detail.id) {
			getDetail();
		}
	}, [visible, detail.id, isLoaded]);

	const columns: ProColumns<ReallocateDetailRecord>[] = useMemo(
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
							dataIndex: 'code',
							title: fields.goodsCode,
							width: 'L',
						},
						{
							dataIndex: 'relationName',
							title: fields.goodsName,
							width: 'L',
						},
						{
							dataIndex: 'commonName',
							title: '通用名称',
							width: 'XL',
						},
						{
							dataIndex: 'specification',
							title: '规格/型号',
							width: 'XL',
							render: (text, record) => {
								return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
							},
						},
						{
							dataIndex: 'manufacturerName',
							title: '生产厂家',
							width: 'XXL',
						},
						{
							dataIndex: 'applyQuantity',
							title: '申请数量',
							width: 'XXS',
						},
						{
							dataIndex: 'reallocateQuantity',
							title: '调拨数量',
							width: 'XXS',
							render: (text, record) => (
								<AllocationDetailModal
									detail={detail}
									rowDetail={record}
									trigger={<a>{text || 0}</a>}
									onVisibleChange={(visible) => {
										setVisible(!visible);
									}}
								/>
							),
						},
						{
							dataIndex: 'applyReason',
							title: '申请事由',
							width: 'XXXL',
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
							dataIndex: 'code',
							title: '医耗套包编号',
							width: 'L',
						},
						{
							dataIndex: 'relationName',
							title: '医耗套包名称',
							width: 'L',
						},
						{
							dataIndex: 'ordinaryDescription',
							title: '医耗套包说明',
							width: 'XXXL',
						},
						{
							dataIndex: 'applyQuantity',
							title: '申请数量',
							width: 'XXS',
						},
						{
							dataIndex: 'reallocateQuantity',
							title: '调拨数量',
							width: 'XXS',
							render: (text, record) => (
								<AllocationDetailModal
									rowDetail={record}
									detail={detail}
									trigger={<a>{text || 0}</a>}
									onVisibleChange={(visible) => {
										setVisible(!visible);
									}}
								/>
							),
						},
						{
							dataIndex: 'applyReason',
							title: '申请事由',
							width: 'XXXL',
						},
				  ],
		[detail],
	);

	return (
		<>
			{cloneElement(trigger, {
				onClick: () => {
					if (disabled) {
						return;
					}
					setVisible(true);
				},
			})}
			<Modal
				title={accessName['allocation_handle_detail']}
				visible={visible}
				onCancel={() => setVisible(false)}
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
				<ProTable<ReallocateDetailRecord>
					headerTitle={detail.goodsType === 1 ? fields.baseGoods : '医耗套包'}
					pagination={false}
					scroll={{ y: 300 }}
					columns={columns}
					options={{
						setting: false,
						density: false,
					}}
					dataSource={dataSource}
				/>
			</Modal>
		</>
	);
};

export default DetailModal;
