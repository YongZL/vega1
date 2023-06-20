import Page from '@/components/Page';
import styles from '@/components/Page/index.less';
import useDepartmentFilter from '@/hooks/useDepartmentFilter';
import useMonthFilter from '@/hooks/useMonthFilter';
import { useModel } from 'umi';
import Bar from '../components/Bar/Smart';
import ConsumedRank from '../components/consumed_rank';
import GoodsCompare from '../components/goods_compare';
import GoodsIncrement from '../components/goods_increment';
import GoodsMonthlyGrowth from '../components/goods_monthly_growth';
import GrowthCompare from '../components/growth_compare';
import Pie from '../components/Pie/Smart';
import Total from '../components/TotalMoney/index';

const MaterialUse = (props) => {
	const { fields } = useModel('fieldsMapping');
	/* ========== 解构 Props 👇 ========== */

	// 权限数据c
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');

	/* ========== Helper 👇 ========== */

	// P是数组 ["supplier", "hospital", "custodian", "operator", "equipment"] 的子集
	const P = getPermission(permissions);

	// CP for 'compute permission'
	const CP = (list) => list.some((e) => P.includes(e));

	/* ========== Hooks 👇 ========== */

	// 月份选择器
	// FilterUI => 月份选择器的UI对应的JSX
	// time => 当前选中的日期对应的时间戳
	// selectedMonth => 当前选中的月份
	const { FilterUI, time, selectedMonth } = useMonthFilter();

	// 科室选择器
	// id => 当前科室选择器选中的科室id （正整数代表特定科室, -1代表全院）
	// name => 当前科室选择器选中的科室名称
	// @params { boolean } shouldShowAllOption => 是否显示 '全院选项', 在拥有 operator | equipment 权限的情况下，为 true
	const [DepartmentSelectUI, { name, id }] = useDepartmentFilter({
		shouldShowAllOption: CP(['operator', 'equipment']),
	});

	// 至少具有 hospital | equipment | operator 这三个权限中的一个，才会用到 departmentId
	// 否则 departmentId 为 undefined 值
	const departmentId = CP(['hospital', 'equipment', 'operator']) && id > 0 ? id : undefined;

	/* ========== Render Condition 👇 ========== */

	// 是否为配送商业
	const isSupplier = CP(['supplier']) && !CP(['operator']);

	const flag = P.length > 0 && id !== null;

	/* ========== JSX 👇 ========== */

	const extra = CP(['hospital', 'equipment', 'operator']) ? DepartmentSelectUI : () => null;

	return (
		flag && (
			<Page
				breadList={['报表', '耗材使用']}
				bodyStyle={{ background: CONFIG_LESS['@bgc_title'] }}
				extra={extra}
				mid={FilterUI}>
				<div className={styles.col}>
					{CP(['supplier', 'hospital', 'operator', 'equipment']) && (
						<Total
							title={(isSupplier ? '' : name) + '耗材使用总金额'}
							params={{ target: time, departmentId }}
							type={isSupplier ? 'supplier' : 'department'}
						/>
					)}

					{!departmentId && CP(['custodian']) && (
						<Bar
							title={selectedMonth + `月${fields.distributor}耗材使用统计(TOP10)`}
							params={{ rank: 10, target: time, departmentId }}
							type='use_all'
						/>
					)}

					{!departmentId && CP(['custodian']) && (
						<Bar
							title={selectedMonth + `月新增${fields.distributor}耗材使用统计`}
							params={{ rank: 10, target: time, departmentId }}
							type='use_add'
						/>
					)}

					{CP(['supplier', 'hospital', 'operator', 'equipment']) && (
						<GoodsMonthlyGrowth
							title={
								(isSupplier ? selectedMonth + '月科室' : selectedMonth + '月' + name) +
								'耗材使用环比/同比增长率'
							}
							params={{ target: time, departmentId }}
							type={isSupplier && 'supplier'}
						/>
					)}
					{!departmentId && CP(['operator', 'equipment']) && (
						<GrowthCompare
							title={[`${selectedMonth}月耗材环比增长率`, `${selectedMonth}月耗材同比增长率`]}
							params={{ target: time, departmentId }}
						/>
					)}
				</div>

				<div className={styles.col}>
					{CP(['operator', 'equipment']) && (
						<Pie
							title='全院耗材使用金额占比'
							params={{ target: time, departmentId }}
							type='departmentUse'
						/>
					)}

					{CP(['operator', 'hospital', 'equipment']) && (
						<GoodsCompare
							title={selectedMonth + '月' + name + '消耗金额占比'}
							params={{ target: time, departmentId }}
						/>
					)}

					{CP(['operator', 'hospital', 'equipment']) && (
						<GoodsIncrement
							title={selectedMonth + '月' + name + '新增耗材'}
							params={{ target: time, departmentId }}
						/>
					)}

					{CP(['operator', 'hospital', 'equipment']) && (
						<ConsumedRank
							title={selectedMonth + '月' + name + '耗材排名'}
							params={{ target: time, departmentId }}
						/>
					)}
				</div>
			</Page>
		)
	);
};

function getPermission(permissions) {
	return permissions
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
}

export default MaterialUse;
