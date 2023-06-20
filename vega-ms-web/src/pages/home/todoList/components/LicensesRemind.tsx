import { getLicenseRemindList, getRegisterRemindList } from '@/services/gsp';
import { Badge, Card, List, Tabs, Tooltip } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import styles from '../index.less';

const TabPane = Tabs.TabPane;
const LicensesRemind = () => {
	const [companyData, setCompanyData] = useState<GSPController.LicenseRemindListRecord[]>([]);
	const [registerData, setRegisterData] = useState<GSPController.RegisterRemindListRecord[]>([]);

	//  获取企业证照
	const getCompanyData = async () => {
		const res = await getLicenseRemindList();
		if (res.code === 0) {
			setCompanyData(res.data || []);
		}
	};

	//  获取企业证照
	const getRegisterData = async () => {
		const res = await getRegisterRemindList();
		if (res.code === 0) {
			setRegisterData(res.data || []);
		}
	};

	useEffect(() => {
		getCompanyData();
		getRegisterData();
	}, []);

	return (
		<Card
			title='GSP证照提醒'
			bordered={false}
			className={styles.homeCard}
			style={{ width: '100%' }}>
			<Tabs>
				<TabPane
					tab={
						<Badge
							count={registerData.length}
							dot>
							产品注册证
						</Badge>
					}
					key='1'>
					<List
						dataSource={registerData}
						renderItem={(item) => (
							<List.Item>
								<List.Item.Meta
									description={<span>{`${item.goodsName} (${item.materialCode})`}</span>}
								/>
								<div>
									<Tooltip
										placement='topRight'
										title={`${moment(Number(item.licenseBeginTime)).format('YYYY/MM/DD')}~${
											item.licenseEndTime
												? moment(Number(item.licenseEndTime)).format('YYYY/MM/DD')
												: ''
										}`}>
										{item.remainDay > 0 ? (
											<span style={{ color: CONFIG_LESS['@c_starus_underway'] }}>即将过期</span>
										) : (
											<span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>已过期</span>
										)}
									</Tooltip>
								</div>
							</List.Item>
						)}
					/>
				</TabPane>
				<TabPane
					tab={
						<Badge
							count={companyData.length}
							dot>
							企业证照
						</Badge>
					}
					key='2'>
					<List
						dataSource={companyData}
						renderItem={(item) => (
							<List.Item>
								<List.Item.Meta
									description={<span>{`[${item.companyType}] ${item.companyName}`}</span>}
								/>
								<div>
									<Tooltip
										placement='topRight'
										title={`${moment(Number(item.licenseBeginTime)).format('YYYY/MM/DD')}~${
											item.licenseEndTime
												? moment(Number(item.licenseEndTime)).format('YYYY/MM/DD')
												: ''
										}`}>
										{item.remainDay > 0 ? (
											<span style={{ color: CONFIG_LESS['@c_starus_underway'] }}>
												即将过期{` [${item.gspType}]`}
											</span>
										) : (
											<span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>
												已过期{` [${item.gspType}]`}
											</span>
										)}
									</Tooltip>
								</div>
							</List.Item>
						)}
					/>
				</TabPane>
			</Tabs>
		</Card>
	);
};

export default LicensesRemind;
