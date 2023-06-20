import type { Effect, Reducer } from 'umi';

export type TodoListModelState = TodoController.TodoItem[];

interface TodoListModel {
	namespace: 'todoList';
	state: TodoListModelState;
	reducers: {
		setTodoList: Reducer<TodoListModelState>;
	};
}
