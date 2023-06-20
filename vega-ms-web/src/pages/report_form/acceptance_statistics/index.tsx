/**
 *  验收统计页面
 */

import Page from '@/components/Page';
import styles from '@/components/Page/index.less';
import useMonthFiilter from '@/hooks/useMonthFilter';
import { useModel } from 'umi';
import TimeConsumeDepartment from '../components/time_consume_department';
import TimeConsumeSupplier from '../components/time_consume_supplier';
import TimeConsumeWarehouse from '../components/time_consume_warehouse';

const Index = (props) => {
	const { fields } = useModel('fieldsMapping');

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
				breadList={['报表', '验收统计']}
				bodyStyle={{ background: CONFIG_LESS['@bgc_title'] }}
				mid={FilterUI}>
				<div className={styles.col}>
					{CP(['acceptance_statistics_view']) && (
						<TimeConsumeDepartment
							title={selectedMonth + '月科室请领响应时效'}
							params={{ target: time }}
						/>
					)}
					{CP(['acceptance_statistics_view']) && (
						<TimeConsumeWarehouse
							title={selectedMonth + '月仓库人员配送时效'}
							params={{ target: time }}
						/>
					)}
				</div>
				<div className={styles.col}>
					{CP(['acceptance_statistics_view']) && (
						<TimeConsumeSupplier
							title={selectedMonth + `月${fields.distributor}验货响应时效`}
							params={{ target: time }}
						/>
					)}
				</div>
			</Page>
		)
	);
};

function getPermission(permissions) {
	return permissions.filter((p) => ['acceptance_statistics_view'].includes(p));
}

export default Index;
