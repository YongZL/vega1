import type { match as Match } from 'react-router';

import React from 'react';
import Add from './';

const EditGoods: React.FC<{ match: Match<{ id: string }> }> = ({ ...props }) => (
	<Add
		{...props}
		handleType='edit'
	/>
);

export default EditGoods;
