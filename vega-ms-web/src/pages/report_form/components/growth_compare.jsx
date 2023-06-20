import React from 'react';
import { Card, Col, Row, Table } from 'antd';
import ReactEcharts from 'echarts-for-react';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
// import { millisecondToDate } from '@/utils/format';
// import jsonToCSV from '@/utils/jsonToCSV';

import { getDepartmentGrowth } from '../service';
import styles from '../style.less';

class GrowthDepartmentModule extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			upperAnnualList: [],
			upperChainList: [],
			lowerAnnualList: [],
			lowerChainList: [],
			optionUpChain: {
				legend: {
					show: false,
				},
				color: ['rgba(61,102,255,.3)'],
				grid: {
					left: 36,
					bottom: 0,
					top: 0,
				},
				toolbox: {
					show: false,
				},
				xAxis: {
					type: 'value',
					show: false,
					splitLine: {
						show: false,
					},
					inverse: false,
				},
				yAxis: {
					type: 'category',
					show: false,
					inverse: true,
					scale: true,
				},
				series: {
					type: 'bar',
					barWidth: '100%',
				},
			},
			optionUpAnnual: {},
			optionLowerChain: {},
			optionLowerAnnual: {},
			averageChain: '',
			averageAnnual: '',
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

	getOption(params) {
		getDepartmentGrowth(params).then((res) => {
			if (res && res.code === 0) {
				let optionUpChain = {
					...this.state.optionUpChain,
					series: {
						type: 'bar',
						barWidth: '100%',
						data:
							res.data.averageChainGrowth < 0
								? res.data.upperChainGrowth.map((item) => {
										return item.rate - res.data.averageChainGrowth;
								  })
								: res.data.upperChainGrowth.map((item) => {
										return item.rate;
								  }),
					},
				};
				let optionUpAnnual = {
					...this.state.optionUpChain,
					color: ['rgba(136,137,247,.3)'],
					series: {
						type: 'bar',
						barWidth: '100%',
						data:
							res.data.averageAnnualGrowth < 0
								? res.data.upperAnnualGrowth.map((item) => {
										return item.rate - res.data.averageAnnualGrowth;
								  })
								: res.data.upperAnnualGrowth.map((item) => {
										return item.rate;
								  }),
					},
				};
				let optionLowerChain = {
					...this.state.optionUpChain,
					color: ['rgba(61,102,255,.08)'],
					grid: {
						left: 0,
						right: 0,
						bottom: 0,
						top: 0,
					},
					xAxis: {
						type: 'value',
						splitLine: {
							show: false,
						},
						inverse: false,
						show: false,
					},
					series: {
						type: 'bar',
						barWidth: '100%',
						data:
							res.data.averageChainGrowth > 0
								? res.data.lowerChainGrowth.map((item) => {
										return item.rate - res.data.averageChainGrowth;
								  })
								: res.data.lowerChainGrowth.map((item) => {
										return item.rate;
								  }),
					},
				};
				let optionLowerAnnual = {
					...this.state.optionUpChain,
					color: ['rgba(136,137,247,.08)'],
					grid: {
						left: 0,
						right: 12,
						bottom: 0,
						top: 0,
					},
					xAxis: {
						type: 'value',
						splitLine: {
							show: false,
						},
						inverse: false,
						show: false,
					},
					series: {
						type: 'bar',
						barWidth: '100%',
						data:
							res.data.averageAnnualGrowth > 0
								? res.data.lowerAnnualGrowth.map((item) => {
										return item.rate - res.data.averageAnnualGrowth;
								  })
								: res.data.lowerAnnualGrowth.map((item) => {
										return item.rate;
								  }),
					},
				};
				let averageChainGrowth = res.data.averageChainGrowth;
				let averageAnnualGrowth = res.data.averageAnnualGrowth;

				this.setState({
					upperAnnualList: res.data.upperAnnualGrowth,
					upperChainList: res.data.upperChainGrowth,
					lowerAnnualList: res.data.lowerAnnualGrowth,
					lowerChainList: res.data.lowerChainGrowth,
					optionUpChain,
					optionUpAnnual,
					optionLowerChain,
					optionLowerAnnual,
					averageAnnual: (averageAnnualGrowth * 100).toFixed(2),
					averageChain: (averageChainGrowth * 100).toFixed(2),
				});
			}
		});
	}

	/**
	 * 下载文件为csv文件
	 */
	download = (type) => {
		// const { data } = this.state;
		// if (type === 'chain') {
		// }
		// let config = {
		//   data: data,
		//   fileName: type === 'chain' ? this.props.title[0] : this.props.title[1],
		//   columns: {
		//     title: [
		//       "科室",
		//       "请领确认",
		//       "请领复核",
		//       "手术请领",
		//       "手术请领确认",
		//       "手术请领复核",
		//       "采购申请审核"
		//     ],
		//     key: [
		//       "departmentName",
		//       "goodsRequestApprovalTime",
		//       "goodsRequestReviewTime",
		//       "surgicalRequestTime",
		//       "surgicalRequestApprovalTime",
		//       "surgicalRequestReviewTime",
		//       "purchasePlanApprovalTime"
		//     ],
		//     formatter: (n, v) => {
		//       //数据的格式化处理
		//       if (n !== "departmentName") {
		//         return millisecondToDate(v);
		//       }
		//     }
		//   }
		// };
		// jsonToCSV.save(config);
	};

	render() {
		const {
			optionUpChain,
			optionUpAnnual,
			optionLowerChain,
			optionLowerAnnual,
			upperAnnualList,
			upperChainList,
			lowerAnnualList,
			lowerChainList,
			averageAnnual,
			averageChain,
		} = this.state;
		let columns = [
			{
				dataIndex: 'departmentId',
				key: 'departmentId',
				width: 40,
				render: (text, record, index) => {
					return <span>{index + 1}</span>;
				},
			},
			{
				dataIndex: 'departmentName',
				key: 'departmentName',
			},
			{
				dataIndex: 'rate',
				key: 'rate',
				width: 120,
				align: 'right',
				render: (text) => {
					return <span style={{ color: '#5C89FF' }}>{(text * 100).toFixed(2)}%</span>;
				},
			},
		];
		return (
			<div className={styles.reportWarp}>
				<Row className={styles.growthWrap}>
					<Col span={12}>
						<Card
							bordered={false}
							title={this.props.title[0]}
							// extra={
							// <Button
							//   onClick={this.download.bind(this, "chain")}
							//   size="small"
							// >
							//   下载
							// </Button>
							// }
						>
							<ReactEcharts
								option={optionUpChain}
								style={{
									height: 39 * upperChainList.length,
									width: '100%',
									position: 'relative',
									zIndex: 9999,
								}}
								opts={{ renderer: 'svg' }}
							/>
							<Table
								className={styles.rankTable}
								columns={columns}
								dataSource={upperChainList}
								size='small'
								rowKey='departmentId'
								pagination={false}
								style={{ marginTop: -39 * upperChainList.length }}
								showHeader={false}
							/>
							<div className={styles.average}>
								<h4>平均增长率</h4>
								<div style={{ color: '#5C89FF' }}>
									{averageChain}%{averageChain > 0 ? <CaretUpOutlined /> : <CaretDownOutlined />}
								</div>
							</div>
							<ReactEcharts
								option={optionLowerChain}
								style={{
									height: 39 * lowerChainList.length,
									width: '100%',
									position: 'relative',
									zIndex: 9999,
								}}
								opts={{ renderer: 'svg' }}
							/>
							<Table
								className={styles.rankTable}
								columns={columns}
								dataSource={lowerChainList}
								size='small'
								rowKey='departmentId'
								pagination={false}
								style={{ marginTop: -39 * lowerChainList.length }}
								showHeader={false}
							/>
						</Card>
					</Col>
					<Col
						span={11}
						offset={1}>
						<Card
							bordered={false}
							title={this.props.title[1]}
							// extra={
							// <Button
							//   onClick={this.download.bind(this, "chain")}
							//   size="small"
							// >
							//   下载
							// </Button>
							// }
						>
							<ReactEcharts
								option={optionUpAnnual}
								style={{
									height: 39 * upperAnnualList.length,
									width: '100%',
									position: 'relative',
									zIndex: 9999,
								}}
								opts={{ renderer: 'svg' }}
							/>
							<Table
								className={styles.rankTable}
								columns={columns}
								dataSource={upperAnnualList}
								size='small'
								rowKey='departmentId'
								pagination={false}
								style={{ marginTop: -39 * upperAnnualList.length }}
								showHeader={false}
							/>
							<div className={styles.average}>
								<h4>平均增长率</h4>
								<div style={{ color: '#8889F7' }}>
									{averageAnnual}%{averageChain > 0 ? <CaretDownOutlined /> : <CaretUpOutlined />}
								</div>
							</div>
							<ReactEcharts
								option={optionLowerAnnual}
								style={{
									height: 39 * lowerAnnualList.length,
									width: '100%',
									position: 'relative',
									zIndex: 9999,
								}}
								opts={{ renderer: 'svg' }}
							/>
							<Table
								className={styles.rankTable}
								columns={columns}
								dataSource={lowerAnnualList}
								size='small'
								rowKey='departmentId'
								pagination={false}
								style={{ marginTop: -39 * lowerAnnualList.length }}
								showHeader={false}
							/>
						</Card>
					</Col>
				</Row>
			</div>
		);
	}
}

export default GrowthDepartmentModule;
