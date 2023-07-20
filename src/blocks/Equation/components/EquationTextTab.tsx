/* eslint-disable spellcheck/spell-checker */
import SmartLink from '@hypatia/hypatia-ui/core/SmartLink'
import TextArea from '@hypatia/hypatia-ui/core/TextArea'
import Typography from '@hypatia/hypatia-ui/core/Typography'
import Icon from '@hypatia/hypatia-ui/Icons/Icon'
import makeStyles from '@hypatia/hypatia-ui/styles/makeStyles'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAddEquationDialogData } from '../AddEquationDialogConnect'

export default React.memo(EquationTextTab)

const latexLink = `https://math.hws.edu/gassert/LaTeX_Guide_Title.pdf`

function EquationTextTab(): JSX.Element {
    const { actions, state } = useAddEquationDialogData()
    const { textValue } = state
    const { setText } = actions.main

    const classes = useStyles()
    const { t } = useTranslation()

    return (
        <div className={classes.content}>
            <div className={classes.contentHeader}>
                <Typography className={classes.latexTitle}>{`LaTeX:`}</Typography>

                <SmartLink type="url" inNewTab className={classes.linkContainer} to={latexLink}>
                    <Typography className={classes.linkText}>{t('exams.howToUse')}</Typography>
                    <Icon className={classes.linkIcon} name="link.externalLink" />
                </SmartLink>
            </div>

            <div className={classes.textContainer}>
                <TextArea
                    value={textValue}
                    fixedSize
                    onChange={setText}
                    className={classes.textArea}
                    rows={4}
                    autoFocus
                    placeholder={`ex: \\sum \\left (\\epsilon \\ae \\right)`}
                />
            </div>
        </div>
    )
}

const useStyles = makeStyles((theme) => ({
    content: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    contentHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: '0px 24px',
        marginTop: 16,
        marginBottom: 8,
    },
    linkContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    latexTitle: {
        fontWeight: 600,
        fontSize: 12,
        color: theme.palette.typography.secondary,
    },
    linkText: {
        fontSize: 12,
        color: theme.palette.typography.secondary,
        marginInlineEnd: 4,
        textDecoration: 'underline',
    },
    linkIcon: {
        fontSize: 14,
        color: theme.palette.typography.secondary,
    },
    textContainer: {
        display: 'flex',
        flex: 1,
    },
    textArea: {
        margin: '0px 24px',
        width: '100%',
        maxHeight: 164,
    },
}))
