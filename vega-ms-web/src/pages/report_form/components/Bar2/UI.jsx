/**
 * 柱状图 展示组件
 *
 * 关联业务：
 *  配送商业退货响应时效统计
 *
 */
import { Button, Card } from 'antd';
import ReactEcharts from 'echarts-for-react';
import React from 'react';
import * as config from './config.js';
import { millisecondToDate } from '@/utils/format';
import jsonToCSV from '@/utils/jsonToCSV';

const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
const UI = ({ title = `${fields.distributor}退货响应时效统计`, width = '100%', apiData }) => {
	const yData = apiData.length > 0 ? apiData.map((e) => e.departmentName) : [];
	const data1 = apiData.length > 0 ? apiData.map((e) => e.confirmTime) : []; // 退货确认confirmTime
	const data2 = apiData.length > 0 ? apiData.map((e) => e.approvalTime) : []; // 退货复核
	const data3 = apiData.length > 0 ? apiData.map((e) => e.deliveredTime) : []; //  退货基础物资送达服务商
	const data4 = apiData.length > 0 ? apiData.map((e) => e.finishTime) : []; // 退货流程结束

	const hasValidValue = () => {
		const totalValue = [data1, data2, data3, data4].reduce(
			(a1, c1) => a1 + c1.reduce((a2, c2) => a2 + c2, 0),
			0,
		);

		return totalValue > 0;
	};

	const legendConfig = [
		{ name: '退货确认', color: '#FF435A', data: data1 },
		{ name: '退货复核', color: '#f08c71', data: data2 },
		{ name: `退货${fields.baseGoods}送达服务商`, color: '#FFD7D0', data: data3 },
		{ name: '退货流程结束', color: '#F3EEEF', data: data4 },
	];

	const option = {
		legend: {
			data: legendConfig.map((e) => e.name),
		},
		grid: config.grid,
		tooltip: config.tooltip,
		xAxis: config.xAxis,
		yAxis: config.getYAxis(yData),
		series: legendConfig.map(({ name, color, data }) =>
			config.getSeriesConfig({ name, color, data }),
		),
	};

	const cardStyle = { width, marginBottom: 25 };

	const canvasStyle = {
		height: apiData ? apiData.length * 40 : 0,
	};

	/**
	 * 下载文件为csv文件
	 */
	const download = () => {
		let config = {
			data: apiData,
			fileName: title,
			columns: {
				title: [
					'科室',
					'退货确认',
					'退货复核',
					`退货${fields.baseGoods}送达服务商`,
					'退货流程结束',
				],
				key: ['departmentName', 'confirmTime', 'approvalTime', 'deliveredTime', 'finishTime'],
				formatter: (n, v) => {
					//数据的格式化处理
					if (n !== 'departmentName') {
						return millisecondToDate(v);
					}
				},
			},
		};
		jsonToCSV.save(config);
	};

	/* ========== UI ========== */
	const fallBackUI = <div>暂无数据</div>;

	const validUI = (
		<ReactEcharts
			notMerge={true}
			lazyUpdate={true}
			option={option}
			style={canvasStyle}
			opts={{ renderer: 'svg' }}
		/>
	);

	const renderCondition = apiData.length === 0 || !hasValidValue();

	return (
		<Card
			title={title}
			bordered={false}
			style={cardStyle}
			extra={
				<Button
					disabled={renderCondition}
					onClick={download}>
					下载
				</Button>
			}>
			{renderCondition ? fallBackUI : validUI}
		</Card>
	);
};

export default UI;
