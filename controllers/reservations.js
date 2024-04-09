const Reservation = require('../models/Reservation');
const MassageShop = require('../models/MassageShop');

//@desc     Get all reservations
//@route    GET /api/v1/reservations
//@access   Public
exports.getReservations = async (req,res,next) => {
    let query;

    //General users can see only their reservations!
    if(req.user.role !== 'admin'){
        query = Reservation.find({user:req.user.id}).populate({
            path: 'massageShop',
            select: 'name province tel'
        }) ;
    } else {
        query = Reservation.find().populate({
            path: 'massageShop',
            select: 'name province tel'
        }) ;
    }

    try{
        const reservations = await query;

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot find Reservation"
        });
    }
}

//@desc     Get single reservation
//@route    GET /api/v1/reservations/:id
//@access   Public
exports.getReservation = async (req,res,next) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate({
            path: 'massageShop',
            select: 'name province tel'
        })

        if(!reservation){
            return res.status(404).json({
                success: false,
                message: `No reservation with id of ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: reservation
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot find Reservation"
        });
    }
}

//@desc     Add reservation
//@route    POST /api/v1/massageShops/:massageShopId/reservation
//@access   Private
exports.addReservation = async (req,res,next) => {
    try {
        req.body.massageShop = req.params.massageShopId ;

        const massageShop = await MassageShop.findById(req.params.massageShopId);

        if(!massageShop){
            return res.status(404).json({
                success: false,
                meesage: `No massageShop with id of ${req.params.massageShopId}`
            });
        }

        // add user Id to req.body
        req.body.user = req.user.id;

        // check for existed reservation
        const existedReservation = await Reservation.find({user:req.user.id});
        console.log(existedReservation.length);
        console.log(req.user.role);

        // if the user is not an admin, they can only create 3 reservations
        if (existedReservation.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({
                success: false,
                message: `The user with ID ${req.user.id} has already made 3 reservations`
            });
        }

        const reservation = await Reservation.create(req.body);

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot create Reservation"
        });
    }
}

//@desc     Update reservation
//@route    PUT /api/v1/reservations/:id
//@access   Private
exports.updateReservation = async (req,res,next) => {
    try{
        let reservation = await Reservation.findById(req.params.id);

        if(!reservation){
            return res.status(404).json({
                success: false,
                message: `No reservation with id of ${req.params.id}`
            });
        }

        // make sure user is the reservation owner
        if(reservation.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this reservation`
            });
        }

        reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot update Rerservation"
        });
    }
}

//@desc     Delete reservation
//@route    DELETE /api/v1/reservations/:id
//@access   Private
exports.deleteReservation = async (req,res,next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if(!reservation){
            return res.status(404).json({
                success: false,
                message: `No reservation with id of ${req.params.id}`
            })
        }

        // make sure user us the reservation owner
        if(reservation.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this bootcamp`
            })
        }

        await reservation.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot delete Reservation"
        });
    }
}