import { NextFunction, Request, Response } from "express"
import { reviewService } from "./review.service"

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; [key: string]: any };
    }
  }
}



const createReview = async (req: Request, res: Response, next:NextFunction) => {
    try {
        console.log(req.user)
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" })
        }
        const result = await reviewService.createReview(req.body, user.id as string);
        res.status(201).json(result)
    } catch (e) {
        next(e)
    }
}

export const reviewController ={
    createReview
}