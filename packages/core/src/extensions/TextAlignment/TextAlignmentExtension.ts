/*
 *   Copyright (c) 2024 妙码学院 @Heyi
 *   All rights reserved.
 *   妙码学院官方出品，作者 @Heyi，供学员学习使用，可用作练习，可用作美化简历，不可开源。
 */
import { Extension } from '@tiptap/core'

export const TextAlignmentExtension = Extension.create({
    name: 'textAlignment',

    addGlobalAttributes() {
        return [
            {
                // Attribute is applied to block content instead of container so that child blocks don't inherit the text
                // alignment styling.
                types: ['paragraph', 'heading', 'bulletListItem', 'numberedListItem', 'checkListItem', 'tableParagraph'],
                attributes: {
                    textAlignment: {
                        default: 'left',
                        parseHTML: element => {
                            return element.getAttribute('data-text-alignment')
                        },
                        renderHTML: attributes => {
                            if (attributes.textAlignment === 'left') {
                                return {}
                            }
                            return {
                                'data-text-alignment': attributes.textAlignment,
                            }
                        },
                    },
                },
            },
        ]
    },
})
