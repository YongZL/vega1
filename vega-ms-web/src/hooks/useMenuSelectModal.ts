import type { ConnectState } from '@/models/connect';
import { useEffect, useState } from 'react';
import { useAccess } from 'umi';

type statusType = {
	text: string;
	value: string;
	key: string;
	num: number;
};
type tabsType = {
	text: string;
	value: string;
	num: number;
	permissions: string;
};

const useMenuSelectModal = (props: {
	tabs?: tabsType[];
	status: Record<string, statusType[]> | statusType[];
	todoList: ConnectState['todoList'];
}) => {
	const [status, setStatus] = useState<Record<string, statusType[]> | statusType[]>(props.status);
	const [tabs, setTabs] = useState<tabsType[] | undefined>(props.tabs);
	const [sum, setSum] = useState(0);
	const access = useAccess();

	useEffect(() => {
		let sum = 0;
		const tabList = (tabs || []).filter((tab) => access[tab.permissions]);
		if (tabList && tabList.length > 0) {
			tabList.forEach((tab) => {
				tab.num = 0;
				status[tab.value].forEach((item: statusType) => {
					props.todoList.forEach((todo) => {
						if (item.key === todo.key) {
							item.num = todo.value;
							tab.num += todo.value;
						}
					});
				});
				sum += tab.num;
			});
		} else {
			(status as statusType[]).forEach((item: statusType) => {
				props.todoList.forEach((todo) => {
					if (item.key === todo.key) {
						item.num = todo.value;
						sum += todo.value;
					}
				});
			});
		}
		setStatus(status);
		setTabs(tabList);
		setSum(sum);
	}, [props.todoList]);
	return { status, tabs, sum };
};

export default useMenuSelectModal;
