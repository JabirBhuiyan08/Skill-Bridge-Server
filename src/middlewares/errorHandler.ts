import { Request, Response, NextFunction } from "express";

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  // Determine status code (default to 500)
  const statusCode = (err as any).statusCode || 500;
  
  // Create response message
  const message = err.message || "Internal Server Error";
  
  // Build error response - include 'error' field for frontend compatibility
  const errorResponse: any = {
    error: message,
  };
  
  // Include stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
