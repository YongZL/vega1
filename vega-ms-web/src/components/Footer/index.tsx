import { FC, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import styles from './index.less';

const FooterInfo: FC<{}> = () => {
	const [isNeedMargin, setIsNeedMargin] = useState<boolean>(true);

	const systemConfig = JSON.parse(sessionStorage.getItem('newDictionary') || '{}')['system_config'];

	const location = useLocation();

	useEffect(() => {
		// 根据路由判断带footer的页面进行处理
		const isNeed =
			location.pathname.indexOf('/add') !== -1 ||
			location.pathname.indexOf('/return_purchase_add') !== -1 ||
			location.pathname.indexOf('/fresh_generate_settlement/detail') !== -1;
		setIsNeedMargin(isNeed);
	}, [location]);

	return (
		<div
			className={styles['page-footer']}
			style={{
				marginBottom: isNeedMargin ? '56px' : '0px',
			}}>
			<span>
				{(systemConfig && systemConfig.length && systemConfig[1].value) || ''} © 谱慧医疗研发中心
			</span>
		</div>
	);
};

export default FooterInfo;
