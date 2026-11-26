import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async savePreferences(userId: string, data: any) {
        const { sleep_hours, productive_hours, routine_schedules, courses } = data;

        // Validasi 1: Maksimal mata kuliah adalah 20
        if (courses && courses.length > 20) {
            throw new BadRequestException(['Maksimal mata kuliah yang diizinkan adalah 20']);
        }

        // Validasi 2: Confidence level (1-5) & keunikan nama course di dalam input
        if (courses && courses.length > 0) {
            const seenCourseNames = new Set<string>();

            for (const course of courses) {
                if (course.confidence_level < 1 || course.confidence_level > 5) {
                    throw new BadRequestException(['confidence_level harus berada di antara 1 dan 5']);
                }

                const normalizedName = course.course_name?.trim().toLowerCase();
                if (!normalizedName) {
                    throw new BadRequestException(['Nama mata kuliah tidak boleh kosong']);
                }

                if (seenCourseNames.has(normalizedName)) {
                    throw new BadRequestException([
                        `Nama mata kuliah "${course.course_name}" tidak boleh duplikat dalam input`,
                    ]);
                }
                seenCourseNames.add(normalizedName);
            }
        }

        // Validasi 3: Jam tidur dan jam produktif tidak boleh tumpang tindih
        if (sleep_hours && productive_hours) {
            if (this.isTimeOverlap(sleep_hours, productive_hours)) {
                throw new BadRequestException(['Jam tidur dan jam produktif tidak boleh tumpang tindih']);
            }
        }

        // Jalankan operasi DB dalam satu transaksi (Transaction)
        const result = await this.prisma.$transaction(async (prisma) => {
            // 1. Update preferensi waktu user
            await prisma.user.update({
                where: { id: userId },
                data: {
                    sleep_time_start: new Date(`1970-01-01T${sleep_hours.start}:00Z`),
                    sleep_time_end: new Date(`1970-01-01T${sleep_hours.end}:00Z`),
                    productive_time_start: new Date(`1970-01-01T${productive_hours.start}:00Z`),
                    productive_time_end: new Date(`1970-01-01T${productive_hours.end}:00Z`),
                },
            });

            // 2. Validasi DB & Insert Courses
            let savedCourses: { id: string; name: string }[] = [];
            if (courses && courses.length > 0) {
                // Cek apakah nama course sudah pernah tersimpan di DB untuk user ini
                const existingCourses = await prisma.course.findMany({
                    where: { user_id: userId },
                    select: { name: true },
                });

                const existingNames = new Set(
                    existingCourses.map((c) => c.name.trim().toLowerCase())
                );

                for (const course of courses) {
                    const normalizedName = course.course_name.trim().toLowerCase();
                    if (existingNames.has(normalizedName)) {
                        throw new BadRequestException([
                            `Mata kuliah "${course.course_name}" sudah terdaftar sebelumnya`,
                        ]);
                    }
                }

                const courseData = courses.map((c: any) => ({
                    user_id: userId,
                    name: c.course_name.trim(),
                    confidence_level: c.confidence_level,
                }));
                await prisma.course.createMany({ data: courseData });

                // Ambil data course yang baru dibuat untuk response
                savedCourses = await prisma.course.findMany({
                    where: { user_id: userId },
                    select: { id: true, name: true },
                });
            }

            // 3. Insert Routine Schedules
            if (routine_schedules && routine_schedules.length > 0) {
                const routineData = routine_schedules.map((r: any) => ({
                    user_id: userId,
                    title: r.activity_name,
                    day_of_week: r.day_of_week,
                    start_time: new Date(`1970-01-01T${r.start_time}:00Z`),
                    end_time: new Date(`1970-01-01T${r.end_time}:00Z`),
                    source: 'manual',
                }));
                await prisma.routine.createMany({ data: routineData });
            }

            return savedCourses.map((c: any) => ({
                course_id: c.id,
                course_name: c.name,
            }));
        });

        // Mengembalikan response sukses 201 Created
        return {
            statusCode: 201,
            message: 'Preferensi berhasil disimpan',
            saved_courses: result,
        };
    }

    // Fungsi helper sederhana untuk cek overlap string jam
    private isTimeOverlap(sleep: { start: string, end: string }, prod: { start: string, end: string }) {
        const sStart = this.timeToMinutes(sleep.start);
        let sEnd = this.timeToMinutes(sleep.end);
        const pStart = this.timeToMinutes(prod.start);
        const pEnd = this.timeToMinutes(prod.end);

        // Penanganan jam tidur melewati tengah malam
        if (sEnd < sStart) sEnd += 24 * 60;

        // Jika jam produktif jatuh di antara jam tidur
        if (pStart >= sStart && pStart < sEnd) return true;
        if (pEnd > sStart && pEnd <= sEnd) return true;

        return false;
    }

    private timeToMinutes(timeStr: string) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }
}