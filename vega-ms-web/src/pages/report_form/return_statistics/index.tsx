/**
 *  退货统计页面
 */

import Page from '@/components/Page';
import styles from '@/components/Page/index.less';
import useMonthFiilter from '@/hooks/useMonthFilter';
import BarOfReturnResponseTimeLimit from '../components/Bar2/Smart';

const Index = (props) => {
	/* ========== 解构 Props 👇 ========== */

	// 权限数据
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');

	/* ========== Helper 👇 ========== */

	// P是数组 ["supplier", "hospital", "custodian", "operator", "equipment"] 的子集
	const P = getPermission(permissions);

	// CP for 'compute permission'
	const CP = (list) => list.some((e) => P.includes(e));

	/* ========== Hooks 👇 ========== */

	// 月份选择器
	const { FilterUI, time, selectedMonth } = useMonthFiilter();

	/* ========== Render Condition 👇 ========== */

	const flag = P.length > 0;
	return (
		flag && (
			<Page
				breadList={['报表', '退货统计']}
				bodyStyle={{ background: CONFIG_LESS['@bgc_title'] }}
				mid={FilterUI}>
				<div className={styles.col}>
					{/* 退货响应时效 */}
					{CP(['return_statistics_view']) && (
						<BarOfReturnResponseTimeLimit
							title={selectedMonth + '月科室退货响应时效'}
							params={{ target: time }}
						/>
					)}
				</div>
				<div className={styles.col}></div>
			</Page>
		)
	);
};

function getPermission(permissions) {
	return permissions.filter((p) => ['return_statistics_view'].includes(p));
}

export default Index;
