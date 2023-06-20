import React, { useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import Goods from '../components/Goods';

const addAllocation: React.FC<{}> = () => {
	const [type, setType] = useState<'1' | '2' | undefined>('1');
	const handleprops = {
		type,
		setType,
	};
	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<Goods
				handleprops={handleprops}
				style={type === '1' ? {} : { display: 'none' }}
			/>
		</div>
	);
};

export default addAllocation;
