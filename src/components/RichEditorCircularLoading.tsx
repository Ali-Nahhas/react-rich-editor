import classNames from 'classnames'
import React from 'react'
import { useRichEditorData } from '../RichEditor'

interface Props {
    className?: string
}

const RichEditorCircularLoading = (props: Props) => {
    const { className } = props

    const { classes } = useRichEditorData()

    const ratio = 0.45

    const size = 48 * ratio
    const c = 24 * ratio
    const r = 21 * ratio

    const strokeWidth = 2
    const strokeDashArray = 240

    return (
        <div className={classNames(classes.circularLoadingContainer, className)}>
            <svg
                // eslint-disable-next-line spellcheck/spell-checker
                style={{ strokeWidth, strokeDasharray: strokeDashArray }}
                className={classNames(classes.loadingSpinnerIcon, classes.loadingAnimation)}
                focusable="false"
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                width={size}
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx={c} cy={c} r={r} />
            </svg>
        </div>
    )
}

export default React.memo(RichEditorCircularLoading)
