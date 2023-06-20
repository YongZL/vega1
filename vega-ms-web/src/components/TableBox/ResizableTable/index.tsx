import React, { useMemo, ReactElement, Children, FC } from 'react';
import ResizableTable from './ResizableTable';

export interface ResizableTableWrapperProps {
	[x: string]: any;
}

const ResizableTableWrapper: FC<ResizableTableWrapperProps> = ({
	children,
	...props
}): ReactElement => {
	const element = useMemo(() => {
		return Children.map(children as ReactElement, (child) => {
			// const { type }: any = child;
			// if (type && (type.name === 'ProviderWarp' || type.name === 'Table')) {
			// }
			return <ResizableTable {...props}>{child}</ResizableTable>;
			// return child;
		});
	}, [children, props]);

	return <>{element}</>;
};

export default ResizableTableWrapper;
