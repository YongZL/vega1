import { LocalIcon } from '@/utils/utils';
import styles from '../index.less';
import getTodoConfig from '../todo.config';

interface PropsType {
	todoItem: TodoController.TodoItem;
	onClick: () => void;
	handleClickNoPath: () => void;
}

const TodoItem = ({ todoItem, onClick, handleClickNoPath }: PropsType) => {
	const configData: Record<string, any> = getTodoConfig(todoItem);

	return (
		<div className={styles['schedule-item']}>
			<div className={styles['schedule-left']}>
				<div className={styles['schedule-name']}> {configData.name} </div>
				<div className={styles['schedule-status']}>{configData.handleName}</div>
				{configData.count === 0 ? (
					<span className={styles['schedule-num0']}>{configData.count}</span>
				) : (
					<div
						className={styles['schedule-num']}
						onClick={onClick}>
						<span className='homeTodoListNum'>{configData.count}</span>
					</div>
				)}
			</div>
			<div className={styles['schedule-right']}>
				{configData.icon ? (
					<LocalIcon
						type={configData.icon}
						onClick={handleClickNoPath}
						style={{ color: `${configData.color}`, fontSize: '50px' }}
					/>
				) : null}
			</div>
		</div>
	);
};

export default TodoItem;
