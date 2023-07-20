import { CodeBlockType } from '@opexams/opx-database/tables/Exams/richEditorTypes'
import React, { useMemo } from 'react'
import { useRichEditorData } from '../RichEditor'
import OldCodeBlock from './Code/OldCodeBlock'

interface Props {
    block: CodeBlockType
    idx: number
    readMode?: boolean
}

export default React.memo(CodeBlock)

function CodeBlock(props: Props): JSX.Element {
    const { block, idx, readMode } = props

    const { state, mainClasses } = useRichEditorData()

    const isFirstBlock = idx === 0
    const isLastBlock = useMemo(() => idx === state.data.blocks.length - 1, [idx, state.data.blocks.length])

    const marginTop = isFirstBlock ? 0 : 4
    const marginBottom = isLastBlock ? 0 : 4

    return (
        <div className={mainClasses.block}>
            <div style={{ minHeight: marginTop }} />

            <div className={mainClasses.blockContent}>
                <OldCodeBlock readMode={readMode} block={block} />
            </div>

            <div style={{ minHeight: marginBottom }} />
        </div>
    )
}
