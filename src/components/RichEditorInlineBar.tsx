import { TextBlockType } from '@opexams/opx-database/tables/Exams/richEditorTypes'
import classNames from 'classnames'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { animated, config, useSpring } from 'react-spring'
import { useRichEditorData } from '../RichEditor'
import RichEditorIcon from '../icons/RichEditorIcon'
import { isSelectionStyled } from '../utils/isSelectionStyled'

interface Props {
    isOpen: boolean
    left: number
    top: number
    block: TextBlockType
}

export default React.memo(RichEditorInlineBar)

function RichEditorInlineBar(props: Props): JSX.Element | null {
    const { isOpen, left, top, block } = props

    const { mainClasses: classes, dispatch } = useRichEditorData()

    const [render, setRender] = useState(false)

    const [style, api] = useSpring(() => {
        return { config: config.stiff, opacity: 0 }
    }, [])

    const [counter, setCounter] = useState(0)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const selectedStyles = useMemo(() => isSelectionStyled(), [isOpen, counter])

    const onBold = useCallback(() => {
        document.execCommand('bold')
        setCounter((x) => x + 1)
    }, [])
    const onItalic = useCallback(() => {
        document.execCommand('italic')
        setCounter((x) => x + 1)
    }, [])
    const onUnderline = useCallback(() => {
        document.execCommand('underline')
        setCounter((x) => x + 1)
    }, [])
    const onStrikeThrough = useCallback(() => {
        document.execCommand('strikeThrough')
        setCounter((x) => x + 1)
    }, [])

    useEffect(() => {
        if (isOpen && !render) {
            setRender(true)
            api.start({ opacity: 1 })
        }

        if (!isOpen && render) {
            api.start({ opacity: 0 })

            setTimeout(() => {
                setRender(false)
            }, 300)
        }
    }, [api, isOpen, render])

    const isBold = selectedStyles.includes('bold')
    const isItalic = selectedStyles.includes('italic')
    const isUnderline = selectedStyles.includes('underline')
    const isStrikeThrough = selectedStyles.includes('strikeThrough')

    const level = block.data.level
    const displaySizes = level !== 'list'

    const changeSize = useCallback(
        (val: TextBlockType['data']['level']) => {
            const isSame = val === level

            if (val === 'text' && isSame) {
                return
            }

            dispatch('convertText', {
                id: block.id,
                level: isSame ? 'text' : val,
                text: block.data.text,
                focusPosition: 'allContent',
            })
        },
        [block.data.text, block.id, dispatch, level]
    )

    const onText = useCallback(() => changeSize('text'), [changeSize])
    const onH1 = useCallback(() => changeSize('h1'), [changeSize])
    const onH2 = useCallback(() => changeSize('h2'), [changeSize])
    const onH3 = useCallback(() => changeSize('h3'), [changeSize])

    return render ? (
        <animated.div style={{ ...style, left: left, top: top }} className={classes.inlineToolbar}>
            {displaySizes ? (
                <>
                    <div onClick={onText} className={classNames(classes.inlineToolbarButton, classes.button)}>
                        <RichEditorIcon icon={!level || level === 'text' ? 'textPrimary' : 'text'} />
                    </div>

                    <div onClick={onH1} className={classNames(classes.inlineToolbarButton, classes.button)}>
                        <RichEditorIcon icon={level === 'h1' ? 'header1Primary' : 'header1'} />
                    </div>

                    <div onClick={onH2} className={classNames(classes.inlineToolbarButton, classes.button)}>
                        <RichEditorIcon icon={level === 'h2' ? 'header2Primary' : 'header2'} />
                    </div>

                    <div onClick={onH3} className={classNames(classes.inlineToolbarButton, classes.button)}>
                        <RichEditorIcon icon={level === 'h3' ? 'header3Primary' : 'header3'} />
                    </div>

                    <div className={classes.inlineToolbarDivider} />
                </>
            ) : null}

            <div onClick={onBold} className={classNames(classes.inlineToolbarButton, classes.button)}>
                <RichEditorIcon icon={isBold ? 'boldPrimary' : 'bold'} />
            </div>

            <div onClick={onItalic} className={classNames(classes.inlineToolbarButton, classes.button)}>
                <RichEditorIcon icon={isItalic ? 'italicPrimary' : 'italic'} />
            </div>

            <div onClick={onUnderline} className={classNames(classes.inlineToolbarButton, classes.button)}>
                <RichEditorIcon icon={isUnderline ? 'underlinePrimary' : 'underline'} />
            </div>

            <div onClick={onStrikeThrough} className={classNames(classes.inlineToolbarButton, classes.button)}>
                <RichEditorIcon icon={isStrikeThrough ? 'strikeThroughPrimary' : 'strikeThrough'} />
            </div>
        </animated.div>
    ) : null
}
