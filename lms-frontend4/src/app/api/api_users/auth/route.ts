import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

const JWT_SECRET = "any"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const token = body?.token;

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        try {
            const decoded: any = jwt.decode(token);
            if (!decoded || !decoded.user_id || !decoded.email) {
                return NextResponse.json({ error: 'Invalid token or missing user info' }, { status: 400 });
            }

            const jwtPayload = {
                user_id: decoded.user_id,
                email: decoded.email,
                name: decoded.name,
                iat: Math.floor(Date.now() / 1000),
                photo: decoded.picture,
            };

            const newJwtToken = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: "1h" });
            const userData = {
                id: jwtPayload.user_id,
                email: jwtPayload.email,
                name: jwtPayload.name,
                photo: jwtPayload.photo,
            }

            return NextResponse.json({
                message: {
                    ...userData,
                    token: newJwtToken,
                }
            });
        } catch (error) {
            console.error('Error generating JWT token:', error);
            return NextResponse.json({ error: "Failed to generate JWT token" }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
}