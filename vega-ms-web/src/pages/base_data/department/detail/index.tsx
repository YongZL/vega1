import { Card, Row } from 'antd';
import React, { useState, useEffect } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import moment from 'moment';
import { detailInfo } from '@/services/department';
import Descriptions, { DescriptionsItemProps } from '@/components/Descriptions';
import { onContent } from '@/config';
import { match } from 'react-router';

const DetailWrap: React.FC<{ match: match<{ id: string }> }> = (props) => {
	const [detail, setDetail] = useState<Record<string, any>>({});

	// 列表
	const getDetailInfo = async () => {
		const res = await detailInfo(props.match.params.id);
		if (res && res.code === 0) {
			setDetail(res.data);
		}
	};

	useEffect(() => {
		getDetailInfo();
	}, []);

	interface DataItem {
		name?: string;
		hospitalCampusName?: string;
		mergeName?: string;
		address?: string;
		contactName?: string;
		contactPhone?: string;
		timeCreated?: string | number;
		remark?: string;
	}

	const options: DescriptionsItemProps<DataItem>[] = [
		{
			label: '科室名称',
			dataIndex: 'name',
		},
		{
			label: '所属院区',
			dataIndex: 'hospitalCampusName',
		},
		{
			label: '所在区域',
			dataIndex: 'mergeName',
		},
		{
			label: '地址',
			dataIndex: 'address',
		},
		{
			label: '联系人员姓名',
			dataIndex: 'contactName',
		},
		{
			label: '联系人员电话',
			dataIndex: 'contactPhone',
		},
		{
			label: '创建时间',
			dataIndex: 'timeCreated',
			render: (timeCreated) =>
				timeCreated ? moment(timeCreated).format('YYYY/MM/DD  HH:mm:ss') : '-',
		},
		{
			label: '备注',
			dataIndex: 'remark',
		},
	];

	return (
		<div className='detail-page'>
			<div className='detail-breadcrumb'>
				<Breadcrumb config={['', ['', '/base_data/department'], '']} />
			</div>
			<Card
				bordered={false}
				className='mb6 card-mt2'>
				<div className='details'>
					<Row>
						<h3 className='detail_title'>详细信息</h3>
						<Descriptions<DataItem>
							options={options}
							data={detail}
							optionEmptyText={onContent}
						/>
					</Row>
				</div>
			</Card>
		</div>
	);
};

export default DetailWrap;
