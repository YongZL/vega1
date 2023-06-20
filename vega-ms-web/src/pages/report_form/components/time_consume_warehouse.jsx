import React from 'react';
import { Card, Menu } from 'antd';
import ReactEcharts from 'echarts-for-react';
import { millisecondToDate } from '@/utils/format';

import { reportFromWarehouseRoles } from '@/constants/dictionary';
import { getDurationList } from '../service';
import '../style.less';

class Module extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			personList: [],
			durations: [],
		};
	}
	componentDidMount() {
		this.getOption();
	}

	componentDidUpdate(prevProps) {
		if (this.props.params.target !== prevProps.params.target) {
			this.getOption();
		}
	}

	getOption = (param) => {
		let params = {
			role: 'receiver',
			target: this.props.params.target,
			...param,
		};
		getDurationList(params).then((res) => {
			if (res && res.code === 0) {
				let personList = res.data.map((item) => {
					return item.name;
				});
				let durations = res.data.map((item) => {
					return item.duration;
				});
				this.setState({
					personList,
					durations,
				});
			}
		});
	};

	rolesSelect = (value) => {
		let parmas = {
			role: value.key,
		};
		this.getOption(parmas);
	};

	render() {
		const { personList, durations } = this.state;
		const option = {
			color: ['#F8BD5B'],
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
				},
				formatter: function (params) {
					return params[0].name + '：' + millisecondToDate(params[0].value);
				},
			},
			grid: {
				left: document.documentElement.clientWidth <= 1440 ? '22%' : '15%',
				right: 0,
				bottom: 0,
				top: 0,
				// containLabel: true,
			},
			xAxis: {
				type: 'value',
				show: false,
			},
			yAxis: {
				type: 'category',
				data: personList,
				inverse: true,
				splitLine: { show: false },
				axisTick: { show: false },
				axisLine: { show: false },
			},
			series: [
				{
					type: 'bar',
					data: durations,
					// data: [2323232,432423]
				},
			],
		};
		return (
			<div className='reportWarp'>
				<Card
					bordered={false}
					title={this.props.title}>
					<div style={{ display: 'flex' }}>
						<Menu
							onSelect={this.rolesSelect}
							defaultSelectedKeys={['receiver']}>
							{reportFromWarehouseRoles.map((item) => {
								return <Menu.Item key={item.value}>{item.label}</Menu.Item>;
							})}
						</Menu>
						{durations.length > 0 ? (
							<ReactEcharts
								option={option}
								style={{ height: 40 * durations.length, width: '100%' }}
								opts={{ renderer: 'svg' }}
							/>
						) : (
							<div className='emptyInfo'>暂无数据</div>
						)}
					</div>
				</Card>
			</div>
		);
	}
}

export default Module;
