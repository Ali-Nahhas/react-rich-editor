/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-multi-comp */
import {
    RichEditorBlock,
    RichEditorBlockName,
    RichEditorData,
} from '@opexams/opx-database/tables/Exams/richEditorTypes'
import { createContext } from '@the-factory/react-utils/hooks/useContextSelector'
import useContextTraced from '@the-factory/react-utils/hooks/useContextTraced'
import classNames from 'classnames'
import React, { useCallback, useMemo } from 'react'
import {
    DragDropContext,
    Draggable,
    DraggableProvided,
    DropResult,
    Droppable,
    DroppableProvided,
    DroppableStateSnapshot,
} from 'react-beautiful-dnd'
import RenderRichEditorBlock from './components/RenderRichEditorBlock'
import RichEditorBlockMenu from './components/RichEditorBlockMenu'
import RichEditorTools from './components/RichEditorTools'
import classes from './styles/RichEditor.module.css'
import blockClasses from './styles/RichEditorBlocks.module.css'
import useRichEditorReducer, { RichEditorActions } from './utils/useRichEditorReducer'

export default React.memo(RichEditor)

export interface RichEditorProps {
    className?: string
    data: RichEditorData
    uploaders?: {
        images?: (file: { id: string; file: File }[]) => Promise<RichEditorActions['setImageLinks']>
        videos?: (file: { id: string; file: File }[]) => Promise<RichEditorActions['setVideoLinks']>
        audios?: (file: { id: string; file: File }[]) => Promise<RichEditorActions['setAudioLinks']>
    }
    onChange?: (data: RichEditorData) => void
    readMode?: boolean
    hiddenBlocks?: RichEditorBlockName[]
    fullWidthBlockOnReadMode?: boolean
    styles?: {
        text?: React.CSSProperties
        codeText?: React.CSSProperties
    }
}

export interface RichEditorState {
    data: RichEditorData
    openMenuId: string | undefined
    selectionNode: { elementId: string; rect: DOMRect } | undefined
    focusedBlock:
        | { id: string; position?: 'start' | 'end' | 'allContent'; specificNode?: number; specificLetter?: number }
        | undefined
}

export type RichEditorContextType = {
    props: RichEditorProps
    state: RichEditorState
    dispatch: <T extends keyof RichEditorActions>(action: T, payload: RichEditorActions[T]) => void
    mainClasses: typeof classes
    classes: typeof blockClasses
}

export const RichEditorContext = createContext<RichEditorContextType>()
export const useRichEditorData = () => useContextTraced(RichEditorContext)

function RichEditor(props: RichEditorProps): JSX.Element {
    const { state, dispatch } = useRichEditorReducer(props)

    const value: RichEditorContextType = useMemo(() => {
        return { props, state, dispatch, mainClasses: classes, classes: blockClasses }
    }, [dispatch, props, state])

    return (
        <RichEditorContext.Provider value={value}>
            <Content />
        </RichEditorContext.Provider>
    )
}

function Content(): JSX.Element {
    const { props, state, dispatch } = useRichEditorData()
    const { className, readMode } = props
    const { data } = state
    const { blocks } = data

    const onDragEnd = useCallback((result: DropResult) => dispatch('handleBlockDrop', result), [dispatch])

    const droppableId = useMemo(() => Math.random() + '', [])

    const handleSelect = useCallback(() => {
        const selection = window.getSelection()
        const selected = selection?.toString()

        if (!selection || !selected) {
            dispatch('setSelectionNode', undefined)
            return
        }

        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        const ids: string[] = [
            (range.commonAncestorContainer as any)?.id,
            range.commonAncestorContainer?.parentElement?.id,
            range.commonAncestorContainer?.parentElement?.parentElement?.id,
            range.commonAncestorContainer?.parentElement?.parentElement?.parentElement?.id,
        ]

        const id = ids.find((x) => x?.includes('text-block'))

        if (id) {
            dispatch('setSelectionNode', { elementId: id, rect })
        }
    }, [dispatch])

    const content = (provided?: DroppableProvided, snapshot?: DroppableStateSnapshot) => {
        return (
            <div
                ref={provided?.innerRef}
                {...provided?.droppableProps}
                className={classes.blocksContainer}
                onSelect={readMode ? undefined : handleSelect}
            >
                {blocks.map((block, idx) => {
                    return (
                        <DraggableItem
                            beingDraggedId={snapshot?.draggingFromThisWith}
                            block={block}
                            idx={idx}
                            key={block.id}
                        />
                    )
                })}

                {provided?.placeholder ?? null}

                <div style={{ minHeight: 8 }} />
            </div>
        )
    }

    return (
        <div className={classNames(classes.container, className)}>
            {readMode ? null : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId={droppableId}>
                        {(provided, snapshot) => {
                            return content(provided, snapshot)
                        }}
                    </Droppable>
                </DragDropContext>
            )}

            {readMode ? content() : null}

            {readMode ? null : <RichEditorTools />}
        </div>
    )
}

type DraggableItemProps = { block: RichEditorBlock; idx: number; beingDraggedId: string | undefined }

function DraggableItem(props: DraggableItemProps): JSX.Element {
    const { beingDraggedId, block, idx } = props

    const { props: editorProps } = useRichEditorData()
    const { readMode, fullWidthBlockOnReadMode } = editorProps

    const disableHover = !!beingDraggedId && beingDraggedId !== block.id

    const content = (dragProvider?: DraggableProvided) => {
        return (
            <div key={block.id} ref={dragProvider?.innerRef} {...dragProvider?.draggableProps}>
                <div
                    className={classNames(readMode ? classes.blockContainerReadMode : classes.blockContainer, {
                        [classes.blockContainerNoHover]: disableHover,
                        [classes.blockContentHighlight]: beingDraggedId === block.id,
                        [classes.fullWidthBlockOnReadMode]: readMode && fullWidthBlockOnReadMode,
                    })}
                >
                    <RenderRichEditorBlock readMode={readMode} idx={idx} block={block} />

                    {readMode ? null : (
                        <RichEditorBlockMenu idx={idx} block={block} handleProps={dragProvider?.dragHandleProps} />
                    )}
                </div>
            </div>
        )
    }

    if (readMode) {
        return content()
    }

    return (
        <Draggable draggableId={block.id} index={idx}>
            {(dragProvider) => {
                return content(dragProvider)
            }}
        </Draggable>
    )
}
