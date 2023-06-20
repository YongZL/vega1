// 医嘱收费 medical-advice-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/medicalAdvice/1.0';

// GET/api/admin/medicalAdvice/1.0/exportSummary 导出医嘱收费汇总

// GET/api/admin/medicalAdvice/1.0/getConsumedGoodsList 根据医嘱id查询该医嘱上已消耗的物资列表
export function getConsumedGoodsList<T = ResponseResult<Record<string, any>>>(
  params: MedicalAdviceController.GoodsListParams,
) {
  return request.get<T>(`${PREFIX}/getConsumedGoodsList`, { params });
}

// GET/api/admin/medicalAdvice/1.0/getListByNum 根据病例号/病人号/医嘱号 查询医嘱列表
export function queryMedicalAdvice<T = ResponseResult<MedicalAdviceController.MedicalAdvice>>(
  params: MedicalAdviceController.MedicalAdviceParams,
) {
  return request.get<T>(`${PREFIX}/getListByNum`, { params });
}

// GET/api/admin/medicalAdvice/1.0/getMedicalAdviceCharge 查询医嘱收费详情(用于医嘱编辑)
export function queryDetail<T = ResponseResult<MedicalAdviceController.DetailListRecord[]>>(
  params: MedicalAdviceController.DetailParams,
) {
  return request.get<T>(`${PREFIX}/getMedicalAdviceCharge`, { params });
}

// GET/api/admin/medicalAdvice/1.0/getMedicalAdviceList 分页查询医嘱信息(用于手术请领绑定医嘱)

// GET/api/admin/medicalAdvice/1.0/getMedicalAdviceWithPage 分页查询医嘱信息列表
export function getPageList<T = ResponseList<MedicalAdviceController.ListRecord[]>>(
  params: MedicalAdviceController.TableListPager,
) {
  return request.get<T>(`${PREFIX}/getMedicalAdviceWithPage`, { params });
}

// GET/api/admin/medicalAdvice/1.0/getWithPage 分页查询医嘱收费汇总

// POST/api/admin/medicalAdvice/1.0/lock 提交医嘱(锁定)

// POST/api/admin/medicalAdvice/1.0/medicalAdviceGoodsProcess 医嘱扫码消耗或退货
export function lockGoods<T = ResponseResult>(
  value: string,
  data: MedicalAdviceController.LockGoodsParams[],
) {
  return request.post<T>(`${PREFIX}/medicalAdviceGoodsProcess?implantSerialNumber=${value}`, {
    data,
  });
}

// GET/api/admin/medicalAdvice/1.0/medicalAdviceScanUdi 医嘱管理扫描udi
export function medicalAdviceScanUdi<T = ResponseResult<MedicalAdviceController.ScanUdiData>>(
  params: MedicalAdviceController.ScanUdiParams,
) {
  return request.get<T>(`${PREFIX}/medicalAdviceScanUdi`, { params });
}

// POST/api/admin/medicalAdvice/1.0/syncMedicalAdvice 医嘱同步后处理
export function syncMedicalAdvice<T = ResponseResult>(data: string[] | number[]) {
  return request.post<T>(`${PREFIX}/syncMedicalAdvice`, { data });
}

// POST/api/admin/medicalAdvice/1.0/unconsume 医嘱反消耗
export function unConsume<T = ResponseResult>(
  value: string,
  data: MedicalAdviceController.UnConsumeParams,
) {
  return request.post<T>(`${PREFIX}/unconsume`, { data });
}
