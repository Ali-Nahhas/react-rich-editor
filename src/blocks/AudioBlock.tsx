/* eslint-disable @typescript-eslint/no-explicit-any */
import { AudioBlockType } from '@opexams/opx-database/tables/Exams/richEditorTypes'
import classNames from 'classnames'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRichEditorData } from '../RichEditor'
import RichEditorCircularLoading from '../components/RichEditorCircularLoading'
import RichEditorIcon from '../icons/RichEditorIcon'

interface Props {
    block: AudioBlockType
    idx: number
    readMode?: boolean
}

export default React.memo(AudioBlock)

function AudioBlock(props: Props): JSX.Element {
    const { block, idx } = props

    const { url, status, tempUrl, customError } = block.data

    const { t } = useTranslation()

    const { classes, state, mainClasses } = useRichEditorData()

    const isFirstBlock = idx === 0
    const isLastBlock = useMemo(() => idx === state.data.blocks.length - 1, [idx, state.data.blocks.length])

    const loading = status === 'uploading'
    const error = status === 'error'
    const isDone = status === 'done'

    const marginTop = isFirstBlock ? 0 : 4
    const marginBottom = isLastBlock ? 0 : 4

    return (
        <div className={mainClasses.block}>
            <div style={{ minHeight: marginTop }} />

            <div className={mainClasses.blockContent}>
                <div className={classes.audioContainer}>
                    <audio
                        src={tempUrl || url}
                        controlsList="nodownload"
                        controls
                        className={classNames(classes.audio)}
                    />

                    <div
                        style={{ borderRadius: 40 }}
                        className={classNames(classes.imgLoadingLayer, { [classes.imgLoadingLayerDone]: isDone })}
                    >
                        <RichEditorCircularLoading
                            className={classNames(classes.imgCircularProgress, {
                                [classes.imgCircularProgressHidden]: !loading,
                            })}
                        />

                        {error ? (
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <RichEditorIcon style={{ maxHeight: 18 }} icon="uploadError" />

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
