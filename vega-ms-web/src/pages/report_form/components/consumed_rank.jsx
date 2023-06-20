import React from 'react';
import { Card, Radio, Table } from 'antd';
import ReactEcharts from 'echarts-for-react';
import { convertPriceWithDecimal } from '@/utils/format';

import { getGoodsConsumedRank } from '../service';
import styles from '../style.less';

class GoodsConsumedModule extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			option: {
				legend: {
					show: false,
				},
				grid: {
					left: 0,
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
				},
				yAxis: {
					type: 'category',
					show: false,
					inverse: true,
				},
				series: {
					type: 'bar',
					barWidth: '100%',
				},
			},
			optionHigh: {},
			optionLower: {},
			highList: [],
			lowerList: [],
			byQuantity: true,
			departmentId: '',
		};
	}
	componentDidMount() {
		this.getLowerOption();
		this.getHighOption();
	}

	componentDidUpdate(prevProps) {
		if (this.props.params != prevProps.params) {
			this.getLowerOption();
			this.getHighOption();
		}
	}

	/**金额与数量切换 */
	handleModeChange(e) {
		let byQuantity = e.target.value;
		this.setState({
			byQuantity,
		});
		this.getHighOption({ byQuantity });
		this.getLowerOption({ byQuantity });
	}

	/**高值 */
	getHighOption(param) {
		let params = {
			rank: 10,
			highValue: true,
			departmentId: this.state.departmentId,
			byQuantity: this.state.byQuantity,
			...this.props.params,
			...param,
		};
		getGoodsConsumedRank(params).then((res) => {
			if (res && res.code === 0) {
				let optionHigh = {
					...this.state.option,
					color: ['rgba(61,102,255,.3)'],
					series: {
						type: 'bar',
						barWidth: '100%',
						data: res.data.map((item) => {
							return this.state.byQuantity ? item.quantity : item.amount;
						}),
					},
				};
				this.setState({
					highList: res.data,
					optionHigh,
				});
			}
		});
	}

	/**低值 */
	getLowerOption(param) {
		let params = {
			rank: 10,
			highValue: false,
			departmentId: this.state.departmentId,
			byQuantity: this.state.byQuantity,
			...this.props.params,
			...param,
		};
		getGoodsConsumedRank(params).then((res) => {
			if (res && res.code === 0) {
				let optionLower = {
					...this.state.option,
					color: ['rgba(61,102,255,.08)'],
					series: {
						type: 'bar',
						barWidth: '100%',
						data: res.data.map((item) => {
							return this.state.byQuantity ? item.quantity : item.amount;
						}),
					},
				};
				this.setState({
					lowerList: res.data,
					optionLower,
				});
			}
		});
	}

	/**科室选择 */
	departmentSelect = (value) => {
		let departmentId = value.key > 0 ? value.key : '';
		this.setState({
			departmentId,
		});
		this.getHighOption({ departmentId });
		this.getLowerOption({ departmentId });
	};

	render() {
		const { optionHigh, highList, optionLower, lowerList, byQuantity } = this.state;
		let columnsHigh = [
			{
				title: '高值耗材名称',
				dataIndex: 'goodsName',
				key: 'goodsName',
				render: (text) => {
					return <span>{text}</span>;
				},
			},
			{
				title: '使用数量',
				dataIndex: 'quantity',
				key: 'quantity',
				align: 'center',
				width: 100,
			},
			{
				title: '消耗金额(元)',
				dataIndex: 'amount',
				key: 'amount',
				width: 120,
				align: 'right',
				render: (text) => {
					return <span>{convertPriceWithDecimal(text)}</span>;
				},
			},
		];
		let columnsLower = [
			{
				title: '低值耗材名称',
				dataIndex: 'goodsName',
				key: 'goodsName',
				render: (text) => {
					return <span>{text}</span>;
				},
			},
			{
				title: '使用数量',
				dataIndex: 'quantity',
				key: 'quantity',
				align: 'center',
				width: 100,
			},
			{
				title: '消耗金额(元)',
				dataIndex: 'amount',
				key: 'amount',
				width: 120,
				align: 'right',
				render: (text) => {
					return <span>{convertPriceWithDecimal(text)}</span>;
				},
			},
		];

		return (
			<div className={styles.reportWarp}>
				<Card
					title={this.props.title}
					bordered={false}
					className={styles.rankWrap}
					extra={
						<Radio.Group
							onChange={this.handleModeChange.bind(this)}
							value={byQuantity}>
							<Radio.Button value={true}>数量</Radio.Button>
							<Radio.Button value={false}>金额</Radio.Button>
						</Radio.Group>
					}>
					<div>
						<ReactEcharts
							option={optionHigh}
							style={{
								height: 39 * highList.length,
								width: '100%',
								position: 'relative',
								zIndex: 9999,
								marginTop: 39,
							}}
						/>
						<Table
							className={styles.rankTable}
							columns={columnsHigh}
							dataSource={highList}
							size='small'
							rowKey='goodsId'
							pagination={false}
							style={{
								marginTop: -39 * (highList.length + 1) + 1,
								marginBottom: 70,
							}}
						/>
						<ReactEcharts
							option={optionLower}
							style={{
								height: 39 * lowerList.length,
								width: '100%',
								position: 'relative',
								zIndex: 9999,
							}}
						/>
						<Table
							className={styles.rankTable}
							columns={columnsLower}
							dataSource={lowerList}
							size='small'
							rowKey='goodsId'
							pagination={false}
							style={{ marginTop: -39 * (lowerList.length + 1) + 1 }}
						/>
					</div>
				</Card>
			</div>
		);
	}
}

export default GoodsConsumedModule;
