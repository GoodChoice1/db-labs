import mongoose from 'mongoose';

const url = 'mongodb://admin:admin@localhost:27017/admin';
mongoose.connect(url);

const shopSchema = new mongoose.Schema({
    lawName: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        type: String,
        required: true,
    },
    standList:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Stand',
    }]
})

const standSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
    },
    shop: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Shop', 
        required: true 
    },
    goodsList:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Goods',
    }]
})

const typeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    fee: {
        type: Number,
        required: true,
    },
})

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    discBaseCustomer: {
        type: Number,
        required: true,
    },
    discBaseCorporate: {
        type: Number,
        required: true,
    },
    discWholesaleCustomer: {
        type: Number,
        required: true,
    },
    discWholesaleCorporate: {
        type: Number,
        required: true,
    },
})

const goodsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Type',
        required: true,
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
    },
    stand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stand',
        required: true,
    }
})

const wholesaleDiscountSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        unique: true,
    },
    discountNumber:{
        type: Number, 
        required: true,
    }
})

const loyaltySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    discountNumber:{
        type: Number, 
        required: true,
    }
})

export const Shop = mongoose.model('Shop', shopSchema);
export const Stand = mongoose.model('Stand', standSchema);
export const Type = mongoose.model('Type', typeSchema);
export const Class = mongoose.model('Class', classSchema);
export const Goods = mongoose.model('Goods', goodsSchema);
export const WholesaleDiscount = mongoose.model('WholesaleDiscount', wholesaleDiscountSchema);
export const Loyalty = mongoose.model('Loyalty', loyaltySchema);

export const setInitialData = async () => {
   const classList = await Class.insertMany([
        { name: 'Эконом', discBaseCustomer: 5, discBaseCorporate: 2, discWholesaleCustomer: 6, discWholesaleCorporate: 3 },
        { name: 'Стандарт', discBaseCustomer: 7, discBaseCorporate: 4, discWholesaleCustomer: 7, discWholesaleCorporate: 5 },
        { name: 'Премиум', discBaseCustomer: 10, discBaseCorporate: 5, discWholesaleCustomer: 11, discWholesaleCorporate: 6 },
    ])

    const typeList = await Type.insertMany([
        { name: 'Продукты', fee: 10 }, 
        { name: 'Техника', fee: 20 },
    ])

   await WholesaleDiscount.insertMany([
        { amount: 10, discountNumber: 2 },
        { amount: 100, discountNumber: 3 },
        { amount: 1000, discountNumber: 5 },
    ])

   await Loyalty.insertMany([
        { name: 'Базовый', discountNumber: 5 },
        { name: 'Серебро', discountNumber: 10 },
        { name: 'Золото', discountNumber: 15 },
    ])

    const shop = await Shop.create({ lawName: 'Магазин-1', address: 'г. Москва, ул. Магазинная' })

    const stand1 = await Stand.create({ number: 1, shop: shop._id })
    const stand2 = await Stand.create({ number: 2, shop: shop._id })

    shop.standList = [stand1._id, stand2._id]
    await shop.save()

    const good1 = await Goods.create({
        name: 'Круассан',
        price: 150,
        type: typeList[0]._id,
        class: classList[1]._id,
        stand: stand1._id,
    })

    const good2 = await Goods.create({
        name: 'Яблоко',
        price: 50,
        type: typeList[0]._id,
        class: classList[0]._id,
        stand: stand1._id,
    })

    stand1.goodsList = [good1._id, good2._id]
    await stand1.save()

    const good3 = await Goods.create({
        name: 'Смартфон',
        price: 20000,
        type: typeList[1]._id,
        class: classList[2]._id,
        stand: stand2._id,
    })

    stand2.goodsList = [good3._id]
    await stand2.save()
}