
const AttachmentsPanel = () => {
    // const attachmentsQuery = useQuery<Attachment[]>(
    //     ["attachments"],
    //     () => simpleRequest<Attachment[]>({
    //         url: "/attachments",
    //         method: "GET",
    //         query: {
    //             content_type: "post"
    //         }
    //     }),
    // )
    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Attachments</h2>
            <p className="text-sm text-gray-500">
                Attach files to this lesson. These files will be available for download
                by students.
            </p>
            <div className="flex flex-col gap-2">
                <button className="btn btn-primary">Upload File</button>
                <button className="btn btn-secondary">View All Attachments</button>
            </div>
        </div>
    );
}

export default AttachmentsPanel;