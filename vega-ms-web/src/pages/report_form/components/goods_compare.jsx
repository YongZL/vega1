import React from 'react';
import { Card, Col, Row } from 'antd';
import ReactEcharts from 'echarts-for-react';
import { priceToTenThousand } from '@/utils/format';

import '@/pages/report_form/style.less';
import styles from '../style.less';
import { getGoodsCompare } from '../service';
/**
 * 耗材使用总金额比例
 */
class GoodsCompare extends React.Component {
	constructor(props) {
		super(props);
	}

	state = {
		config: {
			departmentId: this.props.params.departmentId ? this.props.params.departmentId : null, //如果没有传科室Id，获得全部科室数据
			// num:12, //过去十二个月
		},
	};

	componentDidMount() {
		this.requestData();
	}

	componentDidUpdate(prevProps) {
		if (
			this.props.params.target != prevProps.params.target ||
			this.props.params.departmentId != prevProps.params.departmentId
		) {
			this.requestData();
		}
	}
	/**
	 * 请求数据
	 */
	requestData = () => {
		const { config } = this.state;
		let target = this.props.params.target;
		let departmentId = this.props.params.departmentId;
		let params = {
			...config,
			target: target ? target : null,
			departmentId: departmentId ? departmentId : null,
		};

		getGoodsCompare(params).then((res) => {
			if (res && res.code === 0) {
				this.setState({ data: res.data });
			}
		});
	};

	getOption = (data) => {
		//解析数据，获取时间，同比，环比数据
		let formatData = this.getFormatData(data);
		let byValueData = formatData.byValueData; //高值、低值
		let byImplantationData = formatData.byImplantationData; //植入、非植入
		let optionByValue = {
			tooltip: {
				trigger: 'item',
				// formatter: "{b}:<br/> {c} ({d}%)",
				extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
				formatter: (a) => {
					const { name, percent } = a;
					const money = priceToTenThousand(a.data.value); // 万元
					// return `${a.data.name}:<br/>￥${(a.data.value/100).toFixed(2)}(${a.percent}%)`
					return `${name} <br/> <span style="font-size: 24px; font-weight: bold">${money}</span> 万元 (${percent}%)`;
				},
				position: (x) => {
					return [x + 10, 20];
				},
				backgroundColor: CONFIG_LESS['@bgc_table'],
				textStyle: {
					color: '#333333',
					fontSize: 18,
				},
			},
			legend: {
				x: 'center',
				y: 'bottom',
				data: ['高值', '低值'],
				selectedMode: false,
			},
			series: [
				{
					name: '按价值分',
					type: 'pie',
					radius: ['50%', '70%'],
					avoidLabelOverlap: false,
					label: {
						normal: {
							show: true,
							fontSize: '15',
							position: 'center',
							formatter: (a) => {
								// return '低值/高值';//seriesName
								return a.seriesName;
							},
							color: '#3D66FF',
						},
						emphasis: {
							show: false,
							textStyle: {
								fontSize: '20',
								fontWeight: 'bold',
								color: '#3D66FF',
							},
							formatter: () => {
								// return a.seriesName;
							},
						},
					},
					labelLine: {
						normal: {
							show: false,
						},
					},
					data: byValueData,
				},
			],
			color: ['#3D66FF', '#BED1FF'],
		};
		let optionByImpl = {
			tooltip: {
				trigger: 'item',
				extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
				formatter: (a) => {
					const { name, percent } = a;
					const money = priceToTenThousand(a.data.value); // 万元
					// return `${a.data.name}:<br/>￥${(a.data.value/100).toFixed(2)}(${a.percent}%)`
					return `${name} <br/> <span style="font-size: 24px; font-weight: bold">${money}</span> 万元 (${percent}%)`;
				},
				position: (x) => {
					return [x + 10, 20];
				},
				backgroundColor: CONFIG_LESS['@bgc_table'],
				textStyle: {
					color: '#333333',
					fontSize: 18,
				},
			},
			legend: {
				x: 'center',
				y: 'bottom',
				data: ['植入', '非植入'],
				selectedMode: false,
			},
			series: [
				{
					name: '按植入分',
					type: 'pie',
					radius: ['50%', '70%'],
					avoidLabelOverlap: false,
					label: {
						normal: {
							show: true,
							fontSize: '15',
							position: 'center',
							formatter: (a) => {
								return a.seriesName;
							},
							color: '#7E6AF2',
						},
						emphasis: {
							show: false,
							textStyle: {
								fontSize: '20',
								fontWeight: 'bold',
							},
						},
					},
					labelLine: {
						normal: {
							show: false,
						},
					},
					data: byImplantationData,
				},
			],
			color: ['#E5E1FC', '#7E6AF2'],
		};

		return {
			optionByValue: optionByValue,
			optionByImpl: optionByImpl,
		};
	};

	/**
	 * 格式化获得的数据
	 */
	getFormatData = (data) => {
		if (!data) {
			return undefined;
		}
		let byValueData = this.getCombineData(data.total, data.highValue, 1);
		let byImplantationData = this.getCombineData(data.total, data.implantation, 2); //非植入
		return {
			byValueData: byValueData,
			byImplantationData: byImplantationData,
		};
	};

	/**
	 * 增长率计算
	 * @param lastDataArr   :number[]
	 * @param currDataArr   :number[]
	 * @return              :string[]
	 */
	getCombineData = (total, part, type) => {
		if (type == 1) {
			if (!part && !(total - part)) {
				return null;
			}
			return [
				{ value: part, name: '高值' },
				{ value: total - part, name: '低值' },
			];
		} else if (type == 2) {
			if (!part && !(total - part)) {
				return null;
			}
			return [
				{ value: total - part, name: '非植入' },
				{ value: part, name: '植入' },
			];
		}
	};

	render() {
		const { data } = this.state;
		let formatData = this.getFormatData(data);
		let optionData = undefined;
		if (data) {
			optionData = this.getOption(data);
		}
		return (
			<div className={styles.bottomGap}>
				<Card
					title={this.props.title ? this.props.title : '所有科室采购金额占比'}
					bordered={false}>
					<Row>
						<Col xs={12}>
							{optionData && formatData && formatData.byValueData ? (
								<ReactEcharts
									notMerge={true}
									lazyUpdate={true}
									option={optionData.optionByValue}
									opts={{ renderer: 'svg' }}
								/>
							) : (
								<div>暂无数据</div>
							)}
						</Col>
						<Col xs={12}>
							{optionData && formatData && formatData.byImplantationData ? (
								<ReactEcharts
									notMerge={true}
									lazyUpdate={true}
									option={optionData.optionByImpl}
									opts={{ renderer: 'svg' }}
								/>
							) : (
								<div>暂无数据</div>
							)}
						</Col>
					</Row>
				</Card>
			</div>
		);
	}
}

export default GoodsCompare;
