import ApiUtils from '@/app/api/v1/lms/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const paramsSchema = z.object({
    filename: z.string().min(1),
});

// Schema for query parameters
const querySchema = z.object({
    attachment_id: z.string(),
    download: z.enum(['true', 'false']).optional().default('false'),
});

interface RouteParams {
    params: Promise<{
        filename: string;
    }>;
}


export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        await ApiUtils.authenticateUser(request);
    } catch (error) {
        return NextResponse.json(
            { error: 'Unauthorized access' },
            { status: 401 }
        );
    }
    try {
        const { filename } = paramsSchema.parse(await params);

        const { searchParams } = new URL(request.url);
        const { attachment_id, download } = querySchema.parse({
            attachment_id: searchParams.get('attachment_id') || '',
            download: searchParams.get('download') || 'false',
        });
        // 3. Find and validate attachment in database
        let attachment;
        try {
            attachment = await ApiUtils.findItemById("attachments", Number(attachment_id));
        } catch (error) {
            return NextResponse.json(
                { error: 'Attachment not found' },
                { status: 404 }
            );
        }

        // 6. Validate file exists on disk
        const filePath = (attachment as any).file;
        if (!filePath) {
            return NextResponse.json(
                { error: 'File path not found in attachment record' },
                { status: 404 }
            );
        }

        const fileExists = await ApiUtils.FileStorage.fileExists(filePath);
        if (!fileExists) {
            return NextResponse.json(
                { error: 'Physical file not found on server' },
                { status: 404 }
            );
        }

        // 7. Get file metadata
        const fileStats = await ApiUtils.FileStorage.getFileInfo(filePath);
        const extension = (attachment as any).extension || '';
        const mimeType = getMimeType(extension);

        const fileBuffer = await ApiUtils.FileStorage.readFile(filePath);

        // 10. Prepare response headers
        const responseHeaders = new Headers();
        responseHeaders.set('Content-Type', mimeType);
        responseHeaders.set('Content-Length', fileStats.size!.toString());

        // 10. Set content disposition based on file type and download parameter
        if (download === 'true') {
            responseHeaders.set(
                'Content-Disposition',
                `attachment; filename="${encodeURIComponent(filename)}"`
            );
        } else {
            // Smart disposition: inline for viewable files, attachment for others
            const isViewable = isFileViewable(mimeType);
            responseHeaders.set(
                'Content-Disposition',
                `${isViewable ? 'inline' : 'attachment'}; filename="${encodeURIComponent(filename)}"`
            );
        }

        // 11. Cache and security headers
        responseHeaders.set('Cache-Control', 'private, max-age=3600, must-revalidate');
        responseHeaders.set('X-Content-Type-Options', 'nosniff');
        responseHeaders.set('X-Frame-Options', 'SAMEORIGIN');
        responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

        const etag = `"${fileStats.mtime!.getTime()}-${fileStats.size}-${attachment_id}-${filename}"`;
        responseHeaders.set('ETag', etag);

        // Check if client has cached version
        const ifNoneMatch = request.headers.get('if-none-match');
        if (ifNoneMatch && ifNoneMatch === etag) {
            return new NextResponse(null, { status: 304, headers: responseHeaders });
        }

        // 13. Handle range requests for media streaming
        const range = request.headers.get('range');
        if (range && (mimeType.startsWith('video/') || mimeType.startsWith('audio/'))) {
            return handleRangeRequest(fileBuffer, range, responseHeaders, mimeType);
        }

        // 14. Return file
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: responseHeaders,
        });
    } catch (error) {

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Invalid request parameters',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message,
                    }))
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error while accessing file' },
            { status: 500 }
        );
    }
}

// Handle range requests for streaming media (video/audio)
function handleRangeRequest(
    fileBuffer: Buffer,
    range: string,
    headers: Headers,
    mimeType: string
): NextResponse {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileBuffer.length - 1;
    const chunksize = (end - start) + 1;
    const chunk = fileBuffer.subarray(start, end + 1);

    headers.set('Content-Range', `bytes ${start}-${end}/${fileBuffer.length}`);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Length', chunksize.toString());
    headers.set('Content-Type', mimeType);

    return new NextResponse(chunk, {
        status: 206, // Partial Content
        headers,
    });
}

// Determine if file can be viewed inline in browser
function isFileViewable(mimeType: string): boolean {
    const viewableTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'text/plain',
        'text/html',
        'text/css',
        'text/javascript',
        'application/pdf',
        'video/mp4',
        'video/webm',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
    ];

    return viewableTypes.includes(mimeType) ||
        mimeType.startsWith('image/') ||
        mimeType.startsWith('text/');
}

// Get MIME type from file extension
function getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
        // Images
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.bmp': 'image/bmp',
        '.ico': 'image/x-icon',

        // Audio
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.aac': 'audio/aac',
        '.flac': 'audio/flac',
        '.m4a': 'audio/mp4',

        // Video
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.avi': 'video/x-msvideo',
        '.mov': 'video/quicktime',
        '.wmv': 'video/x-ms-wmv',

        // Documents
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.txt': 'text/plain',
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',

        // Archives
        '.zip': 'application/zip',
        '.rar': 'application/vnd.rar',
        '.7z': 'application/x-7z-compressed',
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}