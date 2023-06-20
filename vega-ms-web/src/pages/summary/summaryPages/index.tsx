// 报表业务 => 动态生成的报表工具页面
import TabsMax, { TabType } from '@/components/TabsMax';
import { getAllStatistic } from '@/services/statistic';
import { useEffect, useState } from 'react';
import PageTable from './components/PageTable';

const Tabs = ({ match }: { match: { path: string } }) => {
	const [tabsList, setTabsList] = useState<TabType[]>([]);

	useEffect(() => {
		const allStatistic = async () => {
			try {
				const allStatisticRes = await getAllStatistic();

				if (allStatisticRes.code === 0) {
					let moduleName = '';
					let statistic = allStatisticRes.data.filter(
						(item) => item.code === match.path.split('/').pop(),
					);

					if (statistic[0].children) {
						moduleName = statistic[0].name;
						statistic = statistic[0].children;
					}

					const tabsList: TabType[] = [];
					statistic.forEach((item) => {
						const { name, id, code, exportCode, printCode, printType } = item;
						const tab = {
							name: name,
							key: String(id),
							permissions: code,
							Tab: PageTable,
							tabProps: {
								code,
								id,
								exportCode,
								printCode,
								printType,
								moduleName,
							},
						};
						tabsList.push(tab);
					});

					setTabsList(tabsList);
				}
			} catch (e) {
				console.log('e', e);
			} finally {
			}
		};
		allStatistic();
	}, [match]);

	const config = ['', ''];
	return (
		<TabsMax
			tabsList={tabsList}
			config={config}
			match={match}
		/>
	);
};

export default Tabs;
