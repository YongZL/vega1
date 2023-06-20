import { Card, Tabs } from 'antd';
import React, { useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import CommonList from './components/CommonList';

const TabPane = Tabs.TabPane;
const InvoicingList: React.FC<{}> = () => {
	const [activeTab, setActiveTab] = useState('repository');

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<Card bordered={false}>
				<Tabs
					activeKey={activeTab}
					onChange={(key) => setActiveTab(key)}>
					<TabPane
						key='repository'
						tab='中心库'>
						<CommonList type='repository' />
					</TabPane>
					<TabPane
						key='department'
						tab='科室库'>
						<CommonList type='department' />
					</TabPane>
				</Tabs>
			</Card>
		</div>
	);
};

export default InvoicingList;
