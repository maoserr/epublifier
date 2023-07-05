/**
 * Sandbox commands
 */
export enum SbxCommand {
    LoadParsers,
    ParseSource,
    ParseChapter,
}

/**
 * Sandbox Results
 */
export interface SbxResult<T> {
    reply: SbxReply;
    message: string;
    data?: T;
}

/**
 * Sandbox replies
 */
export enum SbxReply {
    Ok,
    Error
}
