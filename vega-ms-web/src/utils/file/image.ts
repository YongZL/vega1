// 图片数据、图片路径处理

import { notification } from '@/utils/ui';
import type { RcFile } from 'antd/lib/upload';

/**
 * 根据图片地址返回Antd的Upload的fileList字段的数据
 *
 * @param {string} url 图片地址
 * @returns {UploadProps['fileList']} Antd的Upload的fileList字段的数据
 */
export function convertImageUrl(url: string) {
	if (typeof url !== 'string' || !url) {
		return [];
	}
	const fileName = url.split('/').pop();

	return [
		{
			uid: '-1',
			name: fileName,
			response: url,
			status: 'done',
			key: '-1',
		},
	];
}

export function getBase64(img: Blob, callback: (result: string) => void) {
	const reader = new FileReader();
	reader.addEventListener('load', () => callback(reader.result as string));
	reader.readAsDataURL(img);
}

export function imgBeforeUpload(file: RcFile, _fileList: RcFile[]) {
	const isValid = ['image/bmp', 'image/gif', 'image/png', 'image/jpeg', 'image/jpg'].includes(
		file.type,
	);
	if (!isValid) {
		notification.error('只能上传png、jpeg、jpg 、bmp、gif格式图片');
		return false;
	}

	if (file.name.length > 80) {
		notification.error('文件上传名称长度不得超过80个字符');
		return false;
	}
	const isLt1M = file.size / 1024 / 1024 < 21;
	if (!isLt1M) {
		notification.error('文件必须小于20M');
	}
	return isLt1M;
}
