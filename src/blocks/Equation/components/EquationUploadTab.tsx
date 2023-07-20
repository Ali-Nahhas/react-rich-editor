import Typography from '@hypatia/hypatia-ui/core/Typography'
import UploadArea from '@hypatia/hypatia-ui/core/UploadArea'
import Icon from '@hypatia/hypatia-ui/Icons/Icon'
import makeStyles from '@hypatia/hypatia-ui/styles/makeStyles'
import FullSuspense from '@the-factory/react-utils/hooks/FullSuspense'
import LinearProgress from '@material-ui/core/LinearProgress'
import classNames from 'classnames'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAddEquationDialogData } from '../AddEquationDialogConnect'
import first from '../assets/first.png'
import second from '../assets/second.png'
import wand from '../assets/wand.png'

export default React.memo(EquationUploadTab)

function EquationUploadTab(): JSX.Element {
    const { state, actions } = useAddEquationDialogData()
    const { loading } = state

    const classes = useStyles()
    const { t } = useTranslation()

    const onChange = useCallback((files: File[]) => actions.main.uploadImage(files[0]), [actions.main])

    return (
        <div className={classes.container}>
            {loading ? <LinearProgress className={classes.progress} /> : null}

            <div className={classes.content}>
                <div className={classes.hintContainer}>
                    <Icon className={classes.hintIcon} name="common.infoOutline" />
                    <Typography className={classes.hintText}>{t('exams.uploadEquationHint')}</Typography>
                </div>

                <div className={classes.imagesContainer}>
                    <img src={first} />

                    <div className={classes.wandContainer}>
                        <img src={wand} />
                    </div>

                    <img src={second} />
                </div>

                <Typography className={classes.hintText}>{t('common.uploadFile')}</Typography>

                <FullSuspense fallback={null}>
                    <UploadArea
                        multiple={false}
                        disabled={loading}
                        accept={['image']}
                        onChange={onChange}
                        maxSize={200 * 1024 * 1024}
                    >
                        {({ isDragActive }) => (
                            <div
                                className={classNames(classes.uploadContent, {
                                    [classes.hover]: isDragActive,
                                    [classes.disabled]: loading,
                                })}
                            >
                                <Icon name="exam.imageFile" className={classes.uploadIcon} />
                                <Typography className={classes.dragFilesText}>{t('common.dragFilesHereOr')}</Typography>
                                <Typography className={classes.browseText}>{t('common.clickToBrowse')}</Typography>
                            </div>
                        )}
                    </UploadArea>
                </FullSuspense>
            </div>
        </div>
    )
}

const useStyles = makeStyles((theme) => ({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    content: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        margin: '0px 24px',
        marginTop: 16,
    },
    hintContainer: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 8,
    },
    hintIcon: {
        color: theme.palette.typography.hint,
        marginInlineEnd: 4,
        fontSize: 18,
    },
    hintText: {
        color: theme.palette.typography.secondary,
        fontSize: 12,
    },
    imagesContainer: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 8,
    },
    wandContainer: {
        display: 'flex',
        flexDirection: 'column',
        margin: '0px 16px',
    },
    uploadContent: {
        height: 120,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.background.paper,
        border: `1px dashed ${theme.palette.divider}`,
        borderRadius: 4,
        [theme.breakpoints.up(theme.breakpoints.values.sm)]: {
            transition: theme.transitions.create(['background', 'border-color', 'transform']),
        },
        marginTop: 8,
        '&:hover': {
            [theme.breakpoints.up(theme.breakpoints.values.sm)]: {
                background: theme.palette.action.hover,
                border: `1px dashed ${theme.palette.primary.main}`,
            },
        },
        '&:active': {
            transform: 'scale(0.96)',
        },
    },
    hover: {
        background: theme.palette.action.hover,
        border: `1px dashed ${theme.palette.primary.main}`,
        transform: 'scale(0.96)',
    },
    uploadIcon: {
        color: theme.palette.typography.hint,
        fontSize: 18,
    },
    dragFilesText: {
        color: theme.palette.typography.hint,
        fontWeight: 600,
        marginInline: 4,
        fontSize: 12,
    },
    browseText: {
        color: theme.palette.primary.main,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 12,
    },
    disabled: {
        opacity: 0.7,
    },
    progress: {
        flex: 1,

        [theme.breakpoints.down(theme.breakpoints.values.md)]: {
            maxHeight: 4,
        },
    },
}))
