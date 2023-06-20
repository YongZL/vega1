import React, { useState } from 'react';
import { Resizable } from 'react-resizable';
import './resizableTitle.css';

const ResizableTitle = (props: { [x: string]: any; onResize: any; width: any }) => {
	const { onResize, width, ...restProps } = props;
	const [offset, setOffset] = useState(0);
	if (!width) {
		return <th {...restProps} />;
	}

	return (
		<Resizable
			width={width + offset}
			height={0}
			handle={
				<span
					className={`react-resizable-handle${offset ? ' active' : ''}`}
					style={{ transform: `translate(${offset}px, -50%)` }}
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
					}}
				/>
			}
			onResize={(_e: any, { size }: any) => {
				setOffset(size.width - width);
			}}
			onResizeStop={(...params: any) => {
				setOffset(0);
				onResize(...params);
			}}
			draggableOpts={{ enableUserSelectHack: false }}>
			<th {...restProps} />
		</Resizable>
	);
};

export default ResizableTitle;
