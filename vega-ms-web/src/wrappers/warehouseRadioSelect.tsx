import type { FC } from 'react';

import SelectRadioWarehouseModal from '@/components/SelectWarehouseModal/radioSelect';
import { createContext, useEffect, useState } from 'react';
import { useModel } from 'umi';

export const ConsumeContext = createContext({});

const SelectWarehouseWrapper: FC = ({ children }) => {
	const [visible, setVisible] = useState<boolean>(false);
	const [isChange, setIsChange] = useState(false);
	const { byUserWarehouses, getWarehouseByUser } = useModel('scanConsumeReport');

	useEffect(() => {
		// const warehouseIds = sessionStorage.getItem('consumeWarehouse');
		if (!byUserWarehouses.length) {
			getWarehouseByUser();
		}
	}, [byUserWarehouses, getWarehouseByUser]);

	useEffect(() => {
		// 此步在路由配置上已处理，如果需要用到这个组件的话需要在路由配置的wrappers配置这个组件
		// const systemType = sessionStorage.getItem('systemType');
		// if (systemType !== 'Insight_RS') {
		//   return;
		// }
		if (byUserWarehouses.length === 0) {
			return;
		}
		if (sessionStorage.getItem('consumeWarehouse')) {
			return;
		}
		if (byUserWarehouses.length === 1) {
			return;
		}
		setVisible(true);
	}, [byUserWarehouses]);

	return (
		<>
			{visible ? (
				<SelectRadioWarehouseModal
					isChange={isChange}
					onFinish={() => setVisible(false)}
				/>
			) : (
				<ConsumeContext.Provider
					value={{
						byUserWarehouses,
						setVisible: () => {
							setIsChange(true);
							setVisible(true);
						},
					}}>
					{children}
				</ConsumeContext.Provider>
			)}
		</>
	);
};

export default SelectWarehouseWrapper;
