import { RichEditorBlockName } from '@opexams/opx-database/tables/Exams/richEditorTypes'
import generateUniqueId from '@the-factory/utils/generators/generateUniqueId'
import classNames from 'classnames'
import React, { useCallback, useMemo, useRef } from 'react'
import { useRichEditorData } from '../RichEditor'
import RichEditorIcon, { RichEditorIconType } from '../icons/RichEditorIcon'

export default React.memo(RichEditorTools)

const KB = 1024
const MB = KB * 1024

type Item = { block: RichEditorBlockName; icon: RichEditorIconType; onClick: () => void }

function RichEditorTools(): JSX.Element {
    const { dispatch, mainClasses: classes, props } = useRichEditorData()

    const { uploaders, hiddenBlocks } = props

    const imgRef = useRef<HTMLInputElement>(null)
    const videoRef = useRef<HTMLInputElement>(null)
    const audioRef = useRef<HTMLInputElement>(null)

    const essential = useMemo(() => {
        const items: Item[] = [
            { block: 'text', icon: 'textBlock', onClick: () => dispatch('addTextBlock', {}) },
            { block: 'text', icon: 'headingBlock', onClick: () => dispatch('addTextBlock', { heading: true }) },
            { block: 'image', icon: 'imageBlock', onClick: () => imgRef.current?.click() },
            { block: 'audio', icon: 'audioBlock', onClick: () => audioRef.current?.click() },
            { block: 'video', icon: 'videoBlock', onClick: () => videoRef.current?.click() },
        ]

        return items.filter((x) => !hiddenBlocks?.includes(x.block))
    }, [dispatch, hiddenBlocks])

    const lists = useMemo(() => {
        const items: Item[] = [
            {
                block: 'text',
                icon: 'listNumberedBlock',
                onClick: () => dispatch('addTextBlock', { orderedList: true }),
            },
            {
                block: 'text',
                icon: 'listBulletedBlock',
                onClick: () => dispatch('addTextBlock', { unorderedList: true }),
            },
        ]

        return items.filter((x) => !hiddenBlocks?.includes(x.block))
    }, [dispatch, hiddenBlocks])

    const extra = useMemo(() => {
        const items: Item[] = [
            { block: 'equation', icon: 'mathBlock', onClick: () => dispatch('addEquationBlock', {}) },
            { block: 'code', icon: 'codeBlock', onClick: () => dispatch('addCodeBlock', {}) },
            // { block: 'table', icon: 'tableBlock', onClick: () => undefined },
        ]

        return items.filter((x) => !hiddenBlocks?.includes(x.block))
    }, [dispatch, hiddenBlocks])

    const onImage = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = [...((e.target.files ?? []) as File[])]
            e.target.value = ''

            const data = files.map((x) => ({ id: generateUniqueId(), file: x, large: x.size > MB * 5 }))

            dispatch('addImageBlocks', data)

            const urls = await uploaders?.images?.(data.filter((x) => !x.large))

            dispatch('setImageLinks', urls!)
        },
        [dispatch, uploaders]
    )

    const onVideo = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = [...((e.target.files ?? []) as File[])]
            e.target.value = ''

            const data = files.map((x) => ({ id: generateUniqueId(), file: x, large: x.size > MB * 25 }))

            dispatch('addVideoBlocks', data)

            const urls = await uploaders?.videos?.(data.filter((x) => !x.large))

            dispatch('setVideoLinks', urls!)
        },
        [dispatch, uploaders]
    )

    const onAudio = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = [...((e.target.files ?? []) as File[])]
            e.target.value = ''

            const data = files.map((x) => ({ id: generateUniqueId(), file: x, large: x.size > MB * 25 }))

            dispatch('addAudioBlocks', data)

            const urls = await uploaders?.audios?.(data.filter((x) => !x.large))

            dispatch('setAudioLinks', urls!)
        },
        [dispatch, uploaders]
    )

    return (
        <div className={classes.toolBar}>
            <input multiple accept={'image/*'} ref={imgRef} hidden type="file" onChange={onImage} />
            <input multiple accept={'video/*'} ref={videoRef} hidden type="file" onChange={onVideo} />
            <input multiple accept={'audio/*'} ref={audioRef} hidden type="file" onChange={onAudio} />

            {essential.map((item, idx) => {
                return (
                    <div onClick={item.onClick} key={idx} className={classNames(classes.toolBarItem, classes.button)}>
                        <RichEditorIcon icon={item.icon} />
                    </div>
                )
            })}

            <div className={classes.toolBarDivider} />

            {lists.map((item, idx) => {
                return (
                    <div onClick={item.onClick} key={idx} className={classNames(classes.toolBarItem, classes.button)}>
                        <RichEditorIcon icon={item.icon} />
                    </div>
                )
            })}

            <div className={classes.toolBarDivider} />

            {extra.map((item, idx) => {
                return (
                    <div onClick={item.onClick} key={idx} className={classNames(classes.toolBarItem, classes.button)}>
                        <RichEditorIcon icon={item.icon} />
                    </div>
                )
            })}
        </div>
    )
}
