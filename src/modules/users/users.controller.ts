import { NextFunction, Request, Response } from "express";
import { userService } from "./users.service";

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const getAllUsers = await userService.getAllUsers();
        res.status(200).json(getAllUsers);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve users" });
    }
};

const createUser = async (req: Request, res: Response) => {
    const { name, email, password, role, phone } = req.body;
    try {
        const newUser = await userService.createUser({ name, email, password, role, phone });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Failed to create user" });
    }
};

const updateUser = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const { name, email, phone, role } = req.body;
    try {
        const updatedUser = await userService.updateUser(userId as string, { name, email, phone, role });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Failed to update user" });
    }
};

const updateUserProfile = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const { name, email, phone } = req.body;
    try {
        const updatedUser = await userService.updateUserProfile(userId as string, { name, email, phone });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: "Failed to update user profile" });
    }
};

export const userController = {
    getAllUsers,
    createUser,
    updateUser,
    updateUserProfile   
};