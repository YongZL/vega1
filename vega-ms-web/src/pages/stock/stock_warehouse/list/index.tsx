import Breadcrumb from '@/components/Breadcrumb';
import React, { useEffect, useState } from 'react';
import Goods from '../components/Goods';
import Ordinary from '../components/Ordinarys';

const addAllocation: React.FC<{}> = () => {
	const [type, setType] = useState<'1' | '2' | undefined>('1');
	const [switchoverNum, setSwitchoverNum] = useState(0); //用于判断是否切换过类型
	const handleprops = {
		type,
		setType,
	};
	useEffect(() => {
		if (type === '2' && switchoverNum === 0) {
			setSwitchoverNum(switchoverNum + 1);
		}
	}, [type]);
	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			{switchoverNum > 0 && (
				<Ordinary
					handleprops={handleprops}
					style={type === '2' ? {} : { display: 'none' }}
				/>
			)}
			<Goods
				handleprops={handleprops}
				style={type === '1' ? {} : { display: 'none' }}
			/>
		</div>
	);
};

export default addAllocation;
