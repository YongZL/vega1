import { accessNameMap } from '@/utils';

/**
 * 格式化待办事项
 * @param {后台返回的待办事项的原始数据} data
 * @return  {格式化后的数据} Object
 */
const pageType = {
	// 采购处理
	purchase: {
		code: 'purchase_handle',
		path: '/purchase/handle',
		icon: 'icon-hp_cgjh_djs',
		color: CONFIG_LESS['@c_BE6AFF'],
	},
	// 验收处理
	receiving: {
		code: 'receiving_order',
		path: '/repository/receiving_management',
		icon: 'icon-hp_psd_dys',
		color: CONFIG_LESS['@c_631CA9'],
	},
	// 出库处理
	outBound: {
		code: 'outbound_handle',
		path: '/repository/outbound_handle',
		icon: '',
		color: '',
	},
	// 上架
	putOnShelf: {
		code: 'put_on_shelf',
		path: '/stock/stock_warehouse',
		icon: 'icon-hp_sj_dsj',
		color: CONFIG_LESS['@c_9DE700'],
	},
	// 加工组包
	processingackage: {
		code: 'process',
		path: '/repository/process_list',
		icon: 'icon-ICONSdaibanshixiangjiagongdan',
		color: CONFIG_LESS['@c_6DCAFF'],
	},
	// 入库申请
	warehousingApply: {
		code: 'warehousing_apply',
		path: '/department/warehousing_apply',
		icon: 'icon-hp_ptql',
		color: CONFIG_LESS['@c_00E9DB'],
	},
	// 入库处理
	warehousingHandle: {
		code: 'Inbound_processing',
		path: '/department/Inbound_processing',
		icon: 'icon-hp_psd_dys',
		color: CONFIG_LESS['@c_00E9DB'],
	},
	// 调拨处理
	allocationHandle: {
		code: 'process',
		path: '/allocation/handle',
		icon: 'icon-hp_ksdb_dsh',
		color: CONFIG_LESS['@c_FFC909'],
	},
	// 医嘱管理
	medicalAdvice: {
		code: 'allocation_handle',
		path: '/consume/medical_advice',
		icon: 'icon-hp_cgdd_djs',
		color: CONFIG_LESS['@c_00E9DB'],
	},
	// 盘点处理
	stockCcountDeal: {
		code: 'stock_count_deal',
		path: '/repository/stock_count_deal',
		icon: 'icon-a-ICONS108daibanshixiangpanku',
		color: '',
	},
	// 中心仓库退货
	returnProcessing: {
		code: 'return_goods',
		path: '/department/return_processing',
		icon: 'icon-hp_zxkth_dsh',
		color: CONFIG_LESS['@c_FF6E3F'],
	},
	// 科室退货
	departmentReturnGoods: {
		code: 'department_return_goods',
		path: '/department/return_processing',
		icon: 'icon-hp_zxkth_dsh',
		color: CONFIG_LESS['@c_FF6E3F'],
	},
};

/**
 *@type pageType 中的键 key
 *@count 数量
 *@statusName 状态名称
 *@state history.push state 数据 {key:'',status:''}
 *@color 颜色
 *@Icon 图标
 */
const todoItem = (
	type: string,
	count: number,
	statusName: string,
	state: { key?: string; status?: string },
	Color?: string,
	Icon?: string,
) => {
	const { code, path, icon, color } = pageType[type];
	// 获取后端配置名字的键值对
	const data = accessNameMap();
	return {
		name: data[code] || '',
		path,
		state,
		count,
		nopath: path,
		icon: Icon || icon,
		color: Color || color,
		handleName: statusName,
	};
};

const stateObj = (v1?: string, v2?: string) => {
	return v2 ? { key: v1, status: v2 } : { status: v1 };
};

const getTodoConfig = (data: TodoController.TodoItem) => {
	let configData = { path: '', icon: '', name: '', color: '', state: {} };
	const { value, key } = data;
	let state, icon;
	switch (key) {
		// 采购处理
		case 'commit_purchase_plan_pending': // 采购申请——待提交
			icon = 'icon-ICONS_66_caigoujihua_daitijiao';
			state = stateObj('commit_pending');
			configData = todoItem('purchase', value, '待提交', state, '#BE6AFF', icon);
			break;

		case 'plan_approval_pending': // 采购申请——待审核
			icon = 'icon-ICONS_66_caigoujihua_daishenhe';
			state = stateObj('approval_pending');
			configData = todoItem('purchase', value, '待审核', state, '#B264FF', icon);
			break;

		case 'plan_to_order': // 采购申请——待转订单
			icon = 'icon-ICONS_66_caigoujihua_daizhuandingdan';
			state = stateObj('approval_success');
			configData = todoItem('purchase', value, '待转订单', state, '#9235ED', icon);
			break;

		case 'handled_distributor_accept_order': // 采购订单——待接收
			icon = 'icon-ICONS_66_caigoudingdan_daijieshou';
			state = stateObj('2', 'receive_pending');
			configData = todoItem('purchase', value, '待接收', state, '#6335E4', icon);
			break;

		case 'handled_distributor_order': // 采购订单——已接收
			icon = 'icon-ICONS_66_caigoudingdan_yijieshou';
			state = stateObj('2', 'received');
			configData = todoItem('purchase', value, '已接收', state, '#631CA9', icon);
			break;

		case 'handled_distributor_make': // 采购订单——配送中
			icon = 'icon-ICONS_66_caigoudingdan_daipeisong';
			state = stateObj('2', 'delivering');
			configData = todoItem('purchase', value, '配送中', state, '#210278', icon);
			break;

		// 验收处理
		case 'shipping_order_todo_check': // 待验收
			icon = 'icon-ICONS_66_peisongdan_shenhe';
			state = stateObj('pending');
			configData = todoItem('receiving', value, '待验收', state, '#2B4996', icon);
			break;
		case 'receiving_order_view': // 验收中
			icon = 'icon-ICONS_66_peisongdan_shenhe';
			state = stateObj('receiving');
			configData = todoItem('receiving', value, '验收中', state, '#2852D7', icon);
			break;

		// 上架
		case 'put_on_shelf_pending':
			icon = 'icon-ICONS_66_shangjia';
			state = stateObj('statistic_put_on_shelf_detail', 'put_on_shelf_pending');
			configData = todoItem('putOnShelf', value, '待上架', state, '#5A82EF', icon);
			break;

		// 调拨处理
		case 'reallocate_pending':
			icon = 'icon-ICONS_66_keshitiaobo';
			state = stateObj('3');
			configData = todoItem('allocationHandle', value, '待入库', state, '#4B7CFF', icon);
			break;

		// 出库处理
		case 'pick_pending_generate_pick_order_pending': // 出库处理——配货提示（基础物资+医耗套包）
			icon = 'icon-ICONS_66_chuku';
			state = stateObj('generate_pick_order_pending');
			configData = todoItem('outBound', value, '配货提示', state, '#4998FF', icon);
			break;
		case 'pick_order_pick_pending': // 出库处理——配货——待配货
			icon = 'icon-hp_djh_dscjhd';
			state = stateObj('2', 'pick_pending');
			configData = todoItem('outBound', value, '待配货', state, '#3D7CFF', icon);
			break;
		case 'pick_order_list': // 出库处理——配货——配货中
			icon = 'icon-ICONS_66_tuisong';
			state = stateObj('2', 'picking');
			configData = todoItem('outBound', value, '配货中', state, '#5AAAF8', icon);
			break;
		case 'delivery_order_check_pending': // 出库处理——推送——待复核
			icon = 'icon-ICONS-108-daibanshixiang-caigoudingdan-yijieshou';
			state = stateObj('3', 'check_pending');
			configData = todoItem('outBound', value, '待复核', state, '#49C1EF', icon);
			break;

		// 加工组包
		case 'processing_order_pick_pending': // 出库业务——加工组包——待生成配货单
			icon = 'icon-ICONS_66_jiagong_daishengchengjianhuodan';
			state = stateObj('operate_pending');
			configData = todoItem('processingackage', value, '待生成配货单', state, '#6DCAFF', icon);
			break;
		case 'process_list': // 出库业务——加工组包——待配货
			icon = 'icon-ICONS_66_jiagong_peihuo';
			state = stateObj('pick_pending');
			configData = todoItem('processingackage', value, '待配货', state, '#28ECF9', icon);
			break;
		case 'processing_order_process_pending': // 出库业务——加工组包——待加工
			icon = 'icon-ICONS_66_jiagong';
			state = stateObj('process_pending');
			configData = todoItem('processingackage', value, '待加工', state, '#42DDFF', icon);
			break;

		// 入库申请
		case 'warehousing_apply_approval': // 入库申请——待审核（请领+调拨）
			icon = 'icon-ICONS_66_qingling_putong';
			state = stateObj('approval_pending');
			configData = todoItem('warehousingApply', value, '待审核', state, '#00E9DB', icon);
			break;

		case 'goods_request_review_pending': // 入库申请——待复核（请领）
			icon = 'icon-ICONS_66_qingling_putong';
			state = stateObj('approval_review_pending');
			configData = todoItem('warehousingApply', value, '待复核', state, '#00E9DB', icon);
			break;

		case 'warehousing_apply_withdraw': // 入库申请——撤回（请领）
			icon = 'icon-ICONS_66_bohui';
			state = stateObj('withdraw');
			configData = todoItem('warehousingApply', value, '撤回', state, '#C4C4C4', icon);
			break;

		case 'warehousing_apply_purchasing': // 入库申请——采购中（请领）
			icon = 'icon-ICONS_66_ruku_caigouzhong';
			state = stateObj('purchasing');
			configData = todoItem('warehousingApply', value, '采购中', state, '#5FB700', icon);
			break;
		case 'warehousing_apply_in_delivery': // 入库申请——配送中（请领+调拨）
			icon = 'icon-ICONS_66_ruku_peisongzhong';
			state = stateObj('in_delivery');
			configData = todoItem('warehousingApply', value, '配送中', state, '#A5D244', icon);
			break;

		// 入库处理
		case 'warehousing_handle_pending': // 入库处理——待验收（请领+调拨）
			icon = 'icon-ICONS_66_jianhuo_saomiao';
			state = stateObj('pending');
			configData = todoItem('warehousingHandle', value, '待验收', state, '#9DE700', icon);
			break;
		case 'warehousing_handle_receiving': // 入库处理——验收中（请领+调拨）
			icon = 'icon-ICONS_66_jianhuo_saomiao';
			state = stateObj('receiving');
			configData = todoItem('warehousingHandle', value, '验收中', state, '#9DE700', icon);
			break;

		// 医嘱管理
		case 'department_medical_advice_scan': // 消耗业务——医嘱管理——未消耗
			icon = 'icon-ICONS_66_yizhuguanli_weixiaohao';
			state = stateObj('not_consumed');
			configData = todoItem('medicalAdvice', value, '未消耗', state, '#FFBA2C', icon);
			break;
		case 'department_medical_advice_view': // 消耗业务——医嘱管理——部分消耗
			icon = 'icon-ICONS_66_yizhuguanli_bufenxiaohao';
			state = stateObj('partly_consumed');
			configData = todoItem('medicalAdvice', value, '部分消耗', state, '#FFBA2C', icon);
			break;
		case 'department_medical_advice_return': // 消耗业务——医嘱管理——未退货
			icon = 'icon-ICONS_66_yizhuguanli';
			state = stateObj('not_returned');
			configData = todoItem('medicalAdvice', value, '未退货', state, '#FFC909', icon);
			break;

		// 盘点处理
		case 'stock_count_deal': // 库存业务——盘点处理——待盘库
			icon = 'icon-ICONS_66_panku';
			state = stateObj('stock_taking_pending');
			configData = todoItem('stockCcountDeal', value, '待盘库', state, '#FFA541', icon);
			break;
		case 'stock_count_query': // 库存业务——盘点处理——盘库中
			icon = 'icon-ICONS_66_panku';
			state = stateObj('stock_taking');
			configData = todoItem('stockCcountDeal', value, '盘库中', state, '#FF8D0E', icon);
			break;

		// 退货处理
		case 'return_goods_pending_approve_central': // 待审核（中心仓库）
			icon = 'icon-ICONS_66_tuihuo_keshi';
			state = stateObj('pending_approve');
			configData = todoItem('returnProcessing', value, '待审核', state, '#FF6E3F', icon);
			break;
		case 'return_goods_pending_confirm_central': // 等待退货（中心仓库）
			icon = 'icon-ICONS_66_tuihuo_keshi';
			state = stateObj('pending_return');
			configData = todoItem('returnProcessing', value, '等待退货', state, '#FF6E3F', icon);
			break;
		case 'return_goods_pending_approve_department': // 待审核（科室库）
			icon = 'icon-ICONS_66_tuihuo_keshi';
			state = stateObj('2', 'pending_approve');
			configData = todoItem('departmentReturnGoods', value, '待审核', state, '#EF394F', icon);
			break;
		case 'return_goods_pending_confirm_department': // 等待退货（科室库）
			icon = 'icon-ICONS_66_tuihuo_keshi';
			state = stateObj('2', 'pending_return');
			configData = todoItem('departmentReturnGoods', value, '等待退货', state, '#EF394F', icon);
			break;
		default:
			configData.path = './';
			break;
	}
	return configData;
};

export default getTodoConfig;
