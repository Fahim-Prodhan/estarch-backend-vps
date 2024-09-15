
import Brand from "../models/brand.js";

export const getAllBrands = async(req, res)=>{
    try {
        const brands = await Brand.find()
        res.send(brands)
    } catch (error) {
        res.send(error)
        console.log(error);
        
    }
}