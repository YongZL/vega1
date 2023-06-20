import type { FC } from 'react';

import ReactBarcode from 'react-barcode';

const Barcode: FC<{ noVisible?: boolean; value: string; [key: string]: any }> = ({ ...props }) => {
	const { noVisible, value } = props;
	return (
		<div style={{ visibility: noVisible ? 'hidden' : 'visible' }}>
			<ReactBarcode
				{...props}
				displayValue={false}
			/>
			<h4 style={{ width: '100%', textAlign: 'center' }}>{value}</h4>
		</div>
	);
};

export default Barcode;
