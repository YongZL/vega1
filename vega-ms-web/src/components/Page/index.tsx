import type { FC, CSSProperties, ReactNode } from 'react';
import type { BreadcrumbProps } from '@/components/Breadcrumb';

import Breadcrumb from '@/components/Breadcrumb';

import styles from './index.less';
import commonStyles from '@/assets/style/common.less';

/**
 * @param {breadList} Array 基本用例: ["库存", "库存管理", "盘库"]  需要跳转的用例: ["库存", ["库存管理", "/message_list"], "盘库"]
 * @param {children} ReactComponent | HtmlElement
 */
const Page: FC<{
	breadList: BreadcrumbProps['config'];
	wrapperStyle?: CSSProperties;
	justifyContent?: CSSProperties['justifyContent'];
	extra?: () => ReactNode;
	mid: () => ReactNode;
}> = ({ breadList, children, wrapperStyle, extra, justifyContent = 'space-between', mid }) => {
	return (
		<div className={commonStyles.wrap}>
			<div
				className={commonStyles.pageHeader}
				style={{ justifyContent }}>
				<Breadcrumb config={breadList} />
				{extra && extra()}
			</div>

			{mid && <div className={styles.pageMid}>{mid && mid()}</div>}

			<div
				className='pageHeaderWrapper'
				style={wrapperStyle}>
				<div
					className={styles.wrapper}
					style={document.documentElement.clientWidth <= 1024 ? { flexDirection: 'column' } : {}}>
					{children}
				</div>
			</div>
		</div>
	);
};

export default Page;
