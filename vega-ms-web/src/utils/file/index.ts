// 文件相关

import { notification } from '@/utils/ui';
import { errMsg, patterns } from './uploadValid';

/**
 * use window.open Download file
 *
 * @param {string} url
 * @param {object} opt opt.target: '_blank' | '_self' | string, noopener: boolean, noreferrer: boolean
 */
export function openWindow(
	url: string,
	opt?: { target?: '_blank' | '_self' | string; noopener?: boolean; noreferrer?: boolean },
) {
	const { target = '__blank', noopener = true, noreferrer = true } = opt || {};
	const feature: string[] = [];

	noopener && feature.push('noopener=yes');
	noreferrer && feature.push('noreferrer=yes');

	window.open(url, target, feature.join(','));
}

/**
 * Download file according to file address
 *
 * @param {string} url
 * @param {string} target '_blank' | '_self'
 * @param {string} fileName
 */
export function downloadByUrl({
	url,
	target = '_blank',
	fileName,
}: {
	url: string;
	target?: '_blank' | '_self';
	fileName?: string;
}): boolean {
	const isChrome = window.navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
	const isSafari = window.navigator.userAgent.toLowerCase().indexOf('safari') > -1;

	if (/(iP)/g.test(window.navigator.userAgent)) {
		console.error('Your browser does not support download!');
		return false;
	}
	if (isChrome || isSafari) {
		const link = document.createElement('a');
		link.href = url;
		link.target = target;

		if (link.download !== undefined) {
			link.download = fileName || url.substring(url.lastIndexOf('/') + 1, url.length);
		}

		if (document.createEvent) {
			const e = document.createEvent('MouseEvents');
			e.initEvent('click', true, true);
			link.dispatchEvent(e);
			return true;
		}
	}
	if (url.indexOf('?') === -1) {
		url += '?download';
	}

	openWindow(url, { target });
	return true;
}

export function beforeUpload(file: File) {
	// const isValid = file.type === 'image/jpeg' || file.type === 'image/png';
	// if (!isValid) {
	//   notification.error('只能上传jpg或png图片');
	// }
	// console.log(file, fileList)
	// if (fileList.length >= 2) {
	//   notification.error("图片不能超过9张");
	//   return false;
	// }

	if (patterns.test(file.name)) {
		notification.error(errMsg);
		return;
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

// eslint-disable-next-line consistent-return
export function excelBefore(file: File) {
	const isValid = file.name.indexOf('.xlsx') > -1 || file.name.indexOf('.xls') > -1;
	if (!isValid) {
		notification.error('只能上传.xlsx或.xls文件');
		return false;
	}
}

/**
 * 获取文件名
 *
 * @param url
 * @returns
 */
export function getDownloadName(url: string) {
	if (!url) {
		return '';
	}

	const fileName = url.split('/').pop();
	return fileName;
}
