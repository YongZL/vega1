import Descriptions from '@/components/Descriptions';
import type { DescriptionsItemProps } from '@/components/Descriptions/typings';
import { approvaStatus } from '@/constants/dictionary';
import { Button, Col, Row, Statistic } from 'antd';
import moment from 'moment';
import { history, useAccess } from 'umi';

type PropsItem = {
	goodsType: string;
	tableData: Record<string, any>;
	detail: Record<string, any>;
	modalType: string;
};

const InfoDetail: React.FC<PropsItem> = ({ detail, goodsType, tableData, modalType }) => {
	const access = useAccess();
	let ordinaryItem = tableData?.ordinaryRequestItem;

	const options: DescriptionsItemProps[] = [
		{
			label: '申请单号',
			dataIndex: 'code',
		},
		{
			label: '科室',
			dataIndex: 'departmentName',
		},
		{
			label: '仓库',
			dataIndex: 'warehouseName',
		},
		{
			label: '申请人员',
			dataIndex: 'createdByName',
		},
		{
			label: '申请时间',
			dataIndex: 'requestTime',
			show: goodsType == 'ordinary',
			render: (text) => {
				let time = ordinaryItem?.requestTime;
				return time ? moment(new Date(Number(time))).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			label: '申请类型',
			dataIndex: 'type',
			show: goodsType == 'ordinary',
			render: (text) => <span>医耗套包</span>,
		},
		{
			label: '审核人员',
			dataIndex: 'approvalByName',
		},
		{
			label: '审核时间',
			dataIndex: 'approvalTime',
			render: (text) => (
				<span>{text ? moment(new Date(text)).format('YYYY/MM/DD HH:mm:ss') : '-'}</span>
			),
		},
		{
			label: '复核人员',
			dataIndex: 'approvalReviewByName',
		},
		{
			label: '复核时间',
			dataIndex: 'approvalReviewTime',
			render: (text) => (
				<span>{text ? moment(new Date(text)).format('YYYY/MM/DD HH:mm:ss') : '-'}</span>
			),
		},
		{
			show: ['approval_review_failure', 'approval_failure'].includes(detail?.status),
			label: '不通过原因',
			dataIndex: 'reason',
		},
	];

	return (
		<Row className='detailsBorder four'>
			<Col className='left'>
				<Descriptions
					options={options}
					defaultColumn={4}
					minColumn={3}
					data={detail || {}}
					optionEmptyText='-'
				/>
			</Col>
			<Col className='right'>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<Statistic
						title='当前状态'
						value={detail?.status ? approvaStatus[detail?.status].text : '-'}
					/>
					{access.apply_edit_warehousing_apply && modalType === 'review' && (
						<div style={{ textAlign: 'end' }}>
							<Button
								type='primary'
								onClick={() => {
									history.push(
										`warehousing_apply/edit/${detail.id}/${detail.targetWarehouseId}/${detail.sourceWarehouseId}`,
									);
								}}
								className='iconButton'>
								申请编辑
							</Button>
						</div>
					)}
				</div>
			</Col>
		</Row>
	);
};

export default InfoDetail;
