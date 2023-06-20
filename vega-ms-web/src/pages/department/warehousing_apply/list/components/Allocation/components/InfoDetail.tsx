import Descriptions from '@/components/Descriptions';
import type { DescriptionsItemProps } from '@/components/Descriptions/typings';
import { reallocationStatusTextMap } from '@/constants/dictionary';
import { Col, Row, Statistic } from 'antd';
import moment from 'moment';
type PropsItem = {
	detail: Record<string, any>;
};

const InfoDetail: React.FC<PropsItem> = ({ detail }) => {
	const options: DescriptionsItemProps[] = [
		{
			label: '调拨单号',
			dataIndex: 'code',
		},
		{
			label: '发起科室',
			dataIndex: 'sourceDepartmentName',
		},
		{
			label: '发起仓库',
			dataIndex: 'sourceWarehouseName',
		},
		{
			label: '接收科室',
			dataIndex: 'targetDepartmentName',
		},
		{
			label: '接收仓库',
			dataIndex: 'targetWarehouseName',
		},
		{
			label: '审核人员',
			dataIndex: 'approvedName',
		},
		{
			label: '审核时间',
			dataIndex: 'timeApproved',
			render: (text) => (
				<span>{text ? moment(new Date(text)).format('YYYY/MM/DD HH:mm:ss') : '-'}</span>
			),
		},
		{
			label: '不通过原因',
			dataIndex: 'approvedReason',
		},
	];

	return (
		<Row className='detailsBorder five'>
			<Col className='left'>
				<Descriptions
					options={options}
					data={detail || {}}
					optionEmptyText='-'
				/>
			</Col>
			<Col className='right'>
				<Statistic
					title='当前状态'
					value={detail.status ? reallocationStatusTextMap[detail.status] : '-'}
				/>
			</Col>
		</Row>
	);
};

export default InfoDetail;
