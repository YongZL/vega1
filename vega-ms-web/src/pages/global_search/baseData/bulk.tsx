import { Card, Descriptions, Spin, Statistic } from 'antd';
import { connect, history, useModel } from 'umi';
import Modal from './modal/index';

import commonStyles from '@/assets/style/common.less';
import { goodsItemStatusTextMap } from '@/constants/dictionary';
import styles from '../style.less';

const BulkSearch = ({ dispatch, global, pageData }) => {
	const { fields } = useModel('fieldsMapping');
	const { details, loading, keywords } = pageData;
	const { packageBulkDetails } = details;
	const linkTo = (url: any, code: any, type = undefined) => {
		dispatch({
			type: 'global/updateLinkKeys',
			payload: code,
		});
		history.push(`${url}?search_link`);
	};
	const isEmpty = (obj: any) => {
		if (obj && JSON.stringify(obj) !== '{}') {
			return true;
		} else {
			return false;
		}
	};
	return (
		<div
			id='wrap'
			className={styles.globalSearch}
			key={keywords}>
			<div className={commonStyles.pageHeader}>搜索结果 与“{keywords}”相关结果</div>
			<Spin spinning={loading}>
				<div className={commonStyles.pageHeaderWrapper}>
					{isEmpty(packageBulkDetails) && (
						<Card
							title={
								<div className={styles.goodsTitle}>
									<div
										className={styles.handleLink}
										onClick={() => linkTo('/base_data/bulk', packageBulkDetails.packageId)}>
										{packageBulkDetails.name}
									</div>
								</div>
							}
							bordered={false}
							className='mb2'>
							<div className='modelInfo'>
								<div className='left'>
									<Descriptions column={3}>
										<Descriptions.Item label={`${fields.goods}条码`}>
											{packageBulkDetails.operatorBarcode}
										</Descriptions.Item>
										<Descriptions.Item label={fields.goodsName}>
											{packageBulkDetails.goodsName}
										</Descriptions.Item>
										<Descriptions.Item label={`单${fields.goodsCode}`}>
											{packageBulkDetails.goodsMaterialCode}
										</Descriptions.Item>
										<Descriptions.Item label='规格'>
											{packageBulkDetails.specification}
										</Descriptions.Item>
										<Descriptions.Item label='型号'>
											{packageBulkDetails.model || '-'}
										</Descriptions.Item>
										<Descriptions.Item label='包装数'>
											{packageBulkDetails.minGoodsUnit
												? `${packageBulkDetails.quantity}${packageBulkDetails.minGoodsUnit}/包`
												: '-'}
										</Descriptions.Item>
									</Descriptions>
								</div>
								<div>
									<Statistic
										title='当前状态'
										value={packageBulkDetails.departmentName}
										valueStyle={{ fontSize: 20 }}
									/>
									<Statistic
										title=''
										value={goodsItemStatusTextMap[packageBulkDetails.status] || '-'}
										valueStyle={{ fontSize: 20 }}
									/>
								</div>
							</div>
						</Card>
					)}
					<Modal
						dispatch={dispatch}
						details={details}
						type='bulk'
						isEmpty={isEmpty}
					/>
				</div>
			</Spin>
		</div>
	);
};

export default connect(({ global }) => ({ global }))(BulkSearch);
