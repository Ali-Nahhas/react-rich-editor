import getMathFromImage from '@opexams/opx-common/rpc/getMathFromImage'
import { getUseConnectStateWithNamespace } from '@the-factory/react-utils/connect/connectContext'
import createConnectFragment from '@the-factory/react-utils/connect/createConnectFragment'
import createDerivedStateFunction from '@the-factory/react-utils/connect/createDerivedStateFunction'
import { ConnectDataFromFragment, DerivedStateFromUseDerivedState } from '@the-factory/react-utils/connect/typesHelpers'
import { useAlertNotification } from '@the-factory/react-utils/containers/AlertNotificationContext'
import GetDownloadUrlFromFileToken from '@the-factory/serverer-client/storage/GetDownloadUrlFromFileToken'
import { FileToken } from '@the-factory/serverer-common/storage/tables/FileTable'
import generateUniqueId from '@the-factory/utils/generators/generateUniqueId'
import { useTranslation } from 'react-i18next'
import { useRichEditorData } from '../../RichEditor'

interface Props {
    isOpen: boolean
    onClose: () => void
    onDone: (math: string) => void
    defaultText: string
}
interface State {
    textValue: string
    tab: 'text' | 'upload'
    loading: boolean
}
interface Actions {
    main: {
        setText: string
        setTab: 'text' | 'upload'
        uploadImage: File
    }
}

const useDerivedState = createDerivedStateFunction(() => {
    const { t } = useTranslation()
    const alert = useAlertNotification()

    const { props } = useRichEditorData()

    return [{ t, alert, editorProps: props }, {}]
})

type DerivedState = DerivedStateFromUseDerivedState<typeof useDerivedState>

export const AddEquationDialogConnect = createConnectFragment<Props, State, Actions, DerivedState>({
    namespace: () => 'AddEquationDialog',
    useDerivedState,

    preDerivedStateInitialState: (props) => ({
        textValue: props.defaultText || '',
        hasError: false,
        tab: 'text',
    }),

    reducers: {
        main: {
            setText: (state, val) => (state.textValue = val),
            setTab: (state, val) => (state.tab = val),
        },
    },
})

type AddEquationDialogConnectData = ConnectDataFromFragment<typeof AddEquationDialogConnect>
export const useAddEquationDialogData =
    getUseConnectStateWithNamespace<AddEquationDialogConnectData>('AddEquationDialog')

AddEquationDialogConnect.registerAction('main.uploadImage', async function* (state, file, { derivedState, onDone }) {
    const { alert, t, editorProps } = derivedState
    const { uploaders } = editorProps

    state.loading = true
    onDone(() => (state.loading = false))

    const payload = await uploaders?.images?.([{ file, id: generateUniqueId() }])
    yield

    const result = payload?.[0]

    const uploadErr = !result || result?.status === 'error'

    if (uploadErr) {
        alert({ variant: 'error', alertText: t('errors.uploadErr') })
        return
    }

    const [srcError, src] = await GetDownloadUrlFromFileToken({ token: result.url as FileToken })
    yield

    if (srcError || !src) {
        alert({ variant: 'error', alertText: t('errors.somethingWentWrong') })
        return
    }

    const [error, res] = await getMathFromImage({ src: src })

    yield

    if (error || !res) {
        alert({ variant: 'error', alertText: t('errors.somethingWentWrong') })
        return
    }

    state.textValue = res.text.slice(2, res.text.length - 2)
    state.tab = 'text'
})
