import Breadcrumb from '@/components/Breadcrumb';
import { Card, Tabs } from 'antd';
import React, { useState } from 'react';
import { useModel } from 'umi';
import CompanyInfo from './components/CompanyInfo';

const TabPane = Tabs.TabPane;
const DetailPage: React.FC<{}> = ({ match }: Record<string, any>) => {
	const { id, companyName } = match.params;
	const { fields } = useModel('fieldsMapping');

	// tab配置
	const tabs = [{ name: `${fields.distributor}信息`, key: 'info', component: CompanyInfo }];
	const [currentTabKey, setCurrentTabKey] = useState('info');

	const handleTabSwitch = (key: string) => setCurrentTabKey(key);

	const TabPaneList = tabs.map((tab) => {
		return (
			<TabPane
				tab={tab.name}
				key={tab.key}>
				<tab.component id={id} />
			</TabPane>
		);
	});
	return (
		<div style={{ margin: '-20px -24px' }}>
			<div style={{ padding: '8px 24px', background: '#fff', marginBottom: 1 }}>
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
				className='distributormidcard-body'>
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
						tabs.map((tab) => <tab.component id={id} />)
					)}
				</div>
			</Card>
		</div>
	);
};

export default DetailPage;
