/*
 *   Copyright (c) 2024 妙码学院 @Heyi
 *   All rights reserved.
 *   妙码学院官方出品，作者 @Heyi，供学员学习使用，可用作练习，可用作美化简历，不可开源。
 */
import '@miaoma-doc/shadcn/style.css'

// import { PartialBlock } from '@miaoma-doc/core'
import { Separator } from '@miaoma-doc/shadcn-shared-ui/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

import { SharePopover } from '@/components/SharePopover'
import * as srv from '@/services'
import { debounce } from '@/utils/debounce'
import { queryClient } from '@/utils/query-client'

import { AvatarList } from './AvatarList'
import { DocEditor } from './DocEditor'
// import { DocEditorDemo } from './DocEditorDemo'
// import { cursorRender } from './cursorRender'

// async function loadFromStorage(pageId: string) {
//     // Gets the previously stored editor contents.
//     const storageString = localStorage.getItem('allPages')
//     if (!storageString) {
//         return ''
//     }
//     const stored = JSON.parse(storageString)
//     const storedPage = stored[pageId]
//     if (!storedPage) {
//         return
//     }
//     return storedPage.blocks
// }

const doc = new Y.Doc()
// const provider = new WebsocketProvider('ws://localhost:8082', `doc-yjs`, doc)
// const wsUrl = import.meta.env.VITE_WS_HOST ? `wss://${import.meta.env.VITE_WS_HOST}` : 'ws://192.168.31.68:8082'
const wsUrl = import.meta.env.VITE_WS_HOST ? '/' : 'ws://192.168.31.68:8082'
const provider = new WebsocketProvider(wsUrl, `doc-yjs`, doc, { connect: false })

export const Doc = () => {
    const params = useParams()
    const { data: page } = useQuery({
        queryKey: ['page', params?.id],
        queryFn: async () => {
            if (!params?.id) {
                return
            }
            return (await srv.fetchPageDetail(params?.id)).data
        },
        enabled: !!params?.id,
    })
    // console.log('🚀 ~ Doc ~ pages:', pages)
    // const page = useMemo(() => {
    //     return pages?.find(page => page.pageId === params.id)
    // }, [params?.id, pages])

    // const provider = useRef(new WebsocketProvider('ws://localhost:1314', `miaoma-doc-${page?.id}`, doc)).current
    const [remoteUsers, setRemoteUsers] = useState<Map<number, { name: string; color: string }>>()

    const handleTitleInput = useMemo(() => {
        return debounce((e: React.FormEvent<HTMLDivElement>) => {
            if (!page) {
                return
            }
            const title = (e.target as HTMLDivElement).innerText
            srv.updatePage({
                pageId: page?.pageId,
                title,
            })
            queryClient.invalidateQueries({ queryKey: ['pages'] })
        })
    }, [page])
    /**
     * 文档初始内容
     */
    // const [initialContent, setInitialContent] = useState<PartialBlock[] | 'loading'>('loading')

    useEffect(() => {
        const changeHandler = () => {
            const states = provider.awareness.getStates()
            // console.log('🚀 ~ changeHandler ~ states:', provider.awareness.doc, doc)
            const users = new Map<number, { name: string; color: string }>()
            const cursors = new Map<number, { x: number; y: number; windowSize: { width: number; height: number } }>()
            for (const [key, value] of states) {
                // 排除自己
                if (key === provider.awareness.clientID) {
                    continue
                }
                users.set(key, value.user)
                cursors.set(key, value.cursor)
            }
            setRemoteUsers(users)
        }
        // @TODO: 这里需要优化，避免频繁更新
        provider.awareness.on('change', changeHandler)

        return () => {
            provider.awareness.off('change', changeHandler)
            provider.disconnect()
        }
    }, [provider])

    // 加载缓存的文档内容
    // useEffect(() => {
    //     if (!page?.id) {
    //         return
    //     }
    //     loadFromStorage(page.id).then(content => {
    //         setInitialContent(content)
    //     })
    // }, [page?.id])

    useEffect(() => {
        provider.connect()

        return () => provider.disconnect()
    }, [])

    return (
        <SidebarInset>
            <header className="flex flex-row justify-between items-center h-[52px] px-[16px] border-b border-b-zinc-100">
                <div className="flex flex-row items-center gap-2">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div className="flex flex-row flex-auto items-center text-sm">
                        <em className="mr-2">{page?.emoji}</em>
                        <p className="overflow-hidden whitespace-nowrap max-w-[300px] text-ellipsis" title={page?.title}>
                            {page?.title}
                        </p>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-4">
                    {remoteUsers && <AvatarList remoteUsers={remoteUsers} />}
                    <SharePopover />
                </div>
            </header>
            <div className="w-[60%] mx-auto">
                <h1 className="flex flex-row py-12 px-[54px] leading-[3.25rem] text-4xl font-bold">
                    <span className="mr-4">{page?.emoji}</span>
                    <div
                        contentEditable
                        className="inline-block flex-1 outline-none"
                        onInput={handleTitleInput}
                        dangerouslySetInnerHTML={{ __html: page?.title ?? '' }}
                    />
                </h1>
                {page?.id && <DocEditor key={page?.id} pageId={page.pageId} doc={doc} provider={provider} />}
                {/* <DocEditorDemo /> */}
            </div>
        </SidebarInset>
    )
}
