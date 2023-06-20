import type { TooltipProps } from 'antd';

import styles from './index.less';
import React, { useState } from 'react';
import { getUrl } from '@/utils/utils';
import { Popover, Image } from 'antd';
import popTipConfirmImg from '@/assets/images/popTipConfirmImg.png';

interface PopTipConfirmData {
	imgUrl: string;
	imgStyle?: object;
	placement?: TooltipProps['placement'];
	imgWidth?: number;
	isSupportDialog?: boolean;
}

const PopTipConfirm: React.FC<PopTipConfirmData> = ({
	imgUrl,
	imgStyle,
	placement = 'right',
	imgWidth,
	isSupportDialog = true,
}) => {
	const imgUrlReg = /http[s]{0,1}:\/\/([\w.]+\/?)\S*/;
	const url = imgUrlReg.test(imgUrl) ? imgUrl : imgUrl && `${getUrl()}${imgUrl}`;
	const [visible, setVisible] = useState(false);
	const [popoverVisible, setpopoverVisible] = useState(false);
	let suffix = '';
	if (imgUrl) {
		let index = imgUrl.lastIndexOf('/');
		let filename = imgUrl.substring(index + 1, imgUrl.length);
		let flieArr = filename.split('.');
		suffix = flieArr[flieArr.length - 1];
	}

	const content = (
		<div style={{ margin: 0, padding: 0 }}>
			<img
				style={{ maxWidth: 350, maxHeight: 350, ...imgStyle }}
				src={url}
			/>
		</div>
	);
	return (
		imgUrl &&
		['png', 'jpg', 'jpeg', 'bmp', 'gif'].includes(suffix) && (
			<div className={styles.content}>
				<Popover
					placement={placement || 'right'}
					content={content}
					title={false}
					zIndex={100000}
					visible={popoverVisible}>
					<img
						src={popTipConfirmImg}
						alt=''
						onClick={() => {
							if (!isSupportDialog) {
								return;
							}
							setTimeout(() => {
								setVisible(true);
							}, 300);
						}}
						onMouseEnter={() => setpopoverVisible(true)}
						onMouseLeave={() => setpopoverVisible(false)}
					/>
				</Popover>
				<div
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}>
					<Image
						width={imgWidth || 200}
						src={url}
						preview={{
							visible: visible,
							onVisibleChange: (value) => {
								setVisible(value);
							},
						}}
						style={{ position: 'absolute', top: -12, display: 'none' }}
					/>
				</div>
			</div>
		)
	);
};

export default PopTipConfirm;
