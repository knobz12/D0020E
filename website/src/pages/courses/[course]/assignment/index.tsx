import React from "react"
import FileUpload from "@/components/FileUpload"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../api/auth/[...nextauth]"
import { getApiUrl } from "@/utils/getApiUrl"

interface AssignmentPageProps {}

export default function AssignmentPage({}: AssignmentPageProps) {
    return (
        <FileUpload
            type="ASSIGNMENT"
            title="Generate assignment"
            apiUrl={getApiUrl("/api/assignment")}
        />
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    const session = await getServerSession(req, res, authOptions)

    if (!session) {
        return {
            redirect: { destination: "/api/auth/signin", permanent: false },
        }
    }

    return {
        props: {
            session,
        },
    }
}
