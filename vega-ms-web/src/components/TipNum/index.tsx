import type { FC } from 'react';
import { convertPriceWithDecimal } from '@/utils/format';

import styles from './index.less';

const TipNum: FC<{ value: number; fontSize: string | number }> = ({ value, fontSize }) => {
	const numList = ['百', '千', '万', '十万', '百万', '千万', '亿', '十亿', '百亿', '千亿'];
	const len = parseInt(`${value / 1000000}`).toString().length - 1;
	return (
		<div className={styles.tip_num_wrap}>
			{value >= 1000000 && <span className={styles.tip}>{numList[len]}</span>}
			<span
				className={styles.num}
				style={{ fontSize, textAlign: 'right' }}>
				{convertPriceWithDecimal(value)}
			</span>
		</div>
	);
};

export default TipNum;
