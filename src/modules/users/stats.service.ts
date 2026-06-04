import { prisma } from "../../lib/prisma";

const getHomePageStats = async () => {
    // Get student count
    const studentCount = await prisma.user.count({
        where: { role: "STUDENT" }
    });

    // Get tutor count
    const tutorCount = await prisma.user.count({
        where: { role: "TUTOR" }
    });

    // Get approved reviews to calculate satisfaction rate
    const reviews = await prisma.review.findMany({
        where: {
            isApproved: true
        },
        select: {
            rating: true
        }
    });

    // Calculate satisfaction rate (percentage of 4+ star ratings)
    let satisfactionRate = 0;
    if (reviews.length > 0) {
        const highRatings = reviews.filter(r => r.rating >= 4).length;
        satisfactionRate = Math.round((highRatings / reviews.length) * 100);
    }

    return {
        studentCount,
        tutorCount,
        satisfactionRate,
        totalReviews: reviews.length
    };
};

export const statsService = {
    getHomePageStats
};
