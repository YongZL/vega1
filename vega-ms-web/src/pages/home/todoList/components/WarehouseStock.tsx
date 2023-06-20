import rightIcon from '@/assets/images/right_icon_home.svg';
import { getHomeWarehouseStock } from '@/services/stock';
import { getCentralWarehouse } from '@/services/warehouse';
import { Card, Progress } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { history } from 'umi';
import styles from '../index.less';

interface PropsType {
	userType?: string;
}
const WarehouseStock = ({ userType }: PropsType) => {
	const [warehouseData, setWarehouseData] = useState<Partial<StockController.HomeStockData>>({});
	const centralWarehouseRef = useRef<number>();
	const list = [
		{ key: 'expired', color: CONFIG_LESS['@c_starus_warning'], name: '已过期', status: 'expired' },
		{
			key: 'less30',
			color: CONFIG_LESS['@c_starus_underway'],
			name: '30天内',
			status: 'less_than_30',
		},
		{
			key: 'less60',
			color: CONFIG_LESS['@c_starus_await'],
			name: '31-60天内',
			status: 'less_than_60',
		},
		{
			key: 'less90',
			color: CONFIG_LESS['@c_starus_await'],
			name: '61-90天内',
			status: 'less_than_90',
		},
		{
			key: 'more90',
			color: CONFIG_LESS['@c_starus_await'],
			name: '大于90天',
			status: 'more_than_90',
		},
	];

	// 获取库存
	const getStockData = async () => {
		const res = await getHomeWarehouseStock();
		if (res.code === 0) setWarehouseData(res.data || {});
	};

	useEffect(() => {
		getStockData();
		queryCentralWarehouse();
	}, []);

	const queryCentralWarehouse = async () => {
		const res = await getCentralWarehouse();
		if (res.code === 0 && res.data && res.data.length) {
			const data = res.data[0].id;
			centralWarehouseRef.current = data;
		}
	};

	const goToWarehousePage = (expirationStatus: any) => {
		const url = `/stock/stock_warehouse?expirationStatus=${expirationStatus}&warehouseIds=${centralWarehouseRef.current}`;
		history.push(url);
	};

	const getPercent = (data: number) => {
		return (data / ((warehouseData.expired || 0) + (warehouseData.unexpired || 0))) * 100;
	};

	return (
		<Card
			title={userType == 'operator' ? '中心仓库库存' : '仓库库存'}
			bordered={false}
			className={styles.homeCard}
			style={{ width: '100%' }}>
			{list.map((item) => {
				if (warehouseData[`${item.key}`]) {
					return (
						<div className={styles['progress-container']}>
							<div className={styles['progress-left']}>
								<div className={styles['warehouseStock-title']}>{item.name}</div>
								<div className={styles['warehouseStock-progress']}>
									<Progress
										showInfo={false}
										percent={getPercent(warehouseData[`${item.key}`])}
										strokeColor={item.color}
									/>
								</div>
							</div>
							<div className={styles['progress-right']}>
								<div
									className={styles.center}
									onClick={() => goToWarehousePage(item.status)}>
									<span className='homeTodoListNum'>{warehouseData[`${item.key}`]}</span>
									<img
										src={rightIcon}
										className={styles['right-icon']}
									/>
								</div>
							</div>
						</div>
					);
				}
				return null;
			})}
		</Card>
	);
};

export default WarehouseStock;
