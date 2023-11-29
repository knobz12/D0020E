import "../../public/globals.css"
import { MantineProvider } from "@mantine/core"
import type { AppProps } from "next/app"
import Head from "next/head"
import React from "react"

export default function LlamaApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>Llama-GPT</title>
                <link rel="icon" href="/lama.png" />
            </Head>
            <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={{
                    colorScheme: "dark",
                    colors: {
                        bluegray: [
                            "#f9fafb",
                            "#f3f4f6",
                            "#e5e7eb",
                            "#d1d5db",
                            "#9ca3af",
                            "#6b7280",
                            "#4b5563",
                            "#374151",
                            "#1f2937",
                            "#111827",
                        ],
                        emerald: [
                            "#ecfdf5",
                            "#d1fae5",
                            "#a7f3d0",
                            "#6ee7b7",
                            "#34d399",
                            "#10b981",
                            "#059669",
                            "#047857",
                            "#065f46",
                            "#064e3b",
                        ],
                    },
                    primaryColor: "emerald",
                    primaryShade: { dark: 6, light: 6 },
                    components: {
                        Title: {
                            defaultProps(theme) {
                                return { color: "gray.1" }
                            },
                        },
                        Input: {
                            styles(theme, params, context) {
                                return {
                                    input: {
                                        background: theme.colors.bluegray[8],
                                        borderColor: theme.colors.bluegray[7],
                                        "::placeholder": {
                                            color: theme.colors.bluegray[5],
                                        },
                                    },
                                }
                            },
                        },
                    },
                }}
            >
                <Component {...pageProps} />
            </MantineProvider>
        </>
    )
}
