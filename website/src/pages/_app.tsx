import "../../public/globals.css"
import React from "react"
import Head from "next/head"
import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { Notifications } from "@mantine/notifications"
import { SessionProvider } from "next-auth/react"
import type { AppProps } from "next/app"
import type { Session } from "next-auth"
import { trpc } from "@/lib/trpc"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

function LlamaApp({
    Component,
    pageProps,
}: AppProps & { pageProps: AppProps["pageProps"] & { session: Session } }) {
    return (
        <>
            <Head>
                <title>AI Studybuddy</title>
                <meta name="robots" content="none" />
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="https://cdn.aistudybuddy.se/apple-touch-icon.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="https://cdn.aistudybuddy.se/favicon-32x32.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="https://cdn.aistudybuddy.se/favicon-16x16.png"
                />
                <link
                    rel="manifest"
                    href="https://cdn.aistudybuddy.se/site.webmanifest"
                />
                <link
                    rel="mask-icon"
                    href="https://cdn.aistudybuddy.se/safari-pinned-tab.svg"
                    color="#5bbad5"
                />
                <link
                    rel="shortcut icon"
                    href="https://cdn.aistudybuddy.se/favicon.ico"
                />
                <meta name="msapplication-TileColor" content="#01a0da" />
                <meta
                    name="msapplication-config"
                    content="https://cdn.aistudybuddy.se/browserconfig.xml"
                />
                <meta name="theme-color" content="#01a0da" />
                <meta property="og:title" content="AI Studybuddy" />
                <meta
                    property="og:description"
                    content="The worlds best AI studying assistant"
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://aistudybuddy.se/" />
                <meta
                    property="og:image"
                    content="https://aistudybuddy.se/og.png"
                />
                <meta
                    property="og:image:secure_url"
                    content="https://aistudybuddy.se/og.png"
                />
            </Head>
            <style jsx global>
                {`
                    html {
                        font-family: ${inter.style.fontFamily} !important;
                    }
                `}
            </style>
            <SessionProvider session={pageProps.session}>
                {process.env.NODE_ENV === "development" && (
                    <ReactQueryDevtools />
                )}
                <MantineProvider
                    withGlobalStyles
                    withNormalizeCSS
                    theme={{
                        colorScheme: "dark",
                        fontFamily: "var(--font-inter)",
                        headings: { fontFamily: "var(--font-inter)" },
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
                        primaryColor: "blue",
                        primaryShade: { dark: 6, light: 6 },
                        components: {
                            Modal: {
                                styles(theme, params, context) {
                                    return {
                                        title: {
                                            color: theme.colors.gray[2],
                                            fontSize: theme.fontSizes.lg,
                                            fontWeight: 700,
                                        },
                                        header: {
                                            background: "#19314f",
                                        },
                                    }
                                },
                            },
                            Paper: {
                                styles(theme, params, context) {
                                    return {
                                        root: {
                                            background: "#19314f",
                                        },
                                    }
                                },
                            },
                            Card: {
                                styles(theme, params, context) {
                                    return {
                                        root: {
                                            background: `${theme.colors.blue[8]}66`,
                                        },
                                    }
                                },
                            },
                            Text: {
                                defaultProps: { color: "gray.2" },
                            },
                            Title: {
                                defaultProps(theme) {
                                    return { color: "gray.1" }
                                },
                                styles: {
                                    root: {
                                        letterSpacing: "-0.025em",
                                        fontFamily: "var(--font-inter)",
                                    },
                                },
                            },
                            Input: {
                                styles(theme, params, context) {
                                    return {
                                        input: {
                                            background:
                                                theme.colors.bluegray[8],
                                            borderColor:
                                                theme.colors.bluegray[7],
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
                    <ModalsProvider>
                        <Notifications />
                        <Component {...pageProps} />
                    </ModalsProvider>
                </MantineProvider>
            </SessionProvider>
        </>
    )
}

export default trpc.withTRPC(LlamaApp)
