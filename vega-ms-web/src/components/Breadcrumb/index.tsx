import { FC, ReactNode, useEffect, useState } from 'react';
import type { LinkProps } from 'react-router-dom';

import { ConnectState, GlobalModelState } from '@/models/connect';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { connect, history } from 'umi';
import style from './index.less';

/**
 * 面包屑
 * @param {config} string | Array [] 配置参数
 *
 * @usage

 * 普通用法: <Breadcrumb config={["", "", ""]} />  ==> 该面包屑有几层数组里就需要传几个

 * 附带跳转功能的用法: <Breadcrumb config={["", ["", "/message_list"], ""]} />
 *
 */
const BreadcrumbItem = AntBreadcrumb.Item;

export interface BreadcrumbProps {
	config: (
		| string
		| [string, LinkProps['to']]
		| [string, LinkProps['to'], (() => void) | undefined]
	)[];
	notification?: ReactNode;
	global: GlobalModelState;
	isDynamic: boolean; //是否启用动态面包屑
}

const Breadcrumb: FC<BreadcrumbProps> = ({ config, notification, global, isDynamic }) => {
	const [menuList, setMenuList] = useState<string[]>([]);

	useEffect(() => {
		//获取该页面面包屑的文字数组
		const { breadcrumbList } = global;
		setMenuList(breadcrumbList);
	}, [global.breadcrumbList]);

	const List = (isDynamic ? config : menuList).map((item, i) => {
		let index = i;
		if (index === menuList.length - 1 && index < config.length - 1) {
			index = config.length - 1;
		}
		const text = config[index];
		const content =
			typeof text === 'string' ? (
				(isDynamic ? '' : item || '') + text
			) : (
				<a
					onClick={() => {
						history.push(text[1]);
						if (typeof text[2] === 'function') {
							(text[2] as () => void)();
						}
					}}>
					{isDynamic ? '' : item || ''}
					{text && text[0]}
				</a>
			);

		return (
			<BreadcrumbItem
				key={index}
				className={style.breadcrumbs}>
				{content}
			</BreadcrumbItem>
		);
	});

	return (
		<div style={{ display: 'flex' }}>
			<AntBreadcrumb className={style.breadcrumb}>{List}</AntBreadcrumb>
			{notification && <span style={{ marginLeft: '300px' }}>{notification}</span>}
		</div>
	);
};

export default connect(({ global }: ConnectState) => ({ global }))(Breadcrumb);
