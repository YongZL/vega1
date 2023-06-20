import { getHomeSupplierStock } from '@/services/stock';
import { Card } from 'antd';
import ReactEcharts from 'echarts-for-react';
import { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import styles from '../index.less';
interface PropsType {
	screenWidth: number;
}

const SupplierInventory = ({ screenWidth }: PropsType) => {
	const [supplierData, setSupplierData] = useState({});
	const { fields } = useModel('fieldsMapping');

	// 获取库存
	const getStockData = async () => {
		const res = await getHomeSupplierStock();
		if (res.code === 0) setSupplierData(res.data || {});
	};

	useEffect(() => {
		getStockData();
	}, []);

	const onChartClick = (param: Record<string, any>) => {
		if (!param.data.expirationStatus) {
			return;
		}
		history.push(
			`/summary/distributor_inventory_status?expirationStatus=${param.data.expirationStatus}`,
		);
	};

	const getOption = () => {
		const list = [
			{
				key: 'expired',
				color: CONFIG_LESS['@c_starus_warning'],
				name: '已过期',
				status: 'expired',
			},
			{
				key: 'less30',
				color: CONFIG_LESS['@c_starus_early_warning'],
				name: '30天内',
				status: 'less_than_30',
			},
			{
				key: 'less60',
				color: CONFIG_LESS['@c_starus_underway'],
				name: '31-60天内',
				status: 'less_than_60',
			},
			{ key: 'less90', color: CONFIG_LESS['@c_FFC909'], name: '61-90天内', status: 'less_than_90' },
			{
				key: 'more90',
				color: CONFIG_LESS['@c_starus_await'],
				name: '大于90天',
				status: 'more_than_90',
			},
		];
		let data: any[] = [];
		list.forEach((item) => {
			if (supplierData[item.key]) {
				data.push({
					value: supplierData[item.key],
					name: item.name,
					itemStyle: { normal: { color: item.color } },
					expirationStatus: item.status,
				});
			}
		});
		let a = 0;
		for (let i = 0; i < data.length; i++) {
			a += data[i].value;
		}
		data.push({ value: a, name: '__other', itemStyle: { normal: { color: 'rgba(0,0,0,0)' } } });
		const option = {
			tooltip: {
				show: false,
				trigger: 'item',
				formatter: '{a} <br/>{b} : {c} ({d}%)',
			},
			legend: {
				top: '82%',
				left: 'center',
				data: ['已过期', '30天内', '31-60天内', '61-90天内', '大于90天'],
				selectedMode: false,
			},
			series: [
				{
					name: `${fields.distributor}库存`,
					type: 'pie',
					startAngle: -180,
					radius: screenWidth < 1400 ? ['32%', '72%'] : ['42%', '86%'],
					center: ['52%', '58%'],
					label: {
						formatter: '{b}\n{c}\n',
					},
					labelLine: {
						normal: {
							length2: 6,
						},
					},
					data: data,
					itemStyle: {
						emphasis: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)',
						},
					},
				},
			],
		};
		return option;
	};

	return (
		<Card
			title={`${fields.distributor}库存`}
			bordered={false}
			className={`${styles.supplierInventory} ${styles.homeCard}`}
			style={{ width: '100%' }}>
			<ReactEcharts
				option={getOption() as Record<string, any>}
				notMerge={true}
				lazyUpdate={true}
				onEvents={{
					click: (e) => onChartClick(e),
				}}
			/>
		</Card>
	);
};

export default SupplierInventory;
