import type { FC, ReactNode } from 'react';

import React, { useState, useCallback } from 'react';
import { Image, Modal, Button } from 'antd';
import { getUrl } from '@/utils/utils';
import PDF, { usePdf } from 'react-pdf-js';

import lookFile from '@/assets/images/lookFile.png';
import styles from './index.less';
import defaultSettings from '@/../config/defaultSettings';

const Images: FC<{
	url?: string;
	width?: number;
	name?: ReactNode;
	fontSize?: string | number;
}> = (props) => {
	const { url, width, name, fontSize } = props;
	const [visible, SetVisible] = useState(false);
	const [imgVisible, setImgVisible] = useState(false);
	const [scale, setScale] = useState(1);
	const [pageNums, setPageNums] = useState<number | null>(null);

	const modal = {
		visible: visible,
		title: '',
		destroyOnClose: true,
		maskClosable: true,
		width: 650 * scale,
		bodyStyle: { padding: 0 },
		centered: true,
		onCancel: () => {
			SetVisible(false);
			setScale(1);
		},
		footer: [
			<Button
				key='back'
				onClick={(e) => {
					e.stopPropagation();
					if (scale > 0.4) setScale(scale - 0.2);
				}}
				disabled={scale <= 0.6}>
				{' '}
				缩小{' '}
			</Button>,
			<Button
				type='primary'
				onClick={(e) => {
					e.stopPropagation();
					setScale(scale + 0.2);
				}}
				disabled={scale >= 5}>
				{' '}
				放大
			</Button>,
		],
	};

	const lookInfo = useCallback(() => {
		SetVisible(true);
	}, []);
	let suffix = '';
	if (url && typeof url === 'string' && url.includes('/')) {
		let index = url.lastIndexOf('/');
		let filename = url.substring(index + 1, url.length);
		let flieArr = filename.split('.');
		suffix = flieArr[flieArr.length - 1];
	}
	return (
		<span style={{ paddingLeft: 3, cursor: 'pointer', position: 'relative' }}>
			{['png', 'jpg', 'jpeg', 'bmp', 'gif'].includes(suffix) && (
				<span
					onClick={(e) => {
						e.stopPropagation();
						setImgVisible(true);
						SetVisible(true);
					}}
					style={{ color: defaultSettings.primaryColor }}>
					<Image
						width={width || 16}
						src={visible ? `${getUrl()}${url}` : lookFile}
						preview={{
							onVisibleChange: (value) => {
								SetVisible(value);
								setImgVisible(false);
							},
							visible: imgVisible,
						}}
						style={{ position: 'absolute', top: -12 }}
					/>
					<span style={{ fontSize: fontSize || 12, marginLeft: 0 }}>{name || '查看'} </span>
				</span>
			)}
			{['pdf'].includes(suffix) && (
				<>
					<span
						style={{ color: defaultSettings.primaryColor }}
						onClick={lookInfo}>
						<img
							src={lookFile}
							alt=''
							style={{ marginTop: -1 }}
						/>
						<span style={{ fontSize: fontSize || 12, marginLeft: 0 }}>{name || '查看'} </span>
					</span>
					{
						<Modal {...modal}>
							<div style={{ height: '90vh', overflow: 'auto' }}>
								<div className={styles['pdf-item-wrapper']}>
									<PDF
										page={1}
										scale={scale}
										file={`${getUrl()}${url}`}
										onDocumentComplete={(num) => {
											setPageNums(num);
										}}
									/>
								</div>
								{pageNums &&
									pageNums > 1 &&
									new Array(pageNums).fill('').map(
										(_item, index) =>
											index > 0 && (
												<div className={styles['pdf-item-wrapper']}>
													<PDF
														page={index + 1}
														scale={scale}
														file={`${getUrl()}${url}`}
													/>
												</div>
											),
									)}
							</div>
						</Modal>
					}
				</>
			)}
		</span>
	);
};
export default Images;
