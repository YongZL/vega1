import type { FC } from 'react';
import type { RemarksProps } from './typings';

import classNames from 'classnames';

import './remarks.less';

const Remarks: FC<RemarksProps> = (props) => {
	const { className, remarks, itemStyle, ...rest } = props;
	const prefix = 'ant-remarks';
	return (
		<div
			className={classNames(prefix, className)}
			{...rest}>
			{remarks.map(
				(remark) =>
					remark && (
						<div
							className={`${prefix}__item`}
							style={itemStyle}
							key={remark}>
							{remark}
						</div>
					),
			)}
		</div>
	);
};

export default Remarks;
