type handlepropsType = {
	type: '1' | '2' | undefined;
	setType: React.Dispatch<React.SetStateAction<'1' | '2' | undefined>>;
};
export type propsType = {
	handleprops: handlepropsType;
	style:
		| {}
		| {
				display: string;
		  };
};
