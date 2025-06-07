import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mockDb from "../../mock-db";

const querySchema = z.object({
    lesson: z.string().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const queryParams = {
            lesson: searchParams.get("lesson"),
        };

        // Validate query parameters
        const validatedParams = querySchema.parse(queryParams);

        // Start with all pages data
        let filteredPages = [...mockDb.pages];

        // Filter by lesson if provided
        if (validatedParams.lesson) {
            filteredPages = filteredPages.filter(
                page => `${page.lesson}` === validatedParams.lesson
            );
        }

        return NextResponse.json(filteredPages, { status: 200 });

    } catch (error) {
        console.error("Error in GET /api/v1/lms/lessons/pages:", error);

        // Handle validation errors
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid query parameters",
                    details: error.errors.map(err => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                },
                { status: 400 }
            );
        }

        // Handle other errors
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}