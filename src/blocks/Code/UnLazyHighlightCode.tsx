import React from 'react'
import Highlight from 'react-highlight'

interface Props {
    text: string
    internalKey?: string
    className?: string
    style?: React.CSSProperties
}

export default React.memo(UnLazyHighlightCode)

function UnLazyHighlightCode(props: Props): JSX.Element {
    const { text, className, style, internalKey } = props

    return (
        <Highlight key={internalKey} className={className} style={style}>
            {text}
        </Highlight>
    )
}
