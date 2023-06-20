import Breadcrumb from '@/components/Breadcrumb';
import { Card, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { history } from 'umi';
const { TabPane } = Tabs;

//name；Tab页名称、pageType：判断是查询还是处理界面、permissions:权限编码、Tab：组件
//config:面包屑字段
export type TabType = {
	name: string;
	key: string;
	pageType?: string;
	permissions?: string;
	Tab: any;
	tabProps?: Record<string, any>;
};
export type PropsType = {
	tabsList: TabType[];
	config: string[];
	match?: any;
};

const TabsMax: React.FC<PropsType> = ({ ...props }) => {
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const { tabsList, config } = props;
	const [newArr, setNewArr] = useState<TabType[]>([]);
	// 删除传递过来没有权限的tab

	useEffect(() => {
		tabsList.forEach((item: any, index: number) => {
			if (item.permissions && !permissions.includes(item.permissions)) {
				setNewArr(tabsList.filter((e) => e.key !== item.key));
			} else {
				setNewArr(tabsList);
			}
		});
	}, [tabsList]);

	//默认选中
	let defaultActiveTab = newArr[0]?.key;

	//目前选中的Tab页
	const [activeTab, setActiveTab] = useState(
		history.location.state && (history.location.state as { key: string }).key
			? (history.location.state as { key: string }).key
			: defaultActiveTab,
	);
	const handleTabChange = (key: string) => {
		setActiveTab(key);
		//把url的所有参数重置
		const pathName = history.location.pathname.split('/');
		history.replace({
			...history.location,
			pathname: pathName
				.slice(1, pathName.length - 2)
				.map((item) => '/' + item)
				.join(''),
			state: {
				...history.location.state,
				key,
				status: undefined,
				code: undefined,
				//为解决报表工具 清空点击行时切换tab代入的参数
				tableParams: undefined,
			},
			query: {},
			search: '',
		});
	};
	//当layout头部全局搜索变化的时候更新key
	useEffect(() => {
		if (history.location.state) {
			setActiveTab(
				(history.location.state as { key: string }).key
					? (history.location.state as { key: string }).key
					: defaultActiveTab,
			);
		}
	}, [history.location.state && (history.location.state as { key: string }).key]);

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={config} />
			</div>
			<Card bordered={false}>
				{(newArr || []).length > 1 ? (
					<Tabs
						activeKey={activeTab}
						onChange={handleTabChange}>
						{(newArr || []).map(
							(item) =>
								(!item.permissions || permissions.includes(item.permissions)) && (
									<TabPane
										tab={item.name}
										key={item.key}>
										<item.Tab
											match={props.match}
											pageType={item.pageType}
											activeKey={item.key}
											{...(item.tabProps || {})}
										/>
									</TabPane>
								),
						)}
					</Tabs>
				) : (
					(newArr || []).map(
						(item) =>
							(!item.permissions || permissions.includes(item.permissions)) && (
								<item.Tab
									match={props.match}
									pageType={item.pageType}
									activeKey={item.key}
									{...(item.tabProps || {})}
								/>
							),
					)
				)}
			</Card>
		</div>
	);
};

export default TabsMax;
