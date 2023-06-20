import Breadcrumb from '@/components/Breadcrumb';
import { Card, Tabs } from 'antd';
import React, { useState } from 'react';
import { useAccess } from 'umi';
import AuthAssociation from './components/DistributorList';

const TabPane = Tabs.TabPane;
const distributorAuth: React.FC<{}> = ({ match }: Record<string, any>) => {
	const { id, companyName } = match.params;
	const access = useAccess();
	const [currentTabKey, setCurrentTabKey] = useState('authCustodian');

	// tab配置
	const tabs = [];
	if (access['distributor_authorization_list']) {
		tabs.push({
			name: '授权关系管理',
			key: 'authCustodian',
			passive: false,
			component: AuthAssociation,
		});
	}
	if (access['passive_distributor_authorization_list']) {
		tabs.push({
			name: '被授权关系管理',
			key: 'passiveAuthCustodian',
			passive: true,
			component: AuthAssociation,
		});
	}

	const handleTabSwitch = (key: string) => setCurrentTabKey(key);

	const TabPaneList = tabs.map((tab: Record<string, any>) => {
		return (
			<TabPane
				tab={tab.name}
				key={tab.key}>
				<tab.component
					id={id}
					passive={tab.passive}
					companyName={companyName}
				/>
			</TabPane>
		);
	});

	return (
		<div className='main-page'>
			<div style={{ background: CONFIG_LESS['@bgc_table'] }}>
				<Breadcrumb
					config={[
						'',
						[``, { pathname: '/base_data/distributor', state: 'distributor' }],
						` - ${companyName}`,
					]}
				/>
			</div>
			<Card
				bordered={false}
				style={{ marginTop: 2 }}>
				<div className='wrapper'>
					{TabPaneList.length !== 1 ? (
						<Tabs
							className='tabBar'
							defaultActiveKey='info'
							activeKey={currentTabKey}
							onChange={handleTabSwitch}
							style={{ overflow: 'inherit', width: '100%' }} // 解决表头筛选下拉遮挡
						>
							{TabPaneList}
						</Tabs>
					) : (
						tabs.map((tab: Record<string, any>) => (
							<tab.component
								id={id}
								passive={tab.passive}
								companyName={companyName}
							/>
						))
					)}
				</div>
			</Card>
		</div>
	);
};

export default distributorAuth;
