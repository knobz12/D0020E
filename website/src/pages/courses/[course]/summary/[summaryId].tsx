import { Page } from "@/components/Page"
import { PromptViewer } from "@/components/PromptViewer"
import { db } from "@/lib/database"
import { trpc } from "@/lib/trpc"
import { Container, List, Stack, Text, Title } from "@mantine/core"
import type { Prisma } from "@prisma/client"
import { GetServerSideProps } from "next"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"

export default function SummaryPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const summary = trpc.prompts.getPromptById.useQuery({
        id: router.query.summaryId! as string,
    })
    console.log(summary.data)

    return (
        <Page>
            <Container>
                {summary.data?.type === "SUMMARY" && (
                    <PromptViewer
                        type="SUMMARY"
                        promptId={summary.data.id}
                        title={summary.data.title}
                        editable={
                            session?.user.type === "TEACHER" ||
                            summary.data.userId === session?.user.userId
                        }
                        content={summary.data.content}
                    />
                )}
            </Container>
        </Page>
    )
}

export const getServerSideProps = (async ({ req, res, params }) => {
    try {
        if (!params || !("course" in params) || !("summaryId" in params)) {
            return {
                notFound: true,
            }
        }

        const course = params.course as string
        const summaryId = params.summaryId as string

        const dbCourse = await db.course.findUnique({
            where: { name: course },
            select: { id: true },
        })

        if (!dbCourse) {
            return {
                notFound: true,
            }
        }

        const summary = await db.prompt.findUnique({
            where: {
                id: summaryId,
                course: { id: dbCourse.id },
                type: "SUMMARY",
            },
            select: {
                id: true,
                title: true,
                userId: true,
                content: true,
            },
        })

        if (!summary) {
            return {
                notFound: true,
            }
        }

        return {
            props: {
                quiz: summary,
            },
        }
    } catch (e) {
        console.error(e)
        return {
            notFound: true,
        }
    }
}) satisfies GetServerSideProps
