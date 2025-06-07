import { DocumentId, PaginatedData } from "@/types";
import crypto from 'crypto';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';
import { NextRequest } from "next/server";
import path from 'path';
import mockDb from "./mock-db";

// Define a type map for each table in mockDb
type MockDbTables = typeof mockDb;
type TableName = keyof MockDbTables;
type TableItem<T extends TableName> = MockDbTables[T][number];

const ROOT_DIR = process.cwd();

const MOCK_DATA_DIR = path.join(ROOT_DIR, 'mock-storage');

const DB_FILE_PATH = path.join(MOCK_DATA_DIR, 'db.json');
const UPLOAD_DIR = path.join(MOCK_DATA_DIR, 'uploads');
const PROTECTED_UPLOAD_DIR = path.join(MOCK_DATA_DIR, 'protected-uploads');

// File storage interface
interface FileStorageOptions {
    file: File;
    directory?: string;
    filename?: string;
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    storageEngine?: 'local' | 'protected-local';
}

interface StoredFile {
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimeType: string;
    url: string;
    hash: string;
    uploadedAt: string;
}

function createResponse(success: boolean, data?: any, message?: string, errors?: any) {
    return {
        success: success ? 1 : 0,
        data,
        message,
        errors,
        timestamp: new Date().toISOString(),
    };
}

function paginate<T>(data: T[], page: number = 1, pageSize: number = 10): PaginatedData<T> {
    const offset = (page - 1) * pageSize;
    const paginatedData = data.slice(offset, offset + pageSize);
    return {
        results: paginatedData,
        count: data.length,
    };
}

class BaseFilter<T = any> {
    protected data: T[];

    constructor(data: T[]) {
        this.data = data;
    }

    filter(params: Record<string, any>): T[] {
        let filtered = [...this.data];

        // Generic filtering - override in subclasses for custom logic
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                filtered = filtered.filter(item => {
                    const itemValue = (item as any)[key];
                    if (typeof itemValue === 'string' && typeof value === 'string') {
                        return itemValue.toLowerCase().includes(value.toLowerCase());
                    }
                    return itemValue === value;
                });
            }
        });

        return filtered;
    }
}

// Load data from db.json file
const loadDbFromFile = async (): Promise<MockDbTables> => {
    try {
        const fileContent = await fs.readFile(DB_FILE_PATH, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        // If file doesn't exist or can't be read, return the mock data
        console.warn('Could not load db.json, using mock data:', error);
        return mockDb;
    }
};

// Save data to db.json file
const saveDbToFile = async (data: MockDbTables): Promise<void> => {
    try {
        // Ensure directory exists
        const dir = path.dirname(DB_FILE_PATH);
        await fs.mkdir(dir, { recursive: true });

        // Write file with proper formatting
        await fs.writeFile(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Failed to save db.json:', error);
        throw new Error('Failed to save data to database');
    }
};

const getTable = async <T extends TableName>(dbName: T): Promise<MockDbTables[T]> => {
    const db = await loadDbFromFile();
    const table = db[dbName];
    if (!table) {
        throw new Error(`Table ${dbName} does not exist in database`);
    }
    return table;
};

// Separate File Storage utilities
const FileStorage = {
    // Generate unique filename
    generateFilename: (originalName: string): string => {
        const ext = path.extname(originalName);
        const name = path.basename(originalName, ext);
        const timestamp = Date.now();
        const random = crypto.randomBytes(6).toString('hex');
        return `${name}_${timestamp}_${random}${ext}`;
    },

    // Generate file hash
    generateFileHash: async (buffer: Buffer): Promise<string> => {
        return crypto.createHash('md5').update(buffer).digest('hex');
    },

    // Validate file type
    validateFileType: (file: File, allowedTypes: string[]): boolean => {
        if (allowedTypes.length === 0) return true;
        return allowedTypes.some(type => {
            if (type.includes('/')) {
                return file.type === type;
            }
            return file.type.startsWith(type + '/');
        });
    },

    // Ensure directory exists
    ensureDirectory: async (dirPath: string): Promise<void> => {
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
    },

    // Upload file
    uploadFile: async (options: FileStorageOptions): Promise<StoredFile> => {
        const {
            file,
            directory = '',
            filename,
            maxSize = 10 * 1024 * 1024, // 10MB default
            allowedTypes = [],
            storageEngine = 'local'
        } = options;

        // Validate file size
        if (file.size > maxSize) {
            throw new Error(`File size exceeds maximum allowed size of ${maxSize} bytes`);
        }

        // Validate file type
        if (!FileStorage.validateFileType(file, allowedTypes)) {
            throw new Error(`File type ${file.type} is not allowed`);
        }

        // Determine upload directory
        const baseUploadDir = storageEngine === 'protected-local' ? PROTECTED_UPLOAD_DIR : UPLOAD_DIR;
        const uploadDir = directory ? path.join(baseUploadDir, directory) : baseUploadDir;

        // Ensure directory exists
        await FileStorage.ensureDirectory(uploadDir);

        // Generate filename
        const finalFilename = filename || FileStorage.generateFilename(file.name);
        const filePath = path.join(uploadDir, finalFilename);

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generate file hash
        const hash = await FileStorage.generateFileHash(buffer);

        // Write file to disk
        await fs.writeFile(filePath, buffer);

        // Generate URL based on storage engine
        const url = `/api/v1/lms/attachments/file/${finalFilename}`;

        return {
            filename: finalFilename,
            originalName: file.name,
            path: filePath,
            size: file.size,
            mimeType: file.type,
            url,
            hash,
            uploadedAt: new Date().toISOString()
        };
    },

    // Remove file
    removeFile: async (filePath: string): Promise<boolean> => {
        try {
            await fs.unlink(filePath);
            return true;
        } catch (error) {
            console.error('Error removing file:', error);
            return false;
        }
    },

    // Get file info
    getFileInfo: async (filePath: string): Promise<{
        exists: boolean;
        size?: number;
        mtime?: Date;
    }> => {
        try {
            const stats = await fs.stat(filePath);
            return {
                exists: true,
                size: stats.size,
                mtime: stats.mtime
            };
        } catch {
            return { exists: false };
        }
    },

    getFileType: (extension: string): 'image' | 'video' | 'audio' | 'document' | 'other' => {
        const ext = extension.toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
            return 'image';
        } else if (['.mp4', '.webm'].includes(ext)) {
            return 'video';
        } else if (['.mp3', '.wav'].includes(ext)) {
            return 'audio';
        } else if (['.pdf', '.docx', '.txt'].includes(ext)) {
            return 'document';
        }
        return 'other';
    },

    fileExists: async (filePath: string): Promise<boolean> => {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    },

    readFile: async (filePath: string): Promise<Buffer> => {
        try {
            return await fs.readFile(filePath);
        } catch (error) {
            throw new Error(`File not found: ${filePath}`);
        }
    },
};


function getNowIsoString() {
    return new Date().toISOString();
}


const ApiUtils = {
    getNowIsoString,
    createResponse,
    paginate,
    BaseFilter,
    FileStorage, // Export FileStorage separately

    createDocumentId: async <T extends TableName>(dbName: T): Promise<DocumentId> => {
        const table = await getTable(dbName);
        return table.length + 1;
    },

    findItemById: async <T extends TableName>(
        dbName: T,
        id: DocumentId
    ): Promise<TableItem<T>> => {
        const table = await getTable(dbName);
        const res = table.find((item) => item.id === id);
        if (!res) {
            throw new Error(`Item with id ${id} not found in ${dbName}`);
        }
        return res as TableItem<T>;
    },

    addItem: async <T extends TableName>(
        dbName: T,
        item: Omit<TableItem<T>, "id" | "created_at" | "updated_at">
    ): Promise<TableItem<T>> => {
        const db = await loadDbFromFile();
        const table = db[dbName];
        const newId = table.length + 1;
        const newItem = {
            ...item, id: newId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        } as TableItem<T>;

        // Add to table and save to file
        table.push(newItem as any);
        await saveDbToFile(db);

        return newItem;
    },

    updateItem: async <T extends TableName>(
        dbName: T,
        id: DocumentId,
        updates: Partial<Omit<TableItem<T>, "id">>
    ): Promise<TableItem<T>> => {
        const db = await loadDbFromFile();
        const table = db[dbName];
        const itemIndex = table.findIndex((item) => item.id === id);

        if (itemIndex === -1) {
            throw new Error(`Item with id ${id} not found in ${dbName}`);
        }

        const updatedItem = { ...table[itemIndex], ...updates } as TableItem<T>;
        table[itemIndex] = updatedItem as any;

        // Save changes to file
        await saveDbToFile(db);

        return updatedItem;
    },

    deleteItem: async <T extends TableName>(
        dbName: T,
        id: DocumentId
    ): Promise<boolean> => {
        const db = await loadDbFromFile();
        const table = db[dbName];
        const itemIndex = table.findIndex((item) => item.id === id);

        if (itemIndex === -1) {
            throw new Error(`Item with id ${id} not found in ${dbName}`);
        }

        table.splice(itemIndex, 1);

        // Save changes to file
        await saveDbToFile(db);

        return true;
    },

    listItems: async <T extends TableName>(
        dbName: T,
    ): Promise<TableItem<T>[]> => {
        const table = await getTable(dbName);
        return [...table] as TableItem<T>[];
    },

    // Utility method to initialize db.json with mock data if it doesn't exist
    initializeDb: async (): Promise<void> => {
        console.log("Initializing database...", DB_FILE_PATH);
        try {
            await fs.access(DB_FILE_PATH);
        } catch {
            // File doesn't exist, create it with mock data
            await saveDbToFile(mockDb);
        }

        // Ensure upload directories exist
        await FileStorage.ensureDirectory(UPLOAD_DIR);
        await FileStorage.ensureDirectory(PROTECTED_UPLOAD_DIR);
    },
    // jwt auth
    authenticateUser: async (request: NextRequest): Promise<any> => {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Token ', '');
        if (!token) {
            throw new Error('Authentication required');
        }
        try {
            const decoded: any = jwt.decode(token);
            if (!decoded || !decoded.user_id || !decoded.email) {
                throw new Error('Invalid token or missing user info');
            }

            const jwtPayload = {
                user_id: decoded.user_id,
                email: decoded.email,
                name: decoded.name,
                iat: Math.floor(Date.now() / 1000),
                photo: decoded.picture,
            };

            return {
                user: jwtPayload,
            };
        } catch (error) {
            throw new Error("Failed to generate JWT token");
        }
    }
};

export default ApiUtils;