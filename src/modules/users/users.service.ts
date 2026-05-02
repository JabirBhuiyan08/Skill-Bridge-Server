import {prisma} from "../../lib/prisma";
import { randomUUID } from "crypto";
import { UserRole } from "../../middlewares/auth";
import { scryptAsync } from "@noble/hashes/scrypt.js";
import { hex } from "@better-auth/utils/hex";
import crypto from "crypto";

// Same config as better-auth uses
const scryptConfig = {
    N: 16384,
    r: 16,
    p: 1,
    dkLen: 64
} as const;

async function generateKey(password: string, salt: string) {
    return await scryptAsync(password.normalize("NFKC"), salt, {
        N: scryptConfig.N,
        p: scryptConfig.p,
        r: scryptConfig.r,
        dkLen: scryptConfig.dkLen,
        maxmem: 128 * scryptConfig.N * scryptConfig.r * 2
    });
}

async function hashPassword(password: string) {
    const salt = hex.encode(crypto.getRandomValues(new Uint8Array(16)));
    const key = await generateKey(password, salt);
    return `${salt}:${hex.encode(key)}`;
}

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    emailVerified: boolean;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
}


const getAllUsers = async () => {
    const users = await prisma.user.findMany();
    return users;
}

const createUser = async (data: { name: string, email: string, password: string, role: UserRole, phone?: string }) => {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
    });

    if (existingUser) {
        throw new Error("User with this email already exists");
    }

    // Hash the password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const newUser = await prisma.user.create({
        data: {
            id: randomUUID(),
            name: data.name,
            email: data.email,
            role: data.role,
            emailVerified: true,
            phone: data.phone ?? null
        }
    });

    // Create account record
    await prisma.account.create({
        data: {
            id: randomUUID(),
            accountId: newUser.id,
            providerId: "credential",
            userId: newUser.id,
            password: hashedPassword
        }
    });

    return newUser;
}

const updateUser = async (id: string, data: { name?: string, email?: string, phone?: string, role?: UserRole }) => {
    // First check if the user exists
    const existingUser = await prisma.user.findUnique({
        where: { id: id }
    });

    if (!existingUser) {
        throw new Error("User not found");
    }

    // Update the user
    const updatedUser = await prisma.user.update({
        where: { id: id },
        data: {
            name: data.name ?? existingUser.name,
            email: data.email ?? existingUser.email,
            phone: data.phone ?? existingUser.phone,
            role: data.role ?? existingUser.role
        }
    });

    return updatedUser;
}

const updateUserProfile = async (id: string, data: { name: string, email: string, phone: string }) => {
    // First check if the user exists
    const existingUser = await prisma.user.findUnique({
        where: { id: id }
    });

    if (!existingUser) {
        throw new Error("User not found");
    }

    // Update the user profile
    const updatedUser = await prisma.user.update({
        where: { id: id },
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone ?? null
        }
    });

    return updatedUser;
}

export const userService = {
    getAllUsers,
    createUser,
    updateUser,
    updateUserProfile
};

