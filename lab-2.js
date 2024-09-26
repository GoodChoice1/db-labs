import express from 'express';
import { Loyalty, setInitialData, Shop, WholesaleDiscount } from './mongodb.js';

async function runServer() {
    const app = express()
    const port = 3000;

    app.use(express.json());

    await setInitialData();

    app.get('/shop/:lawName', async (req, res) => {
        const { lawName } = req.params;

        const shop = await Shop.findOne({ lawName }).populate({
            path: 'standList',
            select: '-_id -__v -shop',
            populate: {
                path: 'goodsList',
                select: '-_id -__v -stand',
                populate: {
                    path: 'type class',
                    select: '-_id -__v',
                }
            }
        }).select('-_id -__v');
        if(!shop) return res.status(404).send({message: `Shop not found`});

        const loyaltyList = await Loyalty.find().select('-_id -__v');;
        const wholesaleDiscountList = await WholesaleDiscount.find().select('-_id -__v');;

        const getLoyaltyListPrices = (basePrice) => {
            return {
                base: basePrice,
                loyaltySystem: loyaltyList.map(loyalty => {
                    return {
                        loyalty: loyalty.name,
                        loyaltyPrice: basePrice * (100 - loyalty.discountNumber)/100
                    }
                })
            }
        }

        const result = {
            lawName: shop.lawName,
            address: shop.address,
            standList: shop.standList.map(stand => {
                return {
                    number: stand.number,
                    goodsList: stand.goodsList.map(goods => {
                        const priceWithFee = goods.price * (100 + goods.type.fee)/100;
                        const baseClientPrice = priceWithFee * (100 - goods.class.discBaseCustomer)/100;
                        const baseCorporatePrice =  priceWithFee *  (100 - goods.class.discBaseCorporate)/100;
                        return {
                            name: goods.name,
                            basePrice: goods.price,
                            basePriceWithFee: priceWithFee,
                            class: goods.class.name,
                            type: goods.type.name,
                            price: {
                                base: {
                                    client: getLoyaltyListPrices(baseClientPrice),
                                    corporate: getLoyaltyListPrices(baseCorporatePrice),
                                },
                                wholesale: {
                                    client: wholesaleDiscountList.map(discount => {
                                        return {
                                            amount: discount.amount,
                                            prices: getLoyaltyListPrices(priceWithFee * (100 - discount.discountNumber -  goods.class.discWholesaleCustomer)/100)
                                        }
                                    }),
                                    corporate: wholesaleDiscountList.map(discount => {
                                        return {
                                            amount: discount.amount,
                                            prices: getLoyaltyListPrices(priceWithFee * (100 - discount.discountNumber -  goods.class.discWholesaleCorporate)/100)
                                        }
                                    }),
                                }
                            }
                        }
                    })
                }
            })
        }


        return res.send({result, loyaltyList});
    });

    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

runServer();