// 校验单价
const precision = JSON.parse(sessionStorage.getItem('precision') || '{}')['configValue'];
const precisionValue = parseInt(precision || 2);
export const validateProcurementPrice = (_rule: any, value: string) => {
	const reg = new RegExp(`^[0-9]([0-9]+)?(\.[0-9]{1,${precisionValue}})?$`);
	if (value && !reg.test(value)) {
		return Promise.reject('请输入正确数值');
	}
	if (parseFloat(value) && parseFloat(value) > 1000000) {
		return Promise.reject('最高可输入1000000');
	}
	return Promise.resolve();
};

export const formLayoutItem = {
	wrapperCol: {
		xs: { span: 16 },
		sm: { span: 16 },
		md: { span: 17 },
		lg: { span: 12 },
		xl: { span: 20 },
		xxl: { span: 20 },
	},
};

export const formListLayout = {
	labelCol: {
		style: { width: 120 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 15 },
		md: { span: 16 },
		lg: { span: 12 },
		xl: { span: 15 },
		xxl: { span: 16 },
	},
};
