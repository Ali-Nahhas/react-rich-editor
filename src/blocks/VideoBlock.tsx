/* eslint-disable @typescript-eslint/no-explicit-any */
import { VideoBlockType } from '@opexams/opx-database/tables/Exams/richEditorTypes'
import classNames from 'classnames'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRichEditorData } from '../RichEditor'
import RichEditorCircularLoading from '../components/RichEditorCircularLoading'
import RichEditorIcon from '../icons/RichEditorIcon'

interface Props {
    block: VideoBlockType
    idx: number
    readMode?: boolean
}

export default React.memo(VideoBlock)

function VideoBlock(props: Props): JSX.Element {
    const { block, idx, readMode } = props

    const { url, status, tempUrl, customError } = block.data

    const { t } = useTranslation()

    const { classes, dispatch, state, mainClasses } = useRichEditorData()

    const isFirstBlock = idx === 0
    const isLastBlock = useMemo(() => idx === state.data.blocks.length - 1, [idx, state.data.blocks.length])

    const onDelete = useCallback(() => dispatch('deleteBlock', { id: block.id }), [block.id, dispatch])

    const loading = status === 'uploading'
    const error = status === 'error'
    const isDone = status === 'done'

    const marginTop = isFirstBlock ? 0 : 4
    const marginBottom = isLastBlock ? 0 : 4

    return (
        <div className={mainClasses.block}>
            <div style={{ minHeight: marginTop }} />

            <div className={mainClasses.blockContent}>
                <div className={classes.imgContainer}>
                    <video
                        src={tempUrl || url}
                        controlsList="nodownload"
                        controls
                        className={classNames(classes.video)}
                    />

                    {loading ? null : (
                        <div className={classes.imgActions}>
                            {readMode ? null : (
                                <div onClick={onDelete} className={classes.imgActionButton}>
                                    <RichEditorIcon icon="deleteImgIcon" />
                                </div>
                            )}
                        </div>
                    )}

                    <div className={classNames(classes.imgLoadingLayer, { [classes.imgLoadingLayerDone]: isDone })}>
                        <RichEditorCircularLoading
                            className={classNames(classes.imgCircularProgress, {
                                [classes.imgCircularProgressHidden]: !loading,
                            })}
                        />

                        {error ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <RichEditorIcon style={{ maxHeight: 24 }} icon="uploadError" />

                                <p style={{ fontSize: 12, color: '#fff', fontWeight: 600, margin: 0 }}>
                                    {customError ? t(customError as any) : t('richEditor.uploadError')}
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            <div style={{ minHeight: marginBottom }} />
        </div>
    )
}
