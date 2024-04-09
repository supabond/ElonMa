const MassageShop = require('../models/MassageShop');
//const vacCenter = require('../models/VacCenter');

//@desc     Get all massageShops
//@route    GET /api/v1/massageShops
//@access   Public
exports.getMassageShops = async (req, res, next) => {
    try{
        let query;

        // copy req.query
        const reqQuery = {...req.query};

        // fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];

        // loop over remove fields and delete and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);
        console.log(reqQuery);

        let queryStr=JSON.stringify(req.query);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        query = MassageShop.find(JSON.parse(queryStr)).populate('reservations');

        // select fields
        if(req.query.select){
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }
        // sort
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }
        // pagination
        const page = parseInt(req.query.page, 10) || 1 ;
        const limit = parseInt(req.query.limit, 10) || 25 ;
        const startIndex = (page-1)*limit ;
        const endIndex = page*limit ;
        const total = await MassageShop.countDocuments();

        query = query.skip(startIndex).limit(limit) ;

        // excution query 
        const massageShops = await query;

        // pagination result
        const pagination = {};
        if(endIndex < total){
            pagination.next = {page:page + 1, limit}
        }
        if(startIndex > 0){
            pagination.prev = {page:page - 1, limit}
        }

        res.status(200).json({success:true, count:massageShops.length, pagination, data:massageShops});
    } catch (err){
        res.status(400).json({success:false});
    }
    
}

//@desc     Get single massageShop
//@route    GET /api/v1/massageShops/:id
//@access   Public
exports.getMassageShop = async (req, res, next) => {
    try{
        const massageShop = await MassageShop.findById(req.params.id);
        if(!MassageShop){
            return res.status(400).json({success:false});
        }
        res.status(200).json({secces:true, data:massageShop});
    } catch(err){
        res.status(400).json({success:false});
    }
}

//@desc     Create single massageShop
//@route    POST /api/v1/massageShops
//@access   Private
exports.createMassageShop = async (req, res, next) => {
    const massageShop = await MassageShop.create(req.body);
    res.status(201).json({
        success:true, 
        data:massageShop
    });
}

//@desc     Update single massageShops
//@route    PUT /api/v1/massageShops/:id
//@access   Private
exports.updateMassageShop = async (req, res, next) => {
    try{
        const massageShop = await MassageShop.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if(!massageShop){
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true, data:massageShop});
    } catch (err) {
        res.status(400).json({success:false});
    }
}

//@desc     Delete single massageShops
//@route    DELETE /api/v1/massageShops/:id
//@access   Private
exports.deleteMassageShop = async (req, res, next) => {
    try{
        const massageShop = await MassageShop.findById(req.params.id);
        if(!massageShop){
            return res.status(400).json({success:false});
        }

        massageShop.remove();
        res.status(200).json({success:true, data: {}});
    } catch (err) {
        return res.status(400).json({success:false});
    }
}

//@desc     Get vaccine centers
//@route    GET /api/v1/massageShops/vacCenters/
//@access   Public
// exports.getVacCenters = (req, res, next) => {
//     vacCenter.getAll((err, data) => {
//         if (err) {
//             res.status(500).send({
//                 message:
//                     err.message || "some error occurred while retrieving Vaccine Centers."
//             });
//         }
//         else res.send(data);
//     });
// };
    