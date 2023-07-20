import { RichEditorBlock } from '@opexams/opx-database/tables/Exams/richEditorTypes'
import React from 'react'
import AudioBlock from '../blocks/AudioBlock'
import CodeBlock from '../blocks/CodeBlock'
import EquationBlock from '../blocks/EquationBlock'
import ImageBlock from '../blocks/ImageBlock'
import TextBlock from '../blocks/TextBlock'
import VideoBlock from '../blocks/VideoBlock'

interface Props {
    block: RichEditorBlock
    idx: number
    readMode?: boolean
}

export default React.memo(RenderRichEditorBlock)

function RenderRichEditorBlock(props: Props): JSX.Element {
    const { block, idx, readMode } = props

    switch (block.type) {
        case 'text':
            return <TextBlock readMode={readMode} idx={idx} block={block} />
        case 'image':
            return <ImageBlock readMode={readMode} idx={idx} block={block} />
        case 'video':
            return <VideoBlock readMode={readMode} idx={idx} block={block} />
        case 'audio':
            return <AudioBlock readMode={readMode} idx={idx} block={block} />
        case 'equation':
            return <EquationBlock readMode={readMode} idx={idx} block={block} />
        case 'code':
            return <CodeBlock readMode={readMode} idx={idx} block={block} />

        default:
            return <div />
    }
}
