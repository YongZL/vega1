// message-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/message/1.0';

// POST/api/admin/message/1.0/addMessageAndPermission 新增消息和权限的信息

// POST/api/admin/message/1.0/deleteMessageAndPermission 根据id删除用户的权限信息

// POST/api/admin/message/1.0/doBatchDelete 根据id批量删除消息
export function doBatchDelete<T = ResponseResult>(data: MessageController.BatchDisposeParams) {
	return request.post<T>(`${PREFIX}/doBatchDelete`, { data });
}

// POST/api/admin/message/1.0/doBatchRead 根据id设置消息已读
export function doBatchRead<T = ResponseResult>(data: MessageController.BatchDisposeParams) {
	return request.post<T>(`${PREFIX}/doBatchRead`, { data });
}

// POST/api/admin/message/1.0/doHander 操作消息

// POST/api/admin/message/1.0/doRead 消息改变未读为已读(批量)
export function doReadAll<T = ResponseResult>() {
	return request.post<T>(`${PREFIX}/doRead`);
}

// GET/api/admin/message/1.0/fetchLatestMessage 获取前rank条消息

// GET/api/admin/message/1.0/getMessageAndPermission 获取消息和权限信息

// GET/api/admin/message/1.0/list 分页获取消息列表
export function getMessageList<T = ResponseList<MessageController.ListRecord[]>>(
	params: MessageController.ListPager,
) {
	return request<T>(`${PREFIX}/list`, { params });
}

// GET/api/admin/message/1.0/loadMessageTypeByUser 获取用户消息类型
export function getMessageType<T = ResponseResult<MessageController.MessageType[]>>() {
	return request<T>(`${PREFIX}/loadMessageTypeByUser`);
}

// GET/api/admin/message/1.0/pull weChat 拉取数据

// GET/api/admin/message/1.0/pullMessage pullMessage 拉取数据

// GET/api/admin/message/1.0/single 获取最新一条未读消息

// GET/api/admin/message/1.0/unRead 获得未读消息

// POST/api/admin/message/1.0/updateMessageAndPermission 更新权限列表
