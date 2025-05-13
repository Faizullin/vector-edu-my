export const getProtectedStorageUrl = (url: string) => {
    const prefix_url = '/api/v1/lms/resources/protected-media';
    const prefix_default = '/protected';
    if (url.startsWith(prefix_default)) {
        return `${prefix_url}${url.slice(prefix_default.length)}`;
    }
    throw new Error(`Incorrect url format for ${url}`);
}
export const extractPublishSchema = (content: string) => {
    const parsedContent = JSON.parse(content);
    const publishSchema = {
        content: parsedContent,
        scheme: {},
    }
    return publishSchema;
}