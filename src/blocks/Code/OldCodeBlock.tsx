/* eslint-disable react/jsx-no-useless-fragment */
import CircularLoading from '@hypatia/hypatia-ui/core/CircularLoading'
import Select from '@hypatia/hypatia-ui/core/Select/Select'
import Switch from '@hypatia/hypatia-ui/core/Switch'
import Typography from '@hypatia/hypatia-ui/core/Typography'
import useIsSmallScreen from '@hypatia/hypatia-ui/hooks/useIsSmallScreen'
import makeStyles from '@hypatia/hypatia-ui/styles/makeStyles'
import { CodeBlockType } from '@opexams/opx-database/tables/Exams/richEditorTypes'
import FullSuspense from '@the-factory/react-utils/hooks/FullSuspense'
import useBoolean from '@the-factory/react-utils/hooks/state/useBoolean'
import classNames from 'classnames'
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRichEditorData } from '../../RichEditor'
import HighlightCode from './HighlightCode'
import './atom.css'
import programmingLanguages from './utils/programmingLanguages'

interface Props {
    readMode?: boolean
    block: CodeBlockType
}

export default React.memo(OldCodeBlock)

function OldCodeBlock(props: Props): JSX.Element | null {
    const { readMode, block } = props
    const { code, colored, language } = block.data

    const classes = useStyles()
    const { t } = useTranslation()
    const { isSmallScreen } = useIsSmallScreen()

    const { dispatch, props: editorProps } = useRichEditorData()
    const { styles } = editorProps

    const ref = useRef<HTMLTextAreaElement>(null)

    const setColored = useCallback(
        (val: boolean) => dispatch('setCodeColored', { id: block.id, colored: val }),
        [block.id, dispatch]
    )

    const onText = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            dispatch('setCodeValue', { id: block.id, code: e.target.value })
        },
        [block.id, dispatch]
    )

    const onLangChange = useCallback(
        (val: string | undefined) => {
            dispatch('setCodeLanguage', { id: block.id, language: val || '' })
            dispatch('setCodeColored', { id: block.id, colored: true })
        },
        [block.id, dispatch]
    )

    const [preview, setPreview, closePreview] = useBoolean(readMode)

    const [dimensions, setDimensions] = useState<{ width: number | undefined; height: number | undefined }>()

    useLayoutEffect(() => {
        if (colored) {
            setTimeout(() => {
                setPreview()
            }, 0)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useLayoutEffect(() => {
        const textArea = ref.current
        if (!textArea) {
            return
        }

        const handler = (): void => {
            if (textArea.clientWidth) {
                setDimensions({ width: textArea.clientWidth, height: textArea.clientHeight })
            }

            textArea.style.height = ''
            textArea.style.height = Math.min(textArea.scrollHeight + (preview ? 0 : 16)) + 'px'
        }

        const observer = new ResizeObserver(handler)
        textArea.addEventListener('keydown', handler)

        observer.observe(textArea)

        if (preview) {
            observer.unobserve(textArea)
            textArea?.removeEventListener('keydown', handler)
        }

        return () => {
            observer.unobserve(textArea)
            textArea?.removeEventListener('keydown', handler)
        }
    }, [preview])

    return (
        <div className={classes.container}>
            <div hidden={readMode} className={classes.header}>
                <Select
                    mobileMenu={isSmallScreen}
                    t={t}
                    disabled={readMode}
                    background="subtle"
                    width="auto"
                    search
                    className={classes.select}
                    items={programmingLanguages}
                    value={language}
                    onChange={onLangChange}
                />

                <div className={classes.switchContainer}>
                    <Typography className={classes.switchText}>{t('examAnswers.highlightCode')}</Typography>
                    <Switch disabled={readMode} small checked={colored} onChange={setColored} />
                </div>
            </div>

            {preview ? (
                <div
                    className={classNames(classes.previewContainer, { [classes.previewHover]: !readMode })}
                    style={{ width: dimensions?.width, height: dimensions?.height }}
                    onClick={readMode ? undefined : closePreview}
                >
                    <FullSuspense fallback={<CircularLoading />}>
                        <HighlightCode
                            style={styles?.codeText}
                            internalKey={colored + ''}
                            className={classNames(colored ? language : 'no-color-code', classes.highlight)}
                            text={'\n' + code}
                        />
                    </FullSuspense>
                </div>
            ) : (
                <textarea
                    disabled={readMode}
                    onChange={onText}
                    value={code}
                    onBlur={readMode ? undefined : setPreview}
                    ref={ref}
                    spellCheck={false}
                    className={classes.textarea}
                />
            )}
        </div>
    )
}

const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.default,
        flexDirection: 'column',
        width: '100%',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        padding: 8,
        justifyContent: 'space-between',
    },
    select: {
        width: '320px !important',

        [theme.breakpoints.down(theme.breakpoints.values.md)]: {
            width: 'unset !important',
        },
    },
    textarea: {
        // eslint-disable-next-line spellcheck/spell-checker
        fontFamily: 'Menlo, Monaco, Consolas, Courier New, monospace',
        color: theme.palette.typography.primary,
        lineHeight: '26px',
        fontSize: 13,
        boxShadow: 'none',
        borderRadius: theme.shape.borderRadius,
        wordWrap: 'normal',
        overflowX: 'auto',
        resize: 'none',
        outline: 'none',
        border: 'none',
        padding: '16px',
        backgroundColor: theme.palette.background.default,
        whiteSpace: 'pre-wrap',
    },
    previewContainer: {
        cursor: 'text',
        borderRadius: '0 0 8px 8px',
        overflowX: 'auto',
        display: 'flex',
        background: '#fafafa',
        transition: theme.transitions.create(['background']),
        padding: '0 16px',
    },
    previewHover: {
        '&:hover': {
            background: theme.palette.background.medium,
            '& $highlight': { background: theme.palette.background.medium },
        },
        '&:active': {
            background: theme.palette.action.active,
            '& $highlight': { background: theme.palette.action.active },
        },
    },
    highlight: {
        transition: theme.transitions.create(['background']),
        cursor: 'text',
        whiteSpace: 'pre-wrap',
    },
    switchContainer: {
        display: 'flex',
        alignItems: 'center',
        marginInlineEnd: 8,

        [theme.breakpoints.down(theme.breakpoints.values.md)]: {
            width: 'unset',
        },
    },
    switchText: {
        marginInlineEnd: 8,
        color: theme.palette.typography.hint,
        fontSize: 12,
        fontWeight: 600,

        [theme.breakpoints.down(theme.breakpoints.values.md)]: {
            fontSize: 11,
            textAlign: 'center',
        },
    },
}))
