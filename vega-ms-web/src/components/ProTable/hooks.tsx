import React from 'react';

// 获取滚动条宽度，由于默认滚动条的宽度随着屏幕的缩放比变化而变化，默认是17
// 如果缩放比大于100%，则滚动条宽度会变小，反之则变大(肉眼看到的默认的滚动条宽度是不会变的)
// 但antd Table只有初始化的时候去补正这个宽度，所以屏幕或者浏览器缩放比改变时导致Table header错位的问题
// 此hooks处理还有问题，目前还不确定是什么问题
export function setScrollbarWidth() {
	// 滚动条默认宽度17
	const [scrollbarSize, setScrollbarSize] = React.useState<number>(17);
	const timerRef = React.useRef<NodeJS.Timeout | null>();
	const scrollbarSizeRef = React.useRef<number>(17);
	const lastScrollbarSizeRef = React.useRef<number>(17);

	React.useEffect(() => {
		const fn = (isFirst: boolean | Event) => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
			timerRef.current = setTimeout(() => {
				let el: HTMLDivElement = document.querySelector(
					'#toBeGotScrollbarWidthBox',
				) as HTMLDivElement;
				if (!el) {
					el = document.createElement('div');
					el.appendChild(document.createElement('div'));
					el.style.overflowY = 'scroll';
					el.style.width = '50px';
					el.style.height = '0px';
					el.style.padding = '0px';
					el.style.margin = '0px';
					document.body.appendChild(el);
				}
				setTimeout(() => {
					const childWidth = el.querySelector('div')?.getBoundingClientRect().width as number;
					const w = 50 - childWidth;
					lastScrollbarSizeRef.current = isFirst === true ? w : scrollbarSizeRef.current;
					scrollbarSizeRef.current = w;
					setScrollbarSize(w);
				}, 50);
			}, 100);
		};
		fn(true);
		window.addEventListener('resize', fn);
		return () => window.removeEventListener('resize', fn);
	}, []);

	React.useEffect(() => {
		setTimeout(() => {
			const headerScrollbar = document.querySelectorAll('.ant-table-cell-scrollbar');

			if (headerScrollbar.length > 0) {
				headerScrollbar.forEach((item) => {
					const fixRightCells: NodeListOf<HTMLTableCellElement> =
						item.parentElement?.querySelectorAll(
							'.ant-table-cell-fix-right',
						) as NodeListOf<HTMLTableCellElement>;
					const cols: NodeListOf<HTMLTableColElement> =
						item.parentElement?.parentElement?.parentElement?.querySelectorAll(
							'.ant-table-header table colgroup col',
						) as NodeListOf<HTMLTableColElement>;
					const len = cols.length;
					if (len > 0) {
						cols[len - 1].style.width = `${scrollbarSize}px`;
					}
					const frcLen = fixRightCells.length;
					if (frcLen > 1) {
						fixRightCells.forEach((fixCell, i) => {
							if (i < frcLen - 1) {
								let initRight: string | number = getComputedStyle(fixCell).right;
								initRight = Number(initRight.replace('px', '')) || 0;
								console.log(lastScrollbarSizeRef.current);
								if (initRight > 0) {
									fixCell.style.right = `${
										initRight - lastScrollbarSizeRef.current + scrollbarSize
									}px`;
								}
							}
						});
					}
				});
			}
		}, 50);
	}, [scrollbarSize]);
}
