import request from '@/utils/request';
import api from '@/constants/api';

//获取部门 --public
export const getDepartmentList = () => {
	return () => {
		return request(`${api.departments.departmentList}`);
	};
};
//耗材消耗排名--全院/科室
export const getGoodsConsumedRank = (params) => {
	return request(`${api.report_form.goodsConsumedRank}`, {
		params,
	});
};
//各科室增长率对比
export const getDepartmentGrowth = (params) => {
	return request(`${api.report_form.departmentGrowthCompare}`, {
		params,
	});
};
//科室请领响应时效
export const getDepartmentTimeConsume = (params) => {
	return request(`${api.report_form.departmentTimeConsume}`, {
		params,
	});
};
//配送商业验货响应时效
export const getSupplierTimeConsume = (params) => {
	return request(`${api.report_form.supplierTimeConsume}`, {
		params,
	});
};
//配送商业验货响应时效
export const getDurationList = (params) => {
	return request(`${api.report_form.wareHousedDuration}`, {
		params,
	});
};
//月度金额
export const getAmountMonthly = (params) => {
	return request(`${api.report_form.amountMonthly}`, {
		params,
	});
};
//消耗变化排名
export const getChangeRate = (params) => {
	return request(`${api.report_form.topChangeRate}`, {
		params,
	});
};
//消耗对照
export const getDepartmentCompare = (params) => {
	return request(`${api.report_form.departmentCompare}`, {
		params,
	});
};
//当前金额汇总
export const getAmountSummary = (params) => {
	return request(`${api.report_form.amountSummary}`, {
		params,
	});
};
//基础物资消耗对照
export const getGoodsCompare = (params) => {
	return request(`${api.report_form.goodsCompare}`, {
		params,
	});
};

//月度消耗金额-配送商业/一级配送商业
export const getAmountMonthlySupplier = (params) => {
	return request(`${api.report_form.amountMonthlySupplier}`, {
		params,
	});
};
//一级配送商业下所有配送商业订单对照
export const getSupplierCompare = (params) => {
	return request(`${api.report_form.supplierCompare}`, {
		params,
	});
};

//耗材月度增长率
export const getMonthlyGrowth = (params) => {
	return request(`${api.report_form.getMonthlyGrowth}`, {
		params,
	});
};

//配送商业耗材月度增长率
export const getMonthlyGrowthSupplier = (params) => {
	return request(`${api.report_form.getMonthlyGrowthSupplier}`, {
		params,
	});
};

//本月新增耗材
export const getIncrements = (params) => {
	return request(`${api.report_form.getIncrements}`, {
		params,
	});
};

//每月超过采购基准的科室  monthlyTotalAmount    -   baseAmonut
export const getOverBaseDepartment = (params) => {
	return request(`${api.report_form.getOverBaseDepartment}`, {
		params,
	});
};
