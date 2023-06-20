//模块配置
import request from '@/utils/request';

const PREFIX = '/api/configuration/1.0';

/** GET/api/configuration/1.0/pageList 模块配置分页列表*/
export function configurationPage<
	T = ResponseResult<ConfigurationController.configurationPageRecord>,
>(params: ConfigurationController.ConfigurationPageParams) {
	return request.get<T>(`${PREFIX}/pageList`, { params });
}
