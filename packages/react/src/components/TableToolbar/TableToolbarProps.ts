import { MiaomaDocEditor } from '@miaoma-doc/core'

export type TableToolbarProps = {
    editor: MiaomaDocEditor<any, any, any>
    canMerge: boolean
    canSplit: boolean
    onClose: () => void
}
