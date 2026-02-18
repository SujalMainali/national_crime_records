import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

// POST upload a file (images, videos, audio, documents)
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const category = (formData.get('category') as string) || 'general'; // stations, officers, persons, evidence

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
        }

        // Allowed file types by category
        const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        const videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
        const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/aac'];
        const documentTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];

        let allowedTypes: string[];
        let maxSize: number;

        if (category === 'evidence') {
            // Evidence: allow all media + documents
            allowedTypes = [...imageTypes, ...videoTypes, ...audioTypes, ...documentTypes];
            maxSize = 100 * 1024 * 1024; // 100MB for evidence (video can be large)
        } else {
            // Other categories: images only
            allowedTypes = imageTypes;
            maxSize = 5 * 1024 * 1024; // 5MB
        }

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, message: `Invalid file type: ${file.type}. Not allowed for category "${category}".` },
                { status: 400 }
            );
        }

        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, message: `File too large. Max size: ${maxSize / (1024 * 1024)}MB` },
                { status: 400 }
            );
        }

        // Generate unique filename
        const ext = file.name.split('.').pop() || 'bin';
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 10);
        const filename = `${timestamp}-${randomStr}.${ext}`;

        const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
        const canUseBlob = Boolean(blobToken);

        let urlPath = '';
        let storage: 'vercel-blob' | 'local' = 'local';

        if (canUseBlob) {
            // Store in Vercel Blob. Pathname must not start with '/'
            const pathname = `uploads/${category}/${filename}`;
            const blob = await put(pathname, file, {
                access: 'public',
                contentType: file.type || undefined,
                addRandomSuffix: false,
            });
            urlPath = blob.url;
            storage = 'vercel-blob';
        } else {
            // Local dev fallback (Vercel serverless file system is not persistent)
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', category);
            await mkdir(uploadDir, { recursive: true });

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filePath = path.join(uploadDir, filename);
            await writeFile(filePath, buffer);

            urlPath = `/uploads/${category}/${filename}`;
            storage = 'local';
        }

        // Determine file media type for frontend
        let mediaType = 'unknown';
        if (imageTypes.includes(file.type)) mediaType = 'image';
        else if (videoTypes.includes(file.type)) mediaType = 'video';
        else if (audioTypes.includes(file.type)) mediaType = 'audio';
        else if (documentTypes.includes(file.type)) mediaType = 'document';

        return NextResponse.json({
            success: true,
            message: 'File uploaded successfully',
            data: { url: urlPath, filename, mediaType, mimeType: file.type, size: file.size, storage },
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
    }
}
