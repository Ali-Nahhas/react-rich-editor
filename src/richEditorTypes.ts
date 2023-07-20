export interface ImageBlockType<URL = string> {
    id: string
    type: 'image'
    data: {
        tempUrl?: string
        url: URL | undefined
        status: 'done' | 'error' | 'uploading'
        customError?: string
    }
}

export interface TextBlockType {
    id: string
    type: 'text'
    data: {
        text: string
        level: 'text' | 'h1' | 'h2' | 'h3' | 'list'
        listType?: 'ordered' | 'unordered'
    }
}

export interface CodeBlockType {
    id: string
    type: 'code'
    data: {
        code: string
        language: string
        colored: boolean
    }
}

export interface EquationBlockType {
    id: string
    type: 'equation'
    data: {
        math: string
    }
}

export interface AudioBlockType<URL = string> {
    id: string
    type: 'audio'
    data: {
        tempUrl?: string
        url: URL | undefined
        status: 'done' | 'error' | 'uploading'
        customError?: string
    }
}

export interface VideoBlockType<URL = string> {
    id: string
    type: 'video'
    data: {
        tempUrl?: string
        url: URL | undefined
        status: 'done' | 'error' | 'uploading'
        customError?: string
    }
}

export interface TableBlockType {
    id: string
    type: 'table'
    data: {
        content: string[][]
        withHeadings: boolean
    }
}

export type RichEditorBlock<URL = string> =
    | TextBlockType
    | CodeBlockType
    | EquationBlockType
    | TableBlockType
    | ImageBlockType<URL>
    | AudioBlockType<URL>
    | VideoBlockType<URL>

export type RichEditorBlockName<URL = string> = RichEditorBlock<URL>['type']

export interface RichEditorData<URL = string> {
    blocks: RichEditorBlock<URL>[]
}
