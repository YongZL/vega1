/**
 *  采购统计页面
 */

import Page from '@/components/Page';
import styles from '@/components/Page/index.less';
import useDepartmentFilter from '@/hooks/useDepartmentFilter';
import useMonthFiilter from '@/hooks/useMonthFilter';
import MonthlyOverflow from '../components/monthly_overflow';
import Pie from '../components/Pie/Smart';
import Total from '../components/TotalMoney/index';

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

	const [DepartmentSelectUI, { name, id }] = useDepartmentFilter({
		shouldShowAllOption: CP(['operator', 'equipment']),
	});

	/* ========== Render Condition 👇 ========== */

	const flag = P.length > 0;

	const extra = CP(['hospital', 'equipment', 'operator']) ? DepartmentSelectUI : () => null;

	return (
		flag && (
			<Page
				breadList={['报表', '采购统计']}
				bodyStyle={{ background: CONFIG_LESS['@bgc_bd_title'] }}
				mid={FilterUI}
				extra={extra}>
				<div className={styles.col}>
					{CP(['hospital', 'equipment', 'operator']) && (
						<Total
							title={name + '采购总金额'}
							params={{ target: time, departmentId: id > 0 ? id : undefined }}
							type='department_purchase'
						/>
					)}
					{CP(['purchase_statistics_view']) && (
						<MonthlyOverflow
							title={selectedMonth + '月超过采购基准值的科室'}
							params={{ target: time }}
						/>
					)}
				</div>
				<div className={styles.col}>
					{CP(['purchase_statistics_view']) && (
						<Pie
							title='各科室采购金额占比'
							params={{ target: time }}
							type='purchase'
						/>
					)}
				</div>
			</Page>
		)
	);
};

function getPermission(permissions) {
	let permissionsView = permissions.filter((p) => ['purchase_statistics_view'].includes(p));
	let permissionsRole = permissions
		.filter((p) =>
			[
				'hospital_material_use',
				'operator_material_use',
				'supplier_material_use',
				'custodian_material_use',
				'equipment_material_use',
			].includes(p),
		)
		.map((e) => e.split('_')[0]);
	return permissionsView.concat(permissionsRole);
}

export default Index;
