import { TextBlockType } from '@opexams/opx-database/tables/Exams/richEditorTypes'
import useAsRef from '@the-factory/react-utils/hooks/useAsRef'
import classNames from 'classnames'
import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable'
import { useTranslation } from 'react-i18next'
import { useRichEditorData } from '../RichEditor'
import RichEditorInlineBar from '../components/RichEditorInlineBar'
import focusElement from '../utils/focusElement'
import getTextBlockId from '../utils/getTextBlockId'
import sanitizeHtml from '../utils/sanitizeHtml'
import useTextBlockHandler from './Text/useTextBlockHandler'

interface Props {
    block: TextBlockType
    idx: number
    readMode?: boolean
}

export default React.memo(TextBlock)

function TextBlock(props: Props): JSX.Element {
    const { block, idx, readMode } = props

    const { t } = useTranslation()

    const { text, level } = block.data

    const isHeading = level === 'h1' || level === 'h2' || level === 'h3'

    const ref = useRef<HTMLDivElement>(null)

    const { dispatch, classes, state, mainClasses, props: editorProps } = useRichEditorData()
    const { focusedBlock } = state
    const { styles } = editorProps

    const elementId = useMemo(() => getTextBlockId(block.id), [block.id])

    const isFirstBlock = idx === 0
    const isLastBlock = idx === state.data.blocks.length - 1
    const previousBlock = state.data.blocks[idx - 1]?.type
    const nextBlock = state.data.blocks[idx + 1]?.type

    const dataRef = useAsRef(block.data)
    const readModeRef = useAsRef(readMode)

    const { handler } = useTextBlockHandler({ block, elm: ref.current!, dataRef })

    const isOnlyBlock = useMemo(
        () => state.data.blocks.filter((x) => x.type === 'text').length === 1,
        [state.data.blocks]
    )

    useLayoutEffect(() => {
        const elm = ref.current

        if (!elm || readMode) {
            return
        }

        elm.addEventListener('keydown', handler)

        return () => elm.removeEventListener('keydown', handler)
    }, [handler, readMode])

    useLayoutEffect(() => {
        const div = ref.current

        if (!focusedBlock || focusedBlock.id !== block.id || !div || readMode) {
            return
        }

        const timeout = setTimeout(() => {
            focusElement({
                elm: div,
                position: focusedBlock.position,
                specificNode: focusedBlock.specificNode,
                specificLetter: focusedBlock.specificLetter,
            })

            dispatch('setFocusedBlockId', { callerId: undefined })
        }, 0)

        return () => clearTimeout(timeout)
    }, [block.id, dispatch, focusedBlock, readMode])

    const onContentChange = useCallback(
        (e: ContentEditableEvent | React.FocusEvent) => {
            if (readModeRef.current) {
                return
            }

            const resultText = sanitizeHtml(e.currentTarget.innerHTML)

            const { level: newLevel, text: newText } = getHeadingLevel(dataRef.current.level, resultText)

            if (newLevel && dataRef.current.level !== newLevel) {
                dispatch('convertText', { id: block.id, text: newText, level: newLevel })

                return
            }

            dispatch('setText', { id: block.id, text: resultText })
        },
        [block.id, dataRef, dispatch, readModeRef]
    )

    const marginTop = isFirstBlock ? 0 : isHeading ? (level === 'h1' ? 32 : level === 'h2' ? 24 : 16) : 1
    const marginBottom = isLastBlock ? 0 : 1

    const paddingTop = isFirstBlock ? 4 : previousBlock === 'text' ? 3 : 4
    const paddingBottom = isLastBlock ? 4 : nextBlock === 'text' ? 3 : 4

    const placeholder = isHeading
        ? t('richEditor.headingPlaceholder', { level: level[1] })
        : t('richEditor.textPlaceholder')

    const hasSelection = elementId === state.selectionNode?.elementId

    const dimensions = useMemo(() => {
        if (!ref.current || !state.selectionNode) {
            return { left: 0, top: 0 }
        }

        const elm = ref.current.getBoundingClientRect()

        const left = state.selectionNode.rect.left - elm.left
        const top = state.selectionNode.rect.top - elm.top - 48

        return { left, top }
    }, [state.selectionNode])

    return (
        <div className={mainClasses.block}>
            <div style={{ minHeight: marginTop }} />

            <div className={mainClasses.blockContent}>
                {hasSelection && !readMode ? (
                    <RichEditorInlineBar
                        block={block}
                        left={dimensions.left}
                        top={dimensions.top}
                        isOpen={hasSelection}
                    />
                ) : null}

                <ContentEditable
                    disabled={readMode}
                    style={{ padding: '0px 4px', paddingTop, paddingBottom, ...styles?.text }}
                    id={elementId}
                    key={elementId}
                    innerRef={ref}
                    data-placeholder={readMode ? undefined : placeholder}
                    className={classNames(classes.textArea, {
                        [classes.textAreaFocused]: (isFirstBlock && isOnlyBlock) || isHeading,
                        [classes.heading1]: level === 'h1',
                        [classes.heading2]: level === 'h2',
                        [classes.heading3]: level === 'h3',
                    })}
                    onChange={onContentChange}
                    html={text}
                />
            </div>

            <div style={{ minHeight: marginBottom }} />
        </div>
    )
}

const getHeadingLevel = (
    level: TextBlockType['data']['level'],
    str: string
): { text: string; level: TextBlockType['data']['level'] } => {
    const parts = str.split(/\s/)
    const text = parts[0]

    const resText = parts.slice(1).join(' ')

    if (!text.startsWith('#') || parts.length === 1) {
        return { level, text: resText }
    }

    if (text.startsWith('###')) {
        return { level: 'h3', text: resText }
    }
    if (text.startsWith('##')) {
        return { level: 'h2', text: resText }
    }
    if (text.startsWith('#')) {
        return { level: 'h1', text: resText }
    }

    return { level, text: resText }
}
