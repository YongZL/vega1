import { notification } from '@/utils/ui';

function saveWithFormatCsv(fileName: string, objArray: Record<string, any>[], formatter: any) {
	const csvData = getCsvData(objArray);
	const titleData = objArray.map((item) => {
		return item.name;
	});
	const keyData = objArray.map((item) => {
		return item.key;
	});
	const config = {
		data: csvData,
		fileName,
		columns: {
			title: titleData,
			key: keyData,
			formatter,
		},
	};
	save(config);
}

/*
* obj是一个对象，其中包含有：
* ## data 是导出的具体数据
* ## fileName 是导出时保存的文件名称 是string格式
* ## showLabel 表示是否显示表头 默认显示 是布尔格式
* ## columns 是表头对象，且title和key必须一一对应，包含有
      title:[], // 表头展示的文字
      key:[], // 获取数据的Key
      formatter: function() // 自定义设置当前数据的 传入(key, value)
*/
function save(obj: Record<string, any>) {
	const { data } = obj;
	let ShowLabel = typeof obj.showLabel === 'undefined' ? true : obj.showLabel;
	const fileName = `${obj.fileName || 'UserExport'}.csv`;
	const columns = obj.columns || {
		title: [],
		key: [],
		formatter: undefined,
	};
	ShowLabel = typeof ShowLabel === 'undefined' ? true : ShowLabel;
	let row = '';
	let CSV = '';
	let key;
	// 如果要现实表头文字
	if (ShowLabel) {
		// 如果有传入自定义的表头文字
		if (columns.title.length) {
			columns.title.map(function (n: any) {
				row += `${n},`;
			});
		} else {
			// 如果没有，就直接取数据第一条的对象的属性
			for (key in data[0]) row += `${key},`;
		}
		row = row.slice(0, -1); // 删除最后一个,号，即a,b, => a,b
		CSV += `${row}\r\n`; // 添加换行符号
	}
	// 具体的数据处理
	data.map(function (n: any) {
		row = '';
		// 如果存在自定义key值
		if (columns.key.length) {
			columns.key.map(function (m: any) {
				row += `"${
					typeof columns.formatter === 'function' ? columns.formatter(m, n[m]) || n[m] : n[m]
				}",`;
			});
		} else {
			for (key in n) {
				row += `"${
					typeof columns.formatter === 'function'
						? columns.formatter(key, n[key]) || n[key]
						: n[key]
				}",`;
			}
		}
		row.slice(0, row.length - 1); // 删除最后一个,
		CSV += `${row}\r\n`; // 添加换行符号
	});
	if (!CSV) {
		return;
	}
	saveAs(fileName, CSV);
}

// 保存
function saveAs(fileName: string, csvData: any) {
	const bw = browser();
	if (!bw.edge || !bw.ie) {
		const alink = document.createElement('a');
		alink.id = 'linkDwnldLink';
		alink.href = getDownloadUrl(csvData) as string;
		document.body.appendChild(alink);
		const linkDom = document.getElementById('linkDwnldLink') as HTMLAnchorElement;
		linkDom.setAttribute('download', fileName);
		linkDom.click();
		document.body.removeChild(linkDom);
	} else {
		notification.error({ message: '当前浏览器不支持' });
	}
}

function getDownloadUrl(csvData: any) {
	const _utf = '\uFEFF'; // 为了使Excel以utf-8的编码模式，同时也是解决中文乱码的问题
	if (window.Blob && window.URL && (window.URL.createObjectURL as any)) {
		csvData = new Blob([_utf + csvData], {
			type: 'text/csv',
		});
		return URL.createObjectURL(csvData);
	}
}

function browser() {
	const obj: Record<string, any> = {};
	const ua = navigator.userAgent.toLowerCase();
	let s;
	(s = ua.indexOf('edge') !== -1 ? (obj.edge = 'edge') : ua.match(/rv:([\d.]+)\) like gecko/))
		? (obj.ie = s[1])
		: (s = ua.match(/msie ([\d.]+)/))
		? (obj.ie = s[1])
		: (s = ua.match(/firefox\/([\d.]+)/))
		? (obj.firefox = s[1])
		: (s = ua.match(/chrome\/([\d.]+)/))
		? (obj.chrome = s[1])
		: (s = ua.match(/opera.([\d.]+)/))
		? (obj.opera = s[1])
		: (s = ua.match(/version\/([\d.]+).*safari/))
		? (obj.safari = s[1])
		: 0;
	return obj;
}

/**
 * 将单一的数组集合处理成对象
 * @param {Array} objArray
 * @return [{},{},{}]
 */
function getCsvData(objArray: Record<string, any>[]) {
	const rtnArr: Record<string, any>[] = [];
	for (let i = 0; i < objArray.length; i++) {
		const obj = objArray[i];
		const { key } = obj;
		const { data } = obj;
		data.map((item: any, index: number) => {
			if (!rtnArr[index]) {
				rtnArr[index] = {};
			}
			rtnArr[index][key] = item;
		});
	}
	return rtnArr;
}

export default {
	saveWithFormatCsv,
	save,
};
