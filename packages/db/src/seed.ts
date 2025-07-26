import prisma from "."

const seed = async () => {

    const doctor = await prisma.doctor.create({
        data: {
            id: "user_2zXI6zM5GIXhHMe9sTLu6gHBe2r",
            name: "Ayush",
            email: "ayushr16060@gmail.com",
            password: "ayush123",
            is_active: true,
            is_verified: true,
            is_approved: true,
            is_rejected: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    })

    console.log(doctor)

}
seed();