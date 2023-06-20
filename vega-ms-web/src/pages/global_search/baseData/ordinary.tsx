import TableBox from '@/components/TableBox';
import { Card, Descriptions, Divider, Spin, Statistic } from 'antd';
import { connect, history, useModel } from 'umi';
import Modal from './modal/index';

import commonStyles from '@/assets/style/common.less';
import { goodsItemStatusTextMap } from '@/constants/dictionary';
import styles from '../style.less';
import { formatStrConnect } from '@/utils/format';

const OrdinarySearch = ({ dispatch, pageData }) => {
	const { fields } = useModel('fieldsMapping');

	const { details, loading, keywords } = pageData;
	const { ordinaryDetails } = details;
	const isEmpty = (obj: any) => {
		if (obj && JSON.stringify(obj) !== '{}') {
			return true;
		} else {
			return false;
		}
	};

	const linkTo = (url: any, id: any, type = undefined) => {
		// dispatch({
		//   type: 'global/updateLinkKeys',
		//   payload: code,
		// });
		console.log('codecode', id);

		history.push({ pathname: `${url}`, state: { id } });
		// history.push(`${url}?search_link`);
	};

	let columns = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 60,
			align: 'center',
			render: (text: any, record: any, index: any) => index + 1,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 140,
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			key: 'name',
			width: 100,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 150,
			ellipsis: true,
			render: (text: any, record: Record<string, any>) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '包装规格',
			width: 120,
			dataIndex: 'unitNum',
			key: 'unitNum',
			render: (unitNum, record) => {
				return <span>{`${unitNum} ${record.minGoodsUnit}/${record.purchaseGoodsUnit}`}</span>;
			},
		},

		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 80,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 140,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 180,
		},
	];

	return (
		<div
			id='wrap'
			className={styles.globalSearch}>
			<div className={commonStyles.pageHeader}>搜索结果 与“{keywords}”相关结果1</div>
			<Spin spinning={loading}>
				<div className={commonStyles.pageHeaderWrapper}>
					{ordinaryDetails &&
						isEmpty(details) &&
						isEmpty(ordinaryDetails) &&
						isEmpty(ordinaryDetails.ordinaryResultDto) && (
							<Card
								title={
									<div className={styles.goodsTitle}>
										<div
											className={styles.handleLink}
											onClick={() =>
												linkTo('/base_data/ordinary', ordinaryDetails.ordinaryResultDto.id)
											}>
											{ordinaryDetails.ordinaryResultDto.name}
										</div>
									</div>
								}
								bordered={false}
								className='mb2'>
								<div className='modelInfo'>
									<div className='left'>
										<Descriptions column={3}>
											<Descriptions.Item label={`${fields.goods}条码`}>
												{ordinaryDetails.ordinaryResultDto.operatorBarcode}
											</Descriptions.Item>
											<Descriptions.Item label='医耗套包说明'>
												{ordinaryDetails.ordinaryResultDto.detailGoodsMessage}
											</Descriptions.Item>
										</Descriptions>
									</div>
									<div>
										<Statistic
											title='当前状态'
											value={details.ordinaryItem.departmentName}
											valueStyle={{ fontSize: 20 }}
										/>
										<Statistic
											value={
												goodsItemStatusTextMap[ordinaryDetails.ordinaryResultDto.status] || '-'
											}
											valueStyle={{ fontSize: 20 }}
										/>
									</div>
								</div>
								<Divider />
								<h3 className='ant-descriptions-title'>医耗套包内容</h3>
								<TableBox
									headerTitle=''
									tableInfoId='239'
									rowKey='id'
									columns={columns}
									dataSource={ordinaryDetails.ordinaryGoods}
									scroll={{
										x: '100%',
										y: 300,
									}}
								/>
							</Card>
						)}
					<Modal
						dispatch={dispatch}
						details={details}
						type='ordinary'
						isEmpty={isEmpty}
					/>
				</div>
			</Spin>
		</div>
	);
};

export default connect(({ global }) => ({ global }))(OrdinarySearch);
