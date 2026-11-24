import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service.js';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly prisma: PrismaService,
    ) { }

    async createTask(userId: string, body: any) {
        try {
            // 1. Validasi keberadaan Course dan Hak Akses User
            const course = await this.prisma.course.findUnique({
                where: { id: body.course_id },
            });

            if (!course) {
                throw new HttpException(
                    { statusCode: 404, message: 'Course tidak ditemukan.', error: 'Not Found' },
                    HttpStatus.NOT_FOUND,
                );
            }

            if (course.user_id !== userId) {
                throw new HttpException(
                    { statusCode: 403, message: 'Anda tidak memiliki izin untuk menyimpan tugas pada mata kuliah ini.', error: 'Forbidden' },
                    HttpStatus.FORBIDDEN,
                );
            }

            // 2. Siapkan payload ML sesuai API Contract
            const mlPayload = {
                user_id: userId,
                task_type: body.type,
                size: body.size,
                course_mastery: course.confidence_level,
            };

            // 3. Tembak Endpoint ML FastAPI
            // Idealnya URL dan API Key dipanggil lewat ConfigService / .env
            const mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000';
            const mlApiKey = process.env.ML_API_KEY || 'secret_key_internal';

            let predictionResult;
            try {
                const response = await firstValueFrom(
                    this.httpService.post(`${mlApiUrl}/ml/predict-duration`, mlPayload, {
                        headers: { 'X-API-Key': mlApiKey },
                    })
                );
                predictionResult = response.data;
            } catch (mlError) {
                this.logger.error('Gagal memanggil API FastAPI ML', mlError);
                throw new HttpException(
                    { detail: 'Terjadi kesalahan pada komputasi model ML. Gagal menghasilkan prediksi.' },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            // 4. Simpan tugas ke database dengan kolom lengkap sesuai Modul 9
            const newTask = await this.prisma.task.create({
                data: {
                    user_id: userId,
                    course_id: body.course_id,
                    title: body.title,
                    task_type: body.type,
                    task_size: body.size,
                    deadline: new Date(body.deadline),

                    // Rekam jejak prediksi (Syarat Retrain Model ML)
                    predicted_input: mlPayload,
                    estimated_duration_hours: predictionResult.estimated_hours,
                    predicted_min_hours: predictionResult.duration_range_hours?.min,
                    predicted_max_hours: predictionResult.duration_range_hours?.max,
                    influencing_factors: predictionResult.influencing_factors,
                    model_version: predictionResult.model_version || 'baseline-v0.1',
                    predicted_at: new Date(),
                },
            });

            // 5. Response sukses
            return {
                statusCode: 200,
                message: 'Tugas berhasil disimpan',
                task_id: newTask.id,
            };

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error('Gagal menyimpan task', error);
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}