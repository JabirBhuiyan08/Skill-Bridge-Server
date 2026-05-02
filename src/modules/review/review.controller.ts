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
        const result = await reviewService.getAllReview()
        res.status(200).json(result)
    }catch(e){
        res.status(400).json({
            error: "Post Creation failed",
            details: e
        })
    }
}

export const reviewController ={
    createReview,
    getAllReview
}