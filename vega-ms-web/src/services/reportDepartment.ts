// report-department-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/report/department/1.0';

// GET/api/admin/report/department/1.0/getDepartmentCompare 查询全院科室消耗对照

// GET/api/admin/report/department/1.0/getDepartmentGrowthCompare 查询各科室增长率对比

// GET/api/admin/report/department/1.0/getDepartmentTotalAmount 查询各科室采购总金额

// GET/api/admin/report/department/1.0/getGoodsCompare 查询科室/全院商品消耗对照

// GET/api/admin/report/department/1.0/getHospitalTotalAmount 查询医院采购总金额

// GET/api/admin/report/department/1.0/getIncrements 查询新增商品

// GET/api/admin/report/department/1.0/getMonthlyAmount 查询科室/全院月度金额报表

// GET/api/admin/report/department/1.0/getMonthlyGrowth 查询科室/全院月度消耗的同比和环比

// GET/api/admin/report/department/1.0/getOverBaseDepartment 查询超过基准值的科室

// GET/api/admin/report/department/1.0/goodsConsumedRank 查询耗材消耗排名

// GET/api/admin/report/department/1.0/monthlyTotalAmount 各科室耗材采购总金额按月排名（默认显示前10）

// GET/api/admin/report/department/1.0/returnGoodsTimeConsume 退货流程各环节时间耗时

// GET/api/admin/report/department/1.0/timeConsume 各个流程之间时间耗时
