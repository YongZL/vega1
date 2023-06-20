import React from 'react';
import { Button, Card } from 'antd';
import ReactEcharts from 'echarts-for-react';
import { notification } from '@/utils/ui';
import { formatMoney } from '@/utils/format';
import jsonToCSV from '@/utils/jsonToCSV';

import '../../report_form/style.less';
import { getMonthlyGrowthSupplier, getMonthlyGrowth } from '../service';
import styles from '../style.less';
/**
 * 展示科室和全部科室耗材消耗月同比环比增长率
 * @param  departmentId   null|number  为空时候显示全院
 */
class GoodsMonthlyGrowth extends React.Component {
	constructor(props) {
		super(props);
	}

	state = {
		config: {
			departmentId: this.props.params.departmentId, //如果没有传科室Id，获得全部科室数据
			num: 12, //过去十二个月
		},
	};

	componentDidMount() {
		this.requestData();
	}

	/**
	 * 可以调用setState,但是要注意包裹在条件语句中
	 */
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
			target: target ? target : undefined,
			departmentId: departmentId ? departmentId : null,
		};

		let type = this.props.type;
		if (type && type == 'supplier') {
			getMonthlyGrowthSupplier(params).then((res) => {
				if (res && res.code === 0) {
					this.setState({
						data: res.data,
					});
				}
			});
		} else {
			getMonthlyGrowth(params).then((res) => {
				if (res && res.code == 0) {
					this.setState({
						data: res.data,
					});
				}
			});
		}
	};

	/**
	 * 验证数据合法性,只要有一个合格数据就返回正确
	 */
	validData = (data) => {
		for (let i = 0; i < data.length; i++) {
			let item = data[i];
			if (item && item != 0) {
				return true;
			}
		}
		return false;
	};

	getOption = (data) => {
		//解析数据，获取时间，同比，环比数据
		let formatData = this.getFormatData(data);
		let time = formatData.time; //x轴
		let yoYData = formatData.yoYData; //同比增长率
		let moMData = formatData.moMData; //环比增长率

		if (!time || !yoYData || !moMData) {
			return null;
		}

		let validYoy = this.validData(yoYData);
		let validMom = this.validData(moMData);
		if (!validYoy && !validMom) {
			return null;
		}

		let option = {
			xAxis: {
				type: 'category',
				data: time,
			},
			yAxis: {
				type: 'value',
			},
			legend: {
				data: ['环比', '同比'],
			},
			series: [
				{
					name: '环比',
					type: 'line',
					data: moMData,
					smooth: true,
					seriesLayoutBy: 'row',
				},
				{
					name: '同比',
					type: 'line',
					data: yoYData,
					smooth: true,
					seriesLayoutBy: 'row',
				},
			],
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					label: {
						formatter: function (params) {
							return '增长率（%）';
						},
					},
				},
				backgroundColor: '#DFEBFF',
				textStyle: {
					color: '#4370FF',
				},
			},
			color: ['#9DB8FF', '#8889F7'],
		};
		return option;
	};

	/**
	 * 格式化获得的数据
	 * @return {[],[],[],[]...}
	 *
	 */
	getFormatData = (data) => {
		let current = data.current;
		let lastYear = data.lastYear;
		let prevMonth = data.prevMonth;
		return {
			time: data.axis,
			currData: data.current,
			yoYData: this.getIncraseRate(lastYear, current),
			moMData: this.getIncraseRate(prevMonth, current),
		};
	};

	/**
	 * 增长率计算
	 * @param lastDataArr   :number[]
	 * @param currDataArr   :number[]
	 * @return              :string[]
	 */
	getIncraseRate = (lastDataArr, currDataArr) => {
		if (lastDataArr.length == 0 || currDataArr.length == 0) {
			notification.error('数据为空');
			return;
		}
		if (lastDataArr.length != currDataArr.length) {
			notification.error('数据格式不正确');
			return;
		}
		let rtnDataArr = [];
		for (let i = 0; i < lastDataArr.length; i++) {
			let lastItem = lastDataArr[i];
			let currItem = currDataArr[i];
			if (lastItem == 0) {
				rtnDataArr.push(null);
			} else if (currItem == 0) {
				rtnDataArr.push(null);
			} else {
				rtnDataArr.push(Math.ceil(((currItem - lastItem) / lastItem) * 100));
			}
		}
		return rtnDataArr;
	};

	/**
	 * 下载文件为csv文件
	 */
	download = () => {
		const { data } = this.state;
		let formatData = this.getFormatData(data);
		let timeData = formatData.time; //时间
		let currData = formatData.currData; //当前值
		let yoYData = formatData.yoYData; //同比增长率
		let moMData = formatData.moMData; //环比增长率

		//转化csv需要的数据格式
		let objArray = [
			{ key: 'time', name: '时间', data: timeData },
			{ key: 'current', name: '金额/万元', data: currData },
			{ key: 'YOY', name: '环比/%', data: moMData },
			{ key: 'MOM', name: '同比/%', data: yoYData },
		];
		let fileName = this.props.title ? this.props.title : '科室耗材使用每月环比/同比增长率';
		let formatter = (n, v) => {
			if (n === 'YOY' || n === 'MOM') {
				return v ? v + '%' : '';
			}
			if (n === 'current') {
				return formatMoney(v);
			}
		};
		jsonToCSV.saveWithFormatCsv(fileName, objArray, formatter);
	};

	render() {
		const { data } = this.state;
		let optionData = undefined;
		if (data) {
			optionData = this.getOption(data);
		}
		return (
			<div className={styles.bottomGap}>
				<Card
					title={this.props.title ? this.props.title : '科室耗材使用每月环比/同比增长率'}
					bordered={false}
					extra={
						<Button
							onClick={this.download}
							disabled={!optionData}>
							下载
						</Button>
					}>
					{optionData ? (
						<ReactEcharts
							notMerge={true}
							lazyUpdate={true}
							option={optionData}
							opts={{ renderer: 'svg' }}
						/>
					) : (
						<div>暂无数据</div>
					)}
				</Card>
			</div>
		);
	}
}

export default GoodsMonthlyGrowth;
