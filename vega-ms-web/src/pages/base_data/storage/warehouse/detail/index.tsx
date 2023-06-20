import Breadcrumb from '@/components/Breadcrumb';
import Descriptions from '@/components/Descriptions';
import type { DescriptionsItemProps } from '@/components/Descriptions/typings';
import { getDetail } from '@/services/storageAreas';
import { getStatus } from '@/utils/dataUtil';
import { Card, Spin } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
interface Props {
	match: {
		params: {
			id: string;
		};
	};
}
const DetailWrap: React.FC<Props> = (props) => {
	const { fields } = useModel('fieldsMapping');
	const dictionary = JSON.parse(sessionStorage.getItem('dictionary') || '{}');
	const [loading, setLoading] = useState<boolean>(false);
	const [detaildata, setDetaildata] = useState<StorageAreasController.GetDetailRuleParams>({});
	const getDetailInfo = async () => {
		if (loading) {
			return;
		}
		setLoading(true);
		try {
			const res = await getDetail(props.match.params.id);
			if (res && res.code === 0) {
				setDetaildata(res.data || {});
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getDetailInfo();
	}, []);
	const options: DescriptionsItemProps<StorageAreasController.GetDetailRuleParams>[] = [
		{
			label: '库房名称',
			dataIndex: 'name',
		},
		{
			label: '所属仓库',
			dataIndex: 'warehouseName',
		},
		{
			label: '库房类型',
			dataIndex: 'storageAreaType',
			render: (text, detaildata) =>
				getStatus(dictionary.storage_area_type, detaildata.storageAreaType).text || '-',
		},
		{
			label: '库房编码',
			dataIndex: 'code',
		},
		{
			label: '联系人员',
			dataIndex: 'contact',
		},
		{
			label: '联系电话',
			dataIndex: 'phone',
		},
		{
			label: '所属地区',
			dataIndex: 'mergerName',
		},
		{
			label: '详情地址',
			dataIndex: 'address',
		},
		{
			label: '是否含有智能货架',
			dataIndex: 'hasSmartCabinet',
			render: (detaildata) => (detaildata ? '是' : '否'),
		},
		{
			label: `是否支持高值${fields.goods}`,
			dataIndex: 'highValueSupported',
			render: (detaildata) => (detaildata ? '是' : '否'),
		},
		{
			label: `是否支持低值${fields.goods}`,
			dataIndex: 'lowValueSupported',
			render: (detaildata) => (detaildata ? '是' : '否'),
		},
		{
			label: '创建时间',
			dataIndex: 'timeCreated',
			render: (text, detaildata) =>
				detaildata.timeCreated
					? moment(detaildata.timeCreated).format('YYYY/MM/DD  HH:mm:ss')
					: '-',
		},
		{
			label: '是否收货库房',
			dataIndex: 'receivedGoods',
			render: (text, detaildata) =>
				detaildata.receivedGoods === null ? '-' : detaildata.receivedGoods ? '是' : '否',
		},
		{
			label: '推送优先级',
			dataIndex: 'priorityLevel',
			render: (text, detaildata) => `${detaildata.priorityLevel || 0}`,
		},
		{
			label: '备注',
			dataIndex: 'remark',
		},
	];
	return (
		<div className='detail-page'>
			<Spin spinning={loading}>
				<div className='detail-breadcrumb'>
					<Breadcrumb
						config={[
							'',
							['', { pathname: '/base_data/storage', state: { key: '1' } }],
							['', { pathname: '/base_data/storage', state: { key: '1' } }],
							'',
						]}
					/>
				</div>
				<Card
					bordered={false}
					className='mb6 card-mt2'>
					<h3
						className='detail_title'
						style={{ fontWeight: 700 }}>
						基本信息
					</h3>
					<Descriptions<StorageAreasController.GetDetailRuleParams>
						options={options}
						data={detaildata}
						optionEmptyText={'-'}
					/>
				</Card>
			</Spin>
		</div>
	);
};

export default DetailWrap;
