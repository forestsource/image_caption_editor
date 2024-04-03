export class DirectoryLoadError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DirectoryLoadError';
    }
}

export class InvalidFileTypeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidFileTypeError';
    }
}