import prisma from "@repo/db";

// Returns prescriptions for a doctor that have a follow_up_date set,
// spanning 7 days in the past (missed) through 30 days ahead (upcoming).
export const getDoctorFollowUps = async (doctorId: string) => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const followUps = await prisma.prescriptions.findMany({
        where: {
            doctor_id: doctorId,
            follow_up_date: {
                gte: sevenDaysAgo,
                lte: thirtyDaysAhead,
            },
        },
        include: {
            patient: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    age: true,
                    gender: true,
                },
            },
            medicine_list: {
                select: { id: true, name: true },
            },
        },
        orderBy: { follow_up_date: "asc" },
    });

    return followUps;
};
