import React from 'react';
import { Button, Card, Table } from 'antd';
import { convertPriceWithDecimal } from '@/utils/format';
import jsonToCSV from '@/utils/jsonToCSV';
import { getOverBaseDepartment } from '../service';
import styles from '../../report_form/style.less';

/**
 * 每月超过采购基准值的科室
 */
class MonthlyOverflow extends React.Component {
	constructor(props) {
		super(props);
		this.state.target = this.props.params.target;
	}

	state = {
		config: {
			rank: 10,
			target: undefined,
		},
	};

	componentDidMount() {
		this.requestData();
	}

	componentDidUpdate(prevProps) {
		if (this.props.params.target != prevProps.params.target) {
			this.requestData();
		}
	}
	/**
	 * 请求数据
	 */
	requestData = () => {
		const { config } = this.state;
		let target = this.props.params.target;
		let params = {
			...config,
			target: target ? target : config.target,
		};

		getOverBaseDepartment(params).then((res) => {
			if (res && res.code == 0) {
				this.setState({ data: res.data });
			}
		});
	};

	/**
	 * 下载文件为csv文件
	 */
	download = () => {
		const { data } = this.state;
		//TODO  计算超出金额和百分比
		let formatedData = data.map((item, index) => {
			const price = (item.totalAmount - item.baseAmount) / item.baseAmount;
			return Object.assign({}, item, {
				overflow: item.totalAmount - item.baseAmount,
				percent: item.totalAmount != 0 ? convertPriceWithDecimal(price) : '--',
			});
		});

		let config = {
			data: formatedData,
			fileName: this.props.title ? this.props.title : '每个月超过采购基准值的科室',
			columns: {
				title: ['科室名称', '采购金额(元)', '超出金额(元)', '百分比'],
				key: ['departmentName', 'totalAmount', 'overflow', 'percent'],
				formatter: (n, v) => {
					//数据的格式化处理
					if (n === 'percent' && v != '--') return v + '%';
					if ((n === 'totalAmount' || n === 'overflow') && v != '--') {
						return convertPriceWithDecimal(v);
					}
				},
			},
		};
		jsonToCSV.save(config);
	};

	render() {
		const { data } = this.state;
		const getColumns = () => {
			let columns = [
				{
					title: '科室名称',
					dataIndex: 'departmentName',
					key: 'departmentName',
				},
				{
					title: '采购金额(元)',
					dataIndex: 'totalAmount',
					key: 'totalAmount',
					align: 'right',
					render: (text, record) => {
						return <div>{convertPriceWithDecimal(record.totalAmount)}</div>;
					},
				},
				{
					title: '超出金额(元)',
					dataIndex: 'overflow',
					key: 'overflow',
					align: 'right',
					render: (text, record) => {
						return (
							<div style={{ color: CONFIG_LESS['@c_starus_warning'] }}>
								{convertPriceWithDecimal(record.totalAmount - record.baseAmount)}
							</div>
						);
					},
				},
				{
					title: '百分比',
					dataIndex: 'percent',
					key: 'percent',
					render: (text, record) => {
						const price = (record.totalAmount - record.baseAmount) / record.baseAmount;
						return (
							<div>{record.totalAmount != 0 ? convertPriceWithDecimal(price) + '%' : '--'}</div>
						);
					},
				},
			];
			return columns;
		};
		return (
			<div className={styles.bottomGap}>
				<Card
					title={this.props.title}
					bordered={false}
					extra={
						<Button
							onClick={this.download}
							disabled={data && data.length > 0 ? false : true}>
							下载
						</Button>
					}>
					{data && data.length > 0 ? (
						<Table
							columns={getColumns()}
							dataSource={data}
							bordered={false}
							size='small'
							pagination={false}
							rowKey={(record) => record.departmentId}
						/>
					) : (
						<div>暂无数据</div>
					)}
				</Card>
			</div>
		);
	}
}

export default MonthlyOverflow;
