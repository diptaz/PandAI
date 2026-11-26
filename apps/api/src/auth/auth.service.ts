import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    async register(data: any) {
        const { name, email, password } = data;

        // Cek apakah email sudah terdaftar
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('Email sudah terdaftar');
        }

        // Hash kata sandi
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Simpan ke database
        const newUser = await this.prisma.user.create({
            data: {
                name,
                email,
                password_hash,
            },
        });

        return {
            statusCode: 201,
            message: 'Akun berhasil dibuat',
            user: {
                user_id: newUser.id,
                name: newUser.name,
                email: newUser.email,
            },
        };
    }

    async login(data: any) {
        const { email, password } = data;

        // Cari user berdasarkan email
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('Email atau password salah');
        }

        // Cek kecocokan password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Email atau password salah');
        }

        // Buat payload untuk JWT
        const payload = { sub: user.id, email: user.email };

        // Generate token
        const access_token = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
        const refresh_token = await this.jwtService.signAsync(payload, { expiresIn: '7d' }); // Refresh token 7 hari

        // Simpan refresh token ke database
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refresh_token },
        });

        return {
            statusCode: 200,
            message: 'Login berhasil',
            access_token,
            refresh_token,
            user: {
                user_id: user.id,
                name: user.name,
                email: user.email
            }
        };
    }

    async refresh(data: any) {
        const { refresh_token } = data;

        // Validasi jika refresh token tidak dikirim
        if (!refresh_token) {
            throw new BadRequestException('Refresh token wajib dilampirkan.');
        }

        try {
            // Verifikasi validitas token
            const payload = await this.jwtService.verifyAsync(refresh_token);

            // Cek apakah user ada dan token cocok dengan yang disimpan di database (mencegah token yang sudah dicabut)
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });

            if (!user || user.refresh_token !== refresh_token) {
                throw new UnauthorizedException('Refresh token tidak valid atau telah kedaluwarsa. Silakan login kembali.');
            }

            // Buat payload baru
            const newPayload = { sub: user.id, email: user.email };

            // Generate token baru
            const new_access_token = await this.jwtService.signAsync(newPayload, { expiresIn: '1d' }); // Diubah jadi 1 hari sesuai kontrak
            const new_refresh_token = await this.jwtService.signAsync(newPayload, { expiresIn: '7d' });

            // Simpan refresh token baru ke database
            await this.prisma.user.update({
                where: { id: user.id },
                data: { refresh_token: new_refresh_token },
            });

            // Kembalikan response sukses
            return {
                statusCode: 200,
                message: 'Token berhasil diperbarui',
                access_token: new_access_token,
                refresh_token: new_refresh_token,
            };
        } catch (error) {
            // Tangkap error jika token expired atau invalid
            throw new UnauthorizedException('Refresh token tidak valid atau telah kedaluwarsa. Silakan login kembali.');
        }
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('Sesi telah berakhir, silakan login kembali');
        }

        // Cek status onboarding (true jika sleep_time_start tidak null)
        const onboarding_status = user.sleep_time_start !== null;

        return {
            statusCode: 200,
            user_id: user.id,
            name: user.name,
            email: user.email,
            onboarding_status,
        };
    }
}