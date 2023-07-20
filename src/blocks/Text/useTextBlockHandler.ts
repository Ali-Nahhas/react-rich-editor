/* eslint-disable spellcheck/spell-checker */
import { TextBlockType } from '@opexams/opx-database/tables/Exams/richEditorTypes'
import { useCallback, useMemo } from 'react'
import { useRichEditorData } from '../../RichEditor'
import getCursorPosition from '../../utils/getCursorPosition'
import shouldSplitHtmlList from '../../utils/shouldSplitHtmlList'

interface Args {
    block: TextBlockType
    elm: HTMLDivElement
    dataRef: React.MutableRefObject<TextBlockType['data']>
}

export default function useTextBlockHandler(args: Args) {
    const { block, elm, dataRef } = args

    const { dispatch, state } = useRichEditorData()

    const isOnlyBlock = useMemo(
        () => state.data.blocks.filter((x) => x.type === 'text').length === 1,
        [state.data.blocks]
    )

    const handler = useCallback(
        (e: KeyboardEvent) => {
            if (!elm) {
                return
            }

            const lvl = dataRef.current.level
            const type = !lvl || lvl === 'text' ? 'text' : lvl === 'list' ? 'list' : 'heading'

            if (e.key === 'Enter' && !e.shiftKey) {
                const cursor = getCursorPosition(elm)

                if (type === 'heading' || type === 'text') {
                    e.preventDefault()

                    if (cursor.text === '') {
                        if (type === 'text') {
                            dispatch('addTextBlock', { afterId: block.id })
                        }

                        if (type === 'heading') {
                            dispatch('convertText', { id: block.id, level: 'text', text: '' })
                        }
                    }

                    if (cursor.text !== '' && cursor.position === 'start') {
                        dispatch('moveTextBlockDown', { id: block.id })
                    }

                    if (cursor.text !== '' && cursor.position === 'end') {
                        dispatch('addTextBlock', { afterId: block.id })
                    }

                    if (cursor.text !== '' && cursor.position === 'none') {
                        dispatch('skipTextMidLine', {
                            id: block.id,
                            toKeep: cursor.beforeCursor,
                            toMove: cursor.afterCursor,
                        })
                    }
                }

                if (type === 'list') {
                    setTimeout(() => {
                        const { text } = getCursorPosition(elm)

                        const { action, currentList, newList } = shouldSplitHtmlList(text)

                        if (action === 'end') {
                            dispatch('endListBlock', { id: block.id, content: currentList })
                        }
                        if (action === 'two') {
                            dispatch('splitList', { id: block.id, currentList, newList })
                        }
                    }, 0)
                }
            }

            if (e.key === 'Backspace') {
                const cursor = getCursorPosition(elm)

                if (type === 'heading' && (cursor.text === '' || cursor.position === 'start')) {
                    dispatch('convertText', {
                        id: block.id,
                        level: 'text',
                        text: cursor.text,
                        focusPosition: cursor.position === 'start' ? 'start' : 'end',
                    })
                }

                if (type === 'text' && !isOnlyBlock && cursor.text === '') {
                    dispatch('deleteBlock', { id: block.id })
                }

                if (type === 'text' && cursor.text !== '' && cursor.position === 'start') {
                    dispatch('mergeTextBlockUp', { id: block.id })
                }
            }
        },
        [block.id, dataRef, dispatch, elm, isOnlyBlock]
    )

    return { handler }
}
