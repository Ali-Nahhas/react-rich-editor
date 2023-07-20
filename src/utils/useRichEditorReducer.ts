/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    AudioBlockType,
    CodeBlockType,
    EquationBlockType,
    ImageBlockType,
    TextBlockType,
    VideoBlockType,
} from '@opexams/opx-database/tables/Exams/richEditorTypes'
import useAsRef from '@the-factory/react-utils/hooks/useAsRef'
import generateUniqueId from '@the-factory/utils/generators/generateUniqueId'
import reorderList from '@the-factory/utils/sorting/reorderList'
import produce from 'immer'
import isEqual from 'lodash/isEqual'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DropResult } from 'react-beautiful-dnd'
import { RichEditorContextType, RichEditorProps, RichEditorState } from '../RichEditor'
import programmingLanguages from '../blocks/Code/utils/programmingLanguages'
import getCleanChildNodes from './getCleanChildNodes'
import getTextBlockId from './getTextBlockId'

export interface RichEditorActions {
    setOpenMenuId: { id: string | undefined }
    setSelectionNode: { elementId: string; rect: DOMRect } | undefined

    handleBlockDrop: DropResult

    setFocusedBlockId: { callerId: string | undefined; toPosition?: 'top' | 'bottom' }

    deleteBlock: { id: string }
    duplicateBlock: { id: string }

    convertText: {
        id: string
        level: TextBlockType['data']['level']
        text: string
        focusPosition?: 'start' | 'end' | 'allContent'
    }

    addTextBlock: { afterId?: string; heading?: boolean; orderedList?: boolean; unorderedList?: boolean }
    setText: { id: string; text: string }
    moveTextBlockDown: { id: string }
    skipTextMidLine: { id: string; toKeep: string; toMove: string }
    mergeTextBlockUp: { id: string }

    endListBlock: { id: string; content: string }
    splitList: { id: string; currentList: string; newList: string }

    addImageBlocks: { id: string; file: File; large: boolean }[]
    setImageLinks: (ImageBlockType['data'] & { id: string })[]
    addVideoBlocks: { id: string; file: File; large: boolean }[]
    setVideoLinks: (VideoBlockType['data'] & { id: string })[]
    addAudioBlocks: { id: string; file: File; large: boolean }[]
    setAudioLinks: (AudioBlockType['data'] & { id: string })[]

    addEquationBlock: {}
    updateEquationBlock: { id: string; math: string }
    addCodeBlock: {}
    setCodeLanguage: { id: string; language: string }
    setCodeColored: { id: string; colored: boolean }
    setCodeValue: { id: string; code: string }
}

const allActions: { [K in keyof RichEditorActions]: any } = {
    addTextBlock,
    handleBlockDrop,
    setText,
    deleteBlock,
    setFocusedBlockId,
    addImageBlocks,
    setImageLinks,
    setOpenMenuId,
    duplicateBlock,
    convertText,
    addVideoBlocks,
    setVideoLinks,
    addAudioBlocks,
    setAudioLinks,
    addEquationBlock,
    updateEquationBlock,
    addCodeBlock,
    setCodeValue,
    setCodeColored,
    setCodeLanguage,
    setSelectionNode,
    moveTextBlockDown,
    skipTextMidLine,
    mergeTextBlockUp,
    endListBlock,
    splitList,
}

export default function useRichEditorReducer(props: RichEditorProps) {
    const [state, setState] = useState<RichEditorContextType['state']>({
        data: props.data,
        focusedBlock: undefined,
        openMenuId: undefined,
        selectionNode: undefined,
    })

    const propsRef = useAsRef(props)
    const lastStateRef = useRef<RichEditorState['data']>(props.data)

    useEffect(() => {
        if (!!propsRef.current.onChange && !isEqual(lastStateRef.current, state.data)) {
            propsRef.current.onChange(state.data)
            lastStateRef.current = state.data
        }
    }, [propsRef, state.data])

    const dispatch: RichEditorContextType['dispatch'] = useCallback(
        (action, payload) => {
            setState(
                produce((draftState) => {
                    ;(allActions as any)[action](draftState, payload, propsRef.current)
                })
            )
        },
        [propsRef]
    )

    return useMemo(() => ({ state, dispatch }), [dispatch, state])
}

function addTextBlock(state: RichEditorState, payload: RichEditorActions['addTextBlock']) {
    const id = generateUniqueId()

    const { afterId, heading, orderedList, unorderedList } = payload

    if (heading) {
        const lastBlock = state.data.blocks[state.data.blocks.length - 1]
        const isOneBlock = state.data.blocks.length === 1

        if (
            lastBlock &&
            lastBlock.type === 'text' &&
            (lastBlock.data.level === 'text' || lastBlock.data.level === 'list')
        ) {
            lastBlock.data.level = isOneBlock ? 'h1' : 'h2'
            lastBlock.id = generateUniqueId()

            state.focusedBlock = { id: lastBlock.id }
        } else {
            state.data.blocks.push({ id, type: 'text', data: { text: '', level: 'h2' } })

            state.focusedBlock = { id: id }
        }

        return
    }

    if (orderedList || unorderedList) {
        state.data.blocks.push({
            id,
            type: 'text',
            data: {
                text: orderedList ? `<ol><li></li></ol>` : `<ul><li></li></ul>`,
                level: 'list',
                listType: orderedList ? 'ordered' : 'unordered',
            },
        })

        state.focusedBlock = { id: id }

        return
    }

    if (afterId) {
        const index = state.data.blocks.findIndex((b) => b.id === afterId)

        state.data.blocks.splice(index + 1, 0, { id, type: 'text', data: { text: '', level: 'text' } })

        state.focusedBlock = { id: id }

        return
    }

    state.data.blocks.push({ id, type: 'text', data: { text: '', level: 'text' } })

    state.focusedBlock = { id: id }
}

function convertText(state: RichEditorState, payload: RichEditorActions['convertText']) {
    const { id, level, text, focusPosition } = payload

    const block = state.data.blocks.find((b) => b.id === id)! as TextBlockType

    const newId = generateUniqueId()

    block.data.level = level
    block.data.text = text

    block.id = newId
    state.focusedBlock = { id: newId, position: focusPosition }
}

function setText(state: RichEditorState, payload: RichEditorActions['setText']) {
    const { id, text } = payload

    const block = state.data.blocks.find((b) => b.id === id)! as TextBlockType

    if (block.data.level === 'list' && !text) {
        block.data.level = 'text'
        block.data.text = ''

        return
    }

    block.data.text = text
}

function addImageBlocks(state: RichEditorState, files: RichEditorActions['addImageBlocks']) {
    files.forEach((item) => {
        state.data.blocks.push({
            id: item.id,
            type: 'image',
            data: {
                url: URL.createObjectURL(item.file),
                status: item.large ? 'error' : 'uploading',
                tempUrl: URL.createObjectURL(item.file),
                customError: item.large ? 'richEditor.fileTooLarge' : undefined,
            },
        })
    })
}

function setImageLinks(state: RichEditorState, files: RichEditorActions['setImageLinks']) {
    files.forEach((item) => {
        const block = state.data.blocks.find((b) => b.id === item.id) as ImageBlockType

        if (!block) {
            return
        }

        block.data.url = item.url || undefined
        block.data.status = item.status
    })
}

function deleteBlock(state: RichEditorState, payload: RichEditorActions['deleteBlock']) {
    const blocks = state.data.blocks

    const index = blocks.findIndex((b) => b.id === payload.id)
    const block = blocks[index]

    const canFocus = block.type === 'text'
    if (canFocus) {
        const previousBlock = blocks
            .slice(0, index)
            .reverse()
            .find((b) => b.type === 'text')

        if (previousBlock) {
            state.focusedBlock = { id: previousBlock.id }
        } else {
            const nextBlock = blocks.slice(index + 1).find((b) => b.type === 'text')

            if (nextBlock) {
                state.focusedBlock = { id: nextBlock.id }
            } else {
                state.focusedBlock = undefined
            }
        }
    }

    state.data.blocks = blocks.filter((b) => b.id !== payload.id)
}

function duplicateBlock(state: RichEditorState, payload: RichEditorActions['duplicateBlock']) {
    const blocks = state.data.blocks

    const index = blocks.findIndex((b) => b.id === payload.id)
    const block = blocks[index]

    const newBlock = { ...block, id: generateUniqueId() }

    blocks.splice(index + 1, 0, newBlock)

    state.focusedBlock = { id: newBlock.id }
}

function setFocusedBlockId(state: RichEditorState, payload: RichEditorActions['setFocusedBlockId']) {
    const { callerId, toPosition } = payload

    if (!toPosition) {
        state.focusedBlock = { id: payload.callerId! }
        return
    }

    const index = state.data.blocks.findIndex((b) => b.id === callerId)

    const newIndex = toPosition === 'bottom' ? index + 1 : index - 1

    const toFocusBlock = state.data.blocks[newIndex]

    if (toFocusBlock) {
        state.focusedBlock = { id: toFocusBlock.id }
    }
}

function handleBlockDrop(state: RichEditorState, payload: RichEditorActions['handleBlockDrop']) {
    if (!payload.destination || payload.destination.index === payload.source.index) {
        return
    }

    const destinationIndex = payload.destination.index
    const sourceIndex = payload.source.index

    const newList = reorderList(state.data.blocks, sourceIndex, destinationIndex)
    state.data.blocks = newList
}

function setOpenMenuId(state: RichEditorState, payload: RichEditorActions['setOpenMenuId']) {
    state.openMenuId = payload.id
}

function addVideoBlocks(state: RichEditorState, files: RichEditorActions['addVideoBlocks']) {
    files.forEach((item) => {
        state.data.blocks.push({
            id: item.id,
            type: 'video',
            data: {
                url: URL.createObjectURL(item.file),
                status: item.large ? 'error' : 'uploading',
                tempUrl: URL.createObjectURL(item.file),
                customError: item.large ? 'richEditor.fileTooLarge' : undefined,
            },
        })
    })
}

function setVideoLinks(state: RichEditorState, files: RichEditorActions['setVideoLinks']) {
    files.forEach((item) => {
        const block = state.data.blocks.find((b) => b.id === item.id) as VideoBlockType

        if (!block) {
            return
        }

        block.data.url = item.url || undefined
        block.data.status = item.status
    })
}

function addAudioBlocks(state: RichEditorState, files: RichEditorActions['addAudioBlocks']) {
    files.forEach((item) => {
        state.data.blocks.push({
            id: item.id,
            type: 'audio',
            data: {
                url: URL.createObjectURL(item.file),
                status: item.large ? 'error' : 'uploading',
                tempUrl: URL.createObjectURL(item.file),
                customError: item.large ? 'richEditor.fileTooLarge' : undefined,
            },
        })
    })
}

function setAudioLinks(state: RichEditorState, files: RichEditorActions['setAudioLinks']) {
    files.forEach((item) => {
        const block = state.data.blocks.find((b) => b.id === item.id) as AudioBlockType

        if (!block) {
            return
        }

        block.data.url = item.url || undefined
        block.data.status = item.status
    })
}

function addEquationBlock(state: RichEditorState) {
    state.data.blocks.push({ id: generateUniqueId(), type: 'equation', data: { math: '' } })
}

function updateEquationBlock(state: RichEditorState, payload: RichEditorActions['updateEquationBlock']) {
    const block = state.data.blocks.find((b) => b.id === payload.id)! as EquationBlockType

    block.data.math = payload.math
}

function addCodeBlock(state: RichEditorState) {
    state.data.blocks.push({
        id: generateUniqueId(),
        type: 'code',
        data: {
            code: '',
            colored: true,
            language: programmingLanguages.find((x) => x.title === 'JavaScript')?.value ?? '',
        },
    })
}

function setCodeValue(state: RichEditorState, payload: RichEditorActions['setCodeValue']) {
    const block = state.data.blocks.find((b) => b.id === payload.id)! as CodeBlockType

    block.data.code = payload.code
}

function setCodeColored(state: RichEditorState, payload: RichEditorActions['setCodeColored']) {
    const block = state.data.blocks.find((b) => b.id === payload.id)! as CodeBlockType

    block.data.colored = payload.colored
}

function setCodeLanguage(state: RichEditorState, payload: RichEditorActions['setCodeLanguage']) {
    const block = state.data.blocks.find((b) => b.id === payload.id)! as CodeBlockType

    block.data.language = payload.language
}

function setSelectionNode(state: RichEditorState, payload: RichEditorActions['setSelectionNode']) {
    state.selectionNode = payload
}

function moveTextBlockDown(state: RichEditorState, payload: RichEditorActions['moveTextBlockDown']) {
    const index = state.data.blocks.findIndex((b) => b.id === payload.id)
    const currentBlock = state.data.blocks[index]

    state.data.blocks.splice(index + 1, 0, { ...currentBlock })

    state.data.blocks[index] = { id: generateUniqueId(), data: { level: 'text', text: '' }, type: 'text' }

    state.focusedBlock = { id: currentBlock.id, position: 'start' }
}

function skipTextMidLine(state: RichEditorState, payload: RichEditorActions['skipTextMidLine']) {
    const { id, toKeep, toMove } = payload

    const index = state.data.blocks.findIndex((b) => b.id === id)
    const currentBlock = state.data.blocks[index] as TextBlockType

    const newId = generateUniqueId()

    state.data.blocks.splice(index + 1, 0, { type: 'text', id: newId, data: { text: toMove, level: 'text' } })

    state.data.blocks[index] = { ...currentBlock, data: { ...currentBlock.data, text: toKeep } } as TextBlockType

    state.focusedBlock = { id: newId, position: 'start' }
}

function mergeTextBlockUp(state: RichEditorState, payload: RichEditorActions['mergeTextBlockUp']) {
    const { id } = payload

    const index = state.data.blocks.findIndex((b) => b.id === id)

    const currentBlock = state.data.blocks[index] as TextBlockType
    const previousBlock = state.data.blocks[index - 1]

    if (!previousBlock || previousBlock.type !== 'text') {
        return
    }

    const elm = document.getElementById(getTextBlockId(previousBlock.id))
    const nodeIdx = elm ? getCleanChildNodes(elm).length - 1 : undefined

    const hasValidIdx = !!elm && nodeIdx !== undefined && nodeIdx !== -1
    const specificLetter = hasValidIdx ? elm.childNodes[nodeIdx].textContent?.length ?? 0 : undefined

    state.focusedBlock = {
        id: previousBlock.id,
        specificNode: hasValidIdx ? nodeIdx : undefined,
        specificLetter: specificLetter,
        position: 'start',
    }

    state.data.blocks[index - 1] = {
        ...previousBlock,
        data: { ...previousBlock.data, text: previousBlock.data.text + currentBlock.data.text },
    }

    state.data.blocks.splice(index, 1)
}

function endListBlock(state: RichEditorState, payload: RichEditorActions['endListBlock']) {
    const { id, content } = payload

    const index = state.data.blocks.findIndex((b) => b.id === id)
    const currentBlock = state.data.blocks[index] as TextBlockType

    if (!currentBlock) {
        return
    }

    currentBlock.data = { ...currentBlock.data, text: content }

    const newId = generateUniqueId()

    state.data.blocks.splice(index + 1, 0, { id: newId, type: 'text', data: { text: '', level: 'text' } })

    state.focusedBlock = { id: newId, position: 'start' }
}

function splitList(state: RichEditorState, payload: RichEditorActions['splitList']) {
    const { id, currentList, newList } = payload

    const index = state.data.blocks.findIndex((b) => b.id === id)
    const currentBlock = state.data.blocks[index] as TextBlockType

    if (!currentBlock) {
        return
    }

    currentBlock.data = { ...currentBlock.data, text: currentList }

    const firstId = generateUniqueId()

    state.data.blocks.splice(index + 1, 0, { id: firstId, type: 'text', data: { text: '', level: 'text' } })

    state.data.blocks.splice(index + 2, 0, {
        id: generateUniqueId(),
        type: 'text',
        data: { text: newList, level: 'text' },
    })

    state.focusedBlock = { id: firstId, position: 'start' }
}
