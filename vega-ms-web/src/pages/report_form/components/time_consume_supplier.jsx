import React from 'react';
import { Button, Card } from 'antd';
import ReactEcharts from 'echarts-for-react';
import { millisecondToDate } from '@/utils/format';
import jsonToCSV from '@/utils/jsonToCSV';
import { getSupplierTimeConsume } from '../service';
import '../style.less';

const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
class Module extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			supplierList: [],
			receivedTimes: [],
			shippingTimes: [],
			returnGoodsTimes: [],
			emptyList: [],
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
		let distance = Math.max.apply(null, sum) + 36000;
		let empty = sum.map((item, index) => {
			return parseInt(distance - item);
		});
		return empty;
	};

	getOption(params) {
		getSupplierTimeConsume(params).then((res) => {
			if (res && res.code === 0) {
				let data = res.data;
				let supplierList = data.map((item) => {
					return item.supplierName;
				});
				let receivedTimes = data.map((item) => {
					return item.receivedTime;
				});
				let shippingTimes = data.map((item) => {
					return item.shippingTime;
				});
				let returnGoodsTimes = data.map((item) => {
					return item.returnGoodsTime;
				});

				let emptyList = this.getDistance(receivedTimes, shippingTimes);

				this.setState({
					data,
					supplierList,
					receivedTimes,
					shippingTimes,
					returnGoodsTimes,
					emptyList,
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
				title: [`${fields.distributor}`, '订单接收', `${fields.distributor}配送`, '回收退货'],
				key: ['supplierName', 'receivedTime', 'shippingTime', 'returnGoodsTime'],
				formatter: (n, v) => {
					//数据的格式化处理
					if (n !== 'supplierName') {
						return millisecondToDate(v);
					}
				},
			},
		};
		jsonToCSV.save(config);
	};

	render() {
		const { supplierList, receivedTimes, shippingTimes, returnGoodsTimes, emptyList } = this.state;

		const option = {
			color: ['#A9C1FF', '#628CFF', '#FF7384'],
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					// 坐标轴指示器，坐标轴触发有效
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
				data: ['订单接收', `${fields.distributor}配送`, '回收退货'],
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
				data: supplierList,
				inverse: true,
				splitLine: { show: false },
				axisTick: { show: false },
				axisLine: { show: false },
			},
			series: [
				{
					name: '订单接收',
					type: 'bar',
					stack: '耗时',
					data: receivedTimes,
				},
				{
					name: `${fields.distributor}配送`,
					type: 'bar',
					stack: '耗时',
					data: shippingTimes,
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
					data: emptyList,
				},
				{
					name: '回收退货',
					type: 'bar',
					stack: '耗时',
					data: returnGoodsTimes,
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
						style={{ height: 36 * (supplierList.length + 1), width: '100%' }}
						opts={{ renderer: 'svg' }}
					/>
				</Card>
			</div>
		);
	}
}

export default Module;
