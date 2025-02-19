import React, { useCallback, useEffect, useRef, useState } from "react"
import {
    Button,
    Container,
    Flex,
    Group,
    NumberInput,
    Progress,
    SegmentedControl,
    SimpleGrid,
    Skeleton,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core"
import { showNotification } from "@mantine/notifications"
import { Page } from "@/components/Page"
import { useRouter } from "next/router"
import type { PromptType } from "@prisma/client"
import { QuizContent } from "./QuizContent"
import { ExplainerContent } from "./ExplainerContent"
import { LocalFilePicker } from "./LocalFilePicker"
import { SelectFile } from "./SelectFile"
import { trpc } from "@/lib/trpc"
import { FlashcardsContent } from "./FlashcardsContent"
import dynamic from "next/dynamic"
import { IconInfoCircle } from "@tabler/icons-react"
import { getApiUrl, getApiUrlUrl } from "@/utils/getApiUrl"

const MultiSelect = dynamic(
    () => import("@mantine/core").then((el) => el.MultiSelect),
    {
        loading: () => <Skeleton h="48px" w="100%" />,
        ssr: false,
    },
)

interface MultiProps {
    id?: string
    name?: string
    onChange: (values: string) => void
}

export function Multi({ id, name, onChange }: MultiProps) {
    const inputref = useRef<HTMLInputElement>(null)
    const [data, setData] = useState<{ value: string; label: string }[]>([])
    const multiId = id ?? "multi"

    function keywordExists(query: string): boolean {
        if (
            data.find(
                (val) =>
                    val.value.toLocaleLowerCase() === query.toLocaleLowerCase(),
            )
        ) {
            showNotification({
                color: "blue",
                title: "Keywords must be unique",
                message: `You can't add '${query}' since it is already added.`,
            })
            return true
        }
        return false
    }

    function keyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        console.log(event.key)
        if (event.key === "Enter") {
            const inp = document.getElementById(multiId) as HTMLInputElement
            const value = inp.value

            if (value === "") {
                showNotification({
                    color: "blue",
                    message: "Empty keyword not allowed",
                })
                return
            }

            const exists = keywordExists(value)
            if (exists) {
                return
            }
            console.log()
            const item = { value: value, label: value, selected: true }
            setData((current) => [...current, item])
            console.log(inputref.current)
            console.log(value)
        }
    }

    useEffect(() => {
        onChange(data.map((val) => val.value).join(","))
    }, [data])

    return (
        <MultiSelect
            ref={inputref}
            id={multiId}
            name={name ?? "multi"}
            dropdownComponent={() => null}
            maxSelectedValues={10}
            label="Custom keywords"
            data={data}
            placeholder="Select items"
            searchable
            creatable
            getCreateLabel={(query) => `+ Create ${query}`}
            onKeyDown={keyDown}
            value={data.map((val) => val.value)}
            onChange={(value) =>
                setData(value.map((val) => ({ label: val, value: val })))
            }
            onCreate={(query) => {
                const item = { value: query, label: query }
                setData((current) => [...current, item])
                return item
            }}
        />
    )
}

function encode(input: Uint8Array) {
    var keyStr =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    var output = ""
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4
    var i = 0

    while (i < input.length) {
        chr1 = input[i++]
        chr2 = i < input.length ? input[i++] : Number.NaN // Not sure if the index
        chr3 = i < input.length ? input[i++] : Number.NaN // checks are needed here

        enc1 = chr1 >> 2
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
        enc4 = chr3 & 63

        if (isNaN(chr2)) {
            enc3 = enc4 = 64
        } else if (isNaN(chr3)) {
            enc4 = 64
        }
        output +=
            keyStr.charAt(enc1) +
            keyStr.charAt(enc2) +
            keyStr.charAt(enc3) +
            keyStr.charAt(enc4)
    }
    return output
}

interface FileUploadProps {
    title: string
    apiUrl: string
    type: PromptType
    parameters?: {
        type: "number" | "string" | "Multi"
        id: string
        name: string
        placeholder: string
    }[]
}

export default function FileUpload({
    apiUrl,
    title,
    type,
    parameters,
}: FileUploadProps) {
    const router = useRouter()
    const [data, setData] = useState<string | null>(null)
    const [params, setParams] = useState<
        Record<string, string | number | undefined>
    >({})
    const [isLoading, setIsLoading] = useState<boolean>(false)
    // String is database file ID and File is local user file.
    const [selectedFile, setSelectedFile] = useState<string[] | File[] | null>(
        null,
    )
    const [fileChoice, setFileChoice] = useState<"select" | "upload">("upload")

    const [estimate, setEstimate] = useState<string | null>(null)
    const [percent, setPercent] = useState<number | null>(null)

    useEffect(
        function () {
            if (!estimate) {
                return
            }

            if (percent !== null && percent >= 100) {
                setPercent(null)
                setEstimate(null)
                return
            }

            const time = parseFloat(estimate) * 1000

            if (time < 1000) {
                return setPercent(100)
            }

            const interval = setInterval(function () {
                setPercent((current) => {
                    if (current !== null && current >= 100) {
                        clearInterval(interval)
                        setPercent(null)
                        setEstimate(null)
                        return null
                    }

                    const perc = (current ?? 0) + 5
                    // console.log("Increasing perc:", current, perc)

                    return perc
                })
            }, time / 20)

            return () => clearInterval(interval)
        },
        [estimate],
    )

    const utils = trpc.useUtils()

    useEffect(function () {
        utils.files.getFiles.prefetch({
            page: 1,
            course: router.query.course as string,
        })
    }, [])

    async function redirectToView() {
        const prompt = await utils.prompts.getMyLatestPrompts.fetch({
            course: router.query.course as string,
            type,
        })

        router.push(
            `/courses/${router.query.course}/${
                prompt.type == "DIVIDEASSIGNMENT"
                    ? "divideAssignment"
                    : prompt.type.toLowerCase()
            }/${prompt.id}`,
        )
    }

    async function onClick() {
        setIsLoading(true)
        try {
            const data = new FormData()

            const file = selectedFile

            if (Array.isArray(file)) {
                if (typeof file[0] === "string") {
                    let file_ids: string = file.join(",")
                    data.set("file_ids", file_ids)
                } else {
                    for (let i = 0; i < file.length; ++i) {
                        data.append("files", file[i])
                    }
                }
            } else if (file === null) {
                return showNotification({
                    color: "blue",
                    message: "You must select a file.",
                })
            }

            const url = new URL(apiUrl)

            for (const [key, value] of Object.entries(params)) {
                const val = String(value)
                if (val !== "") {
                    url.searchParams.set(key, val)
                }
            }

            const course = router.query.course
            if (typeof course !== "string") {
                return showNotification({
                    color: "red",
                    message: "Couldn't find course",
                })
            }

            url.searchParams.set("course", course)
            const url2 = getApiUrlUrl("/api/estimate")
            url2.searchParams.set("course", course)
            url2.searchParams.set("type", type)

            const est = await fetch(url2, {
                method: "POST",
                body: data,
                credentials: "include",
            }).catch((e) => null)
            if (est !== null) {
                const text = await est.text()
                setEstimate(text)
            }

            console.log("USING URL:", url.toString())
            const res = await fetch(url.toString(), {
                method: "POST",
                body: data,
                credentials: "include",
            }).catch((e) => null)

            if (res === null) {
                console.error(res)
                return showNotification({
                    color: "red",
                    message: "Failed to make request",
                })
            }

            if (res.status !== 200) {
                console.error(res)
                return showNotification({
                    color: "red",
                    message: await res.text(),
                })
            }

            console.log(res)
            const reader = res.body?.getReader()

            if (!reader) {
                throw new Error("No reader")
            }

            setData("")
            while (true) {
                const { done, value } = await reader.read()

                if (done) {
                    break
                }

                if (value === undefined) {
                    continue
                }

                // console.log(value)
                const str = new TextDecoder().decode(value)
                console.log(str)
                // console.log()
                setData((current) => (current += str))
            }

            // Wait 500 milliseconds before checking for prompt
            await new Promise<void>((res) => setTimeout(res, 500))
            setPercent((current) => (current !== null ? 100 : null))

            // const prompt = await utils.prompts.getMyLatestPrompts.fetch({
            //     course: router.query.course as string,
            //     type,
            // })

            // if (prompt) {
            //     // showNotification({
            //     //     color: "blue",
            //     //     icon: <IconInfoCircle />,
            //     //     message: (
            //     //         <Group spacing="md">
            //     //             <Text>
            //     //                 Your generated prompt has been saved. Do you
            //     //                 want to view it?
            //     //             </Text>
            //     //             <Button
            //     //                 onClick={() =>
            //     //                     router.push(
            //     //                         `/courses/${
            //     //                             router.query.course
            //     //                         }/${prompt.type.toLowerCase()}/${
            //     //                             prompt.id
            //     //                         }`,
            //     //                     )
            //     //                 }
            //     //             >
            //     //                 View
            //     //             </Button>
            //     //         </Group>
            //     //     ),
            //     // })
            // }
        } catch (e) {
            if (e instanceof Error) {
                console.error(e)
                showNotification({
                    color: "red",
                    title: "Something went wrong",
                    message: e.message,
                })
            }
        } finally {
            setIsLoading(false)
        }
    }
    const onFileSelect = useCallback(
        function (file: string[] | File[] | null) {
            setSelectedFile(file)
        },
        [setSelectedFile],
    )

    return (
        <Page>
            <Container size="xs" w="100%">
                <Stack>
                    <Title>{title}</Title>
                </Stack>
                <Stack>
                    <Stack>
                        {parameters && (
                            <Stack>
                                {parameters.map((parameter) => {
                                    switch (parameter.type) {
                                        case "number":
                                            return (
                                                <NumberInput
                                                    label={parameter.name}
                                                    key={parameter.id}
                                                    id={parameter.id}
                                                    name={parameter.id}
                                                    min={1}
                                                    onChange={(e) => {
                                                        if (e === "") {
                                                            return setParams(
                                                                (curr) => {
                                                                    const newParams =
                                                                        {
                                                                            ...curr,
                                                                            [parameter.id]:
                                                                                undefined,
                                                                        }
                                                                    console.log(
                                                                        newParams,
                                                                    )
                                                                    return newParams
                                                                },
                                                            )
                                                        }

                                                        setParams((curr) => {
                                                            const newParams = {
                                                                ...curr,
                                                                [parameter.id]:
                                                                    e,
                                                            }
                                                            console.log(
                                                                newParams,
                                                            )
                                                            return newParams
                                                        })
                                                    }}
                                                    placeholder={
                                                        parameter.placeholder
                                                    }
                                                />
                                            )
                                        case "string":
                                            return (
                                                <TextInput
                                                    key={parameter.id}
                                                    label={parameter.name}
                                                    id={parameter.id}
                                                    name={parameter.id}
                                                    onChange={(e) => {
                                                        var myString =
                                                            e.target.value
                                                        if (myString === "") {
                                                            return setParams(
                                                                (curr) => {
                                                                    const newParams =
                                                                        {
                                                                            ...curr,
                                                                            [parameter.id]:
                                                                                undefined,
                                                                        }
                                                                    console.log(
                                                                        newParams,
                                                                    )
                                                                    return newParams
                                                                },
                                                            )
                                                        }

                                                        setParams((curr) => {
                                                            const newParams = {
                                                                ...curr,
                                                                [parameter.id]:
                                                                    myString,
                                                            }
                                                            console.log(
                                                                newParams,
                                                            )
                                                            return newParams
                                                        })
                                                    }}
                                                    placeholder={
                                                        parameter.placeholder
                                                    }
                                                />
                                            )
                                        case "Multi":
                                            return (
                                                <Multi
                                                    id={parameter.id}
                                                    key={parameter.id}
                                                    name={parameter.id}
                                                    onChange={(values) =>
                                                        setParams(
                                                            (current) => ({
                                                                ...current,
                                                                [parameter.id]:
                                                                    values,
                                                            }),
                                                        )
                                                    }
                                                />
                                            )
                                    }
                                })}
                            </Stack>
                        )}
                        <SegmentedControl
                            color="primary"
                            data={[
                                {
                                    label: "Upload file",
                                    value: "upload",
                                },
                                {
                                    label: "Select file",
                                    value: "select",
                                },
                            ]}
                            onChange={(value) =>
                                setFileChoice(value as "select" | "upload")
                            }
                        />
                        {/* </HoverCard.Target>
                            {selectedFile !== null ? (
                                <HoverCard.Dropdown color="teal">
                                    You must remove the selected file if you
                                    want to choose another file.
                                </HoverCard.Dropdown>
                            ) : null}
                        </HoverCard>
                    </NoSsr> */}
                        {fileChoice === "select" ? (
                            <SelectFile
                                isLoading={isLoading}
                                onSelect={onFileSelect}
                            />
                        ) : (
                            <LocalFilePicker
                                isLoading={isLoading}
                                onSelect={onFileSelect}
                            />
                        )}
                        <Stack w="100%">
                            <Button
                                loading={isLoading}
                                disabled={isLoading}
                                onClick={onClick}
                            >
                                Generate
                            </Button>
                        </Stack>
                    </Stack>
                </Stack>
                {/* {data !== null && <Textarea h="96rem" value={data} />} */}
                {estimate !== null && (
                    <div>
                        <p>Estimated time: {estimate}s</p>
                        <Progress value={percent ?? 0} />
                    </div>
                )}
                {data !== null && (
                    <Flex my="md" gap="md" w="max-content">
                        <Button
                            w="100%"
                            color="blue"
                            variant="filled"
                            disabled={isLoading}
                            onClick={redirectToView}
                        >
                            View
                        </Button>
                    </Flex>
                )}
                {data !== null &&
                    (type === "QUIZ" ? (
                        typeof data === "string" &&
                        data !== "" && (
                            <QuizContent content={JSON.parse(data)} />
                        )
                    ) : type === "FLASHCARDS" ? (
                        typeof data === "string" &&
                        data !== "" && (
                            <FlashcardsContent content={JSON.parse(data)} />
                        )
                    ) : type === "EXPLAINER" ? (
                        typeof data === "string" &&
                        data !== "" && (
                            <ExplainerContent content={JSON.parse(data)} />
                        )
                    ) : (
                        <Text>
                            {data.split("\n").map((val, idx) => (
                                <Text key={val + idx}>{val}</Text>
                            ))}
                        </Text>
                    ))}
            </Container>
        </Page>
    )
}
