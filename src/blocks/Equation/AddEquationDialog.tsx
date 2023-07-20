/* eslint-disable spellcheck/spell-checker */
import Button from '@hypatia/hypatia-ui/core/Button'
import ButtonBase from '@hypatia/hypatia-ui/core/ButtonBase'
import CircularLoading from '@hypatia/hypatia-ui/core/CircularLoading'
import Dialog from '@hypatia/hypatia-ui/core/Dialog'
import Typography from '@hypatia/hypatia-ui/core/Typography'
import useIsSmallScreen from '@hypatia/hypatia-ui/hooks/useIsSmallScreen'
import makeStyles from '@hypatia/hypatia-ui/styles/makeStyles'
import Animate from '@the-factory/react-utils/components/Animate'
import applyConnect from '@the-factory/react-utils/connect/applyConnect'
import ConditionalRenderingHoc from '@the-factory/react-utils/containers/ConditionalRenderingHoc'
import FullSuspense from '@the-factory/react-utils/hooks/FullSuspense'
import useHasScroll from '@the-factory/react-utils/hooks/dom/useHasScroll'
import classNames from 'classnames'
import React, { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Mathlive from '../../../../components/MathLive'
import { AddEquationDialogConnect, useAddEquationDialogData } from './AddEquationDialogConnect'
import EquationTextTab from './components/EquationTextTab'
import EquationUploadTab from './components/EquationUploadTab'

export default ConditionalRenderingHoc('isOpen', applyConnect(AddEquationDialogUI, AddEquationDialogConnect))

function AddEquationDialogUI(): JSX.Element {
    const { props, actions, state } = useAddEquationDialogData()
    const { isOpen, onClose, onDone } = props
    const { textValue, tab } = state
    const { setTab } = actions.main

    const classes = useStyles()
    const { t } = useTranslation()
    const { isSmallScreen } = useIsSmallScreen()

    const onFinish = useCallback(() => {
        onDone(textValue)
        onClose()
    }, [onClose, onDone, textValue])

    const setTabText = useCallback(() => setTab('text'), [setTab])
    const setTabUpload = useCallback(() => setTab('upload'), [setTab])

    const ref = useRef<HTMLDivElement>(null)
    const { x: hasScroll } = useHasScroll(ref)

    return (
        <Dialog
            size={isSmallScreen ? 'fullScreen' : 'default'}
            classes={{ content: classes.dialog, body: classes.dialogBody }}
            open={isOpen}
            onClose={onClose}
        >
            <div className={classes.container}>
                <div
                    ref={ref}
                    className={classNames(classes.previewSection, {
                        [classes.noCenter]: hasScroll,
                    })}
                >
                    <div className={classes.previewDiv}>
                        <FullSuspense fallback={<CircularLoading />}>
                            <Mathlive
                                className={classes.mathfield}
                                mathfieldOptions={{ virtualKeyboardMode: 'manual' }}
                                latex={textValue}
                                onChange={actions.main.setText}
                            />
                        </FullSuspense>
                    </div>
                </div>

                <div className={classes.tabsContainer}>
                    <ButtonBase
                        onClick={setTabText}
                        className={classNames(classes.tab, { [classes.selectedTab]: tab === 'text' })}
                    >
                        <Typography className={classes.tabText}>{t('students.text')}</Typography>
                    </ButtonBase>

                    <ButtonBase
                        onClick={setTabUpload}
                        className={classNames(classes.tab, { [classes.selectedTab]: tab === 'upload' })}
                    >
                        <Typography className={classes.tabText}>{t('common.upload')}</Typography>
                    </ButtonBase>
                </div>

                <Animate changeKey={tab} animation="translate">
                    <>
                        {tab === 'text' ? <EquationTextTab /> : null}
                        {tab === 'upload' ? <EquationUploadTab /> : null}
                    </>
                </Animate>

                <div className={classes.actionsContainer}>
                    <Button onClick={onClose} className={classes.discardButton}>
                        {t('common.discard')}
                    </Button>
                    <Button className={classes.doneButton} onClick={onFinish} color="primary">
                        {t('common.done')}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

const useStyles = makeStyles((theme) => ({
    dialogBody: {
        width: '100%',
        maxWidth: '640px !important',
    },
    dialog: {
        width: 640,
        height: 560,

        [theme.breakpoints.down(theme.breakpoints.values.md)]: {
            width: 'unset',
            height: 'unset',
        },
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flex: 1,
        position: 'relative',

        [theme.breakpoints.down(theme.breakpoints.values.md)]: {
            overflowY: 'auto',
        },
    },
    previewSection: {
        height: 160,
        background: theme.palette.background.large,
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        justifyContent: 'center',
        position: 'relative',
        '& math-field::part(container)': {
            height: 160 - 32 - 1,
        },
        '& math-field::part(content)': {
            margin: 'auto',
            width: 'fit-content',
            height: 'fit-content',
        },

        [theme.breakpoints.down(theme.breakpoints.values.md)]: {
            minHeight: 124,

            '& math-field::part(container)': {
                height: 124 - 32 - 1,
            },
        },
    },
    noCenter: {
        justifyContent: 'unset !important',
    },
    tabsContainer: {
        height: 48,
        display: 'flex',
        alignItems: 'center',
        padding: '0px 24px',
        borderBottom: `1px solid ${theme.palette.divider}`,
        minHeight: 48,
    },
    tab: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0px 16px',
        height: '100%',
        borderBottom: `2px solid ${theme.palette.background.paper}`,
        borderRadius: 0,
        transition: theme.transitions.create(['border-color']),
    },
    selectedTab: {
        borderBottom: `2px solid ${theme.palette.primary.main}`,
        '& $tabText': {
            color: theme.palette.primary.main,
        },
    },
    tabText: {
        color: theme.palette.typography.secondary,
        fontSize: 14,
        transition: theme.transitions.create(['color']),
    },
    actionsContainer: {
        height: 88,
        minHeight: 88,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0px 24px',
    },
    discardButton: {
        marginInlineEnd: 8,

        [theme.breakpoints.down(theme.breakpoints.values.md)]: {
            flex: 1,
        },
    },
    doneButton: {
        [theme.breakpoints.down(theme.breakpoints.values.md)]: {
            flex: 1,
        },
    },
    previewDiv: {
        width: '100%',
        fontSize: 22,
        color: theme.palette.typography.primary,
    },
    mathfield: {
        width: '100%',
        padding: 16,
    },
}))
