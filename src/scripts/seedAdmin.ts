import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";
import crypto from "crypto";
import { scryptAsync } from "@noble/hashes/scrypt.js";
import { hex } from "@better-auth/utils/hex";

// Same config as better-auth uses
const scryptConfig = {
	N: 16384,
	r: 16,
	p: 1,
	dkLen: 64
};

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

async function seedAdmin() {
    try {
        console.log("***** Admin Seeding Started....")
        const adminData = {
            name: "Admin Saheb",
            email: "admin@admin.com",
            role: UserRole.ADMIN,
            password: "admin1234"
        }
        console.log("***** Checking if Admin exists in database")
        // Check if user already exists in db
        const existingUser = await prisma.user.findUnique({
            where: {
                email: adminData.email
            }
        });

        if (existingUser) {
            console.log("Admin user already exists:", existingUser.email);
            console.log("***** Admin Seeding SKIPPED ******")
            return;
        }

        // Create a unique ID for the admin user
        const adminId = crypto.randomUUID();

        console.log("***** Creating admin user directly in database...")
        const createdUser = await prisma.user.create({
            data: {
                id: adminId,
                name: adminData.name,
                email: adminData.email,
                emailVerified: true,
                role: UserRole.ADMIN
            }
        });

        console.log("**** Admin created successfully!")
        
        // Hash the password using scrypt (same algorithm as better-auth)
        console.log("***** Hashing password with Scrypt...")
        const hashedPassword = await hashPassword(adminData.password);

        // Create an account record with the hashed password
        console.log("***** Creating account record with hashed password...")
        await prisma.account.create({
            data: {
                id: crypto.randomUUID(),
                accountId: adminId,
                providerId: "credential",
                userId: adminId,
                password: hashedPassword
            }
        });

        console.log("**** Admin user updated successfully!")
        console.log("Admin Details:", {
            id: createdUser.id,
            email: createdUser.email,
            name: createdUser.name,
            role: createdUser.role,
            emailVerified: createdUser.emailVerified
        })
        console.log("******* SUCCESS - ADMIN SEEDED SUCCESSFULLY ******")
        console.log("Credentials: admin@admin.com / admin1234")

    }
    
    catch (error) {
        console.error("Error during admin seeding:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin()