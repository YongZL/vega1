import { Card } from 'antd';
import moment from 'moment';
import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import Descriptions from '@/components/Descriptions';
import { getWarehouseDetail } from '@/services/warehouse';
import type { DescriptionsItemProps } from '@/components/Descriptions/typings';

type Match = {
	params: { id: number };
};

type DataItem = WarehouseController.WarehouseDetailItem;

const Detail: React.FC<{ match?: Match }> = ({ match }) => {
	const id = match?.params?.id;
	const [data, setData] = useState<DataItem>({} as DataItem);
	const getDetail = async (id: number) => {
		const res = await getWarehouseDetail(id);
		if (res && res.code === 0) {
			setData(res.data);
		}
	};

	useEffect(() => {
		getDetail(id as number);
	}, [id]);

	const options: DescriptionsItemProps<DataItem>[] = [
		{
			label: '仓库名称',
			dataIndex: 'name',
		},
		{
			label: '所属科室',
			dataIndex: 'departmentName',
		},
		{
			label: '仓库类型',
			dataIndex: 'level',
			render: (level) => (level === 0 ? '中心仓库' : '二级仓库'),
		},
		{
			label: '是否为虚拟库',
			dataIndex: 'isVirtual',
			render: (isVirtual) => (isVirtual === 0 ? '是' : '否'),
		},
		{
			label: '推送组别',
			dataIndex: 'deliveryGroupName',
		},
		{
			label: '推送优先级别',
			dataIndex: 'priority',
		},
		{
			label: 'ePS仓库编号',
			show: WEB_PLATFORM === 'DS',
			dataIndex: 'epsWarehouseCode',
		},
		{
			label: '平台仓库码',
			show: WEB_PLATFORM === 'DS',
			dataIndex: 'platformCode',
		},
		{
			label: '创建时间',
			dataIndex: 'timeCreated',
			render: (timeCreated) =>
				timeCreated ? moment(timeCreated).format('YYYY/MM/DD  HH:mm:ss') : '-',
		},
	];

	return (
		<div className='detail-page'>
			<div className='detail-breadcrumb'>
				<Breadcrumb
					config={['', ['', { pathname: '/base_data/warehouse', state: 'warehouse' }], '']}
				/>
			</div>

			<Card className='mb6 card-mt2'>
				<Descriptions<DataItem>
					options={options}
					data={data}
				/>
			</Card>
		</div>
	);
};

export default Detail;
