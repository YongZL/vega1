import { Descriptions as DescriptionsComp } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DescriptionsItemProps, DescriptionsProps } from './typings';

export type { DescriptionsProps, DescriptionsItemProps };

const { Item } = DescriptionsComp;

const Descriptions = <T extends Record<string, any>>(props: DescriptionsProps<T>) => {
	const { options, data, optionEmptyText, hideIfEmpty, defaultColumn, minColumn, ...rest } = props;
	const [column, setColumn] = useState<2 | 4 | 3 | undefined>(
		window.innerWidth > 1024 ? defaultColumn : minColumn,
	);
	const timerRef = useRef<NodeJS.Timeout | null>();

	useEffect(() => {
		window.addEventListener('resize', () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
			timerRef.current = setTimeout(() => {
				setColumn(window.innerWidth > 1024 ? defaultColumn : minColumn);
			}, 50);
		});
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, []);

	return useMemo(() => {
		return (
			<DescriptionsComp
				column={column || 4}
				{...rest}>
				{options.map((option) => {
					const { render, dataIndex, show, ...optionRest } = option;
					let renderText: any = '';
					if (show === false) {
						return undefined;
					}
					if (typeof render === 'function') {
						renderText = render(data[dataIndex], data);
						// 如果renderText是false则不渲染，如果一定要显示false的话请返回字符串的false
						if (renderText === false) {
							return undefined;
						}
					}
					// 值为空不展示
					if (hideIfEmpty) {
						if (
							(data[dataIndex] === undefined || data[dataIndex] === null) &&
							(typeof render === 'function'
								? renderText === undefined || renderText === null || renderText === ''
								: true)
						) {
							return undefined;
						}
					}
					const emptyText =
						typeof optionEmptyText !== 'undefined' && optionEmptyText !== null
							? optionEmptyText
							: '';
					return (
						<Item
							{...optionRest}
							key={dataIndex}>
							{typeof render === 'function'
								? renderText || emptyText
								: typeof data[dataIndex] !== 'undefined' && data[dataIndex] !== null
								? data[dataIndex]
								: emptyText}
						</Item>
					);
				})}
			</DescriptionsComp>
		);
	}, [props, column]);
};

export default Descriptions;
