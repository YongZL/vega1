import type { match as Match } from 'react-router';

import React from 'react';
import Add from './';

const CopyGoods: React.FC<{ match: Match<{ id: string }> }> = ({ ...props }) => (
	<Add
		{...props}
		handleType='copy'
	/>
);

export default CopyGoods;
