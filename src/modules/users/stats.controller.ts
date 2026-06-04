import { Request, Response } from "express";
import { statsService } from "./stats.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const getHomePageStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await statsService.getHomePageStats();
    
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Home page statistics retrieved successfully",
        data: stats
    });
});

export const statsController = {
    getHomePageStats
};
