const mongoose = require('mongoose');

const MassageShopSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50,'Name can not be more than 50 characters']
    },
    address:{
        type: String,
        required: [true, 'Please add an address']
    },
    district:{
        type: String,
        required: [true, 'Please add a district']
    },
    province:{
        type: String,
        required: [true, 'PLase add a province']
    },
    postalcode:{
        type: String,
        required: [true, 'Please add a postalcode'],
        maxlength: [5, 'Postal code can not be be more than 5 digits']
    },
    tel:{
        type: String,
        required: [true, 'Please add a telephone number']
    },
    region:{
        type: String,
        required: [true, 'Please add a region']
    },
    open_close_time:{
        type: String,
        required: [true, 'Please add a open and close time']
    }
}, {
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
});

// cascade delete reservations when a massage shop is deleted
MassageShopSchema.pre('remove', async function(next){
    console.log(`Reservations being removed from massage shop ${this._id}`);
    await this.model('Reservation').deleteMany({massageShop: this._id});
    next();
})

// reverse populate with virtuals
MassageShopSchema.virtual('reservations', {
    ref: 'Reservation',
    localField: '_id',
    foreignField: 'massageShop',
    justOne: false
});

module.exports = mongoose.model('MassageShop', MassageShopSchema);