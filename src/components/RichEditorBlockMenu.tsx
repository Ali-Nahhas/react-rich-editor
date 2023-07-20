import { RichEditorBlock } from '@opexams/opx-database/tables/Exams/richEditorTypes'
import classNames from 'classnames'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd'
import { useTranslation } from 'react-i18next'
import { animated, config, useSpring } from 'react-spring'
import { useRichEditorData } from '../RichEditor'
import RichEditorIcon from '../icons/RichEditorIcon'

interface Props {
    handleProps: DraggableProvidedDragHandleProps | undefined
    block: RichEditorBlock
    idx: number
}

export default React.memo(RichEditorBlockMenu)

function RichEditorBlockMenu(props: Props): JSX.Element {
    const { handleProps, block, idx } = props

    const { mainClasses: classes, dispatch, state } = useRichEditorData()

    const { t } = useTranslation()

    const ref = useRef<HTMLDivElement>(null)

    const onClick = useCallback(() => {
        dispatch('setOpenMenuId', { id: block.id })
    }, [block.id, dispatch])

    const isOpen = state.openMenuId === block.id

    const isOnlyBlock = state.data.blocks.length === 1

    const onClose = useCallback(() => {
        dispatch('setOpenMenuId', { id: undefined })
    }, [dispatch])

    const [render, setRender] = useState(false)

    const [style, api] = useSpring(() => {
        return {
            config: config.stiff,
            opacity: 0,
        }
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

    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

    const numberOfActions = isOnlyBlock ? 1 : 2
    const menuHeight = numberOfActions * 40 + 8

    useEffect(() => {
        const button = ref.current

        if (!button || !render) {
            return
        }

        const buttonRect = button.getBoundingClientRect()
        const menuWidth = 200
        const screenWidth = window.innerWidth
        const screenHeight = window.innerHeight

        let x = buttonRect.right
        if (x + menuWidth > screenWidth) {
            x = screenWidth - menuWidth
        }

        let y = buttonRect.top
        if (y + menuHeight > screenHeight) {
            y = screenHeight - menuHeight
        }

        x = x + 4
        y = y - menuHeight / 2 + buttonRect.height / 2

        setMenuPosition({ x, y })
    }, [menuHeight, render])

    const onMenuClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
    }, [])

    const onDelete = useCallback(() => {
        dispatch('deleteBlock', { id: block.id })
        onClose()
    }, [block.id, dispatch, onClose])

    const onDuplicate = useCallback(() => {
        dispatch('duplicateBlock', { id: block.id })
        onClose()
    }, [block.id, dispatch, onClose])

    const hasMargin =
        block.type === 'text' &&
        (block.data.level === 'h1' || block.data.level === 'h2' || block.data.level === 'h3') &&
        idx !== 0
    const marginTop = hasMargin ? (block.data.level === 'h1' ? 32 : block.data.level === 'h2' ? 24 : 16) : undefined

    return (
        <>
            <div
                onClick={onClick}
                ref={ref}
                style={{ top: marginTop }}
                className={classNames(classes.dragHandle, { [classes.dragHandleFocused]: isOpen })}
                {...(handleProps ?? {})}
            >
                <RichEditorIcon icon="dragMenu" />
            </div>

            {render ? (
                <div onClick={onClose} className={classes.menuBackdrop}>
                    <animated.div
                        onClick={onMenuClick}
                        style={{ ...style, top: menuPosition.y, left: menuPosition.x }}
                        className={classes.blockMenu}
                    >
                        {isOnlyBlock ? null : (
                            <div onClick={onDelete} className={classNames(classes.button, classes.menuItem)}>
                                <RichEditorIcon icon="menuDelete" />

                                <p className={classes.menuItemText}>{t('richEditor.delete')}</p>
                            </div>
                        )}

                        <div onClick={onDuplicate} className={classNames(classes.button, classes.menuItem)}>
                            <RichEditorIcon icon="duplicate" />

                            <p className={classes.menuItemText}>{t('richEditor.duplicate')}</p>
                        </div>
                    </animated.div>
                </div>
            ) : null}
        </>
    )
}
