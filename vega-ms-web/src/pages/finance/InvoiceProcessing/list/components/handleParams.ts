import moment from "moment";

const handleParams = (
	selectRowKeys: Record<string, any>,
	searchParams: Record<string, any>,
	formData: Record<string, any>,
) => {
	const price: number[] = [];
	const goodsIds: number[] = [];
	const goodsList = (selectRowKeys || []).map((item) => {
		price.push(item.price);
		goodsIds.push(Number(item.goodsId));
		return {
			returnOrderId: item.returnOrderId || '',
			receivingOrderId: item.receivingOrderId,
			goodsId: Number(item.goodsId),
			goodsPrice: item.price,
			num: item.totalNum
				? item.totalNum
				: item.generateReceipt
					? item.consumeGoodsQuantity
					: item.remainingNum,
			id: item.id,
			timeFrom: item.timeFrom,
			timeTo: item.timeTo,
			authorizingDistributorId: item.authorizingDistributorId || item.distributorId,
		};
	});


	const { timeTo, timeFrom, invoiceSync, authorizingDistributorId } = searchParams;
	const params = {
		goodsIds: goodsIds,
		goodsPrice: price,
		statementId: selectRowKeys[0].statementId,
		authorizingDistributorId: authorizingDistributorId || selectRowKeys[0]?.distributorId,
		goodsList: goodsList,
		invoiceSync: invoiceSync,
		timeFrom: timeFrom,
		timeTo: timeTo,
		invoiceCode: formData.invoiceCode,
		payWay: formData.payWay,
		invoiceAmount: Number(formData.invoiceAmount) * 10000,
		invoiceNo: formData.invoiceNo,
		invoicingDate: formData.invoicingDate && moment(formData.invoicingDate).startOf('day').format('x'),
		taxRate: formData.taxRate
	};
	return params;
};
export default handleParams;
