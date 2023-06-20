import { millisecondToDate } from '@/utils/format';

export const getSeriesConfig = ({ name, color, data }) => ({
	type: 'bar',
	name,
	stack: '2',
	barWidth: 15,
	itemStyle: {
		color,
		opacity: 1,
	},
	label: {
		show: false,
		position: 'inside',
		formatter: ({ value }) => {
			return `${value}`;
		},
	},
	emphasis: {
		itemStyle: {
			color,
			opacity: 1,
		},
	},
	data,
});

// grid
export const grid = {
	containLabel: true,
	top: 40,
	left: 0,
	right: 15,
	bottom: 0,
};

// hover提示框
export const tooltip = {
	trigger: 'axis',
	axisPointer: {
		type: 'shadow',
		label: {
			show: true,
		},
	},
	formatter: (params) => {
		let startStr = params[0].name + '<br/>';

		return params.reduce((p, c) => {
			const { seriesName, value } = c;
			const time = value ? millisecondToDate(value) : '0秒';
			return p + `${seriesName} : ${time} <br/>`;
		}, startStr);
	},
};

// x轴
export const xAxis = {
	show: false,
	type: 'value',
	splitLine: false,
	axisTick: {
		show: false,
	},
	boundaryGap: [0, 0.01],
};

// Y轴
export const getYAxis = (yData) => ({
	type: 'category',
	splitLine: false,
	// interval: 40,
	inverse: true,
	axisLine: {
		show: false,
	},
	// axisLabel: false,
	axisTick: {
		show: false,
		// interval: 40,
	},
	// axisPointer: {
	//   type: "none",
	// },
	data: yData,
});
