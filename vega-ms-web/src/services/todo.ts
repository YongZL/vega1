// todo-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/todo/1.0';

// GET /api/admin/todo/1.0/countTodoList 待办事项
export function countTodoList<T = ResponseResult<TodoController.TodoItem[]>>() {
	return request<T>(`${PREFIX}/countTodoList`);
}
