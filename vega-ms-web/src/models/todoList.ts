import { TodoListModel } from './typings/todoList';

const todoListModel: TodoListModel = {
	namespace: 'todoList',
	state: [],
	reducers: {
		setTodoList(_, { payload }) {
			return payload || [];
		},
	},
};

export default todoListModel;
