import { NextFunction, Request, Response } from "express"
import { reviewService } from "./review.service"


const createReview = async (req: Request, res: Response, next:NextFunction) => {
    try {
        console.log(req.user)
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" })
        }
        const result = await reviewService.createReview(req.body, user.id as string, user.role as string);
        res.status(201).json(result)
    } catch (e) {
        next(e)
    }
}

const getAllReview = async(req: Request, res: Response) =>{
    try{
        const isApproved = req.query.isApproved === 'true';
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
        
        const filters: { isApproved?: boolean; limit?: number } = {};
        
        if (req.query.isApproved !== undefined) {
            filters.isApproved = isApproved;
        }
        
        if (limit) {
            filters.limit = limit;
        }
        
        const result = await reviewService.getAllReview(filters);
        res.status(200).json(result);
    }catch(e){
        res.status(400).json({
            error: "Failed to fetch reviews",
            details: e
        })
    }
}

export const reviewController ={
    createReview,
    getAllReview
}