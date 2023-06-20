/**
 * 柱状图 展示组件
 *
 * 关联业务：
 *  1.各配送商业消耗使用总金额排名
 *  2.新增配送商业消耗金额及占比
 */
import { Button, Card } from 'antd';
import ReactEcharts from 'echarts-for-react';
import React from 'react';
import { convertPriceWithDecimal } from '@/utils/format';
import jsonToCSV from '@/utils/jsonToCSV';

const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
const ColumnChart = ({ title = `各${fields.distributor}消耗总金额排名`, keys, values }) => {
	const option = {
		tooltip: {
			show: true,
			trigger: 'axis',
			extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
			backgroundColor: CONFIG_LESS['@bgc_table'],
			textStyle: {
				color: '#333333',
				fontSize: 18,
			},
			formatter: (params) => {
				const { name, value } = params[0];
				// return `${name} <br/><br/> <TipNum value={${value}} fontSize="24px"/>`;
				return `${name} <br/><br/> <span style="font-size: 24px; font-weight: bold">${convertPriceWithDecimal(
					value,
				)}</span> 元`;
			},
		},
		grid: {
			top: '0%',
			left: '0%',
			right: '0%',
			bottom: '0%',
			containLabel: true,
		},
		xAxis: {
			show: false,
			type: 'value',
			splitLine: false,
			axisTick: {
				show: false,
			},
			boundaryGap: [0, '10%'],
		},
		yAxis: {
			type: 'category',
			splitLine: false,
			axisLabel: {
				inside: true,
				padding: [6, 0, 6, 0],
				verticalAlign: 'bottom',
				formatter: (name, index) => {
					const value = convertPriceWithDecimal(values[index]);
					return `${name}: ${value}元`;
				},
			},
			axisTick: {
				show: false,
				length: 2,
			},
			axisLine: {
				show: false,
			},
			axisPointer: {
				type: 'none',
			},
			data: keys,
		},
		series: [
			{
				type: 'bar',
				barGap: '-100%',
				barWidth: '20%',
				itemStyle: {
					normal: {
						color: 'rgba(61,102,255,1)',
						opacity: 0.5,
					},
					emphasis: {
						color: 'rgba(61,102,255,1)',
						opacity: 1,
					},
				},
				data: values,
			},
		],
	};

	const cardStyle = {
		padding: 0,
		marginBottom: 25,
	};

	const canvasStyle = {
		height: keys ? keys.length * 65 : 0,
	};

	/**
	 * 下载csv文件
	 */
	const download = () => {
		//转化csv需要的数据格式
		let objArray = [
			{ key: 'companyName', name: '公司名称', data: keys.reverse() },
			{ key: 'counts', name: '金额(元)', data: values.reverse() },
		];
		let fileName = title;
		let formatter = (n, v) => {
			if (n == 'counts') {
				return convertPriceWithDecimal(v);
			}
		};
		jsonToCSV.saveWithFormatCsv(fileName, objArray, formatter);
	};

	return (
		<Card
			title={title}
			bordered={false}
			style={cardStyle}
			extra={
				<Button
					onClick={download}
					disabled={!(values && values.length > 0)}>
					下载
				</Button>
			}>
			{!values || values.length === 0 ? (
				<div>暂无数据</div>
			) : (
				<ReactEcharts
					notMerge={true}
					lazyUpdate={true}
					option={option}
					style={canvasStyle}
					opts={{ renderer: 'svg' }}
				/>
			)}
		</Card>
	);
};

export default ColumnChart;
