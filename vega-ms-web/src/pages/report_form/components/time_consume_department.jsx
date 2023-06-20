import React from 'react';
import { Button, Card } from 'antd';
import ReactEcharts from 'echarts-for-react';
import jsonToCSV from '@/utils/jsonToCSV';
import { millisecondToDate } from '@/utils/format';

import { getDepartmentTimeConsume } from '../service';
import '../style.less';

class Module extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			departmentList: [],
			goodsRequestApprovalTimes: [],
			goodsRequestReviewTimes: [],
			surgicalRequestTimes: [],
			surgicalRequestApprovalTimes: [],
			// surgicalRequestReviewTimes: [],
			purchasePlanApprovalTimes: [],
			emptyList1: [],
			emptyList2: [],
		};
	}
	componentDidMount() {
		this.getOption();
	}

	componentDidUpdate(prevProps) {
		if (this.props.params.target != prevProps.params.target) {
			this.getOption({
				target: this.props.params.target,
			});
		}
	}

	// 计算空白距离
	getDistance = (a, b, c) => {
		let sum = [];
		if (c) {
			sum = a.map(function (v, i) {
				return v + b[i] + c[i];
			});
		} else {
			sum = a.map(function (v, i) {
				return v + b[i];
			});
		}
		let distance = Math.max.apply(null, sum) + 360000;
		let empty = sum.map((item, index) => {
			return parseInt(distance - item);
		});
		return empty;
	};

	getOption(params) {
		getDepartmentTimeConsume(params).then((res) => {
			if (res && res.code === 0) {
				let data = res.data;
				let departmentList = res.data.map((item) => {
					return item.departmentName;
				});
				let goodsRequestApprovalTimes = res.data.map((item) => {
					return item.goodsRequestApprovalTime;
				});
				let goodsRequestReviewTimes = res.data.map((item) => {
					return item.goodsRequestReviewTime;
				});
				let surgicalRequestTimes = res.data.map((item) => {
					return item.surgicalRequestTime;
				});
				let surgicalRequestApprovalTimes = res.data.map((item) => {
					return item.surgicalRequestApprovalTime;
				});
				// let surgicalRequestReviewTimes = res.data.map(item => {
				//   return item.surgicalRequestReviewTime;
				// });
				let purchasePlanApprovalTimes = res.data.map((item) => {
					return item.purchasePlanApprovalTime;
				});

				let emptyList1 = this.getDistance(goodsRequestApprovalTimes, goodsRequestReviewTimes);
				let emptyList2 = this.getDistance(
					surgicalRequestTimes,
					surgicalRequestApprovalTimes,
					// surgicalRequestReviewTimes
				);

				this.setState({
					data,
					departmentList,
					goodsRequestApprovalTimes,
					goodsRequestReviewTimes,
					surgicalRequestTimes,
					surgicalRequestApprovalTimes,
					// surgicalRequestReviewTimes,
					purchasePlanApprovalTimes,
					emptyList1,
					emptyList2,
				});
			}
		});
	}

	/**
	 * 下载文件为csv文件
	 */
	download = () => {
		const { data } = this.state;
		let config = {
			data: data,
			fileName: this.props.title,
			columns: {
				title: [
					'科室',
					'请领确认',
					'请领复核',
					'手术请领',
					'手术请领审核',
					// "手术请领复核",
					'采购申请审核',
				],
				key: [
					'departmentName',
					'goodsRequestApprovalTime',
					'goodsRequestReviewTime',
					'surgicalRequestTime',
					'surgicalRequestApprovalTime',
					// "surgicalRequestReviewTime",
					'purchasePlanApprovalTime',
				],
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

	render() {
		const {
			departmentList,
			goodsRequestApprovalTimes,
			goodsRequestReviewTimes,
			surgicalRequestTimes,
			surgicalRequestApprovalTimes,
			// surgicalRequestReviewTimes,
			purchasePlanApprovalTimes,
			emptyList1,
			emptyList2,
		} = this.state;

		const option = {
			color: ['#BDCAFF', '#86A0FF', '#E6E7FE', '#C0C1FB', '#A4A5FA', '#D788F6'],
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
				},
				formatter: function (params) {
					let info = params[0].name + '<br/>';
					params.map((item) => {
						let date = item.value ? millisecondToDate(item.value) : '0秒';
						item.seriesName.indexOf('series') > -1
							? ''
							: (info += item.seriesName + '：' + date + '<br/>');
					});
					return info;
				},
			},
			legend: {
				data: [
					'请领确认',
					'请领复核',
					'手术请领',
					'手术请领审核',
					// "手术请领复核",
					'采购申请审核',
				],
				selectedMode: false,
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: 0,
				containLabel: true,
			},
			xAxis: {
				type: 'value',
				show: false,
			},
			yAxis: {
				type: 'category',
				inverse: true,
				data: departmentList,
				splitLine: { show: false },
				axisTick: { show: false },
				axisLine: { show: false },
			},
			series: [
				{
					name: '请领确认',
					type: 'bar',
					stack: '耗时',
					data: goodsRequestApprovalTimes,
				},
				{
					name: '请领复核',
					type: 'bar',
					stack: '耗时',
					data: goodsRequestReviewTimes,
				},
				{
					type: 'bar',
					stack: '耗时',
					itemStyle: {
						normal: {
							barBorderColor: CONFIG_LESS['@c_body'],
							color: CONFIG_LESS['@c_body'],
						},
						emphasis: {
							barBorderColor: CONFIG_LESS['@c_body'],
							color: CONFIG_LESS['@c_body'],
						},
					},
					data: emptyList1,
				},
				{
					name: '手术请领',
					type: 'bar',
					stack: '耗时',
					data: surgicalRequestTimes,
				},
				{
					name: '手术请领审核',
					type: 'bar',
					stack: '耗时',
					data: surgicalRequestApprovalTimes,
				},
				// {
				//   name: "手术请领复核",
				//   type: "bar",
				//   stack: "耗时",
				//   data: surgicalRequestReviewTimes
				// },
				{
					type: 'bar',
					stack: '耗时',
					itemStyle: {
						normal: {
							barBorderColor: CONFIG_LESS['@c_body'],
							color: CONFIG_LESS['@c_body'],
						},
						emphasis: {
							barBorderColor: CONFIG_LESS['@c_body'],
							color: CONFIG_LESS['@c_body'],
						},
					},
					data: emptyList2,
				},
				{
					name: '采购申请审核',
					type: 'bar',
					stack: '耗时',
					data: purchasePlanApprovalTimes,
				},
			],
		};

		return (
			<div className='reportWarp'>
				<Card
					bordered={false}
					title={this.props.title}
					extra={
						<Button
							onClick={this.download}
							size='small'>
							下载
						</Button>
					}>
					<ReactEcharts
						option={option}
						style={{ height: 30 * (departmentList.length + 1), width: '100%' }}
						opts={{ renderer: 'svg' }}
					/>
				</Card>
			</div>
		);
	}
}

export default Module;
