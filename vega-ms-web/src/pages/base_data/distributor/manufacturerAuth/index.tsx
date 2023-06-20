import Breadcrumb from '@/components/Breadcrumb';
import { Card, Tabs } from 'antd';
import React, { useState } from 'react';
import { useAccess, useModel } from 'umi';
import GoodsTicket from './components/GoodsTicketList';
import Manufacturer from './components/ManufacturerList';

const TabPane = Tabs.TabPane;
// 生产厂家授权
const manufacturerAuth: React.FC<{}> = ({ match }: Record<string, any>) => {
	const { fields } = useModel('fieldsMapping');
	const { id, companyName } = match.params;
	const access = useAccess();

	// tab配置
	const tabs = [];
	if (access['manufacturer_authorization_list']) {
		tabs.push({ name: '厂家授权', key: 'authManufacturer', component: Manufacturer });
	}
	if (access['invoice_sync_list']) {
		tabs.push({
			name: fields.baseGoods + '货票同行结算设置',
			key: 'goodsTicket',
			component: GoodsTicket,
		});
	}

	const [currentTabKey, setCurrentTabKey] = useState('authManufacturer');

	const handleTabSwitch = (key: string) => setCurrentTabKey(key);

	const TabPaneList = tabs.map((tab) => {
		return (
			<TabPane
				tab={tab.name}
				key={tab.key}>
				<tab.component
					id={id}
					companyName={companyName}
				/>
			</TabPane>
		);
	});

	return (
		<div className='main-page'>
			<Breadcrumb
				config={[
					'',
					[``, { pathname: '/base_data/distributor', state: 'distributor' }],
					` - ${companyName}`,
				]}
			/>

			<Card bordered={false}>
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
						tabs.map((tab) => (
							<tab.component
								id={id}
								companyName={companyName}
							/>
						))
					)}
				</div>
			</Card>
		</div>
	);
};

export default manufacturerAuth;
