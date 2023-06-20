import React from 'react';
import { Button, Card, Table } from 'antd';
import jsonToCSV from '@/utils/jsonToCSV';

import { getIncrements } from '../service';
import '../../report_form/style.less';
import styles from '../style.less';

/**
 * 本月新增耗材
 */
class GoodsIncrement extends React.Component {
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
		// if(this.props.params.target!=nextProps.params.target){
		//     this.requestData();
		// }
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
			target: target ? target : config.target,
			departmentId: departmentId ? departmentId : null,
		};

		getIncrements(params).then((res) => {
			if (res && res.code == 0 && res.data) {
				this.setState({ data: res.data });
			}
		});
	};

	/**
	 * 下载文件为csv文件
	 */
	download = () => {
		const { data } = this.state;
		let config = {
			data: data,
			fileName: this.props.title ? this.props.title : '本月新增耗材',
			columns: {
				title: ['新增耗材名称', '数量', '金额(元)', '生产厂家ID', '生产厂家', '新增耗材ID'],
				key: ['goodsName', 'quantity', 'amount', 'manufacturerId', 'manufacturerName', 'goodsId'],
				formatter: (n, v) => {
					//数据的格式化处理
					if (n === 'amount') return convertPriceWithDecimal(v);
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
					title: '新增耗材名称',
					dataIndex: 'goodsName',
					key: 'goodsName',
				},
				{
					title: '数量',
					dataIndex: 'quantity',
					key: 'quantity',
					align: 'center',
					width: 50,
				},
				{
					title: '金额(元)',
					dataIndex: 'amount',
					key: 'amount',
					align: 'right',
					render: (text, record) => {
						return <div>{convertPriceWithDecimal(record.amount)}</div>;
					},
				},
				{
					title: '生产厂家',
					dataIndex: 'manufacturerName',
					key: 'manufacturerName',
				},
			];
			return columns;
		};
		return (
			<div className={styles.bottomGap}>
				<Card
					title={this.props.title ? this.props.title : '本月新增耗材'}
					bordered={false}
					className={styles.rankWrap}
					extra={
						<Button
							disabled={!(data && data.length > 0)}
							onClick={this.download}>
							下载
						</Button>
					}>
					{data && data.length > 0 ? (
						<Table
							columns={getColumns()}
							className={styles.rankTable}
							dataSource={data}
							bordered={false}
							size='small'
							pagination={false}
							rowKey='goodsId'
						/>
					) : (
						<div>暂无数据</div>
					)}
				</Card>
			</div>
		);
	}
}

export default GoodsIncrement;
