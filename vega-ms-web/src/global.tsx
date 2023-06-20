import { Button, message, notification, Modal } from 'antd';

import React from 'react';
import { formatMessage } from 'umi';
import defaultSettings from '../config/defaultSettings';

const { pwa } = defaultSettings;
// if pwa is true
if (pwa) {
	// Notify user if offline now
	window.addEventListener('sw.offline', () => {
		message.warning(formatMessage({ id: 'app.pwa.offline' }));
	});

	// Pop up a prompt on the page asking the user if they want to use the latest version
	window.addEventListener('sw.updated', (event: Event) => {
		const e = event as CustomEvent;
		const reloadSW = async () => {
			// Check if there is sw whose state is waiting in ServiceWorkerRegistration
			// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration
			const worker = e.detail && e.detail.waiting;
			// if (!worker) {
			//   return true;
			// }
			// Send skip-waiting event to waiting SW with MessageChannel
			await new Promise((resolve, reject) => {
				const channel = new MessageChannel();
				channel.port1.onmessage = (msgEvent) => {
					if (msgEvent.data.error) {
						reject(msgEvent.data.error);
					} else {
						resolve(msgEvent.data);
					}
				};
				worker.postMessage({ type: 'skip-waiting' }, [channel.port2]);
			});
			// Refresh current page to use the updated HTML and other assets after SW has skiped waiting
			window.location.reload(true);
			// return true;
		};
		const key = `open${Date.now()}`;
		const btn = (
			<Button
				type='primary'
				onClick={() => {
					notification.close(key);
					reloadSW();
				}}>
				{formatMessage({ id: 'app.pwa.serviceworker.updated.ok' })}
			</Button>
		);
		notification.open({
			message: formatMessage({ id: 'app.pwa.serviceworker.updated' }),
			description: formatMessage({ id: 'app.pwa.serviceworker.updated.hint' }),
			btn,
			key,
			onClose: async () => {},
		});
	});
} else if ('serviceWorker' in navigator) {
	// unregister service worker
	const { serviceWorker } = navigator;
	if (serviceWorker.getRegistrations) {
		serviceWorker.getRegistrations().then((sws) => {
			sws.forEach((sw) => {
				sw.unregister();
			});
		});
	}
	serviceWorker.getRegistration().then((sw) => {
		if (sw) {
			sw.unregister();
		}
	});
	// remove all caches
	if (window.caches && window.caches.keys) {
		caches.keys().then((keys) => {
			keys.forEach((key) => {
				caches.delete(key);
			});
		});
	}
	// 放在 头部
	const getSrcOrHref = (msg) => {
		if (msg.target) {
			var res = msg.target.src || msg.target.href || msg.srcElement.href || msg.srcElement.src;
			if (res) {
				return res;
			} else {
				return '未知地址';
			}
		} else {
			return '无法找到目标';
		}
	};
	const getHost = (url) => {
		var getHostReg = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/;
		return getHostReg.exec(url) ? getHostReg.exec(url)[0] : null;
	};
	window.addEventListener(
		'error',
		(msg, url, row, col, error) => {
			var targetSrc = getSrcOrHref(msg);
			console.log(msg, targetSrc, getHost(targetSrc), error);
			if (
				msg.target &&
				msg.target.nodeName !== 'IMG' &&
				!msg.message &&
				getHost(targetSrc) === window.location.host
			) {
				// window.location.href='/';
				// if (confirm('检测到平台程序有更新，是否需要刷新浏览器？（若无效，请使用 Ctrl+F5 再次刷新）')) {
				//   console.error('可能您的浏览器还在使用过期的缓存文件，是否需要帮您自动刷新浏览器？' + '原因为找不到' + targetSrc);
				//   window.location.reload()
				// }
				Modal.warning({
					title: '检测到Insight版本更新，为保证正常使用，请按 Ctrl + F5 刷新缓存',
				});
			}
			console.warn(
				msg.target ? msg.target.outerHTML || msg.srcElement.outerHTML : '无法找到目标地址',
			);
			console.warn(msg, url, row, col, error);
			return true;
		},
		true,
	);
}
