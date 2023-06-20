import { accessNameMap } from '@/utils';
import { Modal, notification, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { history } from 'umi';
import styles from './index.less';

type statusType = {
	text: string;
	value: string;
	key: string;
	num: number;
};

const { TabPane } = Tabs;
const SelectWarehouseModal: React.FC<{
	onFinish: () => void;
	status: Record<string, statusType[]> | statusType[];
	tabs?: { text: string; value: string; num: number; permissions: string }[]; // 弹窗无tab时不用传此参数
	defaultActiveKey?: string; // tab的默认选中
	sum: number;
	titleKey: string;
}> = ({ onFinish, status, tabs, sum, titleKey, defaultActiveKey }) => {
	const [checked, setChecked] = React.useState('');
	const [visible, setVisible] = useState<boolean>(true);
	const [activeKey, setActiveKey] = useState('1');
	const [statusList, setStatusList] = useState<statusType[]>([]);
	const accessName = accessNameMap();
	// tab切换
	const tabChange = (activeKey: string) => {
		setActiveKey(activeKey);
		setChecked('');
	};

	useEffect(() => {
		setActiveKey(defaultActiveKey || '1');
	}, [defaultActiveKey]);

	useEffect(() => {
		if (tabs) {
			setStatusList(status[activeKey]);
		} else {
			setStatusList(status as statusType[]);
		}
	}, [activeKey, tabs]);

	useEffect(() => {
		//为了解决从全局搜索或二级页面跳转至页面也会弹todolist弹窗的问题
		//所以这里在app.tsx文件就做了处理，在点击菜单时会在state上带上isMenu参数，就可以区分是点击菜单跳转的页面，还是另外操作跳转的
		// @ts-ignore
		if (!(history.location.state && history.location.state.isMenu)) {
			onFinish();
		}
	}, []);

	// 点击选中事件
	const handleClick = (value: string) => {
		setChecked(value);
		// 这里直接调用原点击确定的方法，为了展示出选中的状态这里利用延时器延时跳转
		setTimeout(() => {
			handleOk(value);
		}, 200);
	};

	// 点击弹出确认
	const handleOk = async (checked: string) => {
		if (!checked) {
			notification.error({
				message: '请选择信息行！',
			});
			return;
		}
		//把url里state的参数替换成与首页待办事项的传参一样
		const pathName = history.location.pathname.split('/');
		history.replace({
			...history.location,
			pathname: pathName
				.slice(1, pathName.length - 2)
				.map((item) => '/' + item)
				.join(''),
			//这里因为浏览器的回退会保留上个页面的state，所以把isMenu清空
			state: {
				...history.location.state,
				key: activeKey,
				status: checked,
				code: undefined,
				isMenu: undefined,
			},
			query: {},
			search: '',
		});
		setActiveKey('1');
		setChecked('');
		setVisible(false);
		onFinish();
	};

	// 点击弹出取消或关闭
	const handleCancel = () => {
		const pathName = history.location.pathname.split('/');
		history.replace({
			...history.location,
			pathname: pathName
				.slice(1, pathName.length - 2)
				.map((item) => '/' + item)
				.join(''),
			// 这里因为浏览器的回退会保留上个页面的state，所以把isMenu清空
			state: {
				...history.location.state,
				isMenu: undefined,
			},
			query: {},
			search: '',
		});
		setActiveKey('1');
		setChecked('');
		setVisible(false);
		onFinish();
	};

	return (
		<>
			<Modal
				title={`${accessName[titleKey]}（${sum}）`}
				width={402}
				centered={true}
				mask={false}
				maskClosable={true}
				visible={visible}
				onCancel={handleCancel}
				footer={'* 请点击处理状态，点击弹窗外区域或叉号可关闭弹窗'}
				className={styles.menuSelectModal}>
				{tabs && tabs.length > 1 && (
					<Tabs
						activeKey={activeKey}
						onChange={tabChange}
						centered={true}>
						{tabs.map((tab) => (
							<TabPane
								tab={`${accessName[tab.permissions]}（${tab.num}）`}
								key={tab.value}
							/>
						))}
					</Tabs>
				)}
				<div
					className='content'
					style={{ height: tabs ? '180px' : '100%' }}>
					{statusList.map((item) => (
						<p
							key={item.value}
							onClick={() => {
								handleClick(item.value);
							}}
							className={item.value === checked ? 'checked' : undefined}>
							{item.text}（{item.num}）
						</p>
					))}
				</div>
			</Modal>
		</>
	);
};

export default SelectWarehouseModal;
