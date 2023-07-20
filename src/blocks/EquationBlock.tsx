/* eslint-disable spellcheck/spell-checker */
import { EquationBlockType } from '@opexams/opx-database/tables/Exams/richEditorTypes'
import useBoolean from '@the-factory/react-utils/hooks/state/useBoolean'
import { MathJax } from 'better-react-mathjax'
import classNames from 'classnames'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRichEditorData } from '../RichEditor'
import AddEquationDialog from './Equation/AddEquationDialog'

export const mathjaxConfig = {
    loader: { load: ['[tex]/html'] },
    tex: {
        packages: { '[+]': ['html'] },
        inlineMath: [
            ['$', '$'],
            ['\\(', '\\)'],
        ],
        displayMath: [
            ['$$', '$$'],
            ['\\[', '\\]'],
        ],
    },
}

interface Props {
    block: EquationBlockType
    idx: number
    readMode?: boolean
}

export default React.memo(EquationBlock)

function EquationBlock(props: Props): JSX.Element {
    const { block, idx, readMode } = props

    const { math } = block.data

    const { t } = useTranslation()

    const { classes, state, dispatch, mainClasses } = useRichEditorData()

    const [mathOpen, openDialog, closeDialog] = useBoolean()

    const isFirstBlock = idx === 0
    const isLastBlock = useMemo(() => idx === state.data.blocks.length - 1, [idx, state.data.blocks.length])

    const marginTop = isFirstBlock ? 0 : 4
    const marginBottom = isLastBlock ? 0 : 4

    const hasMath = !!math

    const onDone = useCallback(
        (value: string) => dispatch('updateEquationBlock', { id: block.id, math: value }),
        [block.id, dispatch]
    )

    return (
        <>
            {readMode ? null : (
                <AddEquationDialog defaultText={math} isOpen={mathOpen} onClose={closeDialog} onDone={onDone} />
            )}

            <div className={mainClasses.block}>
                <div style={{ minHeight: marginTop }} />

                <div className={mainClasses.blockContent}>
                    <div className={classes.equationContainer}>
                        {hasMath || readMode ? (
                            <div
                                onClick={readMode ? undefined : openDialog}
                                className={readMode ? classes.equationButton : classes.equationButtonWithHover}
                            >
                                <MathJax className={classes.mathJaxContainer}>{'$$' + math + '$$'}</MathJax>
                            </div>
                        ) : (
                            <div
                                onClick={openDialog}
                                className={classNames(classes.equationButton, classes.equationButtonEmpty)}
                            >
                                <p className={classes.equationAddText}>{t('richEditor.addAnEquation')}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ minHeight: marginBottom }} />
            </div>
        </>
    )
}
