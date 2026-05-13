/*
 *   Copyright (c) 2024 妙码学院 @Heyi
 *   All rights reserved.
 *   妙码学院官方出品，作者 @Heyi，供学员学习使用，可用作练习，可用作美化简历，不可开源。
 */
import { DynamicModule, Global, Logger, Module } from '@nestjs/common'
import { PostgresqlPersistence } from 'y-postgresql'
import * as Y from 'yjs'

import { setPersistence } from './utils'

export interface YjsPostgresqlOptions {
    host: string
    port: number
    user: string
    database: string
    password: string
    table: {
        name: string
        useIndex: boolean
        flushSize: number
    }
}

@Global()
@Module({})
export class YjsPostgresqlModule {
    static forRoot(options?: YjsPostgresqlOptions): DynamicModule {
        return {
            module: YjsPostgresqlModule,
            providers: [
                {
                    provide: 'YJS_POSTGRESQL_ADAPTER',
                    useFactory: async () => {
                        // 确保只初始化一次客户端
                        Logger.log('🚀 ~ yjs postgresql: ~ options:', options)
                        const isProd = process.env.NODE_ENV === 'production'
                        /**
                         * 妙码学院出品，作者 @Heyi。
                         */
                        const pgdb = await PostgresqlPersistence.build(
                            {
                                // host: process.env.PG_HOST,
                                // port: parseInt(process.env.PG_PORT, 10),
                                // database: process.env.PG_DATABASE,
                                // user: process.env.PG_USER,
                                // password: process.env.PG_PASSWORD,
                                // host: 'localhost',
                                host: isProd ? '172.28.49.109' : '192.168.31.16',
                                port: 5433,
                                user: 'postgres',
                                database: 'postgres',
                                password: 'xiaoer',
                            },
                            { tableName: 'yjs-writings', useIndex: false, flushSize: 200 }
                        )

                        setPersistence({
                            bindState: async (docName, ydoc) => {
                                Logger.log('🚀 ~ bindState: ~ docName:' + docName)
                                // Here you listen to granular document updates and store them in the database
                                // You don't have to do this, but it ensures that you don't lose content when the server crashes
                                // See https://github.com/yjs/yjs#Document-Updates for documentation on how to encode
                                // document updates

                                // official default code from: https://github.com/yjs/y-websocket/blob/37887badc1f00326855a29fc6b9197745866c3aa/bin/utils.js#L36
                                const persistedYdoc = await pgdb.getYDoc(docName)
                                const newUpdates = Y.encodeStateAsUpdate(ydoc)
                                pgdb.storeUpdate(docName, newUpdates)
                                Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc))
                                ydoc.on('update', async (update: Uint8Array) => {
                                    pgdb.storeUpdate(docName, update)
                                })
                            },
                            writeState: async (docName, ydoc) => {
                                Logger.log('🚀 ~ writeState: ~ docName, ydoc:', docName, ydoc)
                                // This is called when all connections to the document are closed.
                                // In the future, this method might also be called in intervals or after a certain number of updates.
                                return new Promise(resolve => {
                                    // When the returned Promise resolves, the document will be destroyed.
                                    // So make sure that the document really has been written to the database.
                                    resolve(true)
                                })
                            },
                        })

                        return pgdb
                    },
                },
            ],
            exports: ['YJS_POSTGRESQL_ADAPTER'],
        }
    }
}
