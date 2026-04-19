import prisma from "@repo/db";

export interface GetDoctorPatientsOptions {
    page?: number;
    limit?: number;
    search?: string;
}

export interface PaginatedPatients {
    patients: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const getDoctorPatients = async (
    doctorId: string,
    options: GetDoctorPatientsOptions = {}
): Promise<PaginatedPatients> => {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
    const skip = (page - 1) * limit;

    // With implicit M2M, filter patients by their doctors relation
    const baseWhere: any = {
        doctors: { some: { id: doctorId } },
    };

    if (options.search?.trim()) {
        const term = options.search.trim();
        baseWhere.AND = [
            {
                OR: [
                    { name: { contains: term, mode: "insensitive" } },
                    { phone: { contains: term } },
                    { email: { contains: term, mode: "insensitive" } },
                ],
            },
        ];
    }

    const [patients, total] = await Promise.all([
        prisma.patient.findMany({
            where: baseWhere,
            skip,
            take: limit,
            orderBy: { updatedAt: "desc" },
            include: {
                prescriptions: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        id: true,
                        prescription_date: true,
                        prescription_text: true,
                        is_active: true,
                        medicine_list: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        }),
        prisma.patient.count({ where: baseWhere }),
    ]);

    return {
        patients,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};
