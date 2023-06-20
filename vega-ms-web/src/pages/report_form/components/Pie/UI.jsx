/**
 * 饼图 展示组件
 *
 * 关联业务：
 *  1.科室采购总金额统计
 *  2.科室耗材使用总金额统计
 *
 */
import { Button, Card, Radio } from 'antd';
import ReactEcharts from 'echarts-for-react';
import React from 'react';
import { color } from './config';
import jsonToCSV from '@/utils/jsonToCSV';

const Tab = ({ value = 1, onChange, download }) => {
	return (
		<div>
			<Radio.Group
				value={value}
				onChange={onChange}>
				<Radio.Button value={1}>月</Radio.Button>
				<Radio.Button value={3}>季</Radio.Button>
				<Radio.Button value={12}>年</Radio.Button>
			</Radio.Group>
			<Button
				className='ml1'
				onClick={download}>
				下载
			</Button>
		</div>
	);
};

const Pie = ({ title = '各科室耗材使用总金额统计', width = '100%', data, query, setQuery }) => {
	const handleSwitchOver = (e) => {
		const { value } = e.target;
		setQuery((p) => ({ ...p, num: value }));
	};

	const downloadFile = () => {
		data.map((item) => {
			return (item.rate = getPercentage(item.name));
		});

		let config = {
			data: data,
			fileName: title,
			columns: {
				title: ['名称', '金额/万元', '占比'],
				key: ['name', 'value', 'rate'],
				formatter: (n, v, c) => {
					//数据的格式化处理
				},
			},
		};
		jsonToCSV.save(config);
	};

	const keys = data.map((e) => e.name);

	const getTotal = () =>
		data.reduce((a, c) => (c.acturalValue ? a + Number(c.acturalValue) : a), 0);
	const getPercentage = (name) => {
		const total = getTotal();
		const theObj = data.find((e) => e.name === name);
		const theValue = theObj && Number(theObj.acturalValue);
		const percentage = ((theValue / total) * 100).toFixed(2);
		return `${percentage}%`;
	};

	const option = {
		backgroundColor: CONFIG_LESS['@bgc_table'],
		color: color,
		tooltip: {
			trigger: 'item',
			extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
			formatter: (a) => {
				const { name, percent, value } = a;
				return `${name} <br/> <span style="font-size: 24px; font-weight: bold">${value}</span> 万元 (${percent}%)`;
			},
			position: (x, y) => {
				return [x + 10, 20];
			},
			backgroundColor: CONFIG_LESS['@bgc_table'],
			textStyle: {
				color: CONFIG_LESS['@c_body'],
				fontSize: 18,
			},
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true,
		},
		// 图例配置
		legend: {
			type: 'scroll',
			orient: 'vartical', // 图例列表的布局朝向 'horizontal' | 'vertical'
			x: 'left',
			top: 'middle',
			//   top: '4%',
			left: '55%',
			bottom: '0%',
			selectedMode: false,
			data: keys,
			itemgap: 10, // 图例每项之间的间隔。横向布局时为水平间隔，纵向布局时为纵向间隔
			itemWidth: 29, // 图例标记的图形宽度
			itemHeight: 14, // 图例标记的图形高度
			// itemGap: 16,
			formatter: (name) => `${name} ${getPercentage(name)}`, // 用来格式化图例文本，支持字符串模板和回调函数两种形式
		},
		series: [
			{
				type: 'pie',
				stillShowZeroSum: false,
				clockwise: false, // 饼图的扇区是否是顺时针排布
				// minAngle: 90, // 最小的扇区角度（0 ~ 360）
				radius: ['35%', '75%'], // 饼图的半径, 数组的第一项是内半径，第二项是外半径
				center: ['27%', '50%'], // 饼图的中心（圆心）坐标
				// roseType: "radius", // 蓝丁格尔图 'radius' 扇区圆心角展现数据的百分比，半径展现数据的大小  | 'area' 所有扇区圆心角相同，仅通过半径展现数据大小
				avoidLabelOverlap: false,
				labelLine: {
					normal: {
						show: false,
					},
				},
				label: {
					normal: {
						show: false,
						position: 'outside',
						formatter: '{text|{b}}\n{c}万元 ({d}%)',
						rich: {
							text: {
								color: CONFIG_LESS['@c_666'],
								fontSize: 16,
								fontWeight: 'bold',
								align: 'center',
								verticalAlign: 'middle',
								padding: 8,
							},
							value: {
								color: CONFIG_LESS['@c_4B7CFF'],
								fontSize: 16,
								align: 'center',
								verticalAlign: 'middle',
							},
						},
					},
					// emphasis: {
					//   show: false,
					//   textStyle: {
					//     fontSize: 20,
					//   },
					// },
				},
				data: data,
			},
		],
	};

	const cardStyle = {
		width,
		// height: 420,
		// height: 420,
		marginBottom: 25,
	};

	/* ========== UI ========== */

	const fallBackUI = <div>暂无数据</div>;

	const validUI = (
		<ReactEcharts
			notMerge={true}
			lazyUpdate={true}
			option={option}
		/>
	);

	const renderCondition = data.length === 0 || getTotal() === 0;

	return (
		<Card
			title={title}
			extra={
				query && (
					<div style={{ display: 'flex' }}>
						<Tab
							onChange={handleSwitchOver}
							value={query.num}
							download={downloadFile}
						/>
					</div>
				)
			}
			bordered={false}
			style={cardStyle}>
			{renderCondition ? fallBackUI : validUI}
		</Card>
	);
};

export default Pie;
