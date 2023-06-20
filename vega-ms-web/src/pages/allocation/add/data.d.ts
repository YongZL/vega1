import type { MutableRefObject } from 'react';
type handlepropsType = {
	type: '1' | '2' | undefined;
	setType: React.Dispatch<React.SetStateAction<'1' | '2' | undefined>>;
	selectType: '1' | '2' | undefined;
	setSelectType: React.Dispatch<React.SetStateAction<'1' | '2' | undefined>>;
};
export type refType = {
	selectList: () => Record<string, any>[];
	getSearchStorageArea: () => Record<string, any>[];
};
export type propsType = {
	comRef: MutableRefObject<refType | undefined>;
	handleprops: handlepropsType;
	style:
		| {}
		| {
				display: string;
		  };
};
