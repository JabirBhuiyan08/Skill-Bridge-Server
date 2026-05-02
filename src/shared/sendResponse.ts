import { Request, Response } from "express";
import httpStatus from "http-status";

const sendResponse = (
  res: Response,
  data: {
    statusCode: number;
    success: boolean;
    message?: string;
    data?: any;
    meta?: any;
  }
) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    meta: data.meta,
  });
};

export default sendResponse;