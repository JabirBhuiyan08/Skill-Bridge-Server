import { Review } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createReview = async (data: Omit<Review, 'id' | 'createdAt' >) =>{
    const result = await prisma.review.create({
        data
    })

 return result;
}


export const reviewService ={
    createReview
}